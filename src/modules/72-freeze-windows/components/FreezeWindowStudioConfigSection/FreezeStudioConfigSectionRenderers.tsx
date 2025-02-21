/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import classnames from 'classnames'
import { set, cloneDeep } from 'lodash-es'
import { Icon, SelectOption, FormInput, Heading } from '@harness/uicore'
import type { ITagInputProps } from '@blueprintjs/core'
import { Color } from '@harness/design-system'
import { getIdentifierFromValue } from '@common/components/EntityReference/EntityReference'
import type { UseStringsReturn } from 'framework/strings'
import {
  EntityType,
  EnvironmentType,
  FIELD_KEYS,
  FILTER_TYPE,
  FreezeWindowLevels,
  ResourcesInterface
} from '@freeze-windows/types'
import {
  allPipelinesObj,
  allProjectsObj,
  getEnvTypeMap,
  isAllOptionSelected
} from '@freeze-windows/utils/FreezeWindowStudioUtil'
import css from './FreezeWindowStudioConfigSection.module.scss'

interface EnvTypeRendererProps {
  getString: UseStringsReturn['getString']
  name: string
  setEnvTypeFilter: React.Dispatch<React.SetStateAction<('Production' | 'PreProduction')[] | undefined>>
}

export interface ServiceEnvironmentFieldCommonPropsInterface {
  index: number
  getString: UseStringsReturn['getString']
  formikProps: any
}

export const EnvironmentTypeRenderer = ({ getString, name, setEnvTypeFilter }: EnvTypeRendererProps) => {
  const envTypeMap = getEnvTypeMap(getString)
  const [envTypes] = React.useState<SelectOption[]>([
    { label: envTypeMap[EnvironmentType.All], value: FILTER_TYPE.All },
    { label: envTypeMap[EnvironmentType.Production], value: EnvironmentType.Production },
    { label: envTypeMap[EnvironmentType.PreProduction], value: EnvironmentType.PreProduction }
  ])

  return (
    <FormInput.Select
      name={name}
      items={envTypes}
      label={getString('envType')}
      style={{ width: '400px' }}
      onChange={val => {
        if (val.value === FILTER_TYPE.All) {
          setEnvTypeFilter(['PreProduction', 'Production'])
        } else setEnvTypeFilter([val.value as 'Production' | 'PreProduction'])
      }}
    />
  )
}

const getOrgNameKeys = (namePrefix: string) => {
  const orgFieldName = `${namePrefix}.${FIELD_KEYS.Org}`
  const orgCheckBoxName = `${namePrefix}.${FIELD_KEYS.ExcludeOrgCheckbox}`
  const excludeOrgName = `${namePrefix}.${FIELD_KEYS.ExcludeOrg}`
  return { orgFieldName, orgCheckBoxName, excludeOrgName }
}

const getProjNameKeys = (namePrefix: string) => {
  const projFieldName = `${namePrefix}.${FIELD_KEYS.Proj}`
  const projCheckBoxName = `${namePrefix}.${FIELD_KEYS.ExcludeProjCheckbox}`
  const excludeProjName = `${namePrefix}.${FIELD_KEYS.ExcludeProj}`
  return { projFieldName, projCheckBoxName, excludeProjName }
}

const getPipelineNameKeys = (namePrefix: string) => {
  const pipelineFieldName = `${namePrefix}.${FIELD_KEYS.Pipeline}`
  const pipelineCheckBoxName = `${namePrefix}.${FIELD_KEYS.ExcludePipelineCheckbox}`
  const excludePipelineName = `${namePrefix}.${FIELD_KEYS.ExcludePipeline}`
  return { pipelineFieldName, pipelineCheckBoxName, excludePipelineName }
}

interface OrganizationfieldPropsInterface {
  getString: UseStringsReturn['getString']
  namePrefix: string
  organizations: SelectOption[]
  values: any
  setFieldValue: any
  formikValues: any
  setValues: any
  fetchProjectsForOrgId: (orgId: string) => void
  fetchOrgByQuery: (query: string) => void
  loadingOrgs: boolean
  fetchOrgResetQuery: () => void
}

const renderSearchLoading = (loading?: boolean): JSX.Element =>
  loading ? <Icon name="spinner" size={18} margin={{ top: 'xsmall', right: 'medium' }} /> : <></>

