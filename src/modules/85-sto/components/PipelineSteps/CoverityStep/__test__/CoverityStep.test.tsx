/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { StringKeys } from 'framework/strings'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { CoverityStep, CoverityStepData } from '../CoverityStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Coverity Step', () => {
  beforeAll(() => {
    factory.registerStep(new CoverityStep())
  })

  describe('Edit View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.Coverity} stepViewType={StepViewType.Edit} />
      )

      expect(container).toMatchSnapshot()
    })

    test('renders runtime inputs', async () => {
      const initialValues = {
        identifier: 'My_Coverity_Step',
        name: 'My Coverity Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          privileged: RUNTIME_INPUT_VALUE,
          target: {
            type: 'repository',
            name: 'target name',
            variant: 'target variant'
          },
          ingestion: {
            file: RUNTIME_INPUT_VALUE
          },
          mode: 'ingestion',
          config: 'default',
          settings: RUNTIME_INPUT_VALUE,
          advanced: {
            fail_on_severity: RUNTIME_INPUT_VALUE,
            log: {
              level: RUNTIME_INPUT_VALUE
            }
          },
          // Right now we do not support Image Pull Policy but will do in the future
          // pull: RUNTIME_INPUT_VALUE,
          resources: {
            limits: {
              cpu: RUNTIME_INPUT_VALUE,
              memory: RUNTIME_INPUT_VALUE
            }
          }
        }
      }

      const onUpdate = jest.fn()
      const ref = React.createRef<StepFormikRef<unknown>>()
      const { container } = render(
        <TestStepWidget
          initialValues={initialValues}
          type={StepType.Coverity}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={ref}
        />
      )

      expect(container).toMatchSnapshot()

      await act(() => ref.current?.submitForm()!)

      expect(onUpdate).toHaveBeenCalledWith(initialValues)
    })

    test('edit mode works', async () => {
      const initialValues = {
        identifier: 'My_Coverity_Step',
        name: 'My Coverity Step',
        description: 'Description',
        timeout: '10s',
        spec: {
          privileged: true,
          target: {
            type: 'repository',
            name: 'target name',
            variant: 'target/variant'
          },
          ingestion: {
            file: 'dir/file'
          },
          config: 'default',
          mode: 'ingestion',
          settings: {
            setting_1: 'settings test value 1',
            setting_2: 'settings test value 1'
          },
          advanced: {
            log: {
              level: 'debug'
            }
          },
          // Right now we do not support Image Pull Policy but will do in the future
          // pull: 'always',
          resources: {
            limits: {
              memory: '128Mi',
              cpu: '0.2'
            }
          }
        }
      }
      const onUpdate = jest.fn()
      const ref = React.createRef<StepFormikRef<unknown>>()
      const { container } = render(
        <TestStepWidget
          initialValues={initialValues}
          type={StepType.Coverity}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={ref}
        />
      )

      expect(container).toMatchSnapshot()

      await act(() => ref.current?.submitForm()!)

      expect(onUpdate).toHaveBeenCalledWith(initialValues)
    })
  })

  describe('InputSet View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget initialValues={{}} type={StepType.Coverity} stepViewType={StepViewType.InputSet} />
      )

      expect(container).toMatchSnapshot()
    })

    test('should render all fields', async () => {
      const template = {
        type: StepType.Coverity,
        identifier: 'My_Coverity_Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          target: {
            type: 'repository',
            name: RUNTIME_INPUT_VALUE,
            variant: RUNTIME_INPUT_VALUE
          },
          privileged: RUNTIME_INPUT_VALUE,
          settings: RUNTIME_INPUT_VALUE,
          // Right now we do not support Image Pull Policy but will do in the future
          // pull: RUNTIME_INPUT_VALUE,
          resources: {
            limits: {
              cpu: RUNTIME_INPUT_VALUE,
              memory: RUNTIME_INPUT_VALUE
            }
          }
        }
      }

      const allValues = {
        type: StepType.Coverity,
        name: 'Test A',
        identifier: 'My_Coverity_Step',
        description: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          target: {
            type: 'repository',
            name: RUNTIME_INPUT_VALUE,
            variant: RUNTIME_INPUT_VALUE
          },
          privileged: RUNTIME_INPUT_VALUE,
          settings: RUNTIME_INPUT_VALUE,
          // Right now we do not support Image Pull Policy but will do in the future
          // pull: RUNTIME_INPUT_VALUE,
          resources: {
            limits: {
              cpu: RUNTIME_INPUT_VALUE,
              memory: RUNTIME_INPUT_VALUE
            }
          }
        }
      }

      const onUpdate = jest.fn()

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.Coverity}
          template={template}
          allValues={allValues}
          stepViewType={StepViewType.InputSet}
          onUpdate={onUpdate}
        />
      )

      expect(container).toMatchSnapshot()
    })

    test('should not render any fields', async () => {
      const template = {
        type: StepType.Coverity,
        identifier: 'My_Coverity_Step'
      }

      const allValues = {
        type: StepType.Coverity,
        identifier: 'My_Coverity_Step',
        name: 'My Coverity Step',
        description: 'Description',
        timeout: '10s',
        spec: {
          privileged: false,
          config: 'default',
          target: {
            type: 'repository',
            name: 'target name',
            variant: 'target variant'
          },
          settings: {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3'
          },
          // Right now we do not support Image Pull Policy but will do in the future
          // pull: 'always',
          resources: {
            limits: {
              memory: '128Mi',
              cpu: '0.2'
            }
          }
        }
      }

      const onUpdate = jest.fn()

      const { container } = render(
        <TestStepWidget
          initialValues={{}}
          type={StepType.Coverity}
          template={template}
          allValues={allValues}
          stepViewType={StepViewType.InputSet}
          onUpdate={onUpdate}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })

  describe('InputVariable View', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestStepWidget
          initialValues={{
            identifier: 'Test_A',
            name: 'Test A',
            type: StepType.Coverity,
            description: 'Description',
            timeout: '10s',
            spec: {
              privileged: false,
              settings: {
                key1: 'value1',
                key2: 'value2',
                key3: 'value3'
              },
              // Right now we do not support Image Pull Policy but will do in the future
              // pull: 'always',
              resources: {
                limits: {
                  memory: '128Mi',
                  cpu: '0.2'
                }
              }
            }
          }}
          customStepProps={{
            stageIdentifier: 'qaStage',
            metadataMap: {
              'step-name': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.Coverity.name',
                  localName: 'step.Coverity.name'
                }
              },
              'step-identifier': {
                yamlExtraProperties: {
                  properties: [
                    {
                      fqn: 'pipeline.stages.qaStage.execution.steps.Coverity.identifier',
                      localName: 'step.Coverity.identifier',
                      variableName: 'identifier'
                    }
                  ]
                }
              },
              'step-description': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.Coverity.description',
                  localName: 'step.Coverity.description'
                }
              },
              'step-timeout': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.Coverity.timeout',
                  localName: 'step.Coverity.timeout'
                }
              },
              'step-settings': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.Coverity.spec.settings',
                  localName: 'step.Coverity.spec.settings'
                }
              },
              // Right now we do not support Image Pull Policy but will do in the future
              // 'step-pull': {
              //   yamlProperties: {
              //     fqn: 'pipeline.stages.qaStage.execution.steps.Coverity.spec.pull',
              //     localName: 'step.Coverity.spec.pull'
              //   }
              // },
              'step-limitMemory': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.Coverity.spec.resources.limits.memory',
                  localName: 'step.Coverity.spec.resources.limits.memory'
                }
              },
              'step-limitCPU': {
                yamlProperties: {
                  fqn: 'pipeline.stages.qaStage.execution.steps.Coverity.spec.resources.limits.cpu',
                  localName: 'step.Coverity.resources.spec.limits.cpu'
                }
              }
            },
            variablesData: {
              type: StepType.Coverity,
              __uuid: 'step-identifier',
              identifier: 'Coverity',
              name: 'step-name',
              description: 'step-description',
              timeout: 'step-timeout',
              spec: {
                privileged: 'step-privileged',
                settings: 'step-settings',
                // Right now we do not support Image Pull Policy but will do in the future
                // pull: 'step-pull',
                resources: {
                  limits: {
                    memory: 'step-limitMemory',
                    cpu: 'step-limitCPU'
                  }
                }
              }
            }
          }}
          type={StepType.Coverity}
          stepViewType={StepViewType.InputVariable}
        />
      )

      expect(container).toMatchSnapshot()
    })
  })

  test('validates input set correctly', () => {
    const data = {
      identifier: 'id',
      name: 'name',
      description: 'desc',
      type: StepType.Coverity,
      timeout: '1h',
      spec: {
        target: {
          type: 'repository',
          name: 'target name',
          variant: 'target variant'
        },
        advanced: {
          include_raw: false
        },
        config: 'default',
        mode: 'ingestion',
        privileged: true,
        settings: {
          policy_type: 'orchestratedScan',
          scan_type: 'repository',
          product_name: 'x',
          product_config_name: 'y'
        },
        imagePullPolicy: 'Always',
        runAsUser: 'user',
        resources: {
          limits: {
            memory: '1Gi',
            cpu: '1000m'
          }
        }
      }
    }

    const result = new CoverityStep().validateInputSet({
      data: data as unknown as CoverityStepData,
      template: data as unknown as CoverityStepData,
      getString: (key: StringKeys, _vars?: Record<string, any>) => key as string,
      viewType: StepViewType.DeploymentForm
    })

    expect(result).toMatchSnapshot()
  })
})
