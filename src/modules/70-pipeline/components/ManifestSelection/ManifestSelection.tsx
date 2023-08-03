/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import { Layout, RUNTIME_INPUT_VALUE, shouldShowError, useToaster } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { defaultTo, get, set } from 'lodash-es'
import produce from 'immer'
import { useGetConnectorListV2, PageConnectorResponse, StageElementConfig, ManifestConfigWrapper } from 'services/cd-ng'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import type { Scope } from '@common/interfaces/SecretsInterface'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { useDeepCompareEffect } from '@common/hooks'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { isValueRuntimeInput } from '@common/utils/utils'
import type { ManifestSelectionProps, PrimaryManifestType } from './ManifestInterface'
import ManifestListView from './ManifestListView/ManifestListView'
import ManifestListViewMultiple from './ManifestListView/ManifestListViewMultiple'

import { getConnectorPath } from './ManifestWizardSteps/ManifestUtils'
import ReleaseRepoListView from './GitOps/ReleaseRepoListView/ReleaseRepoListView'
import {
  ManifestToPathKeyMap,
  ReleaseRepoPipeline,
  getOnlyMainManifests,
  isOnlyHelmChartManifests,
  MultiManifestsTypes
} from './Manifesthelper'
import { isK8sOrNativeHelmDeploymentType } from './ManifestWizardSteps/CommonManifestDetails/utils'

