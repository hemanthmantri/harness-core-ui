/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, queryByAttribute, fireEvent, act, findByText, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { findDialogContainer } from '@common/utils/testUtils'
import { mockSecretList } from '@filestore/components/MultiTypeFileSelect/EncryptedSelect/__tests__/mock'
import { HttpStep } from '../HttpStep'
import type { HttpStepVariablesViewProps } from '../HttpStepVariablesView'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('services/cd-ng', () => ({
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecretList)),
  getSecretV2Promise: jest.fn().mockImplementation(() => {
    return { data: mockSecretList, refetch: jest.fn() }
  })
}))
jest.mock('@common/hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn(() => true),
  useFeatureFlags: jest.fn(() => {
    return { CDS_HTTP_STEP_NG_CERTIFICATE: true }
  })
}))
const selectSecretFromDialog = async (): Promise<void> => {
  //opening secret dialog
  const modal = findDialogContainer()
  const secret = await findByText(modal!, 'selected_secret')
  fireEvent.click(secret)
  const applyBtn = await waitFor(() => findByText(modal!, 'entityReference.apply'))
  fireEvent.click(applyBtn)
}
describe('Http Step', () => {
  beforeAll(() => {
    factory.registerStep(new HttpStep())
  })

  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.HTTP} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('renders runtime inputs', () => {
    const initialValues = {
      identifier: 'My_Http_Step',
      name: 'My Http Step',
      spec: {
        method: RUNTIME_INPUT_VALUE,
        url: RUNTIME_INPUT_VALUE,
        requestBody: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        assertion: RUNTIME_INPUT_VALUE,
        certificate: RUNTIME_INPUT_VALUE,
        certificateKey: RUNTIME_INPUT_VALUE,
        headers: [
          {
            key: 'Header',
            value: RUNTIME_INPUT_VALUE
          }
        ],
        outputVariables: [
          {
            name: 'Output',
            type: 'String',
            value: RUNTIME_INPUT_VALUE
          }
        ]
      }
    }
    const { container } = render(
      <TestStepWidget initialValues={initialValues} type={StepType.HTTP} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('edit mode works', () => {
    const initialValues = {
      identifier: 'My_Http_Step',
      name: 'My Http Step',
      spec: {
        method: 'POST',
        url: RUNTIME_INPUT_VALUE,
        requestBody: RUNTIME_INPUT_VALUE,
        assertion: RUNTIME_INPUT_VALUE,
        timeout: '10s',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json'
          },
          {
            key: 'Header',
            value: RUNTIME_INPUT_VALUE
          }
        ],
        outputVariables: [
          {
            name: 'myVar',
            type: 'String',
            value: 'response.message'
          },
          {
            name: 'myVar1',
            type: 'String',
            value: RUNTIME_INPUT_VALUE
          }
        ]
      }
    }
    const { container } = render(
      <TestStepWidget initialValues={initialValues} type={StepType.HTTP} stepViewType={StepViewType.Edit} />
    )

    expect(container).toMatchSnapshot()
  })

  test('form produces correct data for fixed inputs', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText, getByTestId, getAllByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.HTTP}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'My Http Step' } })
    fireEvent.change(queryByNameAttribute('spec.url')!, { target: { value: 'https://someapi.com/v3' } })
    fireEvent.change(queryByNameAttribute('spec.requestBody')!, {
      target: { value: '{ "message": "Hello world!" }' }
    })

    fireEvent.click(getByText('common.optionalConfig'))

    fireEvent.change(queryByNameAttribute('spec.assertion')!, { target: { value: '${httpResponseBody} == 200' } })

    const secretInputFields = getAllByText('createOrSelectSecret')
    //click on certificate key input box
    fireEvent.click(secretInputFields[1]!)
    await selectSecretFromDialog()

    fireEvent.click(getByTestId('add-header'))
    fireEvent.change(queryByNameAttribute('spec.headers[0].key')!, { target: { value: 'Content-Type' } })
    fireEvent.change(queryByNameAttribute('spec.headers[0].value')!, { target: { value: 'application/json' } })

    fireEvent.click(getByTestId('add-input-response-mapping'))

    fireEvent.change(queryByNameAttribute('spec.inputVariables[0].name')!, { target: { value: 'inputVar' } })
    fireEvent.change(queryByNameAttribute('spec.inputVariables[0].value')!, { target: { value: 'request.message' } })

    fireEvent.click(getByTestId('add-output-response-mapping'))

    fireEvent.change(queryByNameAttribute('spec.outputVariables[0].name')!, { target: { value: 'myVar' } })
    fireEvent.change(queryByNameAttribute('spec.outputVariables[0].value')!, { target: { value: 'response.message' } })

    await act(() => ref.current?.submitForm()!)
    // Validating certificateKey provided needs certificate value
    expect(getByText('pipeline.httpStep.validation.certificate')).toBeTruthy()

    //click on certificate input box
    fireEvent.click(secretInputFields[0]!)
    await selectSecretFromDialog()

    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'My_Http_Step',
      name: 'My Http Step',
      timeout: '10s',
      type: 'Http',
      spec: {
        certificateKey: 'account.selected_secret',
        certificate: 'account.selected_secret',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json'
          }
        ],
        method: 'GET',
        assertion: '${httpResponseBody} == 200',
        inputVariables: [
          {
            name: 'inputVar',
            type: 'String',
            value: 'request.message'
          }
        ],
        outputVariables: [
          {
            name: 'myVar',
            type: 'String',
            value: 'response.message'
          }
        ],

        url: 'https://someapi.com/v3'
      }
    })

    //timeout validation on submit
    fireEvent.change(container.querySelector('input[value="10s"]') as HTMLElement, { target: { value: '' } })

    await act(() => ref.current?.submitForm()!)
    expect(getByText('validation.timeout10SecMinimum')).toBeTruthy()
  })

  test('renders input sets', () => {
    const onUpdate = jest.fn()
    const initialValues = {
      identifier: 'My_Http_Step',
      name: 'My Http Step',
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        method: RUNTIME_INPUT_VALUE,
        url: RUNTIME_INPUT_VALUE,
        requestBody: RUNTIME_INPUT_VALUE,
        timeout: RUNTIME_INPUT_VALUE,
        assertion: RUNTIME_INPUT_VALUE,
        headers: [
          {
            key: 'Authorization',
            value: 'value'
          }
        ],
        outputVariables: [
          {
            name: 'someVar',
            value: '<+input>',
            type: 'String'
          }
        ]
      }
    }
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        template={initialValues}
        type={StepType.HTTP}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
        path="/abc"
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('renders empty input sets', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.HTTP}
        stepViewType={StepViewType.InputSet}
        template={{}}
        path=""
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('render inputvariables ', () => {
    const props = {
      initialValues: {
        spec: {}
      },
      customStepProps: {
        originalData: {
          identifier: 'data',
          name: 'demo',
          spec: {},
          type: StepType.HTTP
        },
        variablesData: {
          type: StepType.HTTP,
          identifier: 'demo',
          name: 'demo',
          description: 'Description',
          timeout: 'step-timeout',
          spec: {
            headers: [
              {
                key: 'Authorization',
                value: 'value'
              }
            ],
            outputVariables: [
              {
                name: 'someVar',
                value: '<+input>',
                type: 'String'
              }
            ]
          }
        },
        metadataMap: {}
      } as HttpStepVariablesViewProps
    }
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.HTTP}
        customStepProps={props.customStepProps}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('renders empty inputVariables', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.HTTP}
        stepViewType={StepViewType.InputVariable}
        customStepProps={{}}
      />
    )
    expect(container).toMatchSnapshot()
  })
})

