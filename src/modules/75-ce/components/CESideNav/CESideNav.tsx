/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Checkbox, Layout, Popover, Text } from '@harness/uicore'
import { Tabs, Tab } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import { useTelemetry } from '@common/hooks/useTelemetry'
import routes from '@common/RouteDefinitions'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import NavExpandable from '@common/navigation/NavExpandable/NavExpandable'
import { USER_JOURNEY_EVENTS } from '@ce/TrackingEventsConstants'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { featureNames } from '@ce/constants'
import css from './CESideNav.module.scss'

const feedbackOptions = [
  'I am a CD/CI user',
  'To organise perspectives better',
  'For access management',
  'Does not matter, account level works for me'
]

export default function CESideNav(): React.ReactElement {
  const { currentUserInfo } = useAppStore()
  const { identifyUser } = useTelemetry()

  useEffect(() => {
    identifyUser(currentUserInfo.email)
  }, [])
  useTelemetry({ pageName: 'CloudCostPage' })
  return (
    <Layout.Vertical spacing="small">
      <Tabs id="ccmNavTab" selectedTabId={'account'} className={css.sideNavTabs}>
        <Tab id="account" title={'Account'} panel={<SideNavItems />} />
        <Tabs.Expander />
        <Popover interactionKind={'hover'} content={<ProjectLevelFeedback />}>
          <Text>{'Project'}</Text>
        </Popover>
      </Tabs>
    </Layout.Vertical>
  )
}

interface ProjectLevelFeedbackProps {
  shouldShowFeedbackCta?: boolean // TODO: temp prop, will remove once data saving API is ready
}

export const ProjectLevelFeedback = (props: ProjectLevelFeedbackProps) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState<boolean>(false)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [moreInfo, setMoreInfo] = useState<string>('')

  const handleOptionChange = (checked: boolean, val: string) => {
    const updatedOptions = [...selectedOptions]
    if (checked) {
      updatedOptions.push(val)
    } else {
      const index = updatedOptions.indexOf(val)
      updatedOptions.splice(index, 1)
    }
    setSelectedOptions(updatedOptions)
  }

  return (
    <div className={css.projectLevelFeedback}>
      <Text font={{ size: 'small' }} data-testid={'supportText'}>
        We currently only support Cloud Cost Management (CCM) at an Account Level.
      </Text>
      {!showFeedbackForm && props.shouldShowFeedbackCta && (
        <>
          <Text font={{ size: 'small', weight: 'bold' }} className={css.spaceAbove}>
            Would you like us to support CCM at a Project level?
          </Text>
          <Text
            font={{ size: 'small' }}
            color={Color.BLUE_700}
            style={{ cursor: 'pointer' }}
            rightIcon={'chevron-right'}
            onClick={() => setShowFeedbackForm(true)}
            data-testid={'fillFeedbackCta'}
          >
            Fill our feature request form
          </Text>
        </>
      )}
      {showFeedbackForm && (
        <>
          <Text font={{ size: 'small', weight: 'bold' }} className={css.spaceAbove}>
            Tell us why you would like CCM at a Project level?
          </Text>
          <div className={css.spaceAbove}>
            {feedbackOptions.map((option: string) => {
              return (
                <Checkbox
                  key={option.substr(0, 5)}
                  label={option}
                  checked={selectedOptions.indexOf(option) > -1}
                  onChange={(e: React.FormEvent<HTMLInputElement>) =>
                    handleOptionChange(e.currentTarget.checked, option)
                  }
                />
              )
            })}
          </div>
          <textarea
            value={moreInfo}
            placeholder={'Tell us more'}
            className={css.spaceAbove}
            onChange={e => setMoreInfo(e.target.value)}
          ></textarea>
          <Layout.Horizontal className={css.spaceAbove} spacing={'medium'}>
            <Button text="Submit" intent="primary" font={{ size: 'small' }} />
            <Button text="Cancel" font={{ size: 'small' }} onClick={() => setShowFeedbackForm(false)} />
          </Layout.Horizontal>
        </>
      )}
    </div>
  )
}

