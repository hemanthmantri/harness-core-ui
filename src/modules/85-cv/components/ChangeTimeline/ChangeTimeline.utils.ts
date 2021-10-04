import moment from 'moment'
import { sumBy } from 'lodash-es'
import type { PointMarkerOptionsObject, SeriesScatterOptions } from 'highcharts'
import { Color } from '@wings-software/uicore'
import type { TimeRangeDetail } from 'services/cv'
import type { UseStringsReturn } from 'framework/strings'
import DeploymentWithTwoChanges from '@cv/assets/ChangeTimelineSymbol/Deployment/DeploymentWithTwoChange.svg'
import DeploymentWithNChanges from '@cv/assets/ChangeTimelineSymbol/Deployment/DeploymentWithNChange.svg'
import IncidentWithTwoChanges from '@cv/assets/ChangeTimelineSymbol/Incident/IncidentWithTwoChange.svg'
import IncidentWithNChanges from '@cv/assets/ChangeTimelineSymbol/Incident/IncidentWithNChange.svg'
import InfraWithTwoChanges from '@cv/assets/ChangeTimelineSymbol/Infra/InfraWithTwoChange.svg'
import InfraWithNChanges from '@cv/assets/ChangeTimelineSymbol/Infra/InfraWithNChange.svg'
import {
  getTimeInHrs,
  isChangesInTheRange
} from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.utils'
import { ChangeSourceTypes, TOTAL_DATA_POINTS } from './ChangeTimeline.constants'
import type { PointMarkerOptionsObjectCustom } from './components/TimelineRow/TimelineRow.types'
import type { ChangesInfoCardData } from './ChangeTimeline.types'

export const getChangeSoureIconColor = (type = '', isChartSymbol = false): string => {
  switch (type) {
    case ChangeSourceTypes.Deployments:
      return isChartSymbol ? 'var(--green-400)' : Color.GREEN_400
    case ChangeSourceTypes.Infrastructure:
      return isChartSymbol ? 'var(--primary-4)' : Color.PRIMARY_4
    case ChangeSourceTypes.Incidents:
      return isChartSymbol ? 'var(--purple-400)' : Color.PURPLE_400
    default:
      return Color.GREY_200
  }
}

const getSymbolBytypeForTwoCluster = (type: string) => {
  switch (type) {
    case ChangeSourceTypes.Deployments:
      return `url(${DeploymentWithTwoChanges})`
    case ChangeSourceTypes.Infrastructure:
      return `url(${InfraWithTwoChanges})`
    case ChangeSourceTypes.Incidents:
      return `url(${IncidentWithTwoChanges})`
    default:
      return 'diamond'
  }
}

const getSymbolBytypeForGreaterThanTwoCluster = (type: string) => {
  switch (type) {
    case ChangeSourceTypes.Deployments:
      return `url(${DeploymentWithNChanges})`
    case ChangeSourceTypes.Infrastructure:
      return `url(${InfraWithNChanges})`
    case ChangeSourceTypes.Incidents:
      return `url(${IncidentWithNChanges})`
    default:
      return 'diamond'
  }
}

const getSymbolAndColorByChangeType = (
  count: number,
  type: ChangeSourceTypes,
  marker: PointMarkerOptionsObjectCustom
): PointMarkerOptionsObjectCustom => {
  if (count === 1) {
    return { ...marker, radius: 6, fillColor: getChangeSoureIconColor(type, true), symbol: 'diamond' }
  } else if (count === 2) {
    return { ...marker, height: 16, width: 16, symbol: getSymbolBytypeForTwoCluster(type) }
  } else if (count > 2) {
    return { ...marker, height: 18, width: 18, symbol: getSymbolBytypeForGreaterThanTwoCluster(type) }
  } else {
    return { ...marker, radius: 6, fillColor: getChangeSoureIconColor(), symbol: 'diamond' }
  }
}