export const Organizationfield: React.FC<OrganizationfieldPropsInterface> = ({
  getString,
  namePrefix,
  organizations,
  values,
  setFieldValue,
  fetchProjectsForOrgId,
  formikValues,
  setValues,
  fetchOrgByQuery,
  loadingOrgs,
  fetchOrgResetQuery
}) => {
  const orgValue = values[FIELD_KEYS.Org]
  const excludeOrgCheckboxValue = values[FIELD_KEYS.ExcludeOrgCheckbox]
  const isCheckBoxEnabled = isAllOptionSelected(orgValue) && orgValue?.length === 1
  const { orgFieldName, orgCheckBoxName, excludeOrgName } = getOrgNameKeys(namePrefix)
  const { projFieldName, projCheckBoxName, excludeProjName } = getProjNameKeys(namePrefix)

  const [allOrgs, setAllOrgs] = React.useState<SelectOption[]>([])
  React.useEffect(() => {
    if (organizations.length) {
      setAllOrgs([{ label: 'All Organizations', value: FILTER_TYPE.All }, ...organizations])
    }
  }, [organizations])

  React.useEffect(() => {
    const isAllOrgSelected = isAllOptionSelected(orgValue)
    if (!isAllOrgSelected && orgValue?.length === 1) {
      fetchProjectsForOrgId(orgValue[0]?.value as string)
    }
  }, [])

  return (
    <>
      <FormInput.MultiSelect
        name={orgFieldName}
        items={allOrgs}
        className={css.tagInputStyle}
        label={getString('orgLabel')}
        usePortal
        tagInputProps={{ rightElement: renderSearchLoading(loadingOrgs) } as unknown as ITagInputProps}
        multiSelectProps={{
          onQueryChange(query: string) {
            query ? fetchOrgByQuery(query) : fetchOrgResetQuery()
          },
          resetOnSelect: false,
          resetOnQuery: false
        }}
        onChange={
          /* istanbul ignore next */ (selected?: SelectOption[]) => {
            const isAllSelected = isAllOptionSelected(selected)
            const selectedLen = (selected || []).length
            const isMultiSelected = selectedLen > 1
            const isSingleSelected = selectedLen === 1
            const isEmptyOrg = selectedLen === 0
            const clonedFormikValues = cloneDeep(formikValues)

            // Only All Orgs is selected
            if ((isAllSelected && !isMultiSelected) || isEmptyOrg) {
              // set projects fields
              set(clonedFormikValues, projFieldName, [allProjectsObj(getString)])
              set(clonedFormikValues, projCheckBoxName, false)
              set(clonedFormikValues, excludeProjName, undefined)
            }

            if (isMultiSelected || isEmptyOrg) {
              // Set org field
              set(clonedFormikValues, orgCheckBoxName, false)
              set(clonedFormikValues, excludeOrgName, undefined)
              // Set Project field
              set(clonedFormikValues, projFieldName, [allProjectsObj(getString)])
              set(clonedFormikValues, projCheckBoxName, false)
              set(clonedFormikValues, excludeProjName, undefined)
            }

            // Set Org field value
            set(clonedFormikValues, orgFieldName, selected)

            setValues(clonedFormikValues)

            if (!isAllSelected && isSingleSelected) {
              fetchProjectsForOrgId(selected?.[0]?.value as string)
            }
          }
        }
      />

      <FormInput.CheckBox
        name={orgCheckBoxName}
        label={getString('freezeWindows.freezeStudio.excludeOrgs')}
        disabled={!isCheckBoxEnabled}
        onChange={() => {
          setFieldValue(excludeOrgName, undefined)
        }}
      />

      {isCheckBoxEnabled && excludeOrgCheckboxValue ? (
        <FormInput.MultiSelect
          name={excludeOrgName}
          items={organizations}
          className={css.tagInputStyle}
          usePortal
          tagInputProps={{ rightElement: renderSearchLoading(loadingOrgs) } as unknown as ITagInputProps}
          multiSelectProps={{
            onQueryChange(query: string) {
              query ? fetchOrgByQuery(query) : fetchOrgResetQuery()
            },
            resetOnSelect: false,
            resetOnQuery: false
          }}
          style={{ marginLeft: '24px' }}
        />
      ) : null}
    </>
  )
}

