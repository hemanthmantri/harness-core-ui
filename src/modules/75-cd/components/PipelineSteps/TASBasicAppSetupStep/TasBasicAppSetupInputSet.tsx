/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getMultiTypeFromValue, MultiTypeInputType, FormikForm, AllowedTypes } from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { FormMultiTypeKVTagInput } from '@common/components/MutliTypeKVTagInput/MultiTypeKVTagInput'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import type { TASBasicAppSetupTemplate } from './TASBasicAppSetupTypes'
import { getResizeStrategies } from '../TasCanaryAppSetup/TasCanaryAppSetupWidget'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
export interface TasBasicAppSetupInputSetProps<T> {
  initialValues: TASBasicAppSetupTemplate<T>
  onUpdate?: (data: TASBasicAppSetupTemplate<T>) => void
  onChange?: (data: TASBasicAppSetupTemplate<T>) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  readonly?: boolean
  template?: TASBasicAppSetupTemplate<T>
  path?: string
}

export default function TasBasicAppSetupInputSet<T>(props: TasBasicAppSetupInputSetProps<T>): React.ReactElement {
  const { template, path, readonly, allowableTypes, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`
  const isTemplateUsageView = stepViewType === StepViewType.TemplateUsage

  return (
    <FormikForm>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <TimeoutFieldInputSetView
          multiTypeDurationProps={{
            enableConfigureOptions: false,
            allowableTypes,
            expressions,
            disabled: readonly
          }}
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${prefix}timeout`}
          disabled={readonly}
          fieldPath={'timeout'}
          template={template}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
      {getMultiTypeFromValue((template?.spec as any)?.existingVersionToKeep) === MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          name={`${prefix}spec.existingVersionToKeep`}
          disabled={readonly}
          label={getString('cd.steps.tas.existingVersionToKeep')}
          multiTextInputProps={{
            expressions,
            allowableTypes,
            textProps: { type: 'number' }
          }}
          template={template}
          fieldPath={'spec.existingVersionToKeep'}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
      {getMultiTypeFromValue((template?.spec as any)?.resizeStrategy) === MultiTypeInputType.RUNTIME && (
        <SelectInputSetView
          label={getString('cd.steps.tas.resizeStrategy')}
          name={`${prefix}spec.resizeStrategy`}
          useValue
          fieldPath={'spec.resizeStrategy'}
          template={template}
          selectItems={getResizeStrategies(getString)}
          multiTypeInputProps={{
            expressions,
            disabled: readonly,
            allowableTypes,
            selectProps: {
              items: getResizeStrategies(getString)
            }
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          disabled={readonly}
          className={cx(stepCss.formGroup, { [stepCss.md]: !isTemplateUsageView })}
        />
      )}
      {getMultiTypeFromValue((template?.spec as any)?.additionalRoutes) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeKVTagInput
            name={`${prefix}spec.additionalRoutes`}
            tagsProps={{ placeholder: getString('cd.steps.tas.typeAndEnterForRouteAdd') }}
            multiTypeProps={{
              expressions,
              allowableTypes
            }}
            type={getString('tagLabel')}
            label={getString('cd.steps.tas.additionalRoutes')}
            enableConfigureOptions
            isArray={true}
          />
        </div>
      )}

      {getMultiTypeFromValue((template?.spec as any)?.tempRoutes) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeKVTagInput
            name={`${prefix}spec.tempRoutes`}
            tagsProps={{ placeholder: getString('cd.steps.tas.typeAndEnterForRouteAdd') }}
            multiTypeProps={{
              expressions,
              allowableTypes
            }}
            type={getString('tagLabel')}
            label={getString('cd.steps.tas.tempRoutes')}
            enableConfigureOptions
            isArray={true}
          />
        </div>
      )}
    </FormikForm>
  )
}
