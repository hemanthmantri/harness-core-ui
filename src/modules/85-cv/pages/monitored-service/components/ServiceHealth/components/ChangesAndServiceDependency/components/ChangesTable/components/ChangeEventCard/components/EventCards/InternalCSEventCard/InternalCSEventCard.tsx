/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { defaultTo } from 'lodash-es'
import { Divider } from '@blueprintjs/core'
import { Card, Container, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import moment from 'moment'
import type { ChangeEventDTO, CustomChangeEventMetadata, InternalChangeEventMetaData } from 'services/cv'
import { useStrings } from 'framework/strings'
import ChangeEventServiceHealth from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/components/ChangeCard/components/ChangeEventServiceHealth/ChangeEventServiceHealth'
import SLOAndErrorBudget from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/components/ChangeCard/components/SLOAndErrorBudget/SLOAndErrorBudget'
import { UserLabel } from '@common/exports'
import {
  ChangeSourceTypes,
  CustomChangeSourceList
} from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import type { ChangeDetailsDataInterface, ChangeTitleData } from '../../../ChangeEventCard.types'
import { createChangeDetailsData, createChangeTitleDataForInternalCS } from '../../../ChangeEventCard.utils'
import { TIME_FORMAT_DETAILS_CARD, TWO_HOURS_IN_MILLISECONDS } from '../../../ChangeEventCard.constant'
import ChangeTitleWithRedirectButton from '../../ChangeTitleWithRedirectButton/ChangeTitleWithRedirectButton'
import ChangeDetails from '../../ChangeDetails/ChangeDetails'
import YAMLDiffView from './components/YAMLDiffView'
import css from '../../../ChangeEventCard.module.scss'

export default function InternalCSEventCard({ data }: { data: ChangeEventDTO }): JSX.Element {
  const { getString } = useStrings()
  const [timeStamps, setTimestamps] = useState<[number, number]>([0, 0])
  const changeTitleData: ChangeTitleData = useMemo(() => createChangeTitleDataForInternalCS(data), [])

  const changeDetailsData: ChangeDetailsDataInterface = useMemo(() => createChangeDetailsData(data), [])
  const metadata: InternalChangeEventMetaData | CustomChangeEventMetadata = defaultTo(data.metadata, {})
  const { eventStartTime, updatedBy, internalChangeEvent, customChangeEvent, user, startTime } = metadata
  const { changeEventDetailsLink, eventDescriptions } = internalChangeEvent || {}

  const isCustomChangeSource = CustomChangeSourceList.includes(data.type as ChangeSourceTypes)

  const renderUserLabel = (): JSX.Element => (
    <Layout.Vertical width="max-content">
      <Layout.Horizontal
        flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
        spacing="small"
        margin={{ bottom: 'medium' }}
      >
        <UserLabel
          name={updatedBy || user || ''}
          email={updatedBy || user}
          iconProps={{ size: 16 }}
          textProps={{ font: { size: 'small', weight: 'semi-bold' }, color: Color.BLACK_100 }}
        />
        <Divider className={css.verticalDivider} />
        <Text icon={'time'} iconProps={{ size: 15 }} font={{ size: 'small' }} margin={{ right: 'medium' }}>
          <Text tag="span" font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK_100}>
            {moment(eventStartTime || startTime).format(TIME_FORMAT_DETAILS_CARD)}
          </Text>
        </Text>
      </Layout.Horizontal>
    </Layout.Vertical>
  )

  const changeDetailsProps = isCustomChangeSource
    ? {
        ...changeDetailsData,
        details: { ...customChangeEvent },
        executedBy: {
          shouldVisible: true,
          component: renderUserLabel()
        }
      }
    : {
        ...changeDetailsData,
        details: { action: defaultTo(eventDescriptions, []) },
        executedBy: {
          shouldVisible: true,
          component: renderUserLabel()
        }
      }

  const showYamlDiff = changeEventDetailsLink?.url && data.type !== ChangeSourceTypes.HarnessCE

  return (
    <Card className={css.main}>
      <ChangeTitleWithRedirectButton changeTitleData={changeTitleData} />
      <Divider className={css.divider} />
      <ChangeDetails ChangeDetailsData={changeDetailsProps} />
      <Divider className={css.divider} />
      {showYamlDiff && (
        <>
          <Container>
            <Text
              font={{ size: 'normal', weight: 'bold' }}
              color={Color.GREY_800}
              style={{ marginBottom: 'var(--spacing-medium)' }}
            >
              {getString('auditTrail.yamlDifference')}
            </Text>
            <YAMLDiffView url={internalChangeEvent?.changeEventDetailsLink?.url} />
          </Container>
          <Divider className={css.divider} />
        </>
      )}

      {data.eventTime && data.monitoredServiceIdentifier && (
        <>
          <ChangeEventServiceHealth
            monitoredServiceIdentifier={data.monitoredServiceIdentifier}
            startTime={data.eventTime}
            eventType={data.type}
            timeStamps={timeStamps}
            setTimestamps={setTimestamps}
            title={getString('cv.monitoredServices.monitoredServiceTabs.serviceHealth')}
          />
          <SLOAndErrorBudget
            monitoredServiceIdentifier={data.monitoredServiceIdentifier}
            startTime={timeStamps[0] || data.eventTime}
            endTime={timeStamps[1] || data.eventTime + TWO_HOURS_IN_MILLISECONDS}
            eventTime={data.eventTime}
            eventType={data.type}
          />
        </>
      )}
    </Card>
  )
}
