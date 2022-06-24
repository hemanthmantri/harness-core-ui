/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikErrors } from 'formik'
import { isEmpty } from 'lodash-es'

import { getMultiTypeFromValue, IconName, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { Step, StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import type { DeployStageConfig } from '@pipeline/utils/DeployStageInterface'
import { DeployInfrastructureWidget } from './DeployInfrastructureWidget'
import DeployInfrastructureInputStep from './DeployInfrastructureInputStep'
import {
  processNonGitOpsInitialValues,
  processGitOpsEnvGroupInitialValues,
  processGitOpsEnvironmentInitialValues,
  processNonGitOpsFormValues,
  processGitOpsEnvironmentFormValues,
  processGitOpsEnvGroupFormValues
} from './utils'

export class DeployInfrastructureStep extends Step<DeployStageConfig> {
  lastFetched: number

  protected stepPaletteVisible = false
  protected type = StepType.DeployInfrastructure
  protected stepName = 'Deploy Infrastructure'
  protected stepIcon: IconName = 'main-environments'

  protected defaultValues: DeployStageConfig = {} as DeployStageConfig

  constructor() {
    super()
    this.lastFetched = new Date().getTime()
  }

  private processInitialValues(initialValues: DeployStageConfig): DeployStageConfig {
    const gitOpsEnabled = initialValues.gitOpsEnabled
    const isEnvGroup = Boolean(initialValues.environmentGroup)
    return {
      gitOpsEnabled,
      ...(!gitOpsEnabled && processNonGitOpsInitialValues(initialValues)),
      ...(gitOpsEnabled && {
        ...(!isEnvGroup && processGitOpsEnvironmentInitialValues(initialValues)),
        ...(isEnvGroup && processGitOpsEnvGroupInitialValues(initialValues))
      })
    }
  }

  private processFormData(data: DeployStageConfig): any {
    const gitOpsEnabled = data.gitOpsEnabled
    const isEnvGroup = data.isEnvGroup

    return {
      ...(gitOpsEnabled === false && processNonGitOpsFormValues(data)),
      ...(gitOpsEnabled === true && {
        ...(data.environmentOrEnvGroupRef === RUNTIME_INPUT_VALUE
          ? {
              ...(data.environmentOrEnvGroupAsRuntime === 'Environment' && processGitOpsEnvironmentFormValues(data)),
              ...(data.environmentOrEnvGroupAsRuntime === 'Environment Group' && processGitOpsEnvGroupFormValues(data))
            }
          : {
              ...(!isEnvGroup && processGitOpsEnvironmentFormValues(data)),
              ...(isEnvGroup && processGitOpsEnvGroupFormValues(data))
            })
      })
    }
  }

  renderStep(props: StepProps<DeployStageConfig>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, readonly = false, allowableTypes } = props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <DeployInfrastructureInputStep
          initialValues={initialValues}
          readonly={readonly}
          onUpdate={data => onUpdate?.(this.processFormData(data as any))}
          stepViewType={stepViewType}
          allowableTypes={allowableTypes}
          inputSetData={inputSetData}
        />
      )
    }

    return (
      <DeployInfrastructureWidget
        initialValues={this.processInitialValues(initialValues)}
        readonly={readonly}
        onUpdate={data => onUpdate?.(this.processFormData(data as any))}
        stepViewType={stepViewType}
        allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<DeployStageConfig>): FormikErrors<DeployStageConfig> {
    const errors: FormikErrors<DeployStageConfig> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (
      isEmpty(data?.environment?.environmentRef) &&
      isRequired &&
      getMultiTypeFromValue(template?.environment?.environmentRef) === MultiTypeInputType.RUNTIME
    ) {
      errors.environment = getString?.('cd.pipelineSteps.environmentTab.environmentIsRequired')
    }
    return errors
  }
}
