/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import * as Yup from 'yup'
import {
  FormikForm,
  FormInput,
  Button,
  Layout,
  Icon,
  Text,
  Heading,
  Formik,
  ButtonProps,
  MultiTypeInputType,
  getMultiTypeFromValue,
  getErrorInfoFromErrorObject
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { useToaster } from '@common/components'
import UserGroupsInput from '@rbac/components/UserGroupsInput/UserGroupsInput'
import { useStrings } from 'framework/strings'
import { useTestNotificationSetting, PagerDutySettingDTO } from 'services/notifications'
import type { PagerDutyNotificationConfiguration } from '@rbac/interfaces/Notifications'
import { TestStatus, NotificationType } from '@rbac/interfaces/Notifications'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import css from '../../ConfigureNotificationsModal.module.scss'

interface ConfigurePagerDutyNotificationsProps {
  onSuccess: (config: PagerDutyNotificationConfiguration) => void
  hideModal: () => void
  isStep?: boolean
  withoutHeading?: boolean
  onBack?: () => void
  submitButtonText?: string
  config?: PagerDutyNotificationConfiguration
  expressions?: string[]
}

interface PagerDutyNotificationData {
  key: string
  pagerDutyKey?: string
  userGroups: string[]
}

export const TestPagerDutyNotifications: React.FC<{
  data: PagerDutyNotificationData
  onClick?: () => Promise<boolean>
  buttonProps?: ButtonProps
}> = ({ data, onClick, buttonProps }) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const [testStatus, setTestStatus] = useState<TestStatus>(TestStatus.INIT)
  const { mutate: testNotificationSetting } = useTestNotificationSetting({})
  const { showSuccess, showError } = useToaster()

  const handleTest = async (testData: PagerDutyNotificationData): Promise<void> => {
    if (onClick) {
      const success = await onClick()
      if (!success) return
    }
    try {
      setTestStatus(TestStatus.INIT)
      const resp = await testNotificationSetting({
        accountId,
        type: 'PAGERDUTY',
        recipient: testData.key || testData.pagerDutyKey,
        notificationId: 'asd'
      } as PagerDutySettingDTO)
      if (resp.status === 'SUCCESS' && resp.data) {
        showSuccess(getString('rbac.notifications.pagerDutyTestSuccess'))
        setTestStatus(TestStatus.SUCCESS)
      } else {
        showError(getString('somethingWentWrong'))
        setTestStatus(TestStatus.FAILED)
      }
    } catch (err) {
      const errorText = getErrorInfoFromErrorObject(err)
      showError(!isEmpty(errorText) ? errorText : getString('rbac.notifications.invalidPagerDutyKey'))
      setTestStatus(TestStatus.ERROR)
    }
  }
  return (
    <>
      <Button text={getString('test')} onClick={() => handleTest(data)} {...buttonProps} />
      {testStatus === TestStatus.SUCCESS ? <Icon name="tick" className={cx(css.statusIcon, css.green)} /> : null}
      {testStatus === TestStatus.FAILED || testStatus === TestStatus.ERROR ? (
        <Icon name="cross" className={cx(css.statusIcon, css.red)} />
      ) : null}
    </>
  )
}

const ConfigurePagerDutyNotifications: React.FC<ConfigurePagerDutyNotificationsProps> = props => {
  const { getString } = useStrings()
  const [selectedInputType, setSelectedInputType] = useState<MultiTypeInputType>(
    getMultiTypeFromValue(props.config?.key)
  )
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const handleSubmit = (formData: PagerDutyNotificationData): void => {
    props.onSuccess({
      type: NotificationType.PagerDuty,
      ...formData
    })
  }

  return (
    <div className={css.body}>
      <Layout.Vertical spacing="large">
        {props.withoutHeading ? null : (
          <>
            <Icon name="service-pagerduty" size={24} />
            <Heading className={css.title}>{getString('rbac.notifications.titlePagerDuty')}</Heading>
          </>
        )}
        <Text>{getString('rbac.notifications.helpPagerDuty')}</Text>
        <Text>{getString('rbac.notifications.infoPagerDuty')}</Text>
        <Formik
          onSubmit={handleSubmit}
          formName="configurePagerDutyNotifications"
          validationSchema={Yup.object().shape({
            key: Yup.string()
              .trim()
              .when('userGroups', {
                is: val => isEmpty(val),
                then: Yup.string().trim().required(getString('rbac.notifications.validationPDKey'))
              })
          })}
          initialValues={{
            key: '',
            userGroups: [],
            ...props.config
          }}
        >
          {formik => {
            return (
              <FormikForm>
                {props.expressions ? (
                  <FormInput.MultiTextInput
                    name={'key'}
                    label={getString('rbac.notifications.labelPDKey')}
                    multiTextInputProps={{
                      expressions: props.expressions,
                      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                      onTypeChange: setSelectedInputType,
                      newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                    }}
                  />
                ) : (
                  <FormInput.Text name={'key'} label={getString('rbac.notifications.labelPDKey')} />
                )}

                <Layout.Horizontal margin={{ bottom: 'xxlarge' }} style={{ alignItems: 'center' }}>
                  <TestPagerDutyNotifications
                    data={formik.values}
                    buttonProps={{ disabled: selectedInputType === MultiTypeInputType.EXPRESSION }}
                  />
                </Layout.Horizontal>
                <UserGroupsInput name="userGroups" label={getString('rbac.notifications.labelPagerDutyUserGroups')} />
                {props.isStep ? (
                  <Layout.Horizontal spacing="medium" margin={{ top: 'xlarge' }}>
                    <Button text={getString('back')} onClick={props.onBack} />
                    <Button text={props.submitButtonText || getString('next')} intent="primary" type="submit" />
                  </Layout.Horizontal>
                ) : (
                  <Layout.Horizontal spacing={'medium'} margin={{ top: 'xxlarge' }}>
                    <Button type={'submit'} intent={'primary'} text={props.submitButtonText || getString('submit')} />
                    <Button text={getString('cancel')} onClick={props.hideModal} />
                  </Layout.Horizontal>
                )}
              </FormikForm>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </div>
  )
}

export default ConfigurePagerDutyNotifications
