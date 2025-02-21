/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, queryByText } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
import { renderHook } from '@testing-library/react-hooks'
import { InputTypes, setFieldValue, fillAtForm } from '@common/utils/JestFormHelper'
import * as pipelineNg from 'services/pipeline-ng'
import * as cdng from 'services/cd-ng'

import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, pipelineModuleParams, triggerPathProps } from '@common/utils/routeUtils'
import { useStrings } from 'framework/strings'
import { getTriggerConfigDefaultProps, getTriggerConfigInitialValues } from './webhookMockConstants'
import {
  GetGitTriggerEventDetailsResponse,
  GetSecretV2PromiseResponse,
  GithubWebhookAuthenticationEnabledFalse,
  GithubWebhookAuthenticationEnabledTrue,
  mergeResponse,
  response
} from './webhookMockResponses'
import WebhookTriggerConfigPanel from '../views/WebhookTriggerConfigPanel'

const params = {
  accountId: 'testAcc',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'test',
  pipelineIdentifier: 'pipeline',
  triggerIdentifier: 'triggerIdentifier',
  module: 'cd'
}

const TEST_PATH = routes.toTriggersWizardPage({ ...accountPathProps, ...triggerPathProps, ...pipelineModuleParams })

jest.mock('clipboard-copy', () => jest.fn())

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)
const { result } = renderHook(() => useStrings(), { wrapper })

function WrapperComponent(props: { initialValues: any; isEdit?: boolean }): JSX.Element {
  const { initialValues, isEdit = false } = props
  return (
    <Formik initialValues={initialValues} onSubmit={() => undefined} formName="wrapperComponentTestForm">
      {formikProps => (
        <FormikForm>
          <TestWrapper path={TEST_PATH} pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
            <WebhookTriggerConfigPanel {...getTriggerConfigDefaultProps({ isEdit })} formikProps={formikProps} />
          </TestWrapper>
        </FormikForm>
      )}
    </Formik>
  )
}

describe('WebhookTriggerConfigPanel Triggers tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - Github Trigger Configuration Panel with Github Webhook Authentication Enabled', async () => {
      jest.spyOn(cdng, 'getSecretV2Promise').mockReturnValue(GetSecretV2PromiseResponse as any)
      jest.spyOn(pipelineNg, 'useGetGitTriggerEventDetails').mockReturnValue(GetGitTriggerEventDetailsResponse as any)
      jest.spyOn(cdng, 'useGetSettingValue').mockReturnValue(GithubWebhookAuthenticationEnabledTrue as any)
      jest.spyOn(pipelineNg, 'useGetStagesExecutionList').mockReturnValue(response as any)
      jest
        .spyOn(pipelineNg, 'useGetMergeInputSetFromPipelineTemplateWithListInput')
        .mockReturnValue(mergeResponse as any)

      const { container } = render(
        <WrapperComponent
          initialValues={{ ...getTriggerConfigInitialValues({}), isGithubWebhookAuthenticationEnabled: true }}
        />
      )
      await waitFor(() =>
        queryByText(container, result.current.getString('triggers.triggerConfigurationPanel.listenOnNewWebhook'))
      )

      expect(
        queryByText(container, result.current.getString('platform.secrets.secret.configureSecret'))
      ).toBeInTheDocument()
      expect(container).toMatchSnapshot()
    })
    test('Initial Render - Github Trigger Configuration Panel with Github Webhook Authentication disabled', async () => {
      jest.spyOn(cdng, 'getSecretV2Promise').mockReturnValue(GetSecretV2PromiseResponse as any)
      jest.spyOn(pipelineNg, 'useGetGitTriggerEventDetails').mockReturnValue(GetGitTriggerEventDetailsResponse as any)
      jest.spyOn(cdng, 'useGetSettingValue').mockReturnValue(GithubWebhookAuthenticationEnabledFalse as any)
      jest.spyOn(pipelineNg, 'useGetStagesExecutionList').mockReturnValue(response as any)
      jest
        .spyOn(pipelineNg, 'useGetMergeInputSetFromPipelineTemplateWithListInput')
        .mockReturnValue(mergeResponse as any)

      const { container } = render(
        <WrapperComponent
          initialValues={{ ...getTriggerConfigInitialValues({}), isGithubWebhookAuthenticationEnabled: false }}
        />
      )
      await waitFor(() =>
        queryByText(container, result.current.getString('triggers.triggerConfigurationPanel.listenOnNewWebhook'))
      )
      const secretInputLabel = `${result.current.getString(
        'platform.secrets.secret.configureSecret'
      )} (${result.current.getString('projectsOrgs.optional')})`

      expect(queryByText(container, secretInputLabel)).toBeInTheDocument()
      expect(container).toMatchSnapshot()
    })
    test('Initial Render - Custom Trigger Configuration Panel', async () => {
      jest.spyOn(pipelineNg, 'useGetStagesExecutionList').mockReturnValue(response as any)
      jest
        .spyOn(pipelineNg, 'useGetMergeInputSetFromPipelineTemplateWithListInput')
        .mockReturnValue(mergeResponse as any)

      const { container } = render(
        <WrapperComponent initialValues={getTriggerConfigInitialValues({ sourceRepo: 'Custom' })} />
      )
      await waitFor(() =>
        queryByText(container, result.current.getString('triggers.triggerConfigurationPanel.listenOnNewWebhook'))
      )
      expect(container).toMatchSnapshot()
    })
  })
  describe('Interactivity: Non-Custom Source Repo/Payload Type', () => {
    test('Selecting Any Actions checkbox disables Actions Select box', async () => {
      jest.spyOn(pipelineNg, 'useGetStagesExecutionList').mockReturnValue(response as any)
      jest
        .spyOn(pipelineNg, 'useGetMergeInputSetFromPipelineTemplateWithListInput')
        .mockReturnValue(mergeResponse as any)
      const getGitTriggerEventDetails = jest.spyOn(pipelineNg, 'useGetGitTriggerEventDetails')
      getGitTriggerEventDetails.mockReturnValue(GetGitTriggerEventDetailsResponse as any)

      const { container } = render(
        <WrapperComponent initialValues={getTriggerConfigInitialValues({ sourceRepo: 'Github' })} />
      )
      await waitFor(() =>
        queryByText(container, result.current.getString('triggers.triggerConfigurationPanel.listenOnNewWebhook'))
      )
      fillAtForm([
        {
          container: container,
          type: InputTypes.SELECT,
          fieldId: 'event',
          value: 'PullRequest'
        }
      ])
      await waitFor(() => expect(container.querySelector('[name="actions"]')).not.toBeNull())

      expect(container.querySelector('[name="actions"]')).toHaveProperty('disabled', false)
      setFieldValue({ type: InputTypes.CHECKBOX, container: container, fieldId: 'anyAction' })
      await waitFor(() => expect(container.querySelector('[name="actions"]')).toHaveProperty('disabled', true))

      setFieldValue({ type: InputTypes.CHECKBOX, container: container, fieldId: 'anyAction' })
      await waitFor(() => expect(container.querySelector('[name="actions"]')).toHaveProperty('disabled', false))
    })
  })
})
