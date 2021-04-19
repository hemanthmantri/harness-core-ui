import React from 'react'
import { FormInput, FormikForm, SelectOption } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'

import { useStrings } from 'framework/exports'
import { DurationInputFieldForInputSet } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { spec } from '../../types'
import { checkIfRunTimeInput } from '../../utils'
import type { ContinousVerificationProps } from './types'
import {
  baseLineOptions,
  durationOptions,
  trafficSplitPercentageOptions,
  VerificationSensitivityOptions
} from '../../constants'

export function ContinousVerificationInputSetStep(props: ContinousVerificationProps): React.ReactElement {
  const { template, path, initialValues, readonly, onUpdate } = props
  const { getString } = useStrings()
  const prefix = isEmpty(path) ? '' : `${path}.`
  const { sensitivity, duration, baseline, trafficsplit, deploymentTag } = (template?.spec?.spec as spec) || {}

  return (
    <FormikForm>
      {checkIfRunTimeInput(sensitivity) && (
        <FormInput.Select
          label={getString('sensitivity')}
          name={`${prefix}spec.spec.sensitivity`}
          items={VerificationSensitivityOptions}
          onChange={(option: SelectOption) => {
            const updatedSpecs = { spec: { ...initialValues.spec.spec, sensitivity: option.value.toString() } }
            onUpdate?.({ ...initialValues, spec: { ...initialValues.spec, ...updatedSpecs } })
          }}
          disabled={readonly}
        />
      )}

      {checkIfRunTimeInput(duration) && (
        <FormInput.Select
          label={getString('duration')}
          name={`${prefix}spec.spec.duration`}
          items={durationOptions}
          onChange={(option: SelectOption) => {
            const updatedSpecs = { spec: { ...initialValues.spec.spec, duration: option.value.toString() } }
            onUpdate?.({ ...initialValues, spec: { ...initialValues.spec, ...updatedSpecs } })
          }}
          disabled={readonly}
        />
      )}

      {checkIfRunTimeInput(baseline) && (
        <FormInput.Select
          label={getString('connectors.cdng.baseline')}
          name={`${prefix}spec.spec.baseline`}
          items={baseLineOptions}
          onChange={(option: SelectOption) => {
            const updatedSpecs = { spec: { ...initialValues.spec.spec, baseline: option.value.toString() } }
            onUpdate?.({ ...initialValues, spec: { ...initialValues.spec, ...updatedSpecs } })
          }}
          disabled={readonly}
        />
      )}

      {checkIfRunTimeInput(trafficsplit) && (
        <FormInput.Select
          label={getString('connectors.cdng.trafficsplit')}
          name={`${prefix}spec.spec.trafficsplit`}
          items={trafficSplitPercentageOptions}
          onChange={(option: SelectOption) => {
            const updatedSpecs = { spec: { ...initialValues.spec.spec, trafficsplit: option.value.toString() } }
            onUpdate?.({ ...initialValues, spec: { ...initialValues.spec, ...updatedSpecs } })
          }}
          disabled={readonly}
        />
      )}

      {checkIfRunTimeInput(deploymentTag) && (
        <FormInput.Text
          label={getString('connectors.cdng.deploymentTag')}
          name={`${prefix}spec.spec.deploymentTag`}
          disabled={readonly}
        />
      )}

      {checkIfRunTimeInput(template?.timeout) && (
        <DurationInputFieldForInputSet
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${prefix}timeout`}
          disabled={readonly}
        />
      )}
    </FormikForm>
  )
}