interface ProjectFieldPropsInterface {
  getString: UseStringsReturn['getString']
  namePrefix: string
  resources: ResourcesInterface
  values: any
  setFieldValue: any
  formikValues: any
  setValues: any
  fetchProjectsByQuery: (query: string, orgId: string) => void
  loadingProjects: boolean
  fetchProjectsResetQuery: (orgId: string) => void
}
export const ProjectField: React.FC<ProjectFieldPropsInterface> = ({
  getString,
  namePrefix,
  resources,
  values,
  setFieldValue,
  formikValues,
  setValues,
  fetchProjectsByQuery,
  loadingProjects,
  fetchProjectsResetQuery
}) => {
  const { projects, freezeWindowLevel } = resources
  const [excludeProjects, setExcludeProjects] = React.useState(projects)

  const orgValue = values[FIELD_KEYS.Org]
  const isAccLevel = freezeWindowLevel === FreezeWindowLevels.ACCOUNT
  const isOrgValueAll = isAccLevel ? isAllOptionSelected(orgValue) : false
  const isSingleOrgValue = isAccLevel ? orgValue?.length === 1 && !isOrgValueAll : true
  const projValue = values[FIELD_KEYS.Proj]
  const excludeProjValue = values[FIELD_KEYS.ExcludeProjCheckbox]
  const isCheckBoxEnabled = isAllOptionSelected(projValue) && projValue?.length === 1
  const { projFieldName, projCheckBoxName, excludeProjName } = getProjNameKeys(namePrefix)
  const [allProj, setAllProj] = React.useState<SelectOption[]>([])

  React.useEffect(() => {
    if (isAccLevel) {
      if (isSingleOrgValue) {
        const orgId = orgValue[0].value
        const _projects = resources.projectsByOrgId?.[orgId]?.projects || []
        setAllProj([allProjectsObj(getString), ..._projects])
        setExcludeProjects(_projects)
      } else {
        setAllProj([allProjectsObj(getString)])
        setExcludeProjects([])
      }
    } else {
      if (!isSingleOrgValue || projects?.length === 0) {
        setAllProj([allProjectsObj(getString)])
        setExcludeProjects([])
      } else if (projects?.length) {
        setAllProj([allProjectsObj(getString), ...projects])
        setExcludeProjects(projects)
      }
    }
  }, [projects, isOrgValueAll, isSingleOrgValue, resources.projectsByOrgId])
  return (
    <>
      <FormInput.MultiSelect
        name={projFieldName}
        items={allProj}
        label={getString('projectsText')}
        className={css.tagInputStyle}
        usePortal
        tagInputProps={{ rightElement: renderSearchLoading(loadingProjects) } as unknown as ITagInputProps}
        multiSelectProps={{
          onQueryChange(query: string) {
            const orgId = isAccLevel ? orgValue[0].value : ''
            query ? fetchProjectsByQuery(query, orgId) : fetchProjectsResetQuery(orgId)
          },
          resetOnSelect: false,
          resetOnQuery: false
        }}
        // enabled only if org value is single select, and not All Organizations
        disabled={!isSingleOrgValue}
        onChange={(selected?: SelectOption[]) => {
          const isAllSelected = isAllOptionSelected(selected)
          const isMultiSelected = (selected || []).length > 1

          if (!isAllSelected || isMultiSelected) {
            const clonedFormikValues = cloneDeep(formikValues)
            set(clonedFormikValues, projCheckBoxName, false)
            set(clonedFormikValues, excludeProjName, undefined)

            // Set Proj field value
            set(clonedFormikValues, projFieldName, selected)
            setValues(clonedFormikValues)
          }
        }}
      />

      <FormInput.CheckBox
        name={projCheckBoxName}
        label={getString('freezeWindows.freezeStudio.excludeProjects')}
        disabled={!isCheckBoxEnabled || !isSingleOrgValue}
        onChange={() => {
          setFieldValue(excludeProjName, undefined)
        }}
      />

      {isCheckBoxEnabled && excludeProjValue ? (
        <FormInput.MultiSelect
          className={css.tagInputStyle}
          usePortal
          tagInputProps={{ rightElement: renderSearchLoading(loadingProjects) } as unknown as ITagInputProps}
          multiSelectProps={{
            onQueryChange(query: string) {
              const orgId = isAccLevel ? orgValue[0].value : ''
              query ? fetchProjectsByQuery(query, orgId) : fetchProjectsResetQuery(orgId)
            },
            resetOnSelect: false,
            resetOnQuery: false
          }}
          disabled={isOrgValueAll}
          name={excludeProjName}
          items={excludeProjects}
          style={{ marginLeft: '24px' }}
        />
      ) : null}
    </>
  )
}

