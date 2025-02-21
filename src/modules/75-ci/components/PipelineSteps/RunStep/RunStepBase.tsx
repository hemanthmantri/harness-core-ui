/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import cx from 'classnames'
import {
  Text,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm,
  Accordion,
  Container
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { FormikErrors, FormikProps } from 'formik'
import { get, merge } from 'lodash-es'
import { StepFormikFowardRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { TemplateStudioPathProps } from '@modules/10-common/interfaces/RouteInterfaces'
import { ScriptType, ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import { getImagePullPolicyOptions } from '@common/utils/ContainerRunStepUtils'
import { getCIShellOptions, Shell } from '@ci/utils/CIShellOptionsUtils'
import StepCommonFields from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFields'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { CIBuildInfrastructureType } from '@pipeline/utils/constants'
import type { RunStepProps, RunStepData, RunStepDataUI } from './RunStep'
import { transformValuesFieldsConfig, getEditViewValidateFieldsConfig } from './RunStepFunctionConfigs'
import { CIStepOptionalConfig, PathnameParams } from '../CIStep/CIStepOptionalConfig'
import {
  AllMultiTypeInputTypesForStep,
  useGetPropagatedStageById,
  validateConnectorRefAndImageDepdendency
} from '../CIStep/StepUtils'
import { CIStep } from '../CIStep/CIStep'
import { ConnectorRefWithImage } from '../CIStep/ConnectorRefWithImage'
import { getCIStageInfraType } from '../../../utils/CIPipelineStudioUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const keysWithAllowedEmptyValues = ['envVariables']

export const RunStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, onChange }: RunStepProps,
  formikRef: StepFormikFowardRef<RunStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  const buildInfrastructureType = getCIStageInfraType(currentStage)

  const getScriptTypeForShell = useCallback((formik: FormikProps<RunStepData>): ScriptType => {
    const selectedShell = get(formik, 'values.spec.shell.value') as Shell
    switch (selectedShell) {
      case Shell.Pwsh:
      case Shell.Powershell:
        return 'PowerShell'
      case Shell.Python:
        return 'Python'
      default:
        return 'Bash'
    }
  }, [])

  const pathnameParams = useLocation()?.pathname?.split('/') || []
  const isTemplateStudio = pathnameParams.includes(PathnameParams.TEMPLATE_STUDIO)
  const { templateType } = useParams<TemplateStudioPathProps>()
  const allowEmptyConnectorImage = isTemplateStudio && (templateType === 'Step' || templateType === 'StepGroup')

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<RunStepData, RunStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { imagePullPolicyOptions: getImagePullPolicyOptions(getString), shellOptions: getCIShellOptions(getString) }
      )}
      formName="ciRunStep"
      validate={valuesToValidate => {
        let errors: FormikErrors<any> = {}
        /* If a user configures AWS VMs as an infra, the steps can be executed directly on the VMS or in a container on a VM.
        For the latter case, even though Container Registry and Image are optional for AWS VMs infra, they both need to be specified for container to be spawned properly */
        if (
          [CIBuildInfrastructureType.VM, CIBuildInfrastructureType.Cloud, CIBuildInfrastructureType.Docker].includes(
            buildInfrastructureType
          )
        ) {
          errors = validateConnectorRefAndImageDepdendency(
            get(valuesToValidate, 'spec.connectorRef', ''),
            get(valuesToValidate, 'spec.image', ''),
            getString
          )
        }
        const schemaValues = getFormValuesInCorrectFormat<RunStepDataUI, RunStepData>(
          valuesToValidate,
          transformValuesFieldsConfig,
          keysWithAllowedEmptyValues
        )
        onChange?.(schemaValues)
        errors = merge(
          errors,
          validate(
            valuesToValidate,
            getEditViewValidateFieldsConfig(buildInfrastructureType, allowEmptyConnectorImage),
            {
              initialValues,
              steps: currentStage?.stage?.spec?.execution?.steps || {},
              serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || [],
              getString
            },
            stepViewType
          )
        )
        return errors
      }}
      onSubmit={(_values: RunStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<RunStepDataUI, RunStepData>(
          _values,
          transformValuesFieldsConfig,
          keysWithAllowedEmptyValues
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<RunStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)
        const scriptType = getScriptTypeForShell(formik)
        return (
          <FormikForm>
            <CIStep
              isNewStep={isNewStep}
              readonly={readonly}
              stepViewType={stepViewType}
              formik={formik}
              enableFields={{
                name: {},
                description: {}
              }}
            />
            {![
              CIBuildInfrastructureType.VM,
              CIBuildInfrastructureType.Cloud,
              CIBuildInfrastructureType.Docker
            ].includes(buildInfrastructureType) && !allowEmptyConnectorImage ? (
              <ConnectorRefWithImage showOptionalSublabel={false} readonly={readonly} stepViewType={stepViewType} />
            ) : null}
            <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
              <MultiTypeSelectField
                name="spec.shell"
                label={
                  <Text
                    tooltipProps={{ dataTooltipId: 'run_shell' }}
                    className={css.inpLabel}
                    color={Color.GREY_600}
                    font={{ size: 'small', weight: 'semi-bold' }}
                  >
                    {getString('common.shell')}
                  </Text>
                }
                multiTypeInputProps={{
                  selectItems: getCIShellOptions(getString),
                  placeholder: getString('select'),
                  multiTypeInputProps: {
                    expressions,
                    selectProps: { items: getCIShellOptions(getString) },
                    allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
                  },
                  disabled: readonly
                }}
                disabled={readonly}
                configureOptionsProps={{ variableName: 'spec.shell' }}
              />
            </Container>
            <div className={cx(css.fieldsGroup, css.withoutSpacing, css.topPadding3, css.bottomPadding3)}>
              <MultiTypeFieldSelector
                name="spec.command"
                label={
                  <Text
                    color={Color.GREY_800}
                    font={{ size: 'normal', weight: 'bold' }}
                    className={css.inpLabel}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    {getString('commandLabel')}
                  </Text>
                }
                defaultValueToReset=""
                skipRenderValueInExpressionLabel
                allowedTypes={AllMultiTypeInputTypesForStep}
                expressionRender={() => {
                  return (
                    <ShellScriptMonacoField
                      title={getString('commandLabel')}
                      name="spec.command"
                      scriptType={scriptType}
                      expressions={expressions}
                      disabled={readonly}
                    />
                  )
                }}
                style={{ flexGrow: 1, marginBottom: 0 }}
                disableTypeSelection={readonly}
              >
                <ShellScriptMonacoField
                  title={getString('commandLabel')}
                  name="spec.command"
                  scriptType={scriptType}
                  disabled={readonly}
                  expressions={expressions}
                />
              </MultiTypeFieldSelector>
              {getMultiTypeFromValue(formik?.values?.spec?.command) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  style={{ marginTop: 17 }}
                  value={formik?.values?.spec?.command as string}
                  type={getString('string')}
                  variableName="spec.command"
                  showRequiredField={false}
                  showDefaultField={false}
                  onChange={value => formik?.setFieldValue('spec.command', value)}
                  isReadonly={readonly}
                />
              )}
            </div>
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <Container margin={{ top: 'medium' }}>
                    {[
                      CIBuildInfrastructureType.VM,
                      CIBuildInfrastructureType.Cloud,
                      CIBuildInfrastructureType.Docker
                    ].includes(buildInfrastructureType) || allowEmptyConnectorImage ? (
                      <ConnectorRefWithImage
                        showOptionalSublabel={true}
                        readonly={readonly}
                        stepViewType={stepViewType}
                      />
                    ) : null}
                    <CIStepOptionalConfig
                      stepViewType={stepViewType}
                      readonly={readonly}
                      enableFields={{
                        'spec.privileged': {
                          shouldHide: [
                            CIBuildInfrastructureType.VM,
                            CIBuildInfrastructureType.KubernetesHosted,
                            CIBuildInfrastructureType.Docker
                          ].includes(buildInfrastructureType)
                        },
                        'spec.reportPaths': {},
                        'spec.envVariables': {},
                        'spec.outputVariables': {}
                      }}
                    />
                    <StepCommonFields
                      enableFields={['spec.imagePullPolicy']}
                      disabled={readonly}
                      buildInfrastructureType={buildInfrastructureType}
                      stepViewType={stepViewType}
                    />
                  </Container>
                }
              />
            </Accordion>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const RunStepBaseWithRef = React.forwardRef(RunStepBase)
