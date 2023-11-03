/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useCallback, useState } from 'react'
import { Dialog, Intent } from '@blueprintjs/core'
import { useParams, useLocation } from 'react-router-dom'
import { get, pickBy, isEmpty, defaultTo } from 'lodash-es'
import { Text, Icon, PageError, PageSpinner, Layout, Container, Heading } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { CIExecutionImages, getDeprecatedConfigPromise, ResponseCIExecutionImages } from 'services/ci'
import { GovernanceMetadata, GraphLayoutNode, ExecutionNode, useRetryHistory } from 'services/pipeline-ng'
import { isExecutionComplete } from '@pipeline/utils/statusHelpers'
import { getPipelineStagesMap, processForCIData } from '@pipeline/utils/executionUtils'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useQueryParams, useDeepCompareEffect } from '@common/hooks'
import { joinAsASentence } from '@common/utils/StringUtils'
import { useStrings } from 'framework/strings'
import type { ExecutionPageQueryParams } from '@pipeline/utils/types'
import type { ExecutionPathProps, GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { PipelineExecutionWarning } from '@pipeline/components/PipelineExecutionWarning/PipelineExecutionWarning'
import { logsCache } from '@pipeline/components/LogsContent/LogsState/utils'
import ExecutionContext from '@pipeline/context/ExecutionContext'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { IfPrivateAccess } from 'framework/components/PublicAccess/PublicAccess'
import { usePolling } from '@common/hooks/usePolling'
import { pipelineHasCIStageWithK8sInfra } from '@pipeline/utils/stageHelpers'
import { useGetPipelineSummaryQuery } from 'services/pipeline-rq'
import { PolicyManagementEvaluationView } from '@governance/PolicyManagementEvaluationView'
import { useDownloadLogs } from '@pipeline/components/LogsContent/components/DownloadLogs/useDownloadLogs'
import ExecutionTabs from './ExecutionTabs/ExecutionTabs'
import ExecutionMetadata from './ExecutionMetadata/ExecutionMetadata'
import { ExecutionPipelineVariables } from './ExecutionPipelineVariables'
import { ExecutionHeader } from './ExecutionHeader/ExecutionHeader'
import { useExecutionData } from './useExecutionData'

import css from './ExecutionLandingPage.module.scss'

export const POLL_INTERVAL = 2 /* sec */ * 1000 /* ms */
const PageTabs = { PIPELINE: 'pipeline' }

export default function ExecutionLandingPage(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, executionIdentifier, accountId, module, pipelineIdentifier } =
    useParams<PipelineType<ExecutionPathProps>>()
  const [allNodeMap, setAllNodeMap] = React.useState<Record<string, ExecutionNode>>({})

  /* cache token required for retrieving logs */
  const [logsToken, setLogsToken] = React.useState('')
  const { getRBACErrorMessage } = useRBACError()
  const {
    data,
    error,
    loading,
    refetch,
    selectedStageId,
    selectedStepId,
    selectedStageExecutionId,
    selectedChildStageId,
    selectedCollapsedNodeId
  } = useExecutionData()

  const { downloadLogsAction } = useDownloadLogs()

  const [isPipelineInvalid, setIsPipelineInvalid] = React.useState(false)
  const { preference: savedExecutionView, setPreference: setSavedExecutionView } = usePreferenceStore<
    string | undefined
  >(PreferenceScope.USER, 'executionViewType')
  const queryParams = useQueryParams<ExecutionPageQueryParams & GitQueryParams>()
  const initialSelectedView = savedExecutionView || 'graph'
  const { view } = queryParams
  const isLogView = view === 'log' || (!view && initialSelectedView === 'log')
  const location = useLocation<{ shouldShowGovernanceEvaluations: boolean; governanceMetadata: GovernanceMetadata }>()
  const locationPathNameArr = location?.pathname?.split('/') || []
  const selectedPageTab = locationPathNameArr[locationPathNameArr.length - 1]
  const [deprecatedImagesUsed, setDeprecatedImagesUsed] = useState<CIExecutionImages>()
  const [showWarningBanner, setShowWarningBanner] = useState<boolean>(false)
  const [governanceEvaluations, setGovernanceEvaluations] = useState<{
    shouldShowGovernanceEvaluations: boolean
    governanceMetadata: GovernanceMetadata
  }>({
    shouldShowGovernanceEvaluations: !!location?.state?.shouldShowGovernanceEvaluations,
    governanceMetadata: location?.state?.governanceMetadata
  })

  const { data: retryHistoryResponse } = useRetryHistory({
    planExecutionId: executionIdentifier,
    queryParams: {
      pipelineIdentifier: pipelineIdentifier,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const retriedHistoryInfo = React.useMemo(() => {
    const retriedStages = defaultTo(retryHistoryResponse?.data?.retryStagesMetadata?.retryStagesIdentifier, [])
    const retriedExecutionUuids = retryHistoryResponse?.data?.executionInfos
      ?.map(val => val.uuid)
      .filter(uuid => uuid !== undefined) as string[]
    return { retriedStages, retriedExecutionUuids }
  }, [retryHistoryResponse?.data])

  const { data: pipeline, isLoading: loadingPipeline } = useGetPipelineSummaryQuery(
    {
      pipelineIdentifier,
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        getMetadataOnly: true
      }
    },
    {
      staleTime: 5 * 60 * 1000
    }
  )

  useEffect(() => {
    if (pipelineHasCIStageWithK8sInfra(data?.data?.pipelineExecutionSummary)) {
      getDeprecatedConfigPromise({
        queryParams: { accountIdentifier: accountId }
      }).then((response: ResponseCIExecutionImages) => {
        const { data: deprecatedImages } = response
        if (!isEmpty(deprecatedImages)) {
          setShowWarningBanner(true)
          setDeprecatedImagesUsed(deprecatedImages)
        }
      })
    }
  }, [data?.data?.pipelineExecutionSummary])

  useDeepCompareEffect(() => {
    setGovernanceEvaluations({
      shouldShowGovernanceEvaluations: !!location?.state?.shouldShowGovernanceEvaluations,
      governanceMetadata: location?.state?.governanceMetadata
    })
  }, [location?.state?.shouldShowGovernanceEvaluations, location?.state?.governanceMetadata])

  const getDeprecatedImageUsageSummary = useCallback((): React.ReactElement => {
    if (!deprecatedImagesUsed) {
      return <></>
    }
    const el = (
      <>
        {joinAsASentence(
          Object.entries(deprecatedImagesUsed)
            .filter(item => !!item[0] && !!item[1])
            .map((item: [string, string]) => `${item[0]}(${item[1]})`),
          getString('and').toLowerCase()
        )}
      </>
    )
    return (
      <Text
        font={{ variation: FontVariation.SMALL_SEMI }}
        lineClamp={1}
        tooltip={
          <Text
            font={{ variation: FontVariation.SMALL_SEMI }}
            padding={{ left: 'medium', right: 'medium', top: 'small', bottom: 'small' }}
          >
            {el}
          </Text>
        }
      >
        {el}
      </Text>
    )
  }, [deprecatedImagesUsed])

  const graphNodeMap = data?.data?.executionGraph?.nodeMap || {}
  const childGraphNodeMap = data?.data?.childGraph?.executionGraph?.nodeMap || {}
  const rollbackGraphNodeMap = data?.data?.rollbackGraph?.executionGraph?.nodeMap || {}

  let isDataLoadedForSelectedStage = Object.keys(graphNodeMap).some(
    key => graphNodeMap?.[key]?.setupId === selectedStageId
  )

  const isDataLoadedForSelectedChildStage = Object.keys(childGraphNodeMap).some(
    key => childGraphNodeMap?.[key]?.setupId === selectedChildStageId
  )

  const isDataLoadedForSelectedRollbackStage = Object.keys(rollbackGraphNodeMap).some(
    key => rollbackGraphNodeMap?.[key]?.setupId === selectedChildStageId
  )
  isDataLoadedForSelectedStage ||= isDataLoadedForSelectedChildStage || isDataLoadedForSelectedRollbackStage

  const allStagesMap = React.useMemo(() => {
    return getPipelineStagesMap(
      data?.data?.pipelineExecutionSummary?.layoutNodeMap,
      data?.data?.pipelineExecutionSummary?.startingNodeId
    )
  }, [data?.data?.pipelineExecutionSummary?.layoutNodeMap, data?.data?.pipelineExecutionSummary?.startingNodeId])

  const childPipelineStagesMap = React.useMemo(() => {
    return getPipelineStagesMap(
      data?.data?.childGraph?.pipelineExecutionSummary?.layoutNodeMap,
      data?.data?.childGraph?.pipelineExecutionSummary?.startingNodeId
    )
  }, [
    data?.data?.childGraph?.pipelineExecutionSummary?.layoutNodeMap,
    data?.data?.childGraph?.pipelineExecutionSummary?.startingNodeId
  ])

  const rollbackPipelineStagesMap = React.useMemo(() => {
    const parentRollbackStageId = get(data?.data?.rollbackGraph?.pipelineExecutionSummary, [
      'parentStageInfo',
      'stagenodeid'
    ])
    return getPipelineStagesMap(
      data?.data?.rollbackGraph?.pipelineExecutionSummary?.layoutNodeMap,
      data?.data?.rollbackGraph?.pipelineExecutionSummary?.startingNodeId,
      isEmpty(parentRollbackStageId) ? selectedStageId : parentRollbackStageId
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data?.data?.rollbackGraph?.pipelineExecutionSummary?.layoutNodeMap,
    data?.data?.rollbackGraph?.pipelineExecutionSummary?.startingNodeId
  ])

  let pipelineStagesMap = allStagesMap
  if (childPipelineStagesMap.size)
    pipelineStagesMap = new Map<string, GraphLayoutNode>([...pipelineStagesMap, ...childPipelineStagesMap])
  if (rollbackPipelineStagesMap.size)
    pipelineStagesMap = new Map<string, GraphLayoutNode>([...pipelineStagesMap, ...rollbackPipelineStagesMap])

  // combine steps and dependencies(ci stage)
  useDeepCompareEffect(() => {
    let nodeMap = { ...data?.data?.executionGraph?.nodeMap }
    if (data?.data?.childGraph?.executionGraph) nodeMap = { ...data?.data?.childGraph?.executionGraph?.nodeMap }
    else if (data?.data?.rollbackGraph?.executionGraph)
      nodeMap = { ...data?.data?.rollbackGraph?.executionGraph?.nodeMap }

    nodeMap = processForCIData({ nodeMap, data })

    setAllNodeMap(oldNodeMap => {
      const interruptHistories = pickBy(oldNodeMap, val => get(val, '__isInterruptNode'))

      return { ...interruptHistories, ...nodeMap }
    })
  }, [
    data?.data?.executionGraph?.nodeMap,
    data?.data?.executionGraph?.nodeAdjacencyListMap,
    data?.data?.childGraph?.executionGraph?.nodeMap,
    data?.data?.childGraph?.executionGraph?.nodeAdjacencyListMap,
    data?.data?.rollbackGraph?.executionGraph?.nodeMap,
    data?.data?.rollbackGraph?.executionGraph?.nodeAdjacencyListMap
  ])

  // Do polling after initial default loading and has some data, stop if execution is in complete status
  usePolling(refetch, {
    pollingInterval: POLL_INTERVAL,
    startPolling: !loading && !!data && !isExecutionComplete(data.data?.pipelineExecutionSummary?.status),
    pollOnInactiveTab: !isExecutionComplete(data?.data?.pipelineExecutionSummary?.status)
  })

  React.useEffect(() => {
    return () => {
      logsCache.clear()
    }
  }, [])

  return (
    <ExecutionContext.Provider
      value={{
        pipelineExecutionDetail: data?.data || null,
        allNodeMap,
        pipelineStagesMap,
        childPipelineStagesMap,
        rollbackPipelineStagesMap,
        allStagesMap,
        isPipelineInvalid,
        selectedStageId,
        selectedChildStageId,
        selectedStepId,
        selectedStageExecutionId,
        selectedCollapsedNodeId,
        loading,
        isDataLoadedForSelectedStage,
        queryParams,
        logsToken,
        setLogsToken,
        refetch,
        setIsPipelineInvalid,
        addNewNodeToMap(id, node) {
          setAllNodeMap(nodeMap => ({ ...nodeMap, [id]: node }))
        },
        retriedHistoryInfo,
        downloadLogsAction
      }}
    >
      <ExecutionPipelineVariables
        shouldFetch={data?.data?.pipelineExecutionSummary?.executionInputConfigured}
        accountIdentifier={accountId}
        orgIdentifier={orgIdentifier}
        projectIdentifier={projectIdentifier}
        planExecutionId={executionIdentifier}
      >
        {(!data && loading) || loadingPipeline ? <PageSpinner /> : null}
        {error ? (
          <PageError message={getRBACErrorMessage(error) as string} />
        ) : (
          <main className={css.main}>
            <div className={css.lhs}>
              <header className={css.header}>
                <ExecutionHeader pipelineMetadata={pipeline} />
                <IfPrivateAccess>
                  <ExecutionMetadata />
                </IfPrivateAccess>
              </header>
              <ExecutionTabs savedExecutionView={savedExecutionView} setSavedExecutionView={setSavedExecutionView} />
              {module === 'ci' && showWarningBanner ? (
                <PipelineExecutionWarning
                  warning={
                    <Layout.Horizontal padding={{ left: 'xxlarge', right: 'xxlarge' }} flex width="95%">
                      <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }}>
                        <Icon name="warning-sign" intent={Intent.DANGER} />
                        <Text color={Color.ORANGE_900} font={{ variation: FontVariation.SMALL_BOLD }}>
                          {getString('pipeline.imageVersionDeprecated')}
                        </Text>
                      </Layout.Horizontal>
                      <Layout.Vertical
                        padding={{ left: 'large', right: 'large', top: 'xsmall', bottom: 'xsmall' }}
                        width="95%"
                      >
                        <Text font={{ weight: 'semi-bold', size: 'small' }} color={Color.PRIMARY_10} lineClamp={2}>
                          {getString('pipeline.unsupportedImagesWarning')}
                        </Text>
                        <Container>{getDeprecatedImageUsageSummary()}</Container>
                      </Layout.Vertical>
                      {/* <Link to={'/'}>{getString('learnMore')}</Link> */}
                    </Layout.Horizontal>
                  }
                  onBannerClose={() => setShowWarningBanner(false)}
                />
              ) : null}
              <div
                className={css.childContainer}
                data-view={selectedPageTab === PageTabs.PIPELINE && isLogView ? 'log' : 'graph'}
                id="pipeline-execution-container"
              >
                {props.children}
              </div>
              <Dialog
                isOpen={governanceEvaluations.shouldShowGovernanceEvaluations}
                onClose={() => {
                  setGovernanceEvaluations({
                    shouldShowGovernanceEvaluations: false,
                    governanceMetadata: {} as GovernanceMetadata
                  })
                }}
                title={
                  <Heading level={3} font={{ variation: FontVariation.H3 }} padding={{ top: 'medium' }}>
                    {getString('common.policiesSets.evaluations')}
                  </Heading>
                }
                enforceFocus={false}
                className={css.policyEvaluationDialog}
              >
                <PolicyManagementEvaluationView
                  metadata={governanceEvaluations.governanceMetadata}
                  accountId={accountId}
                  module={module}
                />
              </Dialog>
            </div>
          </main>
        )}
      </ExecutionPipelineVariables>
    </ExecutionContext.Provider>
  )
}