interface PipelineFieldPropsInterface {
  getString: UseStringsReturn['getString']
  namePrefix: string
  resources: ResourcesInterface
  values: any
  setFieldValue: any
  formikValues: any
  setValues: any
  fetchPipelinesByQuery: (query: string) => void
  loadingPipelines: boolean
  fetchPipelinesResetQuery: () => void
}
export const PipelineField: React.FC<PipelineFieldPropsInterface> = ({
  getString,
  namePrefix,
  resources,
  values,
  setFieldValue,
  formikValues,
  setValues,
  fetchPipelinesByQuery,
  loadingPipelines,
  fetchPipelinesResetQuery
}) => {
  const { pipelineOptions } = resources
  const [excludePipelines, setExcludePipelines] = React.useState(pipelineOptions)
  const pipelineValue = values[FIELD_KEYS.Pipeline]
  const excludePipelineValue = values[FIELD_KEYS.ExcludePipelineCheckbox]
  const isCheckBoxEnabled = isAllOptionSelected(pipelineValue) && pipelineValue?.length === 1
  const { excludePipelineName, pipelineCheckBoxName, pipelineFieldName } = getPipelineNameKeys(namePrefix)
  const [allPipeline, setAllPipeline] = React.useState<SelectOption[]>([])

  React.useEffect(() => {
    if (pipelineOptions?.length) {
      setAllPipeline([allPipelinesObj(getString), ...pipelineOptions])
      setExcludePipelines(pipelineOptions)
    }
  }, [pipelineOptions])
  return (
    <>
      <FormInput.MultiSelect
        name={pipelineFieldName}
        items={allPipeline}
        label={getString('pipelines')}
        className={css.tagInputStyle}
        usePortal
        tagInputProps={{ rightElement: renderSearchLoading(loadingPipelines) } as unknown as ITagInputProps}
        multiSelectProps={{
          onQueryChange(query: string) {
            query ? fetchPipelinesByQuery(query) : fetchPipelinesResetQuery()
          },
          resetOnSelect: false,
          resetOnQuery: false
        }}
        onChange={(selected?: SelectOption[]) => {
          const isAllSelected = isAllOptionSelected(selected)
          const isMultiSelected = (selected || []).length > 1

          if (!isAllSelected || isMultiSelected) {
            const clonedFormikValues = cloneDeep(formikValues)
            set(clonedFormikValues, pipelineCheckBoxName, false)
            set(clonedFormikValues, excludePipelineName, undefined)

            // Set Pipeline field value
            set(clonedFormikValues, pipelineFieldName, selected)
            setValues(clonedFormikValues)
          }
        }}
      />

      <FormInput.CheckBox
        name={pipelineCheckBoxName}
        label={getString('freezeWindows.freezeStudio.excludePipelines')}
        disabled={!isCheckBoxEnabled}
        onChange={() => {
          setFieldValue(excludePipelineName, undefined)
        }}
      />

      {isCheckBoxEnabled && excludePipelineValue ? (
        <FormInput.MultiSelect
          className={css.tagInputStyle}
          usePortal
          tagInputProps={{ rightElement: renderSearchLoading(loadingPipelines) } as unknown as ITagInputProps}
          multiSelectProps={{
            onQueryChange(query: string) {
              query ? fetchPipelinesByQuery(query) : fetchPipelinesResetQuery()
            },
            resetOnSelect: false,
            resetOnQuery: false
          }}
          name={excludePipelineName}
          items={excludePipelines}
          style={{ marginLeft: '24px' }}
        />
      ) : null}
    </>
  )
}

