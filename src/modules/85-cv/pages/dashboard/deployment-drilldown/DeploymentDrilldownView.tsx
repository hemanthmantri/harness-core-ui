import React, { useState, useEffect, useMemo } from 'react'
import { Container, Button, Text } from '@wings-software/uicore'
import { useParams, useLocation } from 'react-router-dom'
import { useGetVerificationInstances, DeploymentVerificationJobInstanceSummary } from 'services/cv'
import { Page } from '@common/exports'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useToaster } from '@common/exports'
import DeploymentDrilldownViewHeader from './DeploymentDrilldownViewHeader'
import DeploymentDrilldownSideNav, { InstancePhase } from './DeploymentDrilldownSideNav'
import VerificationInstanceView, { TabIdentifier } from './VerificationInstanceView'
import { VerificationInstancePostDeploymentView } from './VerificationInstancePostDeploymentView'
import VerificationStatusCard from './VerificationStatusCard'
import styles from './DeploymentDrilldownView.module.scss'

export default function DeploymentDrilldownView(): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier, deploymentTag, serviceIdentifier } = useParams()
  const location = useLocation()
  const { showError } = useToaster()
  const [anomalousMetricsOnly, setAnomalousMetricsOnly] = useState<boolean>(false)
  const [selectedTab, setSelectedTab] = useState<TabIdentifier>(TabIdentifier.METRICS_TAB)
  const [verificationInstance, setVerificationInstance] = useState<
    DeploymentVerificationJobInstanceSummary | undefined
  >()
  const [instancePhase, setInstancePhase] = useState<InstancePhase>()

  const {
    data: activityVerifications,
    loading: activityVerificationsLoading,
    error: activityVerificationsError
  } = useGetVerificationInstances({
    deploymentTag: deploymentTag as string,
    queryParams: {
      accountId,
      projectIdentifier: projectIdentifier as string,
      orgIdentifier: orgIdentifier as string,
      serviceIdentifier: serviceIdentifier as string
    }
  })

  const [preProduction, postDeployment, productionDeployment] = useMemo(() => {
    const {
      preProductionDeploymentVerificationJobInstanceSummaries: preProdVerifications,
      postDeploymentVerificationJobInstanceSummaries: postDeployVerifications,
      productionDeploymentVerificationJobInstanceSummaries: prodDeployVerifications
    } = activityVerifications?.resource?.deploymentResultSummary || {}
    const sortByTime = (a: DeploymentVerificationJobInstanceSummary, b: DeploymentVerificationJobInstanceSummary) =>
      a.startTime! - b.startTime!
    preProdVerifications?.length && preProdVerifications.sort(sortByTime)
    postDeployVerifications?.length && postDeployVerifications.sort(sortByTime)
    prodDeployVerifications?.length && prodDeployVerifications.sort(sortByTime)
    return [preProdVerifications, postDeployVerifications, prodDeployVerifications]
  }, [activityVerifications?.resource?.deploymentResultSummary])

  useEffect(() => {
    const selectedPhase = new URLSearchParams(location.search).get('phase')
    const instances = [
      { values: preProduction, phase: InstancePhase.PRE_PRODUCTION },
      { values: productionDeployment, phase: InstancePhase.PRODUCTION },
      { values: postDeployment, phase: InstancePhase.POST_DEPLOYMENT }
    ]
    let entry
    if (selectedPhase) {
      entry = instances.find(val => val.values?.length && val.phase === selectedPhase)
    }
    if (!entry) {
      entry = instances.find(val => !!val.values?.length)
    }
    if (entry) {
      setVerificationInstance(entry.values![0])
      setInstancePhase(entry.phase)
    }
  }, [preProduction, postDeployment, productionDeployment])

  useEffect(() => {
    if (activityVerificationsError) {
      showError(activityVerificationsError.message)
    }
  }, [activityVerificationsError])

  return (
    <Page.Body className={styles.main}>
      <DeploymentDrilldownViewHeader
        deploymentTag={decodeURIComponent(deploymentTag as string)}
        environments={activityVerifications?.resource?.environments}
        service={activityVerifications?.resource?.serviceName}
      />
      <Container className={styles.body}>
        <DeploymentDrilldownSideNav
          selectedInstance={verificationInstance}
          onSelect={(item, phase) => {
            setVerificationInstance(item)
            setInstancePhase(phase)
          }}
          preProductionInstances={preProduction}
          postDeploymentInstances={postDeployment}
          productionDeployment={productionDeployment}
        />
        <Container className={styles.content}>
          <Container className={styles.subHeader}>
            <Container>
              <Text font={{ weight: 'bold' }}>{verificationInstance?.jobName}</Text>
              <VerificationStatusCard status={verificationInstance?.status} />
            </Container>
            <Container>
              <Button minimal icon="symbol-square" text="Stop Deployment" disabled />
              <Button minimal icon="refresh" text="Rollback" disabled />
              <Button minimal icon="share" text="Share" disabled />
              <Button minimal icon="service-jira" text="Create Ticket" disabled />
            </Container>
          </Container>
          {verificationInstance && instancePhase !== InstancePhase.POST_DEPLOYMENT && (
            <VerificationInstanceView
              verificationInstance={verificationInstance}
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
              anomalousMetricsOnly={anomalousMetricsOnly}
              onAnomalousMetricsOnly={setAnomalousMetricsOnly}
            />
          )}
          {verificationInstance && instancePhase === InstancePhase.POST_DEPLOYMENT && (
            <VerificationInstancePostDeploymentView
              selectedActivityId={(verificationInstance as any).activityId}
              environmentIdentifier={verificationInstance.environmentName!}
              activityStartTime={(verificationInstance as any).activityStartTime}
              durationMs={verificationInstance.durationMs!}
            />
          )}
        </Container>
      </Container>
      {activityVerificationsLoading && <PageSpinner />}
    </Page.Body>
  )
}
