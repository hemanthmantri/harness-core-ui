/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { Types as TransformValuesTypes } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'

import { Field, SscaCdOrchestrationStepData, SscaCiOrchestrationStepData } from './types'

export function transformValuesFieldsConfig<StepType, T>(stepType?: StepType, data?: T): Field[] {
  const _data = data as SscaCiOrchestrationStepData | SscaCdOrchestrationStepData

  return [
    {
      name: 'identifier',
      type: TransformValuesTypes.Text
    },
    {
      name: 'name',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.attestation.type',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.attestation.spec.privateKey',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.attestation.spec.password',
      type: TransformValuesTypes.Text
    },
    {
      name: 'spec.source.type',
      type: TransformValuesTypes.List
    },
    {
      name: 'spec.source.spec.connector',
      type: TransformValuesTypes.ConnectorRef
    },
    {
      name: 'spec.source.spec.image',
      type: TransformValuesTypes.Text
    },
    ...(_data?.spec.mode === 'ingestion'
      ? [
          {
            name: 'spec.ingestion.file',
            type: TransformValuesTypes.Text
          }
        ]
      : [
          {
            name: 'spec.tool.type',
            type: TransformValuesTypes.List
          },
          {
            name: 'spec.tool.spec.format',
            type: TransformValuesTypes.List
          }
        ]),
    ...(stepType === StepType.CdSscaOrchestration
      ? [
          {
            name: 'spec.infrastructure.type',
            type: TransformValuesTypes.Text
          },
          {
            name: 'spec.infrastructure.spec.connectorRef',
            type: TransformValuesTypes.ConnectorRef
          },
          {
            name: 'spec.infrastructure.spec.namespace',
            type: TransformValuesTypes.Text
          },
          {
            name: 'spec.infrastructure.spec.resources.limits.memory',
            type: TransformValuesTypes.Text
          },
          {
            name: 'spec.infrastructure.spec.resources.limits.cpu',
            type: TransformValuesTypes.Text
          }
        ]
      : [
          {
            name: 'spec.mode',
            type: TransformValuesTypes.List
          },
          {
            name: 'spec.resources.limits.memory',
            type: TransformValuesTypes.Text
          },
          {
            name: 'spec.resources.limits.cpu',
            type: TransformValuesTypes.Text
          }
        ]),
    {
      name: 'timeout',
      type: TransformValuesTypes.Text
    }
  ]
}

export const editViewValidateFieldsConfig = (stepType: StepType) => [
  {
    name: 'identifier',
    type: ValidationFieldTypes.Identifier,
    label: 'identifier',
    isRequired: true
  },
  {
    name: 'name',
    type: ValidationFieldTypes.Name,
    label: 'pipelineSteps.stepNameLabel',
    isRequired: true
  },
  {
    name: 'spec.tool.type',
    type: ValidationFieldTypes.List,
    label: 'ssca.orchestrationStep.sbomTool',
    isRequired: true
  },
  {
    name: 'spec.tool.spec.format',
    type: ValidationFieldTypes.List,
    label: 'ssca.orchestrationStep.sbomFormat',
    isRequired: true
  },
  {
    name: 'spec.attestation.type',
    type: ValidationFieldTypes.Text,
    label: 'platform.connectors.serviceNow.privateKey'
  },
  {
    name: 'spec.attestation.spec.privateKey',
    type: ValidationFieldTypes.Text,
    label: 'platform.connectors.serviceNow.privateKey'
  },
  {
    name: 'spec.attestation.spec.password',
    type: ValidationFieldTypes.Text,
    label: 'password'
  },
  {
    name: 'spec.source.type',
    type: ValidationFieldTypes.List,
    label: 'pipeline.artifactsSelection.artifactType',
    isRequired: true
  },
  {
    name: 'spec.source.spec.connector',
    type: ValidationFieldTypes.Text,
    label: 'pipelineSteps.connectorLabel',
    isRequired: true
  },
  {
    name: 'spec.source.spec.image',
    type: ValidationFieldTypes.Text,
    label: 'imageLabel',
    isRequired: true
  },
  ...(stepType === StepType.CdSscaOrchestration
    ? [
        {
          name: 'spec.infrastructure.type',
          type: ValidationFieldTypes.Text
        },
        {
          name: 'spec.infrastructure.spec.connectorRef',
          type: ValidationFieldTypes.Text,
          label: 'connector',
          isRequired: true
        },
        {
          name: 'spec.infrastructure.spec.namespace',
          type: ValidationFieldTypes.Text,
          label: 'common.namespace',
          isRequired: true
        },
        {
          name: 'spec.infrastructure.spec.resources.limits.memory',
          type: ValidationFieldTypes.LimitMemory,
          label: 'pipelineSteps.limitMemoryLabel',
          isRequired: true
        },
        {
          name: 'spec.infrastructure.spec.resources.limits.cpu',
          type: ValidationFieldTypes.LimitCPU,
          label: 'pipelineSteps.limitCPULabel',
          isRequired: true
        }
      ]
    : [
        {
          name: 'spec.mode',
          type: ValidationFieldTypes.List,
          label: 'ssca.orchestrationStep.stepMode',
          isRequired: true
        },
        {
          name: 'spec.ingestion.file',
          type: ValidationFieldTypes.Text,
          label: 'pipelineSteps.limitMemoryLabel'
        },
        {
          name: 'spec.resources.limits.memory',
          type: ValidationFieldTypes.LimitMemory,
          label: 'pipelineSteps.limitMemoryLabel'
        },
        {
          name: 'spec.resources.limits.cpu',
          type: ValidationFieldTypes.LimitCPU,
          label: 'pipelineSteps.limitCPULabel'
        }
      ]),
  {
    name: 'timeout',
    type: ValidationFieldTypes.Timeout,
    label: 'pipelineSteps.timeoutLabel'
  }
]

