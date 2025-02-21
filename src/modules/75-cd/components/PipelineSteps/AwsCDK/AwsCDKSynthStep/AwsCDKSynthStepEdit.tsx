/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import { defaultTo, get } from 'lodash-es'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import type { FormikProps } from 'formik'
import {
  Accordion,
  AllowedTypes,
  Container,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text
} from '@harness/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeCheckboxField } from '@common/components'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ConnectorConfigureOptions } from '@platform/connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { NameTimeoutField } from '../../Common/GenericExecutionStep/NameTimeoutField'
import {
  AwsCdkCommonOptionalFieldsEdit,
  awsCdkStepAllowedConnectorTypes,
  AwsCDKCommonStepFormikValues
} from '../AwsCDKCommonFields'
import { AwsCDKSynthStepInitialValues } from './AwsCDKSynthStep'
import { getEnvirontmentVariableValidationSchema } from '../../Common/utils/utils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../AwsCDKStep.module.scss'

export interface AwsCDKSynthStepProps {
  initialValues: AwsCDKSynthStepInitialValues
  onUpdate?: (data: AwsCDKCommonStepFormikValues) => void
  onChange?: (data: AwsCDKCommonStepFormikValues) => void
  stepViewType?: StepViewType
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
}

const AwsCDKSynthStepEdit = (
  props: AwsCDKSynthStepProps,
  formikRef: StepFormikFowardRef<AwsCDKCommonStepFormikValues>
): React.ReactElement => {
  const { initialValues, onUpdate, isNewStep = true, readonly, allowableTypes, stepViewType, onChange } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, repoName, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const validationSchema = Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      connectorRef: Yup.string().required(
        getString('common.validation.fieldIsRequired', { name: getString('pipelineSteps.connectorLabel') })
      ),
      image: Yup.string().required(getString('validation.imageRequired')),
      envVariables: getEnvirontmentVariableValidationSchema(getString)
    })
  })

  const getInitialValues = (): AwsCDKCommonStepFormikValues => {
    return {
      ...initialValues,
      spec: {
        ...initialValues.spec,
        commandOptions:
          typeof initialValues.spec.commandOptions === 'string'
            ? initialValues.spec.commandOptions
            : initialValues.spec.commandOptions?.map(commandOption => ({
                id: uuid('', nameSpace()),
                value: commandOption
              })),
        stackNames:
          typeof initialValues.spec.stackNames === 'string'
            ? initialValues.spec.stackNames
            : initialValues.spec.stackNames?.map(stackName => ({
                id: uuid('', nameSpace()),
                value: stackName
              })),
        envVariables: Object.keys(defaultTo(initialValues.spec.envVariables, {})).map(envKey => {
          const envValue = initialValues.spec.envVariables?.[envKey]
          return {
            id: uuid('', nameSpace()),
            key: envKey,
            value: defaultTo(envValue, '')
          }
        })
      }
    }
  }

  const renderConnectorField = (
    formik: FormikProps<AwsCDKCommonStepFormikValues>,
    fieldName: string,
    fieldLabel: string
  ): React.ReactElement => {
    return (
      <Container className={stepCss.formGroup}>
        <FormMultiTypeConnectorField
          width={510}
          name={fieldName}
          label={fieldLabel}
          placeholder={getString('select')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{ expressions, allowableTypes }}
          type={awsCdkStepAllowedConnectorTypes}
          enableConfigureOptions={false}
          selected={get(formik.values, fieldName) as string}
          setRefValue
          disabled={readonly}
          gitScope={{ repo: defaultTo(repoIdentifier, repoName), branch, getDefaultFromOtherRepo: true }}
        />
        {getMultiTypeFromValue(get(formik.values, fieldName)) === MultiTypeInputType.RUNTIME && (
          <ConnectorConfigureOptions
            style={{ marginTop: 6 }}
            value={get(formik.values, fieldName) as string}
            type="String"
            variableName={fieldName}
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => formik.setFieldValue(fieldName, value)}
            isReadonly={readonly}
            connectorReferenceFieldProps={{
              accountIdentifier: accountId,
              projectIdentifier,
              orgIdentifier,
              type: awsCdkStepAllowedConnectorTypes,
              label: fieldLabel,
              disabled: readonly,
              gitScope: { repo: defaultTo(repoIdentifier, repoName), branch, getDefaultFromOtherRepo: true }
            }}
          />
        )}
      </Container>
    )
  }

  return (
    <>
      <Formik<AwsCDKCommonStepFormikValues>
        onSubmit={values => {
          onUpdate?.(values)
        }}
        formName="AwsCDKSynthStepEdit"
        initialValues={getInitialValues()}
        validate={data => {
          onChange?.(data)
        }}
        validationSchema={validationSchema}
      >
        {(formik: FormikProps<AwsCDKCommonStepFormikValues>) => {
          setFormikRef(formikRef, formik)

          return (
            <FormikForm>
              <NameTimeoutField
                allowableTypes={allowableTypes}
                isNewStep={isNewStep}
                readonly={readonly}
                stepViewType={stepViewType}
              />

              <Text className={css.containerConfiguration} tooltipProps={{ dataTooltipId: 'containerConfiguration' }}>
                {getString('cd.steps.containerStepsCommon.containerConfigurationText')}
              </Text>

              {renderConnectorField(formik, 'spec.connectorRef', getString('pipelineSteps.connectorLabel'))}

              <Container className={stepCss.formGroup}>
                <FormInput.MultiTextInput
                  name="spec.image"
                  label={getString('imageLabel')}
                  placeholder={getString('pipeline.artifactsSelection.existingDocker.imageNamePlaceholder')}
                  disabled={readonly}
                  multiTextInputProps={{
                    expressions,
                    disabled: readonly,
                    allowableTypes
                  }}
                />
                {getMultiTypeFromValue(formik.values.spec?.image) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.spec?.image as string}
                    type="String"
                    variableName="spec.image"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => {
                      formik.setFieldValue('spec.image', value)
                    }}
                    isReadonly={readonly}
                  />
                )}
              </Container>
              <Container className={stepCss.formGroup}>
                <FormInput.MultiTextInput
                  name="spec.appPath"
                  label={getString('optionalField', { name: getString('pipeline.stepCommonFields.appPath') })}
                  placeholder={getString('pipeline.stepCommonFields.appPath')}
                  disabled={readonly}
                  multiTextInputProps={{
                    expressions,
                    disabled: readonly,
                    allowableTypes
                  }}
                />
                {getMultiTypeFromValue(formik.values.spec?.appPath) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.spec?.appPath as string}
                    type="String"
                    variableName="spec.appPath"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={value => {
                      formik.setFieldValue('spec.appPath', value)
                    }}
                    isReadonly={readonly}
                  />
                )}
              </Container>

              <Accordion className={stepCss.accordion}>
                <Accordion.Panel
                  id="aws-cdk-synth-optional-accordion"
                  data-testid={'aws-cdk-synth-optional-accordion'}
                  summary={getString('common.optionalConfig')}
                  details={
                    <Container margin={{ top: 'medium' }}>
                      <AwsCdkCommonOptionalFieldsEdit
                        allowableTypes={allowableTypes}
                        readonly={readonly}
                        formik={formik}
                        commandOptionsFieldName={'spec.commandOptions'}
                        commandOptionsFieldLabel={getString('cd.steps.awsCdkStep.awsCdkSynthCommandOptions')}
                        stepType={StepType.AwsCdkSynth}
                      />

                      <Container className={cx(stepCss.formGroup, stepCss.md)}>
                        <FormMultiTypeCheckboxField
                          name={'spec.exportTemplate'}
                          label={getString('pipeline.buildInfra.exportTemplate')}
                          multiTypeTextbox={{
                            expressions,
                            allowableTypes,
                            disabled: readonly
                          }}
                          disabled={readonly}
                          configureOptionsProps={{ hideExecutionTimeField: true }}
                        />
                      </Container>
                    </Container>
                  }
                />
              </Accordion>
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export const AwsCDKSynthStepEditRef = React.forwardRef(AwsCDKSynthStepEdit)
