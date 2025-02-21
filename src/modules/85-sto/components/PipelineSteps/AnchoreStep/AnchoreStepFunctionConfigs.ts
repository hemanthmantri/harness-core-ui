/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { Types as TransformValuesTypes } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  additionalFieldsValidationConfigEitView,
  additionalFieldsValidationConfigInputSet,
  authFieldsTransformConfig,
  authFieldsValidationConfig,
  commonFieldsTransformConfig,
  commonFieldsValidationConfig,
  imageFieldsValidationConfig,
  ingestionFieldValidationConfig
} from '../constants'
import type { Field, InputSetViewValidateFieldsConfig } from '../types'
import type { AnchoreStepData } from './AnchoreStep'

const toolFieldsTransformConfig = (data: AnchoreStepData): Field[] =>
  data.spec.mode === 'extraction'
    ? [
        {
          name: 'spec.tool.image_name',
          type: TransformValuesTypes.Text
        }
      ]
    : []

const toolFieldsValidationConfig = (
  data: AnchoreStepData,
  stepViewType?: StepViewType
): InputSetViewValidateFieldsConfig[] =>
  data.spec.mode === 'extraction' || stepViewType === StepViewType.InputSet
    ? [
        {
          name: 'spec.tool.image_name',
          type: ValidationFieldTypes.Text,
          label: 'imageNameLabel',
          isRequired: true
        }
      ]
    : []

const extraAuthFieldsTransformConfig = (data: AnchoreStepData): Field[] =>
  data.spec.mode === 'orchestration' || data.spec.mode === 'extraction'
    ? [
        {
          name: 'spec.auth.access_id',
          type: TransformValuesTypes.Text
        },
        {
          name: 'spec.auth.domain',
          type: TransformValuesTypes.Text
        }
      ]
    : []

const extraAuthFieldsValidationConfig = (
  data: AnchoreStepData,
  stepViewType?: StepViewType
): InputSetViewValidateFieldsConfig[] =>
  data.spec.mode === 'orchestration' || data.spec.mode === 'extraction' || stepViewType === StepViewType.InputSet
    ? [
        {
          name: 'spec.auth.access_id',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.authAccessId',
          isRequired: true
        },
        {
          name: 'spec.auth.domain',
          type: ValidationFieldTypes.Text,
          label: 'sto.stepField.authAccessId',
          isRequired: true
        }
      ]
    : []

export const transformValuesFieldsConfig = (data: AnchoreStepData): Field[] => {
  const transformValuesFieldsConfigValues = [
    ...commonFieldsTransformConfig(data),
    ...authFieldsTransformConfig(data),
    ...extraAuthFieldsTransformConfig(data),
    ...toolFieldsTransformConfig(data)
  ]

  return transformValuesFieldsConfigValues
}

export const editViewValidateFieldsConfig = (data: AnchoreStepData): InputSetViewValidateFieldsConfig[] => {
  const editViewValidationConfig = [
    ...commonFieldsValidationConfig,
    ...authFieldsValidationConfig(data),
    ...extraAuthFieldsValidationConfig(data),
    ...ingestionFieldValidationConfig(data),
    ...imageFieldsValidationConfig(data),
    ...toolFieldsValidationConfig(data),
    ...additionalFieldsValidationConfigEitView
  ]

  return editViewValidationConfig
}

export function getInputSetViewValidateFieldsConfig(data: AnchoreStepData): InputSetViewValidateFieldsConfig[] {
  const inputSetViewValidateFieldsConfig: InputSetViewValidateFieldsConfig[] = [
    ...commonFieldsValidationConfig,
    ...authFieldsValidationConfig(data, StepViewType.InputSet),
    ...extraAuthFieldsValidationConfig(data, StepViewType.InputSet),
    ...ingestionFieldValidationConfig(data, StepViewType.InputSet),
    ...imageFieldsValidationConfig(data, StepViewType.InputSet),
    ...toolFieldsValidationConfig(data, StepViewType.InputSet),
    ...additionalFieldsValidationConfigInputSet
  ]

  return inputSetViewValidateFieldsConfig
}