export const EnvTypeRenderer: React.FC<{
  envType: EnvironmentType
  getString: UseStringsReturn['getString']
}> = ({ getString, envType }) => {
  const envTypeMap = getEnvTypeMap(getString)

  return (
    <Heading level={3} style={{ fontWeight: 600, fontSize: '12px', lineHeight: '18px' }} color={Color.GREY_600}>
      {`${getString('envType')}: ${envTypeMap[envType as EnvironmentType]}`}
    </Heading>
  )
}

interface OrgProjAndServiceRendererPropsInterface {
  entitiesMap: Record<FIELD_KEYS, EntityType>
  freezeWindowLevel: FreezeWindowLevels
  resources: ResourcesInterface
  getString: UseStringsReturn['getString']
}

const ProjectLevelRender: React.FC<OrgProjAndServiceRendererPropsInterface> = ({
  entitiesMap,
  resources,
  getString
}) => {
  const serviceEntityMap = entitiesMap[FIELD_KEYS.Service]
  const envEntityMap = entitiesMap[FIELD_KEYS.Environment]
  const filterTypeEnv = envEntityMap?.filterType || FILTER_TYPE.All
  const environmentMap = resources.environmentsMap
  const selectedEnvIds = envEntityMap?.entityRefs || []
  let envNodes = null
  if (filterTypeEnv === FILTER_TYPE.All || selectedEnvIds.length === 0) {
    envNodes = <span className={css.badge}>{getString('common.allEnvironments')}</span>
  } else {
    envNodes = selectedEnvIds.map(envId => {
      const envIdWithoutScope = getIdentifierFromValue(envId)
      return (
        <span key={envId} className={css.badge}>
          {environmentMap[envIdWithoutScope]?.label || envIdWithoutScope}
        </span>
      )
    })
  }

  const filterTypeSvc = serviceEntityMap?.filterType || FILTER_TYPE.All
  const serviceMap = resources.servicesMap
  const selectedServiceIds = serviceEntityMap?.entityRefs || []
  let serviceNodes = null
  if (filterTypeSvc === FILTER_TYPE.All || selectedServiceIds.length === 0) {
    serviceNodes = <span className={css.badge}>{getString('common.allServices')}</span>
  } else {
    serviceNodes = selectedServiceIds.map(svcId => {
      const svcIdWithoutScope = getIdentifierFromValue(svcId)
      return (
        <span key={svcId} className={css.badge}>
          {serviceMap[svcIdWithoutScope]?.label || svcIdWithoutScope}
        </span>
      )
    })
  }

  return (
    <>
      <div className={css.viewRowNode}>
        <span>{getString('services')}</span>:
        {filterTypeSvc === 'NotEquals' ? (
          <span className={css.badge}>{getString('common.allServices')}</span>
        ) : (
          serviceNodes
        )}
      </div>
      {filterTypeSvc === 'NotEquals' && (
        <div className={css.viewRowNode}>
          <span>{getString('freezeWindows.freezeStudio.excludeFollowingServices')}</span>: {serviceNodes}
        </div>
      )}

      <div className={css.viewRowNode}>
        <span>{getString('environments')}</span>:
        {filterTypeEnv === 'NotEquals' ? (
          <span className={css.badge}>{getString('common.allEnvironments')}</span>
        ) : (
          envNodes
        )}
      </div>
      {filterTypeEnv === 'NotEquals' && (
        <div className={css.viewRowNode}>
          <span>{getString('freezeWindows.freezeStudio.excludeFollowingEnvironments')}</span>: {envNodes}
        </div>
      )}
    </>
  )
}

interface PipelineRendererPropsInterface {
  entitiesMap: Record<FIELD_KEYS, EntityType>
  pipelinesMap: Record<string, SelectOption>
  getString: UseStringsReturn['getString']
}

