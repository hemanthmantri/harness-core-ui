import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { noop } from 'lodash-es'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { mockSecret } from '@connectors/components/CreateConnector/K8sConnector/__test__/k8Mocks.ts'

import Stepk8ClusterDetails from '../Stepk8ClusterDetails'

const updateConnector = jest.fn()
const createConnector = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateTags: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

jest.mock('services/cd-ng', () => ({
  useCreateConnector: jest.fn().mockImplementation(() => ({ mutate: createConnector })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({ mutate: updateConnector })),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret))
}))

describe('Stepk8ClusterDetails', () => {
  test('render ', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Stepk8ClusterDetails
          setIsEditMode={noop}
          name="credentials"
          onConnectorCreated={noop}
          isEditMode={false}
          connectorInfo={{ name: 'name', identifier: 'id', type: 'K8sCluster', spec: {} } as any}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    await act(async () => {
      fireEvent.click(getByText('Save and Continue'))
    })

    expect(container).toMatchSnapshot()
    expect(getByText('Username is a required field')).toBeDefined()

    fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'masterUrl',
        value: 'dummyMasterUrl'
      },
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'textField',
        value: 'dummyusername'
      }
    ])
    expect(container).toMatchSnapshot()
  })
  test('render edit mode ', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Stepk8ClusterDetails
          setIsEditMode={noop}
          name="credentials"
          onConnectorCreated={noop}
          isEditMode={true}
          connectorInfo={
            {
              name: 'dummyname',
              identifier: 'dummyId',
              description: '',
              orgIdentifier: null,
              projectIdentifier: null,
              tags: {},
              type: 'K8sCluster',
              spec: {
                credential: {
                  type: 'ManualConfig',
                  spec: {
                    masterUrl: 'dummymasterUrl',
                    auth: {
                      type: 'UsernamePassword',
                      spec: { username: 'username', usernameRef: null, passwordRef: 'account.jkdhkjdhk' }
                    }
                  }
                }
              }
            } as any
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('Cluster Details')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })
  test('render edit mode  service token', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Stepk8ClusterDetails
          name="credentials"
          setIsEditMode={noop}
          onConnectorCreated={noop}
          isEditMode={true}
          connectorInfo={
            {
              name: 'dummy2',
              identifier: 'dummy2',
              description: '',
              orgIdentifier: null,
              projectIdentifier: null,
              tags: {},
              type: 'K8sCluster',
              spec: {
                credential: {
                  type: 'ManualConfig',
                  spec: {
                    masterUrl: 'master',
                    auth: { type: 'ServiceAccount', spec: { serviceAccountTokenRef: 'account.testcorrectpasswordRef' } }
                  }
                }
              }
            } as any
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('Cluster Details')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })
  test('render edit mode oidc update', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Stepk8ClusterDetails
          name="credentials"
          setIsEditMode={noop}
          onConnectorCreated={noop}
          isEditMode={true}
          connectorInfo={
            {
              name: 'dmhgjdgj',
              identifier: 'dmhgjdgj',
              description: '',
              orgIdentifier: null,
              projectIdentifier: null,
              tags: {},
              type: 'K8sCluster',
              spec: {
                credential: {
                  type: 'ManualConfig',
                  spec: {
                    masterUrl: 'nmbshg',
                    auth: {
                      type: 'OpenIdConnect',
                      spec: {
                        oidcIssuerUrl: 'hsdgjgj',
                        oidcUsername: 'dmhdj',
                        oidcUsernameRef: null,
                        oidcClientIdRef: 'account.jkdhkjdhk',
                        oidcPasswordRef: 'account.jkdhkjdhk',
                        oidcSecretRef: 'account.jkdhkjdhk',
                        oidcScopes: 'dhgjdd'
                      }
                    }
                  }
                }
              }
            } as any
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('Cluster Details')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })

  test('render edit mode if correct auth type is not given ', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Stepk8ClusterDetails
          setIsEditMode={noop}
          name="credentials"
          onConnectorCreated={noop}
          isEditMode={true}
          connectorInfo={
            {
              name: 'dmhgjdgj',
              identifier: 'dmhgjdgj',
              description: '',
              orgIdentifier: null,
              projectIdentifier: null,
              tags: {},
              type: 'K8sCluster',
              spec: {
                credential: {
                  type: 'ManualConfig',
                  spec: {
                    masterUrl: 'nmbshg',
                    auth: {
                      type: 'OpenIdWrongConnect',
                      spec: {
                        oidcIssuerUrl: 'hsdgjgj',
                        oidcUsername: 'dmhdj',
                        oidcUsernameRef: null,
                        oidcClientIdRef: 'account.jkdhkjdhk',
                        oidcPasswordRef: 'account.jkdhkjdhk',
                        oidcSecretRef: 'account.jkdhkjdhk',
                        oidcScopes: 'dhgjdd'
                      }
                    }
                  }
                }
              }
            } as any
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('Cluster Details')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })
})
