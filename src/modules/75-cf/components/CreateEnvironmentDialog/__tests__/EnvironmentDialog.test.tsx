/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, RenderResult, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import * as useFeaturesMock from '@common/hooks/useFeatures'
import * as usePlanEnforcementMock from '@cf/hooks/usePlanEnforcement'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { CheckFeatureReturn } from 'framework/featureStore/featureStoreUtil'
import mockImport from 'framework/utils/mockImport'
import EnvironmentDialog, { EnvironmentDialogProps } from '../EnvironmentDialog'
import mockCreateEnvironmentResp from './mockCreateEnvironmentResp'

const createEnvironment = jest.fn().mockResolvedValue(mockCreateEnvironmentResp)

const renderComponent = (props: Partial<EnvironmentDialogProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <EnvironmentDialog onCreate={jest.fn()} environments={[]} {...props} />
    </TestWrapper>
  )
}

describe('EnvironmentDialog', () => {
  beforeEach(() => {
    jest.spyOn(usePlanEnforcementMock, 'default').mockReturnValue({ isPlanEnforcementEnabled: true, isFreePlan: false })
    mockImport('services/cd-ng', {
      useCreateEnvironment: () => ({
        mutate: createEnvironment,
        loading: false
      })
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('it should select an environment type', async () => {
    renderComponent({ createEnvFromInput: true })

    expect(screen.getAllByTestId(/^environmentType.*$/)).toHaveLength(2)
    expect(screen.getByTestId('environmentTypeSelected')).toHaveTextContent('nonProduction')

    await userEvent.click(screen.getByText('production'))
    await waitFor(() => expect(screen.getByTestId('environmentTypeSelected')).toHaveTextContent('production'))

    await userEvent.click(screen.getByText('nonProduction'))
    await waitFor(() => expect(screen.getByTestId('environmentTypeSelected')).toHaveTextContent('nonProduction'))
  })

  test('it should display plan enforcement tooltip when limits reached', async () => {
    const mockedReturnValue = new Map<FeatureIdentifier, CheckFeatureReturn>()
    mockedReturnValue.set(FeatureIdentifier.MAUS, {
      enabled: false,
      featureDetail: {
        enabled: false,
        featureName: FeatureIdentifier.MAUS,
        moduleType: 'CF',
        count: 100,
        limit: 100
      }
    })
    jest.spyOn(useFeaturesMock, 'useFeatures').mockReturnValue({ features: mockedReturnValue })

    renderComponent()

    const createEnvironmentButton = screen.getByRole('button', { name: 'newEnvironment' })
    fireEvent.mouseOver(createEnvironmentButton)

    await waitFor(() => {
      expect(screen.getByText('cf.planEnforcement.upgradeRequiredMau')).toBeInTheDocument()
      expect(createEnvironmentButton).toHaveClass('bp3-disabled')
    })
  })

  test('it should hide tooltip and render button when plan enforcement disabled and feature disabled', async () => {
    jest
      .spyOn(usePlanEnforcementMock, 'default')
      .mockReturnValue({ isPlanEnforcementEnabled: false, isFreePlan: false })
    jest.spyOn(useFeaturesMock, 'useFeature').mockReturnValue({ enabled: false })

    renderComponent()

    const createEnvironmentButton = screen.getByRole('button', { name: 'newEnvironment' })
    fireEvent.mouseOver(createEnvironmentButton)

    await waitFor(() => {
      expect(screen.queryByText('cf.planEnforcement.upgradeRequiredMau')).not.toBeInTheDocument()
      expect(createEnvironmentButton).not.toBeDisabled()
    })
  })

  test('it should autofill the environment name when created from input', async () => {
    renderComponent({ onCreate: jest.fn(), createEnvFromInput: true, createEnvName: 'my environment name' })

    await userEvent.click(screen.getByRole('button', { name: 'createSecretYAML.create' }))

    await waitFor(() => {
      expect(createEnvironment).toBeCalled()
      expect(screen.queryByText('cf.create.env.error')).not.toBeInTheDocument()
    })
  })

  test('it should sanitise the Id based on the env name text provided', async () => {
    renderComponent({ onCreate: jest.fn(), createEnvFromInput: true, createEnvName: 'my environment name' })

    expect(document.querySelector('div[class*="InputWithIdentifier--idValue"]')).toHaveTextContent(
      'my_environment_name'
    )

    // form should submit
    await userEvent.click(screen.getByRole('button', { name: 'createSecretYAML.create' }))

    await waitFor(() => {
      expect(createEnvironment).toBeCalled()
      expect(screen.queryByText('cf.create.env.error')).not.toBeInTheDocument()
    })
  })

  test('it should call onCloseDialog when modal closes', async () => {
    const onClose = jest.fn()
    renderComponent({ createEnvFromInput: true, onCloseDialog: onClose })

    await waitFor(() => {
      expect(onClose).not.toHaveBeenCalled()
      expect(screen.getByRole('button', { name: 'cancel' })).toBeVisible()
    })

    await userEvent.click(screen.getByRole('button', { name: 'cancel' }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('Environment name validation', () => {
    beforeEach(() => {
      jest
        .spyOn(usePlanEnforcementMock, 'default')
        .mockReturnValue({ isPlanEnforcementEnabled: false, isFreePlan: false })
      jest.spyOn(useFeaturesMock, 'useFeature').mockReturnValue({ enabled: false })
    })

    test('it should show appropriate error message if Environment name is empty', async () => {
      renderComponent()

      // open the modal
      await userEvent.click(screen.getByRole('button', { name: 'newEnvironment' }))

      // leave environment name blank and submit form
      await userEvent.click(screen.getByRole('button', { name: 'createSecretYAML.create' }))

      await waitFor(() => expect(screen.getByText('fieldRequired')).toBeInTheDocument())
    })

    test('it should show appropriate error message if Environment name contains a non-ASCII character', async () => {
      renderComponent()

      // open the modal
      await userEvent.click(screen.getByRole('button', { name: 'newEnvironment' }))

      // enter invalid text and submit form
      const environmentNameInputField = screen.getByRole('textbox', { name: '' })
      await userEvent.type(environmentNameInputField, 'à')

      await userEvent.click(screen.getByRole('button', { name: 'createSecretYAML.create' }))

      await waitFor(() => expect(screen.getByText('common.validation.namePatternIsNotValid')).toBeInTheDocument())
    })

    test('it should not show error message if Environment name contains an ASCII character', async () => {
      renderComponent({ onCreate: jest.fn() })

      // open the modal
      await userEvent.click(screen.getByRole('button', { name: 'newEnvironment' }))

      // enter valid environment name and submit form
      const environmentNameInputField = screen.getByRole('textbox', { name: '' })
      await userEvent.type(environmentNameInputField, 'my environment name')

      await userEvent.click(screen.getByRole('button', { name: 'createSecretYAML.create' }))

      await waitFor(() => {
        expect(screen.queryByText('common.validation.namePatternIsNotValid')).not.toBeInTheDocument()
        expect(screen.queryByText('fieldRequired')).not.toBeInTheDocument()
      })
    })

    test('it should show error message if there is a duplicated Environment name', async () => {
      // preexisting environment passed in as props
      renderComponent({
        environments: [
          {
            accountId: 'AQ8xhfNCRtGIUjq5bSM8Fg',
            orgIdentifier: 'default',
            projectIdentifier: 'asdasd',
            identifier: 'mockIdentifier',
            name: 'myEnvName',
            description: undefined,
            color: '#0063F7',
            type: 'PreProduction',
            deleted: false,
            tags: {}
          }
        ]
      })

      // open the modal
      await userEvent.click(screen.getByRole('button', { name: 'newEnvironment' }))

      const environmentNameInputField = screen.getByRole('textbox', { name: '' })

      await userEvent.type(environmentNameInputField, 'myEnvName')
      await userEvent.click(screen.getByRole('button', { name: 'createSecretYAML.create' }))

      await waitFor(() => {
        expect(screen.queryByText('cf.environments.create.duplicateName')).toBeInTheDocument()
      })
    })
  })
})
