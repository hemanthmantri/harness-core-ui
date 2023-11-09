/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GetDataError } from 'restful-react'
import routes from '@common/RouteDefinitions'
import type { UseStringsReturn } from 'framework/strings'
import type {
  RestResponseAnalyzedRadarChartLogDataWithCountDTO,
  RestResponseLogAnalysisRadarChartListWithCountDTO
} from 'services/cv'
import { getWindowLocationUrl } from 'framework/utils/WindowLocation'
import type { LogsRowData } from './LogAnalysisRow.types'
import { LogEvents } from '../../LogAnalysis.types'

export const getEventTypeFromClusterType = (
  tag: LogEvents,
  getString: UseStringsReturn['getString'],
  fullName = false
): string => {
  switch (tag) {
    case LogEvents.KNOWN:
      return 'Known'
    case LogEvents.UNKNOWN:
      return 'Unknown'
    case LogEvents.UNEXPECTED:
      return fullName ? getString('cv.unexpectedFrequency') : 'Unexpected'
    case LogEvents.NO_BASELINE_AVAILABLE:
      return getString('newLabel')
    default:
      return ''
  }
}

export const onClickErrorTrackingRow = (
  message: string,
  accountId: string,
  projectIdentifier: string,
  orgIdentifier: string
): void => {
  const rowMessageSplit = message.split('|')
  const timestamp = rowMessageSplit[rowMessageSplit.length - 1].trim()
  const requestId = rowMessageSplit[rowMessageSplit.length - 2].trim()
  const sid = rowMessageSplit[rowMessageSplit.length - 3].trim()

  // Make duration window 1 hour from timestamp
  const fromTimestamp = parseInt(timestamp) - 3600

  const arcJson = `{
          "service_id": "${sid}",
          "viewport_strings":{
            "from_timestamp":"${fromTimestamp}",
            "to_timestamp":"${timestamp}",
            "until_now":false,
            "machine_hashes":[],
            "agent_hashes":[],
            "deployment_hashes":[],
            "request_ids":[${requestId}]
          }
          ,"timestamp":"${timestamp}"
        }`

  const errorTrackingBaseUrl = routes.toErrorTracking({
    orgIdentifier: orgIdentifier,
    projectIdentifier: projectIdentifier,
    accountId: accountId
  })

  window.open(`${getWindowLocationUrl()}${errorTrackingBaseUrl}/arc?event=${btoa(arcJson)}`)
}

export const isNoLogSelected = (selectedLog?: string | null): boolean =>
  selectedLog === null || typeof selectedLog === 'undefined'

export function getCorrectLogsData({
  serviceScreenLogsData,
  verifyStepLogsData,
  serviceScreenLogsLoading,
  verifyStepLogsLoading,
  serviceScreenLogsError,
  verifyStepLogsError,
  isServicePage
}: {
  serviceScreenLogsData: RestResponseAnalyzedRadarChartLogDataWithCountDTO | null
  verifyStepLogsData: RestResponseLogAnalysisRadarChartListWithCountDTO | null
  serviceScreenLogsLoading: boolean
  verifyStepLogsLoading: boolean
  serviceScreenLogsError: GetDataError<unknown> | null
  verifyStepLogsError: GetDataError<unknown> | null
  isServicePage?: boolean
}): LogsRowData {
  return {
    logsData: isServicePage ? serviceScreenLogsData : verifyStepLogsData,
    logsLoading: isServicePage ? serviceScreenLogsLoading : verifyStepLogsLoading,
    logsError: isServicePage ? serviceScreenLogsError : verifyStepLogsError
  }
}