export const createTooltipLabel = (
  count: number,
  type: ChangeSourceTypes,
  getString: UseStringsReturn['getString']
): string => {
  switch (type) {
    case ChangeSourceTypes.Deployments:
      return `${count} ${count > 1 ? type : getString('deploymentText')}`
    case ChangeSourceTypes.Infrastructure:
      return `${count} ${getString('infrastructureText')} ${count > 1 ? getString('changes') : getString('change')}`
    case ChangeSourceTypes.Incidents:
      return `${count} ${
        count > 1 ? getString('cv.changeSource.incident') : getString('cv.changeSource.tooltip.incidents')
      }`
    default:
      return ''
  }
}

export const createMarkerSymbol = (
  timeline: TimeRangeDetail,
  type: ChangeSourceTypes,
  getString: UseStringsReturn['getString']
): PointMarkerOptionsObjectCustom => {
  const count = timeline.count || 0
  const marker: PointMarkerOptionsObjectCustom = {
    custom: {
      count,
      startTime: timeline.startTime || 0,
      endTime: timeline.endTime || 0,
      color: getChangeSoureIconColor(type, true),
      toolTipLabel: createTooltipLabel(count, type, getString)
    }
  }
  return getSymbolAndColorByChangeType(count, type, marker)
}

export const createChangeInfoCardData = (
  startTime: number | undefined,
  endTime: number | undefined,
  Deployment: TimeRangeDetail[],
  Infrastructure: TimeRangeDetail[],
  Alert: TimeRangeDetail[],
  getString: UseStringsReturn['getString']
): ChangesInfoCardData[] => {
  if (startTime && endTime) {
    const filterDeployment = Deployment?.filter((item: TimeRangeDetail) =>
      isChangesInTheRange(item, startTime, endTime)
    )
    const filterInfra = Infrastructure?.filter((item: TimeRangeDetail) => isChangesInTheRange(item, startTime, endTime))
    const filterIncident = Alert?.filter((item: TimeRangeDetail) => isChangesInTheRange(item, startTime, endTime))
    return [
      {
        key: ChangeSourceTypes.Deployments,
        count: sumBy(filterDeployment, 'count'),
        message: createTooltipLabel(sumBy(filterDeployment, 'count'), ChangeSourceTypes.Deployments, getString)
      },
      {
        key: ChangeSourceTypes.Incidents,
        count: sumBy(filterIncident, 'count'),
        message: createTooltipLabel(sumBy(filterIncident, 'count'), ChangeSourceTypes.Incidents, getString)
      },
      {
        key: ChangeSourceTypes.Infrastructure,
        count: sumBy(filterInfra, 'count'),
        message: createTooltipLabel(sumBy(filterInfra, 'count'), ChangeSourceTypes.Infrastructure, getString)
      }
    ]
  } else {
    return []
  }
}

export const nearestMinutes = (interval: number, someMoment: moment.Moment) => {
  const roundedMinutes = Math.ceil(someMoment.clone().minute() / interval) * interval
  return someMoment.clone().minute(roundedMinutes).second(0)
}

export const getStartAndEndTime = (duration: string) => {
  const now = moment()
  const diff = getTimeInHrs(duration || '') * 60 * 60 * 1000
  const interval = diff / TOTAL_DATA_POINTS
  const endTimeRoundedOffToNearest30min = nearestMinutes(30, now).valueOf()
  const startTimeRoundedOffToNearest30min = endTimeRoundedOffToNearest30min - diff

  return { interval, startTimeRoundedOffToNearest30min, endTimeRoundedOffToNearest30min }
}

export const createTimelineSeriesData = (
  timeRangeDetail: TimeRangeDetail[] | undefined,
  type: ChangeSourceTypes,
  getString: UseStringsReturn['getString']
): SeriesScatterOptions => {
  return {
    type: 'scatter',
    name: type,
    data: timeRangeDetail?.length
      ? timeRangeDetail?.map(timeline => {
          return {
            x: timeline.startTime,
            y: 0,
            marker: {
              ...(createMarkerSymbol(timeline, type, getString) as PointMarkerOptionsObject)
            }
          }
        })
      : []
  }
}
