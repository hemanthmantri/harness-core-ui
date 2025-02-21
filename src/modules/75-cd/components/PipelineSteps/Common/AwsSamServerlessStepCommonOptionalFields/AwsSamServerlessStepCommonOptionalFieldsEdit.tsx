/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get } from 'lodash-es'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { AllowedTypes, Container, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { getImagePullPolicyOptions } from '@common/utils/ContainerRunStepUtils'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { ConnectorConfigureOptions } from '@platform/connectors/components/ConnectorConfigureOptions/ConnectorConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { AwsSamDeployStepFormikValues } from '../../AwsSam/AwsSamDeployStep/AwsSamDeployStepEdit'
import type { AwsSamBuildStepFormikValues } from '../../AwsSam/AwsSamBuildStep/AwsSamBuildStepEdit'
import type { ServerlessAwsLambdaPrepareRollbackV2StepFormikValues } from '../../ServerlessAwsLambda/ServerlessAwsLambdaPrepareRollbackV2Step/ServerlessAwsLambdaPrepareRollbackV2StepEdit'
import { ServerlessAwsLambdaRollbackV2StepFormikValues } from '../../ServerlessAwsLambda/ServerlessAwsLambdaRollbackV2Step/ServerlessAwsLambdaRollbackV2StepEdit'
import { serverlessStepAllowedConnectorTypes } from '../utils/utils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export type AwsSamServerlessCommonStepFormikVaues =
  | AwsSamDeployStepFormikValues
  | AwsSamBuildStepFormikValues
  | ServerlessAwsLambdaPrepareRollbackV2StepFormikValues
  | ServerlessAwsLambdaRollbackV2StepFormikValues

interface AwsSamServerlessStepCommonOptionalFieldsEditProps {
  allowableTypes: AllowedTypes
  readonly?: boolean
  formik: FormikProps<AwsSamServerlessCommonStepFormikVaues>
  versionFieldName: string
  versionFieldLabel: string
  commandOptionsFieldName?: string
  commandOptionsFieldLabel?: string
  isAwsSamBuildStep?: boolean
}

export function AwsSamServerlessStepCommonOptionalFieldsEdit(
  props: AwsSamServerlessStepCommonOptionalFieldsEditProps
): React.ReactElement {
  const {
    readonly,
    allowableTypes,
    formik,
    versionFieldName,
    versionFieldLabel,
    commandOptionsFieldName,
    commandOptionsFieldLabel,
    isAwsSamBuildStep
  } = props

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, repoName, branch } = useQueryParams<GitQueryParams>()

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const renderConnectorField = (fieldName: string, fieldLabel: string): React.ReactElement => {
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
          type={serverlessStepAllowedConnectorTypes}
          enableConfigureOptions={false}
          selected={get(formik?.values, fieldName) as string}
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
              type: serverlessStepAllowedConnectorTypes,
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
      <Container className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name={versionFieldName}
          label={versionFieldLabel}
          placeholder={getString('common.enterPlaceholder', { name: versionFieldLabel })}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes
          }}
        />
        {getMultiTypeFromValue(get(formik.values, versionFieldName)) === MultiTypeInputType.RUNTIME && !readonly && (
          <ConfigureOptions
            value={get(formik.values, versionFieldName) as string}
            type="String"
            variableName={versionFieldName}
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => {
              formik.setFieldValue(versionFieldName, value)
            }}
            isReadonly={readonly}
          />
        )}
      </Container>

      {commandOptionsFieldName && (
        <Container className={cx(stepCss.formGroup)}>
          <MultiTypeList
            name={commandOptionsFieldName}
            multiTextInputProps={{
              expressions,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
            }}
            multiTypeFieldSelectorProps={{
              label: defaultTo(commandOptionsFieldLabel, ''),
              allowedTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
            }}
            disabled={readonly}
            configureOptionsProps={{ hideExecutionTimeField: true }}
          />
        </Container>
      )}

      {isAwsSamBuildStep &&
        renderConnectorField(
          'spec.samBuildDockerRegistryConnectorRef',
          getString('cd.steps.awsSamBuildStep.samBuildDockerContainerRegistry')
        )}

      <Container className={cx(stepCss.formGroup, stepCss.md)}>
        <FormMultiTypeCheckboxField
          name={'spec.privileged'}
          label={getString('pipeline.buildInfra.privileged')}
          multiTypeTextbox={{
            expressions,
            allowableTypes,
            disabled: readonly
          }}
          disabled={readonly}
          configureOptionsProps={{ hideExecutionTimeField: true }}
        />
      </Container>

      <Container className={stepCss.formGroup}>
        <FormInput.MultiTypeInput
          name="spec.imagePullPolicy"
          label={getString('pipelineSteps.pullLabel')}
          selectItems={getImagePullPolicyOptions(getString)}
          placeholder={getString('select')}
          disabled={readonly}
          useValue={true}
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: { addClearBtn: true, items: getImagePullPolicyOptions(getString) }
          }}
        />
        {getMultiTypeFromValue(formik.values.spec.imagePullPolicy) === MultiTypeInputType.RUNTIME && (
          <SelectConfigureOptions
            options={getImagePullPolicyOptions(getString)}
            value={formik.values.spec.imagePullPolicy as string}
            type={getString('string')}
            variableName={'spec.imagePullPolicy'}
            showRequiredField={false}
            showDefaultField={false}
            onChange={val => formik?.setFieldValue('formik.values.spec.imagePullPolicy', val)}
            isReadonly={readonly}
          />
        )}
      </Container>

      <Container className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.runAsUser"
          label={getString('pipeline.stepCommonFields.runAsUser')}
          placeholder="1000"
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes
          }}
        />
        {getMultiTypeFromValue(formik.values.spec?.runAsUser) === MultiTypeInputType.RUNTIME && !readonly && (
          <ConfigureOptions
            value={formik.values.spec?.runAsUser as string}
            type="String"
            variableName="spec.runAsUser"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => {
              formik.setFieldValue('spec.runAsUser', value)
            }}
            isReadonly={readonly}
          />
        )}
      </Container>

      <Container className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.resources.limits.memory"
          label={getString('pipelineSteps.limitMemoryLabel')}
          placeholder={getString('common.enterPlaceholder', { name: getString('pipelineSteps.limitMemoryLabel') })}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes
          }}
        />
        {getMultiTypeFromValue(formik.values.spec?.resources?.limits?.memory) === MultiTypeInputType.RUNTIME &&
          !readonly && (
            <ConfigureOptions
              value={formik.values.spec?.resources?.limits?.memory as string}
              type="String"
              variableName="spec.resources.limits.memory"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => {
                formik.setFieldValue('spec.resources.limits.memory', value)
              }}
              isReadonly={readonly}
            />
          )}
      </Container>

      <Container className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.resources.limits.cpu"
          label={getString('pipelineSteps.limitCPULabel')}
          placeholder={getString('common.enterPlaceholder', { name: getString('pipelineSteps.limitCPULabel') })}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes
          }}
        />
        {getMultiTypeFromValue(formik.values.spec?.resources?.limits?.cpu) === MultiTypeInputType.RUNTIME && !readonly && (
          <ConfigureOptions
            value={formik.values.spec?.resources?.limits?.cpu as string}
            type="String"
            variableName="spec.resources.limits.cpu"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => {
              formik.setFieldValue('spec.resources.limits.cpu', value)
            }}
            isReadonly={readonly}
          />
        )}
      </Container>

      <MultiTypeMap
        name={'spec.envVariables'}
        valueMultiTextInputProps={{ expressions, allowableTypes }}
        multiTypeFieldSelectorProps={{
          label: getString('environmentVariables'),
          disableTypeSelection: true
        }}
        configureOptionsProps={{
          hideExecutionTimeField: true
        }}
        disabled={readonly}
      />
    </>
  )
}
