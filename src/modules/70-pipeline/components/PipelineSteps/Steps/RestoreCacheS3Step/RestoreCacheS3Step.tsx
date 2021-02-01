import React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/exports'
import type { UseStringsReturn } from 'framework/exports'
import { StepType } from '../../PipelineStepInterface'
import { PipelineStep } from '../../PipelineStep'
import { validateInputSet } from '../StepsValidateUtils'
import type { MultiTypeConnectorRef, Resources } from '../StepsTypes'
import { RestoreCacheS3StepBaseWithRef } from './RestoreCacheS3StepBase'
import { RestoreCacheS3StepInputSet } from './RestoreCacheS3StepInputSet'
import { RestoreCacheS3StepVariables, RestoreCacheS3StepVariablesProps } from './RestoreCacheS3StepVariables'
import { inputSetViewValidateFieldsConfig } from './RestoreCacheS3StepFunctionConfigs'

export interface RestoreCacheS3StepSpec {
  connectorRef: string
  region: string
  bucket: string
  key: string
  endpoint?: string
  target?: string
  resources?: Resources
}

export interface RestoreCacheS3StepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  spec: RestoreCacheS3StepSpec
}

export interface RestoreCacheS3StepSpecUI extends Omit<RestoreCacheS3StepSpec, 'connectorRef' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface RestoreCacheS3StepDataUI extends Omit<RestoreCacheS3StepData, 'spec'> {
  spec: RestoreCacheS3StepSpecUI
}

export interface RestoreCacheS3StepProps {
  initialValues: RestoreCacheS3StepData
  template?: RestoreCacheS3StepData
  path?: string
  readonly?: boolean
  stepViewType?: StepViewType
  onUpdate?: (data: RestoreCacheS3StepData) => void
}

export class RestoreCacheS3Step extends PipelineStep<RestoreCacheS3StepData> {
  constructor() {
    super()
    this._hasStepVariables = true
  }

  protected type = StepType.RestoreCacheS3
  protected stepName = 'Restore Cache from S3'
  protected stepIcon: IconName = 'restore-cache-s3'
  protected stepPaletteVisible = false

  protected defaultValues: RestoreCacheS3StepData = {
    identifier: '',
    type: StepType.RestoreCacheS3 as string,
    spec: {
      connectorRef: '',
      region: '',
      bucket: '',
      key: ''
    }
  }

  validateInputSet(
    data: RestoreCacheS3StepData,
    template?: RestoreCacheS3StepData,
    getString?: UseStringsReturn['getString']
  ): object {
    if (getString) {
      return validateInputSet(data, template, inputSetViewValidateFieldsConfig, { getString })
    }

    return {}
  }

  renderStep(props: StepProps<RestoreCacheS3StepData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <RestoreCacheS3StepInputSet
          initialValues={initialValues}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          readonly={!!inputSetData?.readonly}
          stepViewType={stepViewType}
          onUpdate={onUpdate}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <RestoreCacheS3StepVariables
          {...(customStepProps as RestoreCacheS3StepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <RestoreCacheS3StepBaseWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        ref={formikRef}
      />
    )
  }
}