const SideNavItems = () => {
  const { accountId } = useParams<PipelinePathProps>()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const {
    CCM_COMMORCH: showCO,
    CCM_CURRENCY_PREFERENCES: currencyPreferencesEnabled,
    CCM_CLUSTER_ORCH,
    CCM_MSP
  } = useFeatureFlags()

  return (
    <Layout.Vertical spacing="small">
      <React.Fragment>
        <SidebarLink
          label={getString('overview')}
          to={routes.toCEOverview({ accountId })}
          onClick={() => {
            trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, { feature_name: featureNames.OVERVIEW_FEATURE })
          }}
        />
        <SidebarLink
          label={getString('ce.perspectives.sideNavText')}
          to={routes.toCEPerspectives({ accountId })}
          onClick={() => {
            trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, { feature_name: featureNames.PERSPECTIVES_FEATURE })
          }}
        />
        <SidebarLink
          label={getString('ce.budgets.sideNavText')}
          to={routes.toCEBudgets({ accountId })}
          onClick={() => {
            trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, { feature_name: featureNames.BUDGETS_FEATURE })
          }}
        />
        <SidebarLink
          label={getString('ce.anomalyDetection.sideNavText')}
          to={routes.toCEAnomalyDetection({ accountId })}
          onClick={() => {
            trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, { feature_name: featureNames.ANOMALIES_FEATURE })
          }}
        />
        <SidebarLink
          label={getString('ce.recommendation.sideNavText')}
          to={routes.toCERecommendations({ accountId })}
          onClick={() => {
            trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, {
              feature_name: featureNames.RECOMMENDATIONS_FEATURE
            })
          }}
        />
        {showCO && (
          <SidebarLink
            label={getString('ce.commitmentOrchestration.sideNavLabel')}
            to={routes.toCommitmentOrchestration({ accountId })}
            onClick={() => {
              trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, {
                feature_name: featureNames.COMMITMENT_ORCHESTRATOR_FEATURE
              })
            }}
          />
        )}
        <SidebarLink
          label={getString('ce.co.breadCrumb.rules')}
          to={routes.toCECORules({ accountId, params: '' })}
          onClick={() => {
            trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, { feature_name: featureNames.AUTOSTOPPING_FEATURE })
          }}
        />
        <SidebarLink
          label={getString('ce.biDashboard.sideNavText')}
          to={routes.toCEDashboards({ accountId })}
          onClick={() => {
            trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, { feature_name: featureNames.BI_DASHBOARD_FEATURE })
          }}
        />
        <SidebarLink
          label={getString('ce.governance.sideNavText')}
          to={routes.toCEGovernance({ accountId })}
          onClick={() => {
            trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, { feature_name: featureNames.GOVERNANCE })
          }}
        />
        {CCM_CLUSTER_ORCH && (
          <SidebarLink
            label={getString('ce.co.clusterOrchestratorLabel')}
            to={routes.toClusterOrchestrator({ accountId })}
            onClick={() => {
              trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, {
                feature_name: featureNames.CLUSTER_ORCHESTRATOR_FEATURE
              })
            }}
          />
        )}
        {CCM_MSP && (
          <SidebarLink
            label={getString('ce.msp.sideNavText')}
            to={routes.toCEManagedServiceProvider({ accountId })}
            onClick={() => {
              trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, {
                feature_name: featureNames.MSP
              })
            }}
          />
        )}
        <NavExpandable title={getString('common.setup')} route={routes.toCECOAccessPoints({ accountId })}>
          <Layout.Vertical spacing="small">
            {currencyPreferencesEnabled && (
              <SidebarLink
                label={getString('ce.currencyPreferences.sideNavText')}
                to={routes.toCECurrencyPreferences({ accountId })}
                onClick={() => {
                  trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, {
                    feature_name: featureNames.CURRENCY_PREFERENCES
                  })
                }}
              />
            )}
            <SidebarLink
              label={getString('ce.cloudIntegration.sideNavText')}
              to={routes.toCECloudIntegration({ accountId })}
              onClick={() => {
                trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, {
                  feature_name: featureNames.CLOUD_INTEGRATION_FEATURE
                })
              }}
            />
            <SidebarLink
              label={getString('ce.co.accessPoint.loadbalancers')}
              to={routes.toCECOAccessPoints({ accountId })}
              onClick={() => {
                trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, {
                  feature_name: featureNames.LOAD_BALANCER_FEATURE
                })
              }}
            />
            <SidebarLink
              label={getString('ce.businessMapping.sideNavText')}
              to={routes.toBusinessMapping({ accountId })}
              onClick={() => {
                trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, {
                  feature_name: featureNames.COST_CATEGORY_FEATURE
                })
              }}
            />
            <SidebarLink
              label={getString('common.defaultSettings')}
              rightIcon={'launch'}
              to={routes.toDefaultSettings({ accountId })}
              onClick={() => {
                trackEvent(USER_JOURNEY_EVENTS.CCM_FEATURE_NAVIGATION, {
                  feature_name: featureNames.DEFAULT_SETTINGS
                })
              }}
            />
          </Layout.Vertical>
        </NavExpandable>
      </React.Fragment>
    </Layout.Vertical>
  )
}
