/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import {
  Layout,
  Button,
  Formik,
  Text,
  StepProps,
  Container,
  ButtonVariation,
  PageSpinner,
  ThumbnailSelect,
  FormInput
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { DelegateCardInterface, setupGCPFormData } from '@platform/connectors/pages/connectors/utils/ConnectorUtils'
import { DelegateTypes } from '@common/components/ConnectivityMode/ConnectivityMode'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import type { ConnectorConfigDTO, ConnectorInfoDTO } from 'services/cd-ng'

import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { useStrings } from 'framework/strings'
import { Connectors } from '@platform/connectors/constants'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'
import type { ScopedObjectDTO } from '@common/components/EntityReference/EntityReference'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { EmailValidationSchema } from '@modules/75-cd/components/PipelineSteps/EmailStep/emailStepUtils'
import { useConnectorWizard } from '../../../CreateConnectorWizard/ConnectorWizardContext'
import css from '../CreateGcpConnector.module.scss'

interface GcpAuthenticationProps {
  name: string
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  onConnectorCreated?: (data?: ConnectorConfigDTO) => void | Promise<void>
  connectorInfo: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  helpPanelReferenceId?: string
}

interface StepConfigureProps {
  closeModal?: () => void
  onSuccess?: () => void
}

interface GCPFormInterface {
  delegateType?: string
  password: SecretReferenceInterface | void
}
const GcpAuthentication: React.FC<StepProps<StepConfigureProps> & GcpAuthenticationProps> = props => {
  const { prevStepData, nextStep } = props
  const { accountId } = props
  const { getString } = useStrings()
  const { PL_GCP_OIDC_AUTHENTICATION } = useFeatureFlags()
  const defaultInitialFormData: GCPFormInterface = {
    password: undefined
  }

  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && props.isEditMode)

  const DelegateCards: DelegateCardInterface[] = [
    {
      type: DelegateTypes.DELEGATE_OUT_CLUSTER,
      info: getString('platform.connectors.GCP.delegateOutClusterInfo'),
      icon: 'service-kubernetes'
    },
    {
      type: DelegateTypes.DELEGATE_IN_CLUSTER,
      info: getString('platform.connectors.GCP.delegateInClusterInfo'),
      icon: 'delegates-blue'
    },
    ...(PL_GCP_OIDC_AUTHENTICATION
      ? [
          {
            type: DelegateTypes.DELEGATE_OIDC,
            info: 'OIDC',
            icon: 'oidc-authentication'
          } as DelegateCardInterface
        ]
      : [])
  ]

  useEffect(() => {
    if (loadingConnectorSecrets) {
      if (props.isEditMode) {
        if (props.connectorInfo) {
          setupGCPFormData(props.connectorInfo, accountId).then(data => {
            setInitialValues(data as GCPFormInterface)
            setLoadingConnectorSecrets(false)
          })
        } else {
          setLoadingConnectorSecrets(false)
        }
      }
    }
  }, [loadingConnectorSecrets])

  const handleSubmit = (formData: ConnectorConfigDTO) => {
    trackEvent(ConnectorActions.AuthenticationStepSubmit, {
      category: Category.CONNECTOR,
      connector_type: Connectors.Gcp
    })
    nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData } as StepConfigureProps)
  }
  useConnectorWizard({
    helpPanel: props.helpPanelReferenceId ? { referenceId: props.helpPanelReferenceId, contentWidth: 1100 } : undefined
  })

  const { trackEvent } = useTelemetry()

  useTrackEvent(ConnectorActions.AuthenticationStepLoad, {
    category: Category.CONNECTOR,
    connector_type: Connectors.Gcp
  })

  const scope: ScopedObjectDTO | undefined = props.isEditMode
    ? {
        orgIdentifier: props?.orgIdentifier,
        projectIdentifier: props?.projectIdentifier
      }
    : undefined

  const authenticationModifiedCardItems = DelegateCards.map(card => ({
    label: (
      <Text
        font={{ size: 'small', weight: 'bold' }}
        icon={card.icon}
        iconProps={{ size: 23, margin: { right: 'xsmall' } }}
      >
        {card.info}
      </Text>
    ),
    value: card.type
  }))
  return loadingConnectorSecrets ? (
    <PageSpinner />
  ) : (
    <Layout.Vertical className={css.secondStep}>
      <Text font={{ variation: FontVariation.H3 }} tooltipProps={{ dataTooltipId: 'gcpAuthenticationDetails' }}>
        {getString('details')}
      </Text>
      <Formik
        initialValues={{
          ...initialValues,
          ...props.prevStepData
        }}
        formName="gcpAuthForm"
        validationSchema={Yup.object().shape({
          delegateType: Yup.string().required(
            getString('platform.connectors.chooseMethodForConnection', { name: Connectors.GCP })
          ),
          password: Yup.object().when('delegateType', {
            is: DelegateTypes.DELEGATE_OUT_CLUSTER,
            then: Yup.object().required(getString('validation.encryptedKey'))
          }),
          workloadPoolId: Yup.string().when('delegateType', {
            is: DelegateTypes.DELEGATE_OIDC,
            then: Yup.string().required(
              getString('common.validation.fieldIsRequired', {
                name: getString('platform.connectors.GCP.workloadPoolId')
              })
            )
          }),
          providerId: Yup.string().when('delegateType', {
            is: DelegateTypes.DELEGATE_OIDC,
            then: Yup.string().required(
              getString('common.validation.fieldIsRequired', {
                name: getString('platform.connectors.GCP.providerId')
              })
            )
          }),
          gcpProjectId: Yup.string().when('delegateType', {
            is: DelegateTypes.DELEGATE_OIDC,
            then: Yup.string().required(
              getString('common.validation.fieldIsRequired', {
                name: getString('platform.connectors.ceGcp.existingCurTable.projectId')
              })
            )
          }),
          serviceAccountEmail: Yup.string().when('delegateType', {
            is: DelegateTypes.DELEGATE_OIDC,
            then: EmailValidationSchema(getString)
          })
        })}
        onSubmit={handleSubmit}
      >
        {formikProps => (
          <>
            <Container className={css.clusterWrapper}>
              <ThumbnailSelect
                thumbnailClassName={css.thumbnailCard}
                items={authenticationModifiedCardItems}
                name="delegateType"
                size="large"
                layoutProps={{ className: css.cardRow }}
                onChange={type => {
                  formikProps?.setFieldValue('delegateType', type)
                }}
              />
              <Layout.Vertical style={{ width: '54%' }}>
                {formikProps.values.delegateType === DelegateTypes.DELEGATE_OUT_CLUSTER && (
                  <SecretInput
                    name={'password'}
                    label={getString('platform.connectors.k8.serviceAccountKey')}
                    type={'SecretFile'}
                    tooltipProps={{ dataTooltipId: 'gcpConnectorSecretKeyTooltip' }}
                    scope={scope}
                  />
                )}
                {formikProps.values.delegateType === DelegateTypes.DELEGATE_OIDC && (
                  <Layout.Vertical>
                    <FormInput.Text
                      name="workloadPoolId"
                      label={getString('platform.connectors.GCP.workloadPoolId')}
                      placeholder={getString('platform.connectors.GCP.enterEntity', {
                        entity: getString('platform.connectors.GCP.workloadPoolId')
                      })}
                    />
                    <FormInput.Text
                      name="providerId"
                      label={getString('platform.connectors.GCP.providerId')}
                      placeholder={getString('platform.connectors.GCP.enterEntity', {
                        entity: getString('platform.connectors.GCP.providerId')
                      })}
                    />
                    <FormInput.Text
                      name="gcpProjectId"
                      label={getString('platform.connectors.ceGcp.existingCurTable.projectId')}
                      placeholder={getString('platform.connectors.GCP.enterEntity', {
                        entity: getString('platform.connectors.ceGcp.existingCurTable.projectId')
                      })}
                    />
                    <FormInput.Text
                      name="serviceAccountEmail"
                      label={getString('platform.connectors.GCP.serviceAccountEmail')}
                      placeholder={getString('platform.connectors.GCP.enterEntity', {
                        entity: getString('platform.connectors.GCP.serviceAccountEmail')
                      })}
                    />
                  </Layout.Vertical>
                )}
              </Layout.Vertical>
            </Container>
            <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
              <Button
                text={getString('back')}
                icon="chevron-left"
                variation={ButtonVariation.SECONDARY}
                onClick={() => props?.previousStep?.(props?.prevStepData)}
                data-name="gcpBackButton"
              />
              <Button
                type="submit"
                onClick={formikProps.submitForm}
                variation={ButtonVariation.PRIMARY}
                text={getString('continue')}
                rightIcon="chevron-right"
              />
            </Layout.Horizontal>
          </>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default GcpAuthentication
