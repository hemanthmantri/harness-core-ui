/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { fireEvent, render, waitFor } from '@testing-library/react'
import React from 'react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import { CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@platform/connectors/constants'
import StepTasAuthentication from '../StepTasAuthentication'
import { commonProps, connectorInfoMock, mockSecret, mockSecretList } from '../../__tests__/mocks'

jest.mock('services/cd-ng', () => ({
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecretList)),
  getSecretV2Promise: jest.fn().mockImplementation(() => Promise.resolve(mockSecret))
}))

describe('<StepTasAuthentication />', () => {
  jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
    CDS_CF_TOKEN_AUTH: true
  })
  test('nextStep coverage and called with inputs', async () => {
    const nextStep = jest.fn()
    const { getByText, container, getAllByText } = render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <StepTasAuthentication
          {...commonProps}
          name={'credentials'}
          identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
          isEditMode={false}
          connectorInfo={connectorInfoMock}
          nextStep={nextStep}
        />
      </TestWrapper>
    )

    // Change Endpoint URL
    fireEvent.change(container.querySelector('input[name="endpointUrl"]')!, {
      target: { value: 'http://sample_url_tas.com/' }
    })

    // Change username
    fireEvent.change(container.querySelector('input[name="usernametextField"]')!, {
      target: { value: 'AdminUser' }
    })

    // Change token
    fireEvent.click(getAllByText('createOrSelectSecret')[0])

    await waitFor(() => getByText('common.entityReferenceTitle'))

    fireEvent.click(getByText('TasToken')!)

    fireEvent.click(getByText('entityReference.apply')!)

    // Change refresh token
    fireEvent.click(getAllByText('createOrSelectSecret')[0])

    await waitFor(() => getByText('common.entityReferenceTitle'))

    fireEvent.click(getByText('TasTokenRefresh')!)

    fireEvent.click(getByText('entityReference.apply')!)

    await act(async () => {
      fireEvent.click(container.querySelector('button[type="submit"]')!)
    })

    expect(getAllByText('platform.secrets.secret.configureSecret')[0]).toBeInTheDocument()
    expect(getByText('<TasToken>')).toBeInTheDocument()
    expect(getAllByText('platform.secrets.secret.configureSecret')[1]).toBeInTheDocument()
    expect(getByText('<TasTokenRefresh>')).toBeInTheDocument()

    expect(nextStep).toBeCalledWith({
      passwordRef: {
        identifier: 'TasToken',
        name: 'TasToken',
        referenceString: 'account.TasToken',
        type: 'SecretText'
      },
      description: 'test description',
      endpointUrl: 'http://sample_url_tas.com/',
      identifier: 'tasConnector',
      name: 'tasConnector',
      orgIdentifier: 'default',
      projectIdentifier: 'defaultproject',
      spec: {
        credential: {
          spec: {
            endpointUrl: 'http://sample_url.com/',
            passwordRef: 'tasToken',
            refreshTokenRef: 'tasTokenRefresh',
            username: 'admin',
            usernameRef: null
          },
          type: 'ManualConfig'
        },
        delegateSelectors: ['account-delegate-1668077546'],
        executeOnDelegate: true
      },
      tags: { tag1: '', tag2: '', tag3: '' },
      refreshTokenRef: {
        identifier: 'TasTokenRefresh',
        name: 'TasTokenRefresh',
        referenceString: 'account.TasTokenRefresh',
        type: 'SecretText'
      },
      type: 'Tas',
      username: { type: 'TEXT', value: 'AdminUser' },
      usernamefieldType: 'TEXT',
      usernametextField: 'AdminUser'
    })
  })
})
