/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import {
  Button,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  getErrorInfoFromErrorObject,
  StepProps,
  Icon,
  Text,
  ButtonSize,
  ButtonVariation
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { pick } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { CrossAccountAccess, useCreateConnector, useUpdateConnector, Failure } from 'services/cd-ng'
import { useAwsaccountconnectiondetail } from 'services/ce/index'
import { CE_AWS_CONNECTOR_CREATION_EVENTS } from '@platform/connectors/trackingConstants'
import { useStepLoadTelemetry } from '@platform/connectors/common/useTrackStepLoad/useStepLoadTelemetry'
import ConnectorInstructionList from '@platform/connectors/common/ConnectorCreationInstructionList/ConnectorCreationInstructionList'
import { connectorHelperUrls } from '@platform/connectors/constants'
import { useGovernanceMetaDataModal } from '@governance/hooks/useGovernanceMetaDataModal'
import { connectorGovernanceModalProps } from '@platform/connectors/utils/utils'
import { useTelemetry, useTrackEvent } from '@common/hooks/useTelemetry'
import { Category, ConnectorActions } from '@common/constants/TrackingConstants'
import { Features } from './CrossAccountRoleStep1'
import type { CEAwsConnectorDTO } from './OverviewStep'
import css from '../CreateCeAwsConnector.module.scss'

interface CrossAccountRoleProps {
  isEditMode?: boolean
  setIsEditMode?: (val: boolean) => void
}

const CrossAccountRoleStep2: React.FC<StepProps<CEAwsConnectorDTO> & CrossAccountRoleProps> = props => {
  const { getString } = useStrings()

  useStepLoadTelemetry(CE_AWS_CONNECTOR_CREATION_EVENTS.LOAD_CREATE_CROSS_ACCOUNT_ROLE)

  const { accountId } = useParams<{
    accountId: string
  }>()
  const { prevStepData, nextStep, previousStep } = props
  const [externalId, setExternalId] = useState<string>(prevStepData?.spec.crossAccountAccess.externalId || '')
  const { mutate: createConnector } = useCreateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateConnector } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })

  const { conditionallyOpenGovernanceErrorModal } = useGovernanceMetaDataModal(connectorGovernanceModalProps())
  const { data: awsUrlTemplateData, loading: awsUrlTemplateLoading } = useAwsaccountconnectiondetail({
    queryParams: { accountIdentifier: accountId, is_gov: prevStepData?.spec.isAWSGovCloudAccount }
  })
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false)

  const randomString = (): string => {
    return Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8)
  }

  useEffect(() => {
    if (awsUrlTemplateData?.status === 'SUCCESS' && !prevStepData?.isEditMode)
      setExternalId(awsUrlTemplateData?.data?.externalId || '')
  }, [awsUrlTemplateLoading])

  const featuresEnabled = (prevStepData?.spec?.featuresEnabled || []) as Features[]
  const curStatus = featuresEnabled.includes(Features.BILLING)
  const visibiltyStatus = featuresEnabled.includes(Features.VISIBILITY)
  const optimizationStatus = featuresEnabled.includes(Features.OPTIMIZATION)
  const governanceStatus = featuresEnabled.includes(Features.GOVERNANCE)

  const getRoleName = (roleArn: string) => {
    if (roleArn === undefined) return
    return roleArn.split('/')[1]
  }

  const makeTemplateUrl = () => {
    const baseurl = awsUrlTemplateData?.data?.stackLaunchTemplateLink
    const bucketName = prevStepData?.spec?.curAttributes?.s3BucketName || ''
    const rand = randomString()
    const roleName = prevStepData?.isEditMode
      ? getRoleName(prevStepData?.spec.crossAccountAccess.crossAccountRoleArn)
      : `HarnessCERole-${rand}`
    const url = `${baseurl}&param_ExternalId=${externalId}&param_BucketName=${bucketName}&param_BillingEnabled=${curStatus}&param_EventsEnabled=${visibiltyStatus}&param_OptimizationEnabled=${optimizationStatus}&param_GovernanceEnabled=${governanceStatus}&param_RoleName=${roleName}`
    window.open(url)
  }

  const handleSubmit = async (formData: CrossAccountAccess) => {
    setIsSubmitLoading(true)
    const newspec = { ...prevStepData?.spec, crossAccountAccess: formData }
    if (prevStepData) {
      prevStepData.spec = newspec
    }

    try {
      if (prevStepData) {
        const connectorInfo: CEAwsConnectorDTO = {
          ...pick(prevStepData, ['name', 'identifier', 'description', 'tags', 'spec', 'type'])
        }

        const response = props.isEditMode
          ? await updateConnector({ connector: connectorInfo })
          : await createConnector({ connector: connectorInfo })
        if (response.status !== 'SUCCESS') {
          throw response as Failure
        }
        if (response.data?.governanceMetadata) {
          conditionallyOpenGovernanceErrorModal(response.data?.governanceMetadata, () => {
            nextStep?.(prevStepData)
            props.setIsEditMode?.(true)
          })
        } else {
          nextStep?.(prevStepData)
          props.setIsEditMode?.(true)
        }
      }
    } catch (e) {
      modalErrorHandler?.showDanger(getErrorInfoFromErrorObject(e))
    }
    setIsSubmitLoading(false)
  }

  const handleprev = () => {
    previousStep?.({ ...(prevStepData as CEAwsConnectorDTO) })
  }

  const instructionsList = [
    {
      type: 'hybrid',
      renderer: () => {
        return (
          <>
            <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_800}>
              {getString('platform.connectors.ceAws.crossAccountRoleStep2.instructions.i1')}
              <Button
                text={getString('platform.connectors.ceAws.crossAccountRoleStep2.launchTemplate')}
                rightIcon="main-share"
                variation={ButtonVariation.SECONDARY}
                size={ButtonSize.SMALL}
                iconProps={{ size: 12, margin: { left: 'xsmall' } }}
                onClick={() => {
                  makeTemplateUrl()
                }}
              />
            </Text>
            <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_800}>
              {getString('platform.connectors.ceAws.crossAccountRoleStep2.instructions.i2')}
              <a href={awsUrlTemplateData?.data?.cloudFormationTemplateLink || ''} target="_blank" rel="noreferrer">
                {getString('platform.connectors.ceAws.crossAccountRoleStep2.instructions.templateRedirection')}
              </a>
              {'.)'}
            </Text>
          </>
        )
      }
    },
    {
      type: 'text',
      text: 'platform.connectors.ceAws.crossAccountRoleStep2.instructions.i3',
      listClassName: 'instructionList'
    },
    {
      type: 'hybrid',
      listClassName: 'instructionList',
      renderer: function instructionRenderer() {
        return (
          <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_800}>
            {getString('platform.connectors.ceAws.cur.instructions.i2')}
            <a href={connectorHelperUrls.ceAwsRoleARNsteps} target="_blank" rel="noreferrer">
              {getString('platform.connectors.ceAws.crossAccountRoleStep2.instructions.i4')}
              <Icon name="main-share" size={16} color={Color.PRIMARY_7} />
            </a>
          </Text>
        )
      }
    },
    {
      type: 'text',
      text: 'platform.connectors.ceAws.crossAccountRoleStep2.instructions.i5',
      listClassName: 'instructionList'
    }
  ]

  const { trackEvent } = useTelemetry()

  useTrackEvent(ConnectorActions.CENGAwsConnectorCrossAccountRoleStep2Load, {
    category: Category.CONNECTOR
  })

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Text
        font={{ variation: FontVariation.H3 }}
        tooltipProps={{ dataTooltipId: 'awsConnectorCreateRole' }}
        margin={{ bottom: 'large' }}
      >
        {getString('platform.connectors.ceAws.crossAccountRoleStep2.heading')}
      </Text>
      <Text color={Color.GREY_800} font={{ variation: FontVariation.BODY }} margin={{ bottom: 'large' }}>
        {getString('platform.connectors.ceAws.crossAccountRoleStep2.subHeading')}
      </Text>
      <ConnectorInstructionList instructionsList={instructionsList} />
      <div style={{ flex: 1 }}>
        <Formik<CrossAccountAccess>
          formName="crossAccountRoleStep2Form"
          initialValues={{
            crossAccountRoleArn: prevStepData?.spec.crossAccountAccess.crossAccountRoleArn || '',
            externalId: externalId || ''
          }}
          validationSchema={Yup.object().shape({
            crossAccountRoleArn: Yup.string()
              .matches(
                /arn:aws(-us-gov)?:iam::[0-9]*:role\/[^$%!&*?><\s]*/,
                getString('platform.connectors.ceAws.crossAccountRoleStep2.validation.roleArnPattern')
              )
              .required(getString('platform.connectors.ceAws.crossAccountRoleStep2.validation.roleArnRequired'))
          })}
          onSubmit={formData => {
            trackEvent(ConnectorActions.CENGAwsConnectorCrossAccountRoleStep2Submit, {
              category: Category.CONNECTOR
            })
            handleSubmit(formData)
          }}
          enableReinitialize={true}
        >
          {() => (
            <FormikForm>
              <ModalErrorHandler bind={setModalErrorHandler} />
              <Container className={css.main}>
                <FormInput.Text
                  name="crossAccountRoleArn"
                  label={getString('platform.connectors.ceAws.crossAccountRoleStep2.roleArn')}
                  className={css.dataFields}
                  tooltipProps={{ dataTooltipId: 'crossAccountRoleArn' }}
                />

                <FormInput.Text
                  name="externalId"
                  label={getString('platform.connectors.ceAws.crossAccountRoleStep2.extId')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setExternalId(e.target.value)
                  }}
                  disabled={awsUrlTemplateLoading}
                  className={css.dataFields}
                  tooltipProps={{ dataTooltipId: 'externalId' }}
                />
              </Container>
              <a
                href={connectorHelperUrls.ceAwsNoAccount}
                target="_blank"
                rel="noreferrer"
                className={css.noAccountLink}
              >
                {getString('platform.connectors.ceAws.crossAccountRoleStep2.dontHaveAccess')}
              </a>
              <Layout.Horizontal className={css.buttonPanel} spacing="small">
                <Button
                  text={getString('previous')}
                  icon="chevron-left"
                  onClick={handleprev}
                  disabled={isSubmitLoading}
                ></Button>
                <Button
                  type="submit"
                  intent="primary"
                  text={getString('saveAndContinue')}
                  rightIcon="chevron-right"
                  disabled={isSubmitLoading}
                />
                {isSubmitLoading && <Icon name="spinner" size={24} color="blue500" />}
              </Layout.Horizontal>
            </FormikForm>
          )}
        </Formik>
      </div>
    </Layout.Vertical>
  )
}

export default CrossAccountRoleStep2
