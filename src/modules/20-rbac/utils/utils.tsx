/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactNode } from 'react'
import type { IconName, ModalErrorHandlerBinding, MultiSelectOption, SelectOption } from '@harness/uicore'
import { defaultTo, pick } from 'lodash-es'
import type { StringsMap } from 'stringTypes'
import type {
  AccessControlCheckError,
  RoleAssignmentMetadataDTO,
  Scope as CDScope,
  UserGroupDTO,
  Failure,
  GetUserGroupAggregateQueryParams
} from 'services/cd-ng'
import { Scope, PrincipalScope } from '@common/interfaces/SecretsInterface'
import { String } from 'framework/strings'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import type {
  Assignment,
  RoleOption,
  ResourceGroupOption
} from '@rbac/modals/RoleAssignmentModal/views/UserRoleAssigment'
import { RbacResourceGroupTypes } from '@rbac/constants/utils'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { FeatureRequest } from 'framework/featureStore/featureStoreUtil'
import type { PermissionsRequest } from '@rbac/hooks/usePermission'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import type { UseStringsReturn } from 'framework/strings'
import type { RbacMenuItemProps } from '@rbac/components/MenuItem/MenuItem'
import type { ResourceSelectorValue } from '@rbac/pages/ResourceGroupDetails/utils'
import type { AttributeFilter } from 'services/resourcegroups'
import { useQueryParamsOptions, UseQueryParamsOptions } from '@common/hooks/useQueryParams'
import type { CommonPaginationQueryParams } from '@common/hooks/useDefaultPaginationProps'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'

export const DEFAULT_RG = '_all_resources_including_child_scopes'
export const PROJECT_DEFAULT_RG = '_all_project_level_resources'

export enum AuthenticationMechanisms {
  SAML = 'SAML',
  OAUTH = 'OAUTH',
  LDAP = 'LDAP',
  USER_PASSWORD = 'USER_PASSWORD'
}

export interface ProjectSelectOption extends MultiSelectOption {
  orgIdentifier: string
}

export enum PrincipalType {
  USER = 'USER',
  USER_GROUP = 'USER_GROUP',
  SERVICE = 'SERVICE_ACCOUNT'
}

export enum SelectionType {
  ALL = 'ALL',
  SPECIFIED = 'SPECIFIED'
}

export const getRoleIcon = (roleIdentifier: string): IconName => {
  switch (roleIdentifier) {
    case '_account_viewer':
    case '_organization_viewer':
    case '_project_viewer':
      return 'viewerRole'
    case '_account_admin':
    case '_organization_admin':
    case '_project_admin':
      return 'adminRole'
    case '_pipeline_executor':
      return 'pipeline-executor'
    default:
      return 'customRole'
  }
}

export enum InvitationStatus {
  USER_INVITED_SUCCESSFULLY = 'USER_INVITED_SUCCESSFULLY',
  USER_ADDED_SUCCESSFULLY = 'USER_ADDED_SUCCESSFULLY',
  USER_ALREADY_ADDED = 'USER_ALREADY_ADDED',
  USER_ALREADY_INVITED = 'USER_ALREADY_INVITED',
  USER_INVITE_NOT_REQUIRED = 'USER_INVITE_NOT_REQUIRED',
  FAIL = 'FAIL'
}

export enum ScopeFilterItems {
  ALL = 'ALL',
  ACCOUNT_ONLY = 'ACCOUNT_ONLY',
  ORG_ONLY = 'ORG_ONLY',
  ORG_WITH_PROJECTS = 'ORG_WITH_PROJECTS',
  PROJECT_ONLY = 'PROJECT_ONLY'
}
interface HandleInvitationResponse {
  responseType: InvitationStatus
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
  showSuccess: (message: string | ReactNode, timeout?: number, key?: string) => void
  modalErrorHandler?: ModalErrorHandlerBinding
  onSubmit?: () => void
  onUserAdded?: () => void
}

