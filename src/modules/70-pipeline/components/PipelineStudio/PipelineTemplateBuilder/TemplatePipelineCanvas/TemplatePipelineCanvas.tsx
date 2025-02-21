/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { PageError, Tag, PageSpinner } from '@harness/uicore'
import { defaultTo, get, isEmpty, merge } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { parse } from '@common/utils/YamlHelperMethods'
import type { PipelineInfoConfig, StageElementWrapperConfig } from 'services/pipeline-ng'
import { findAllByKey, usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { extractGitBranchUsingTemplateRef, getTemplateTypesByRef } from '@pipeline/utils/templateUtils'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import {
  getIdentifierFromValue,
  getScopeFromValue,
  getScopeBasedProjectPathParams
} from '@common/components/EntityReference/EntityReference'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetTemplate } from 'services/template-ng'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
import { StoreType } from '@common/constants/GitSyncTypes'
import { BaseReactComponentProps, DiagramFactory, NodeType } from '@pipeline/components/PipelineDiagram/DiagramFactory'
import { getPipelineGraphData } from '@pipeline/components/PipelineDiagram/PipelineGraph/PipelineGraphUtils'
import PipelineStageNode from '@pipeline/components/PipelineDiagram/Nodes/DefaultNode/PipelineStageNode/PipelineStageNode'
import { DiamondNodeWidget } from '@pipeline/components/PipelineDiagram/Nodes/DiamondNode/DiamondNode'
import EndNodeStage from '@pipeline/components/PipelineDiagram/Nodes/EndNode/EndNodeStage'
import StartNodeStage from '@pipeline/components/PipelineDiagram/Nodes/StartNode/StartNodeStage'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import css from './TemplatePipelineCanvas.module.scss'

export function TemplatePipelineCanvas(): React.ReactElement {
  const {
    state: { pipeline, templateTypes, templateIcons, templateServiceData, gitDetails, storeMetadata },
    setTemplateTypes,
    setTemplateIcons,
    setTemplateServiceData
  } = usePipelineContext()
  const canvasRef = React.useRef<HTMLDivElement | null>(null)
  const { errorMap } = useValidationErrors()
  const [resolvedPipeline, setResolvedPipeline] = React.useState<PipelineInfoConfig>()
  const templateScope = getScopeFromValue(defaultTo(pipeline.template?.templateRef, ''))
  const queryParams = useParams<ProjectPathProps>()
  const { supportingTemplatesGitx } = useAppStore()

  const diagram = new DiagramFactory('graph')
  const CDPipelineStudioNew = diagram.render()
  diagram.registerNode('Deployment', PipelineStageNode as unknown as React.FC<BaseReactComponentProps>, true)
  diagram.registerNode('Approval', DiamondNodeWidget)
  diagram.registerNode(NodeType.EndNode, EndNodeStage)
  diagram.registerNode(NodeType.StartNode, StartNodeStage)

  if (diagram) diagram.registerListeners({})

  const stageData = React.useMemo(() => {
    return getPipelineGraphData({
      data: resolvedPipeline?.stages as StageElementWrapperConfig[],
      templateTypes: templateTypes,
      templateIcons,
      serviceDependencies: undefined,
      errorMap: errorMap,
      parentPath: `pipeline.stages`
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedPipeline?.stages, JSON.stringify(templateTypes), JSON.stringify(templateIcons), errorMap])

  const {
    data: pipelineTemplateResponse,
    error: pipelineTemplateError,
    refetch: refetchPipelineTemplate,
    loading: pipelineTemplateLoading
  } = useGetTemplate({
    templateIdentifier: getIdentifierFromValue(defaultTo(pipeline.template?.templateRef, '')),
    queryParams: {
      ...getScopeBasedProjectPathParams(queryParams, templateScope),
      versionLabel: defaultTo(pipeline.template?.versionLabel, ''),
      ...getGitQueryParamsWithParentScope({
        storeMetadata,
        params: queryParams,
        repoIdentifier: gitDetails.repoIdentifier,
        branch: defaultTo(pipeline.template?.gitBranch, gitDetails.branch),
        sendParentEntityDetails: pipeline.template?.gitBranch ? false : true
      })
    },
    requestOptions: { headers: { 'Load-From-Cache': 'true' } },
    lazy: storeMetadata?.storeType === StoreType.REMOTE && isEmpty(storeMetadata?.connectorRef)
  })

  React.useEffect(() => {
    const templateRefs = findAllByKey('templateRef', resolvedPipeline)
    if (storeMetadata?.storeType === StoreType.REMOTE && isEmpty(storeMetadata?.connectorRef)) {
      return
    }
    const templateGitBranches = extractGitBranchUsingTemplateRef(
      resolvedPipeline?.stages as StageElementWrapperConfig,
      ''
    )

    getTemplateTypesByRef(
      {
        accountIdentifier: queryParams.accountId,
        orgIdentifier: queryParams.orgIdentifier,
        projectIdentifier: queryParams.projectIdentifier,
        templateListType: 'Stable',
        repoIdentifier: gitDetails.repoIdentifier,
        branch: gitDetails.branch,
        getDefaultFromOtherRepo: true
      },
      templateRefs,
      storeMetadata,
      supportingTemplatesGitx,
      true,
      templateGitBranches
    ).then(resp => {
      setTemplateTypes(merge(templateTypes, resp.templateTypes))
      setTemplateIcons({ ...merge(templateIcons, resp.templateIcons) })
      setTemplateServiceData(merge(templateServiceData, resp.templateServiceData))
    })
  }, [JSON.stringify(resolvedPipeline), storeMetadata])

  React.useEffect(() => {
    if (pipelineTemplateResponse?.data?.yaml) {
      setResolvedPipeline(parse<any>(pipelineTemplateResponse.data.yaml)?.template?.spec)
    }
  }, [pipelineTemplateResponse?.data?.yaml])

  return (
    <div className={css.canvas} ref={canvasRef}>
      {pipelineTemplateLoading && <PageSpinner />}
      {!pipelineTemplateLoading && pipelineTemplateError && (
        <PageError
          message={get(
            pipelineTemplateError,
            'data.error',
            get(pipelineTemplateError, 'data.message', pipelineTemplateError?.message)
          )}
          onClick={() => refetchPipelineTemplate()}
        />
      )}
      <Tag className={css.readOnlyTag}>READ ONLY</Tag>
      <CDPipelineStudioNew readonly={true} data={stageData} graphLinkClassname={css.graphLink} />
    </div>
  )
}