export default function ManifestSelection({
  isPropagating,
  deploymentType,
  readonly,
  initialManifestList,
  allowOnlyOneManifest,
  addManifestBtnText,
  updateManifestList,
  preSelectedManifestType,
  availableManifestTypes,
  deleteManifest
}: ManifestSelectionProps): JSX.Element | null {
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    getStageFromPipeline,
    updateStage,
    allowableTypes
  } = usePipelineContext()

  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const [fetchedConnectorResponse, setFetchedConnectorResponse] = React.useState<PageConnectorResponse | undefined>()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { CDS_HELM_MULTIPLE_MANIFEST_SUPPORT_NG } = useFeatureFlags()

  const { accountId, orgIdentifier, projectIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      accountId: string
    }>
  >()
  const defaultQueryParams = {
    pageIndex: 0,
    pageSize: 10,
    searchTerm: '',
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    includeAllConnectorsAvailableAtScope: true
  }
  const { mutate: fetchConnectors } = useGetConnectorListV2({
    queryParams: defaultQueryParams
  })

  const manifestList = useMemo(() => {
    /* istanbul ignore next */
    /* istanbul ignore else */
    if (isPropagating) {
      return get(stage, 'stage.spec.serviceConfig.stageOverrides.manifests', [])
    }
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests', [])
  }, [isPropagating, stage])

  const listOfManifests = useMemo(() => {
    return initialManifestList ?? manifestList
  }, [initialManifestList, manifestList])

  useDeepCompareEffect(() => {
    refetchConnectorList()
  }, [listOfManifests])

  const isGitOpsEnabled = useMemo(() => {
    return (pipeline as ReleaseRepoPipeline).gitOpsEnabled
  }, [pipeline])

  const getConnectorList = (): Array<{ scope: Scope; identifier: string }> => {
    return defaultTo(listOfManifests, []).length
      ? listOfManifests.map((data: any) => ({
          scope: getScopeFromValue(
            getConnectorPath(get(data, 'manifest.spec.store.type', ''), get(data, 'manifest', null))
          ),
          identifier: getIdentifierFromValue(
            getConnectorPath(get(data, 'manifest.spec.store.type', ''), get(data, 'manifest', null))
          )
        }))
      : []
  }
  const isKubernetesOrNativeHelm = React.useMemo(() => {
    return isK8sOrNativeHelmDeploymentType(deploymentType)
  }, [deploymentType])

  const refetchConnectorList = async (): Promise<void> => {
    try {
      const connectorList = getConnectorList()
      const connectorIdentifiers = connectorList.map((item: { scope: string; identifier: string }) => item.identifier)
      const response = await fetchConnectors({ filterType: 'Connector', connectorIdentifiers })
      /* istanbul ignore else */
      if (get(response, 'data', null)) {
        const { data: connectorResponse } = response
        setFetchedConnectorResponse(connectorResponse)
      }
    } catch (e) {
      /* istanbul ignore else */
      if (shouldShowError(e)) {
        showError(getRBACErrorMessage(e))
      }
    }
  }

  const updateStageData = useCallback((): void => {
    const path = isPropagating
      ? 'stage.spec.serviceConfig.stageOverrides.manifests'
      : 'stage.spec.serviceConfig.serviceDefinition.spec.manifests'
    const multiManifestPath = isPropagating
      ? 'stage.spec.serviceConfig.stageOverrides.manifestConfigurations'
      : 'stage.spec.serviceConfig.serviceDefinition.spec.manifestConfigurations'

    if (stage) {
      updateStage(
        produce(stage, draft => {
          set(draft, path, listOfManifests)
          if (CDS_HELM_MULTIPLE_MANIFEST_SUPPORT_NG && isKubernetesOrNativeHelm) {
            const mainManifests = getOnlyMainManifests(listOfManifests, deploymentType, MultiManifestsTypes.MANIFESTS)
            const isOnlyHelm = isOnlyHelmChartManifests(mainManifests)
            const manifestConfigurations = get(draft, multiManifestPath)
            if (isOnlyHelm && !manifestConfigurations) {
              set(draft, multiManifestPath, {
                primaryManifestRef: RUNTIME_INPUT_VALUE
              })
            } else if (!isOnlyHelm || mainManifests?.length < 2) {
              set(draft, multiManifestPath, undefined)
            }
          }
        }).stage as StageElementConfig
      )
    }
  }, [isPropagating, listOfManifests, stage, updateStage])

  const updateListOfManifests = useCallback(
    (manifestObj: ManifestConfigWrapper, manifestIndex: number): void => {
      if (updateManifestList) {
        updateManifestList(manifestObj, manifestIndex)
      } else {
        if (listOfManifests?.length > 0) {
          listOfManifests.splice(manifestIndex, 1, manifestObj)
        } else {
          listOfManifests.push(manifestObj)
        }
        updateStageData()
      }
      refetchConnectorList()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPropagating, listOfManifests, updateStageData]
  )
  const removeManifestConfig = useCallback(
    (index: number): void => {
      if (deleteManifest) {
        deleteManifest(index)
      } else {
        listOfManifests.splice(index, 1)
        if (stage) {
          const multiManifestPath = isPropagating
            ? 'stage.spec.serviceConfig.stageOverrides.manifestConfigurations'
            : 'stage.spec.serviceConfig.serviceDefinition.spec.manifestConfigurations'
          const newStage = produce(stage, draft => {
            set(draft, 'stage.spec.serviceConfig.serviceDefinition.spec.manifests', listOfManifests)
            if (CDS_HELM_MULTIPLE_MANIFEST_SUPPORT_NG && isKubernetesOrNativeHelm) {
              if (
                isOnlyHelmChartManifests(
                  getOnlyMainManifests(listOfManifests, deploymentType, MultiManifestsTypes.MANIFESTS)
                )
              ) {
                set(draft, multiManifestPath, {
                  primaryManifestRef: RUNTIME_INPUT_VALUE
                })
              } else {
                set(draft, 'stage.spec.serviceConfig.serviceDefinition.spec.manifestConfigurations', undefined)
              }
            }
          }).stage
          if (newStage) {
            updateStage(newStage)
          }
        }
      }
    },
    [listOfManifests, stage, updateStage, deploymentType]
  )
  const attachPathYaml = useCallback(
    (manifestPathData: any, manifestId: string, manifestType: PrimaryManifestType): void => {
      const manifestData = listOfManifests?.find(
        (manifestObj: ManifestConfigWrapper) => manifestObj.manifest?.identifier === manifestId
      )
      if (manifestData) {
        set(manifestData, `manifest.spec.${ManifestToPathKeyMap[manifestType]}`, manifestPathData)
      }
      updateStageData()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const removeValuesYaml = useCallback(
    (valuesYamlIndex: number, manifestId: string, manifestType: PrimaryManifestType): void => {
      const manifestData = listOfManifests?.find(
        (manifestObj: ManifestConfigWrapper) => manifestObj.manifest?.identifier === manifestId
      )
      if (isValueRuntimeInput(manifestData?.manifest?.spec[ManifestToPathKeyMap[manifestType]])) {
        delete manifestData?.manifest?.spec[ManifestToPathKeyMap[manifestType]]
      } else {
        manifestData?.manifest?.spec[ManifestToPathKeyMap[manifestType]].splice(valuesYamlIndex, 1)
      }
      updateStageData()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const manifestListViewCommonProps = {
    connectors: fetchedConnectorResponse,
    isReadonly: readonly,
    deploymentType,
    listOfManifests,
    allowableTypes
  }

  return (
    <Layout.Vertical>
      {!isGitOpsEnabled ? (
        <>
          {CDS_HELM_MULTIPLE_MANIFEST_SUPPORT_NG && isKubernetesOrNativeHelm ? (
            <ManifestListViewMultiple
              {...manifestListViewCommonProps}
              pipeline={pipeline}
              updateManifestList={updateListOfManifests}
              removeManifestConfig={removeManifestConfig}
              attachPathYaml={attachPathYaml}
              removeValuesYaml={removeValuesYaml}
              allowOnlyOneManifest={allowOnlyOneManifest}
              addManifestBtnText={addManifestBtnText}
              preSelectedManifestType={preSelectedManifestType}
              availableManifestTypes={availableManifestTypes}
            />
          ) : (
            <ManifestListView
              {...manifestListViewCommonProps}
              pipeline={pipeline}
              updateManifestList={updateListOfManifests}
              removeManifestConfig={removeManifestConfig}
              attachPathYaml={attachPathYaml}
              removeValuesYaml={removeValuesYaml}
              allowOnlyOneManifest={allowOnlyOneManifest}
              addManifestBtnText={addManifestBtnText}
              preSelectedManifestType={preSelectedManifestType}
              availableManifestTypes={availableManifestTypes}
            />
          )}
        </>
      ) : (
        <ReleaseRepoListView
          {...manifestListViewCommonProps}
          stage={stage}
          updateStage={updateStage}
          allowOnlyOne={true}
          refetchConnectors={refetchConnectorList}
        />
      )}
    </Layout.Vertical>
  )
}