export const handleInvitationResponse = ({
  responseType,
  getString,
  showSuccess,
  modalErrorHandler,
  onSubmit,
  onUserAdded
}: HandleInvitationResponse): void => {
  switch (responseType) {
    case InvitationStatus.USER_INVITED_SUCCESSFULLY: {
      onSubmit?.()
      return showSuccess(getString('rbac.usersPage.invitationSuccess'))
    }
    case InvitationStatus.USER_INVITE_NOT_REQUIRED:
    case InvitationStatus.USER_ADDED_SUCCESSFULLY: {
      onUserAdded?.()
      return showSuccess(getString('rbac.usersPage.userAddedSuccess'))
    }
    case InvitationStatus.USER_ALREADY_ADDED:
      return showSuccess(getString('rbac.usersPage.userAlreadyAdded'))
    case InvitationStatus.USER_ALREADY_INVITED:
      return showSuccess(getString('rbac.usersPage.userAlreadyInvited'))
    default:
      return modalErrorHandler?.showDanger(getString('rbac.usersPage.invitationError'))
  }
}

export const getPermissionRequestFromProps = (
  permission?: RbacMenuItemProps['permission']
): PermissionsRequest | undefined => {
  if (permission) {
    return {
      ...pick(permission, ['resourceScope', 'resource', 'options', 'attributeFilter']),
      permissions: [permission.permission]
    } as PermissionsRequest
  }
}

export const getScopeBasedDefaultResourceGroup = (
  scope: Scope,
  getString: UseStringsReturn['getString']
): SelectOption => {
  switch (scope) {
    case Scope.PROJECT:
      return {
        label: getString('rbac.allProjectResources'),
        value: '_all_project_level_resources'
      }
    default:
      return {
        label: getString('rbac.allResourcesIncludingChildScopes'),
        value: DEFAULT_RG
      }
  }
}

export const getScopeLevelManagedResourceGroup = (
  scope: Scope,
  getString: UseStringsReturn['getString']
): SelectOption => {
  switch (scope) {
    case Scope.ACCOUNT:
      return {
        label: getString('rbac.allAccountResources'),
        value: '_all_account_level_resources'
      }
    case Scope.ORG:
      return {
        label: getString('rbac.allOrgResources'),
        value: '_all_organization_level_resources'
      }
    case Scope.PROJECT:
      return {
        label: getString('rbac.allProjectResources'),
        value: '_all_project_level_resources'
      }
    default:
      return {
        label: getString('rbac.allResources'),
        value: '_all_resources'
      }
  }
}

export const isAccountBasicRole = (identifier: string): boolean => {
  return identifier === '_account_basic'
}

export const getScopeBasedDefaultAssignment = (
  scope: Scope,
  getString: UseStringsReturn['getString'],
  disableDefaultAssignment: boolean
): Assignment[] => {
  if (disableDefaultAssignment) {
    return []
  } else {
    const resourceGroup: ResourceGroupOption = {
      managedRoleAssignment: true,
      ...getScopeLevelManagedResourceGroup(scope, getString)
    }
    switch (scope) {
      case Scope.ACCOUNT:
        return [
          {
            role: {
              label: getString('common.accViewer'),
              value: '_account_viewer',
              managed: true,
              managedRoleAssignment: true
            },
            resourceGroup
          }
        ]
      case Scope.ORG:
        return [
          {
            role: {
              label: getString('common.orgViewer'),
              value: '_organization_viewer',
              managed: true,
              managedRoleAssignment: true
            },
            resourceGroup
          }
        ]
      case Scope.PROJECT:
        return [
          {
            role: {
              label: getString('common.projectViewer'),
              value: '_project_viewer',
              managed: true,
              managedRoleAssignment: true
            },
            resourceGroup
          }
        ]
      default:
        return []
    }
  }
}

export const isAssignmentFieldDisabled = (value: RoleOption | ResourceGroupOption): boolean => {
  if (value.assignmentIdentifier) {
    return true
  }
  return false
}
export const isDynamicResourceSelector = (value: ResourceSelectorValue): boolean => {
  return value === RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR
}