export const getInputSetViewValidateFieldsConfig =
  (stepType: StepType) =>
  (isRequired = true): Array<{ name: string; type: ValidationFieldTypes; label?: string; isRequired?: boolean }> => {
    return [
      {
        name: 'spec.source.spec.connector',
        type: ValidationFieldTypes.Text,
        label: 'pipelineSteps.connectorLabel',
        isRequired
      },
      {
        name: 'spec.source.spec.image',
        type: ValidationFieldTypes.Text,
        label: 'imageLabel',
        isRequired
      },
      {
        name: 'spec.attestation.spec.privateKey',
        type: ValidationFieldTypes.Text,
        label: 'platform.connectors.serviceNow.privateKey'
      },
      {
        name: 'spec.attestation.spec.password',
        type: ValidationFieldTypes.Text,
        label: 'password'
      },
      ...(stepType === StepType.CdSscaOrchestration
        ? [
            {
              name: 'spec.infrastructure.spec.connectorRef',
              type: ValidationFieldTypes.Text,
              label: 'connector',
              isRequired
            },
            {
              name: 'spec.infrastructure.spec.namespace',
              type: ValidationFieldTypes.Namespace,
              label: 'common.namespace',
              isRequired
            },
            {
              name: 'spec.infrastructure.spec.resources.limits.memory',
              type: ValidationFieldTypes.LimitMemory,
              label: 'pipelineSteps.limitMemoryLabel',
              isRequired
            },
            {
              name: 'spec.infrastructure.spec.resources.limits.cpu',
              type: ValidationFieldTypes.LimitCPU,
              label: 'pipelineSteps.limitCPULabel',
              isRequired
            }
          ]
        : [
            {
              name: 'spec.mode',
              type: ValidationFieldTypes.List,
              label: 'ssca.orchestrationStep.stepMode',
              isRequired
            },
            {
              name: 'spec.ingestion.file',
              type: ValidationFieldTypes.Text,
              label: 'ssca.orchestrationStep.ingestion.file'
            },
            {
              name: 'spec.resources.limits.memory',
              type: ValidationFieldTypes.LimitMemory,
              label: 'pipelineSteps.limitMemoryLabel'
            },
            {
              name: 'spec.resources.limits.cpu',
              type: ValidationFieldTypes.LimitCPU,
              label: 'pipelineSteps.limitCPULabel'
            }
          ]),
      {
        name: 'timeout',
        type: ValidationFieldTypes.Timeout,
        label: 'pipelineSteps.timeoutLabel'
      }
    ]
  }
