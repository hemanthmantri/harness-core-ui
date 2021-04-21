import React from 'react'
import { sortBy } from 'lodash-es'
import { Popover } from '@blueprintjs/core'

import type { ModulePathParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import type { GraphLayoutNode } from 'services/pipeline-ng'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'

import { StageNode } from './StageNode'
import css from './MiniExecutionGraph.module.scss'

// Higher the number, Higher the Priority, Max 100.
const StagePriority: Record<ExecutionStatus, number> = {
  Success: 1,
  Running: 2,
  Failed: 20,
  Expired: 18,
  Aborted: 19,
  Suspended: 17,
  Queued: 0,
  NotStarted: 0,
  Paused: 24,
  Waiting: 25,
  Skipped: 15,
  ApprovalRejected: 22,
  Pausing: 23
}
const STEP_DETAILS_LIMIT = 4

export interface ParallelNodeProps extends PipelinePathProps, ModulePathParams {
  stages: GraphLayoutNode[]
  planExecutionId: string
}

export function ParallelStageNode(props: ParallelNodeProps): React.ReactElement {
  const { stages, accountId, orgIdentifier, projectIdentifier, pipelineIdentifier, planExecutionId, module } = props
  const sortedStages = sortBy(stages, stage => 100 - StagePriority[stage.status as ExecutionStatus])

  return (
    <Popover
      interactionKind="hover"
      minimal
      position="bottom"
      lazy
      autoFocus={false}
      enforceFocus={false}
      className={css.parallelNodes}
      wrapperTagName="div"
      targetTagName="div"
      targetClassName={css.ghostNodes}
      popoverClassName={css.moreStages}
      targetProps={{ 'data-stages': sortedStages.length } as any}
      modifiers={{ offset: { offset: '0,8px' } }}
    >
      <StageNode
        stage={sortedStages[0]}
        {...{ accountId, orgIdentifier, projectIdentifier, module, pipelineIdentifier, planExecutionId }}
      />
      <React.Fragment>
        {sortedStages.slice(1, STEP_DETAILS_LIMIT).map((stage: GraphLayoutNode, i) => (
          <StageNode
            key={i}
            stage={stage}
            {...{ accountId, orgIdentifier, projectIdentifier, module, pipelineIdentifier, planExecutionId }}
          />
        ))}
        {sortedStages.length > STEP_DETAILS_LIMIT ? (
          <div className={css.extraCount}>+ {stages.length - STEP_DETAILS_LIMIT}</div>
        ) : null}
      </React.Fragment>
    </Popover>
  )
}