describe('validate http step input sets', () => {
  test('validates default inputs set correctly', () => {
    const response = new HttpStep().validateInputSet({
      data: {
        name: 'HTTP Step',
        identifier: 'HTTP_Step',
        timeout: '10s',
        type: 'Http',
        spec: {
          url: 'https://abc.com',
          method: 'POST',
          headers: [
            {
              key: 'Authorization',
              value: 'header.payload.signature'
            }
          ],
          outputVariables: [
            {
              name: 'someVar',
              value: 'dummy',
              type: 'String'
            }
          ],
          requestBody: '{\nsomeVar: "Ash"\n}'
        }
      },
      template: {
        name: 'HTTP Step',
        identifier: 'HTTP_Step',
        timeout: '<+input>',
        type: 'Http',
        spec: {
          url: '<+input>',
          method: '<+input>',
          headers: [
            {
              key: 'Authorization',
              value: '<+input>'
            }
          ],
          outputVariables: [
            {
              name: 'someVar',
              value: '<+input>',
              type: 'String'
            }
          ],
          requestBody: '<+input>'
        }
      },
      viewType: StepViewType.DeploymentForm,
      getString: jest.fn().mockImplementation(val => val)
    })
    expect(response).toMatchSnapshot()
  })

  test('validates error in inputs set', () => {
    const response = new HttpStep().validateInputSet({
      data: {
        name: 'HTTP Step',
        identifier: 'HTTP_Step',
        timeout: '10s',
        type: 'Http',
        spec: {
          url: '',
          method: '',
          headers: [
            {
              key: 'Authorization',
              value: ''
            }
          ],
          outputVariables: [
            {
              name: 'someVar',
              value: '',
              type: 'String'
            }
          ],
          requestBody: ''
        }
      },
      template: {
        name: 'HTTP Step',
        identifier: 'HTTP_Step',
        timeout: '<+input>',
        type: 'Http',
        spec: {
          url: '<+input>',
          method: '<+input>',
          headers: [
            {
              key: 'Authorization',
              value: '<+input>'
            }
          ],
          outputVariables: [
            {
              name: 'someVar',
              value: '<+input>',
              type: 'String'
            }
          ],
          requestBody: '<+input>'
        }
      },
      viewType: StepViewType.DeploymentForm,
      getString: jest.fn().mockImplementation(val => val)
    })
    expect(response).toMatchSnapshot()
  })

  test('validates timeout is min 10s', () => {
    const response = new HttpStep().validateInputSet({
      data: {
        name: 'HTTP Step',
        identifier: 'HTTP_Step',
        timeout: '1s',
        type: 'Http',
        spec: {
          url: 'https://abc.com',
          method: 'POST',
          requestBody: '{\nsomeVar: "Ash"\n}'
        }
      },
      template: {
        name: 'HTTP Step',
        identifier: 'HTTP_Step',
        timeout: '<+input>',
        type: 'Http',
        spec: {
          url: '<+input>',
          method: '<+input>',
          requestBody: '{\nsomeVar: "Ash"\n}'
        }
      },
      viewType: StepViewType.TriggerForm
    })
    expect(response).toMatchSnapshot()
  })
})