export const isAtrributeFilterSelector = (value: ResourceSelectorValue): boolean => {
  return Array.isArray((value as AttributeFilter)?.attributeValues)
}

export const isScopeResourceSelector = (value: string): boolean => {
  return value === RbacResourceGroupTypes.SCOPE_RESOURCE_SELECTOR
}

export interface ErrorHandlerProps {
  data: Failure | AccessControlCheckError | Error
}

export const getAssignments = (roleBindings: RoleAssignmentMetadataDTO[]): Assignment[] => {
  return defaultTo(
    roleBindings?.reduce((acc: Assignment[], roleAssignment) => {
      if (!isAccountBasicRole(roleAssignment.roleIdentifier)) {
        acc.push({
          role: {
            label: roleAssignment.roleName,
            value: roleAssignment.roleIdentifier,
            managed: roleAssignment.managedRole,
            managedRoleAssignment: roleAssignment.managedRoleAssignment,
            assignmentIdentifier: roleAssignment.identifier
          },
          resourceGroup: {
            label: defaultTo(roleAssignment.resourceGroupName, ''),
            value: defaultTo(roleAssignment.resourceGroupIdentifier, ''),
            managedRoleAssignment: roleAssignment.managedRoleAssignment,
            assignmentIdentifier: roleAssignment.identifier
          }
        })
      }
      return acc
    }, []),
    []
  )
}

export const isNewRoleAssignment = (assignment: Assignment): boolean => {
  return !(assignment.role.assignmentIdentifier || assignment.resourceGroup.assignmentIdentifier)
}

interface FeatureProps {
  featureRequest: FeatureRequest
  isPermissionPrioritized?: boolean
}

interface TooltipProps {
  permissionRequest?: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier }
  featureProps?: FeatureProps
  canDoAction: boolean
  featureEnabled: boolean
}

interface TooltipReturn {
  tooltip?: React.ReactElement
}

export function getTooltip({
  permissionRequest,
  featureProps,
  canDoAction,
  featureEnabled
}: TooltipProps): TooltipReturn {
  // if permission check override the priorirty
  if (featureProps?.isPermissionPrioritized && permissionRequest && !canDoAction) {
    return {
      tooltip: (
        <RBACTooltip
          permission={permissionRequest.permission}
          resourceType={permissionRequest.resource.resourceType}
          resourceScope={permissionRequest.resourceScope}
        />
      )
    }
  }

  // feature check by default take priority
  if (featureProps?.featureRequest && !featureEnabled) {
    return {
      tooltip: <FeatureWarningTooltip featureName={featureProps?.featureRequest.featureName} />
    }
  }

  // permission check
  if (permissionRequest && !canDoAction) {
    return {
      tooltip: (
        <RBACTooltip
          permission={permissionRequest.permission}
          resourceType={permissionRequest.resource.resourceType}
          resourceScope={permissionRequest.resourceScope}
        />
      )
    }
  }

  return {}
}

export const generateScopeList = (org: string, projects: ProjectSelectOption[], accountId: string): CDScope[] => {
  if (projects.length > 0) {
    return projects.map(project => ({
      accountIdentifier: accountId,
      orgIdentifier: project.orgIdentifier,
      projectIdentifier: project.value as string
    }))
  }
  return [
    {
      accountIdentifier: accountId,
      orgIdentifier: org as string
    }
  ]
}

export const getUserGroupActionTooltipText = (
  accountId: string,
  orgIdentifier: string,
  projectIdentifier: string,
  userGroup: UserGroupDTO,
  userGroupInherited?: boolean
): React.ReactElement | undefined => {
  const { ssoLinked, externallyManaged } = userGroup
  const scope = getScopeFromDTO({
    accountId,
    orgIdentifier,
    projectIdentifier
  })
  const parentScope = mapfromScopetoPrincipalScope(getScopeFromUserGroupDTO(userGroup))
  const currentScope = mapfromScopetoPrincipalScope(scope)
  if (userGroupInherited) {
    const vars = {
      parentScope: parentScope ? parentScope.charAt(0).toUpperCase() + parentScope.slice(1) : undefined,
      childScope: currentScope ? currentScope.charAt(0).toUpperCase() + currentScope.slice(1) : undefined
    }
    return <String stringID="rbac.unableToEditInheritedMembershipDetailed" vars={vars} />
  }

  if (ssoLinked) {
    return <String stringID="rbac.userDetails.linkToSSOProviderModal.btnDisabledTooltipText" />
  }

  if (externallyManaged) {
    return <String stringID="rbac.unableToEditSCIMMembership" />
  }
}

