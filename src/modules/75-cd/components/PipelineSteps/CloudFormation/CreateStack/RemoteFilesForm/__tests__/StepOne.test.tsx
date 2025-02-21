/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdServices from 'services/cd-ng'
import StepOne from '../RemoteStepOne'

const mockedConnectorData = {
  name: 'harness-qa',
  identifier: 'harnessqa',
  description: null,
  orgIdentifier: null,
  projectIdentifier: null,
  tags: {},
  type: 'CEAws',
  spec: {
    featuresEnabled: ['VISIBILITY', 'OPTIMIZATION', 'BILLING'],
    tenantId: 'b229b2bb-5f33-4d22-bce0-730f6474e906',
    subscriptionId: '20d6a917-99fa-4b1b-9b2e-a3d624e9dcf0',
    billingExportSpec: {
      storageAccountName: 'cesrcbillingstorage',
      containerName: 'cesrcbillingcontainer',
      directoryName: 'billingdirectorycommon',
      reportName: 'cebillingreportharnessqa-lightwing',
      subscriptionId: '20d6a917-99fa-4b1b-9b2e-a3d624e9dcf0'
    }
  }
}

const mockedConnectorDataResponse = { response: mockedConnectorData }

jest.spyOn(cdServices, 'useGetConnector').mockImplementation(
  () =>
    ({
      loading: false,
      refetch: jest.fn(),
      data: mockedConnectorDataResponse
    } as any)
)