const PipelineRenderer: React.FC<PipelineRendererPropsInterface> = ({ entitiesMap, pipelinesMap, getString }) => {
  const entityMap = entitiesMap[FIELD_KEYS.Pipeline]
  const filterType = entityMap?.filterType || FILTER_TYPE.All
  const selectedItemIds = entityMap?.entityRefs || []
  let nodesEl = null
  if (filterType === FILTER_TYPE.All || selectedItemIds.length === 0) {
    const nodes = <span className={css.badge}>{allPipelinesObj(getString).label}</span>
    nodesEl = (
      <>
        <span>{getString('pipelines')}:</span> {nodes}
      </>
    )
  } else if (filterType === FILTER_TYPE.NotEquals) {
    const nodes = selectedItemIds.map(itemId => {
      return (
        <span key={itemId} className={css.badge}>
          {pipelinesMap[itemId]?.label || itemId}
        </span>
      )
    })

    return (
      <>
        <div className={classnames(css.viewRowNode, css.marginSmaller)}>
          <span>{getString('pipelines')}:</span> <span className={css.badge}>{allPipelinesObj(getString)?.label}</span>
        </div>
        <div className={css.viewRowNode}>
          <span>
            {getString(
              selectedItemIds.length === 1
                ? 'freezeWindows.freezeStudio.excludeFollowingPipeline'
                : 'freezeWindows.freezeStudio.excludeFollowingPipelines'
            )}
            :
          </span>
          {nodes}
        </div>
      </>
    )
  } else if (filterType === FILTER_TYPE.Equals) {
    const nodes = selectedItemIds.map(itemId => {
      return (
        <span key={itemId} className={css.badge}>
          {pipelinesMap[itemId]?.label || itemId}
        </span>
      )
    })
    nodesEl = (
      <>
        <span>{getString('pipelines')}:</span> {nodes}
      </>
    )
  }

  return <div className={css.viewRowNode}>{nodesEl}</div>
}

const AccountLevelRenderer: React.FC<OrgProjAndServiceRendererPropsInterface> = ({
  entitiesMap,
  resources,
  getString
}) => {
  const entityMap = entitiesMap[FIELD_KEYS.Org]
  const filterType = entityMap?.filterType || FILTER_TYPE.All
  const resourcesMap = resources.orgsMap
  const projResourcesMap = resources.projectsMap
  const selectedItemIds = entityMap?.entityRefs || []
  if (filterType === FILTER_TYPE.All || selectedItemIds.length === 0) {
    return (
      <>
        <div className={css.viewRowNode}>
          <span>{getString('orgsText')}:</span>
          <span className={css.badge}>{resourcesMap[FILTER_TYPE.All]?.label}</span>
        </div>
        <div className={css.viewRowNode}>
          <span>{getString('projectsText')}:</span>
          <span className={css.badge}>{projResourcesMap[FILTER_TYPE.All]?.label}</span>
        </div>
      </>
    )
  } else if (filterType === FILTER_TYPE.NotEquals) {
    const nodes = selectedItemIds.map(itemId => {
      return (
        <span key={itemId} className={css.badge}>
          {resourcesMap[itemId]?.label || itemId}
        </span>
      )
    })
    return (
      <>
        <div className={classnames(css.viewRowNode, css.marginSmaller)}>
          <span>{getString('orgsText')}:</span>
          <span className={css.badge}>{resourcesMap[FILTER_TYPE.All]?.label}</span>
        </div>
        <div className={css.viewRowNode}>
          <span>
            {getString(
              selectedItemIds.length === 1
                ? 'freezeWindows.freezeStudio.excludeFollowingOrg'
                : 'freezeWindows.freezeStudio.excludeFollowingOrgs'
            )}
            :
          </span>
          {nodes}
        </div>
        <div className={css.viewRowNode}>
          <span>{getString('projectsText')}:</span>
          <span className={css.badge}>{projResourcesMap[FILTER_TYPE.All]?.label}</span>
        </div>
      </>
    )
  } else if (filterType === FILTER_TYPE.Equals) {
    const isOrgMultiSelected = selectedItemIds.length > 1
    const nodes = selectedItemIds.map(itemId => {
      return (
        <span key={itemId} className={css.badge}>
          {resourcesMap[itemId]?.label || itemId}
        </span>
      )
    })
    // Render selected orgs and render "All Projects" test
    if (isOrgMultiSelected) {
      return (
        <>
          <div className={css.viewRowNode}>
            <span>{getString('orgsText')}:</span> {nodes}
          </div>
          <div className={css.viewRowNode}>
            <span>{getString('projectsText')}:</span>
            <span className={css.badge}>{projResourcesMap[FILTER_TYPE.All]?.label}</span>
          </div>
        </>
      )
    } else {
      return (
        <>
          <div className={css.viewRowNode}>
            <span>{getString('orgsText')}:</span> {nodes}
          </div>
          <OrgLevelRenderer
            entitiesMap={entitiesMap}
            projectsMap={resources.projectsByOrgId[selectedItemIds[0]]?.projectsMap || {}}
            getString={getString}
          />
        </>
      )
    }
  }
  return <div></div>
}

