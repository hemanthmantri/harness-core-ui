/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { TimeSeriesSampleDTO } from 'services/cv'
import { initNewRelicCustomForm } from '../../NewRelicHealthSource.constants'
import type { InitNewRelicCustomFormInterface } from '../../NewRelicHealthSource.types'

export const getOptionsForChart = (newRelicTimeSeriesData: TimeSeriesSampleDTO[] | null): (number | undefined)[][] => {
  return newRelicTimeSeriesData?.map(el => [el?.timestamp, el?.metricValue]) || []
}

export const initNewRelicCustomFormValue = (): InitNewRelicCustomFormInterface => {
  return {
    ...initNewRelicCustomForm,
    groupName: { label: '', value: '' }
  }
}