export const getUserGroupMenuOptionText = (
  action: string,
  target: string,
  userGroup: UserGroupDTO,
  userGroupInherited?: boolean
): React.ReactElement | undefined => {
  const { externallyManaged } = userGroup
  const parentScope = mapfromScopetoPrincipalScope(getScopeFromUserGroupDTO(userGroup))
  if (userGroupInherited) {
    const vars = {
      action: action.toLowerCase(),
      parentScope: parentScope ? parentScope.charAt(0).toUpperCase() + parentScope.slice(1) : undefined
    }
    return <String stringID="rbac.manageInheritedGroupText" vars={vars} />
  }
  if (externallyManaged) {
    const vars = {
      action: action.toLowerCase(),
      target: target.toLowerCase()
    }
    return <String stringID="rbac.manageSCIMText" vars={vars} />
  }
}

export const getScopeFromUserGroupDTO = (userGroupDTO?: UserGroupDTO): Scope => {
  return getScopeFromDTO({
    accountIdentifier: userGroupDTO?.accountIdentifier,
    orgIdentifier: userGroupDTO?.orgIdentifier,
    projectIdentifier: userGroupDTO?.projectIdentifier
  })
}

export const mapfromScopetoPrincipalScope = (scope?: Scope): PrincipalScope | undefined => {
  switch (scope) {
    case Scope.ACCOUNT:
      return PrincipalScope.ACCOUNT
    case Scope.ORG:
      return PrincipalScope.ORG
    case Scope.PROJECT:
      return PrincipalScope.PROJECT
    default:
      return undefined
  }
}

export const isUserGroupInherited = (
  accountId: string,
  orgIdentifier: string,
  projectIdentifier: string,
  userGroupDTO?: UserGroupDTO
): boolean => {
  const scope = getScopeFromDTO({
    accountId,
    orgIdentifier,
    projectIdentifier
  })
  if (userGroupDTO === undefined) {
    return false
  }
  const userGroupScope = getScopeFromUserGroupDTO(userGroupDTO)
  if (userGroupScope !== scope) {
    return true
  }
  return false
}

export const getUserGroupQueryParams = (
  accountIdentifier: string,
  orgIdentifier: string,
  projectIdentifier: string,
  parentScope?: PrincipalScope
): Pick<GetUserGroupAggregateQueryParams, 'accountIdentifier' | 'orgIdentifier' | 'projectIdentifier'> => {
  const params = {
    accountIdentifier
  }
  switch (parentScope) {
    case PrincipalScope.ORG:
      return {
        ...params,
        orgIdentifier
      }
    case PrincipalScope.PROJECT:
      return {
        ...params,
        orgIdentifier,
        projectIdentifier
      }
    default:
      return params
  }
}

export const getDefaultSelectedFilter = (scope: Scope): ScopeFilterItems => {
  switch (scope) {
    case Scope.ACCOUNT:
      return ScopeFilterItems.ACCOUNT_ONLY
    case Scope.ORG:
      return ScopeFilterItems.ORG_ONLY
    case Scope.PROJECT:
      return ScopeFilterItems.PROJECT_ONLY
    default:
      return ScopeFilterItems.ALL
  }
}

export type RbacQueryParams = {
  searchTerm?: string
} & CommonPaginationQueryParams

export const useRbacQueryParamOptions = (): UseQueryParamsOptions<
  RequiredPick<RbacQueryParams, keyof CommonPaginationQueryParams>
> => {
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()

  return useQueryParamsOptions({
    page: 0,
    size: PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : 10
  })
}