interface OrgRendererPropsInterface {
  entitiesMap: Record<FIELD_KEYS, EntityType>
  projectsMap: Record<string, SelectOption>
  getString: UseStringsReturn['getString']
}

const OrgLevelRenderer: React.FC<OrgRendererPropsInterface> = ({ entitiesMap, projectsMap, getString }) => {
  const entityMap = entitiesMap[FIELD_KEYS.Proj]
  const filterType = entityMap?.filterType || FILTER_TYPE.All
  const selectedItemIds = entityMap?.entityRefs || []
  let nodesEl = null
  if (filterType === FILTER_TYPE.All || selectedItemIds.length === 0) {
    const nodes = <span className={css.badge}>{allProjectsObj(getString).label}</span>
    nodesEl = (
      <>
        <span>{getString('projectsText')}:</span> {nodes}
      </>
    )
  } else if (filterType === FILTER_TYPE.NotEquals) {
    const nodes = selectedItemIds.map(itemId => {
      return (
        <span key={itemId} className={css.badge}>
          {projectsMap[itemId]?.label || itemId}
        </span>
      )
    })

    return (
      <>
        <div className={classnames(css.viewRowNode, css.marginSmaller)}>
          <span>{getString('projectsText')}:</span>
          <span className={css.badge}>{allProjectsObj(getString)?.label}</span>
        </div>
        <div className={css.viewRowNode}>
          <span>
            {getString(
              selectedItemIds.length === 1
                ? 'freezeWindows.freezeStudio.excludeFollowingProject'
                : 'freezeWindows.freezeStudio.excludeFollowingProjects'
            )}
            :
          </span>
          {nodes}
        </div>
      </>
    )
  } else if (filterType === FILTER_TYPE.Equals) {
    const nodes = selectedItemIds.map(itemId => {
      return (
        <span key={itemId} className={css.badge}>
          {projectsMap[itemId]?.label || itemId}
        </span>
      )
    })
    nodesEl = (
      <>
        <span>{getString('projectsText')}:</span> {nodes}
      </>
    )
  }

  return <div className={css.viewRowNode}>{nodesEl}</div>
}

export const OrgProjAndServiceRenderer: React.FC<OrgProjAndServiceRendererPropsInterface> = ({
  entitiesMap,
  freezeWindowLevel,
  resources,
  getString
}) => {
  if (freezeWindowLevel === FreezeWindowLevels.PROJECT) {
    return (
      <>
        <ProjectLevelRender
          entitiesMap={entitiesMap}
          resources={resources}
          getString={getString}
          freezeWindowLevel={freezeWindowLevel}
        />
        <PipelineRenderer entitiesMap={entitiesMap} pipelinesMap={resources.pipelinesMap || {}} getString={getString} />
      </>
    )
  }
  if (freezeWindowLevel === FreezeWindowLevels.ORG) {
    return (
      <>
        <OrgLevelRenderer entitiesMap={entitiesMap} projectsMap={resources.projectsMap || {}} getString={getString} />
        <ProjectLevelRender
          entitiesMap={entitiesMap}
          resources={resources}
          getString={getString}
          freezeWindowLevel={freezeWindowLevel}
        />
      </>
    )
  }
  /* istanbul ignore else */
  if (freezeWindowLevel === FreezeWindowLevels.ACCOUNT) {
    return (
      <>
        <AccountLevelRenderer
          entitiesMap={entitiesMap}
          resources={resources}
          getString={getString}
          freezeWindowLevel={freezeWindowLevel}
        />
        <ProjectLevelRender
          entitiesMap={entitiesMap}
          resources={resources}
          getString={getString}
          freezeWindowLevel={freezeWindowLevel}
        />
      </>
    )
  }
  return <div></div>
}