describe('Test cloudformation remote wizard step one', () => {
  test('should render with no initial data', () => {
    const data = {
      type: 'CreateStack',
      name: 'createStack',
      timeout: '10m',
      identifier: 'createStack',
      spec: {
        provisionerIdentifier: 'createStack',
        configuration: {
          stackName: 'createStack',
          connectorRef: 'demo_aws',
          region: 'eu-west-1',
          templateFile: {
            type: 'Remote',
            spec: {
              store: {
                spec: {}
              }
            }
          }
        }
      }
    }
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <StepOne
          isReadonly={false}
          initialValues={data}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          index={undefined}
          regions={[]}
          setShowNewConnector={() => undefined}
          selectedConnector={''}
          setSelectedConnector={() => undefined}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render with runtime data', () => {
    const data = {
      type: 'CreateStack',
      name: 'createStack',
      timeout: '10m',
      identifier: 'createStack',
      spec: {
        provisionerIdentifier: 'createStack',
        configuration: {
          stackName: 'createStack',
          connectorRef: 'demo_aws',
          region: 'eu-west-1',
          templateFile: {
            type: 'Remote',
            spec: {
              store: {
                type: RUNTIME_INPUT_VALUE,
                spec: {
                  branch: RUNTIME_INPUT_VALUE,
                  connectorRef: RUNTIME_INPUT_VALUE,
                  gitFetchType: RUNTIME_INPUT_VALUE,
                  paths: RUNTIME_INPUT_VALUE
                }
              }
            }
          }
        }
      }
    }
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <StepOne
          isReadonly={false}
          initialValues={data}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          index={undefined}
          regions={[]}
          setShowNewConnector={() => undefined}
          selectedConnector={''}
          setSelectedConnector={() => undefined}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render with initial data', () => {
    const data = {
      type: 'CreateStack',
      name: 'createStack',
      timeout: '10m',
      identifier: 'createStack',
      spec: {
        provisionerIdentifier: 'createStack',
        configuration: {
          stackName: 'createStack',
          connectorRef: 'demo_aws',
          region: 'eu-west-1',
          templateFile: {
            type: 'Remote',
            spec: {
              store: {
                type: 'Github',
                spec: {
                  branch: 'main',
                  connectorRef: 'github_demo',
                  gitFetchType: 'Branch',
                  paths: ['test.com']
                }
              }
            }
          }
        }
      }
    }
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <StepOne
          isReadonly={false}
          initialValues={data}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          index={undefined}
          regions={[]}
          setShowNewConnector={() => undefined}
          selectedConnector={'Github'}
          setSelectedConnector={() => undefined}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should click each repo option', async () => {
    const data = {
      type: 'CreateStack',
      name: 'createStack',
      timeout: '10m',
      identifier: 'createStack',
      spec: {
        provisionerIdentifier: 'createStack',
        configuration: {
          stackName: 'createStack',
          connectorRef: 'demo_aws',
          region: 'eu-west-1',
          templateFile: {
            type: 'Remote',
            spec: {
              store: {
                type: 'Github',
                spec: {
                  branch: 'main',
                  connectorRef: 'github_demo',
                  gitFetchType: 'Branch',
                  paths: ['test.com']
                }
              }
            }
          }
        }
      }
    }
    const { container, getByTestId } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <StepOne
          isReadonly={false}
          initialValues={data}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          index={undefined}
          regions={[]}
          setShowNewConnector={() => undefined}
          selectedConnector={'Github'}
          setSelectedConnector={() => undefined}
        />
      </TestWrapper>
    )
    const git = getByTestId('connector-Git')
    await userEvent.click(git)
    expect(container).toMatchSnapshot()

    const github = getByTestId('connector-Github')
    await userEvent.click(github)
    expect(container).toMatchSnapshot()

    const gitLab = getByTestId('connector-GitLab')
    await userEvent.click(gitLab)
    expect(container).toMatchSnapshot()

    const bitbucket = getByTestId('connector-Bitbucket')
    await userEvent.click(bitbucket)
    expect(container).toMatchSnapshot()
  })

  test('should render parameter details', () => {
    const data = {
      type: 'CreateStack',
      name: 'createStack',
      timeout: '10m',
      identifier: 'createStack',
      spec: {
        provisionerIdentifier: 'createStack',
        configuration: {
          stackName: 'createStack',
          connectorRef: 'demo_aws',
          region: 'eu-west-1',
          parameters: [
            {
              type: 'Remote',
              store: {
                type: 'Github',
                spec: {
                  branch: 'main',
                  connectorRef: 'github_demo',
                  gitFetchType: 'Branch',
                  paths: ['test.com']
                }
              }
            }
          ]
        }
      }
    }
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <StepOne
          isReadonly={false}
          initialValues={data}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          index={0}
          regions={[]}
          setShowNewConnector={() => undefined}
          selectedConnector={'Github'}
          setSelectedConnector={() => undefined}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render parameter details including S3 and region', () => {
    const data = {
      type: 'CreateStack',
      name: 'createStack',
      timeout: '10m',
      identifier: 'createStack',
      spec: {
        provisionerIdentifier: 'createStack',
        configuration: {
          stackName: 'createStack',
          connectorRef: 'demo_aws',
          region: 'eu-west-1',
          parameters: [
            {
              type: 'Remote',
              store: {
                type: 'S3Url',
                spec: {
                  connectorRef: 'github_demo',
                  region: 'us-east',
                  paths: ['test.com']
                }
              }
            }
          ]
        }
      }
    }
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <StepOne
          isReadonly={false}
          initialValues={data}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          index={0}
          regions={[]}
          setShowNewConnector={() => undefined}
          selectedConnector={'S3'}
          setSelectedConnector={() => undefined}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render parameter details including S3 and region', () => {
    const data = {
      type: 'CreateStack',
      name: 'createStack',
      timeout: '10m',
      identifier: 'createStack',
      spec: {
        provisionerIdentifier: 'createStack',
        configuration: {
          stackName: 'createStack',
          connectorRef: 'demo_aws',
          region: 'eu-west-1',
          parameters: [
            {
              type: 'Remote',
              store: {
                type: 'S3Url',
                spec: {
                  connectorRef: RUNTIME_INPUT_VALUE,
                  region: RUNTIME_INPUT_VALUE,
                  paths: RUNTIME_INPUT_VALUE
                }
              }
            }
          ]
        }
      }
    }
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <StepOne
          isReadonly={false}
          initialValues={data}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          index={0}
          regions={[]}
          setShowNewConnector={() => undefined}
          selectedConnector={'S3'}
          setSelectedConnector={() => undefined}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render submit step one', async () => {
    const data = {
      type: 'CreateStack',
      name: 'createStack',
      timeout: '10m',
      identifier: 'createStack',
      spec: {
        provisionerIdentifier: 'createStack',
        configuration: {
          stackName: 'createStack',
          connectorRef: 'demo_aws',
          region: 'eu-west-1',
          parameters: [
            {
              type: 'Remote',
              store: {
                type: 'Github',
                spec: {
                  branch: 'main',
                  connectorRef: 'github_demo',
                  gitFetchType: 'Branch',
                  paths: ['test.com']
                }
              }
            }
          ]
        }
      }
    }
    const { container, getByTestId } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <StepOne
          isReadonly={false}
          initialValues={data}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          index={0}
          regions={[]}
          setShowNewConnector={() => undefined}
          selectedConnector={'Github'}
          setSelectedConnector={() => undefined}
        />
      </TestWrapper>
    )
    const continueButton = getByTestId('submit')
    await userEvent.click(continueButton)

    expect(container).toMatchSnapshot()
  })

  test('should render error when submitting', async () => {
    const data = {
      type: 'CreateStack',
      name: 'createStack',
      timeout: '10m',
      identifier: 'createStack',
      spec: {
        provisionerIdentifier: 'createStack',
        configuration: {
          stackName: 'createStack',
          connectorRef: 'demo_aws',
          region: 'eu-west-1'
        }
      }
    }
    const { container, getByTestId } = render(
      <TestWrapper
        path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <StepOne
          isReadonly={false}
          initialValues={data}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          index={0}
          regions={[]}
          setShowNewConnector={() => undefined}
          selectedConnector={''}
          setSelectedConnector={() => undefined}
        />
      </TestWrapper>
    )
    const continueButton = getByTestId('submit')
    await userEvent.click(continueButton)

    expect(container).toMatchSnapshot()
  })
})
