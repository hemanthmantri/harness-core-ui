/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useParams } from 'react-router-dom'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import type { LicenseRedirectProps } from 'framework/LicenseStore/LicenseStoreContext'
import AuditTrailFactory, { ResourceScope } from 'framework/AuditTrail/AuditTrailFactory'
import { RouteWithLayout } from '@common/router'
import routesV1 from '@common/RouteDefinitions'
import routesV2 from '@common/RouteDefinitionsV2'
import { accountPathProps, orgPathProps, projectPathProps, secretPathProps } from '@common/utils/routeUtils'

import SecretsPage from '@secrets/pages/secrets/SecretsPage'
import SecretDetails from '@secrets/pages/secretDetails/SecretDetails'
import SecretReferences from '@secrets/pages/secretReferences/SecretReferences'
import SecretDetailsHomePage from '@secrets/pages/secretDetailsHomePage/SecretDetailsHomePage'
import CreateSecretFromYamlPage from '@secrets/pages/createSecretFromYaml/CreateSecretFromYamlPage'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import SecretResourceModalBody from '@secrets/components/SecretResourceModalBody/SecretResourceModalBody'
import type { Module, ModulePathParams, ProjectPathProps, SecretsPathProps } from '@common/interfaces/RouteInterfaces'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String } from 'framework/strings'
import SecretResourceRenderer from '@secrets/components/SecretResourceRenderer/SecretResourceRenderer'
import { AccountSideNavProps } from '@common/RouteDestinations'
import type { AuditEventData, ResourceDTO } from 'services/audit'
import SecretRuntimeUsage from '@common/pages/entityUsage/views/RuntimeUsageView/SecretRuntimeUsage'

RbacFactory.registerResourceTypeHandler(ResourceType.SECRET, {
  icon: 'res-secrets',
  label: 'common.secrets',
  labelSingular: 'secretType',
  category: ResourceCategory.SHARED_RESOURCES,
  permissionLabels: {
    [PermissionIdentifier.VIEW_SECRET]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.UPDATE_SECRET]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_SECRET]: <String stringID="rbac.permissionLabels.delete" />,
    [PermissionIdentifier.ACCESS_SECRET]: <String stringID="rbac.permissionLabels.access" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <SecretResourceModalBody {...props} />,
  // eslint-disable-next-line react/display-name
  staticResourceRenderer: props => <SecretResourceRenderer {...props} />
})

const platformLabel = 'common.resourceCenter.ticketmenu.platform'
AuditTrailFactory.registerResourceHandler('SECRET', {
  moduleIcon: {
    name: 'nav-settings'
  },
  moduleLabel: platformLabel,
  resourceLabel: 'secretType',
  resourceUrl: (
    resource: ResourceDTO,
    resourceScope: ResourceScope,
    _module?: Module,
    _auditEventData?: AuditEventData,
    isNewNav?: boolean
  ) => {
    const { orgIdentifier, accountIdentifier, projectIdentifier } = resourceScope
    const routes = isNewNav ? routesV2 : routesV1

    return routes.toSecretDetails({
      orgIdentifier,
      accountId: accountIdentifier,
      projectIdentifier,
      secretId: resource.identifier
    })
  }
})

const RedirectToSecretDetailHome: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, secretId, module } = useParams<
    ProjectPathProps & SecretsPathProps & ModulePathParams
  >()
  return (
    <Redirect
      to={routesV1.toSecretDetailsOverview({ accountId, projectIdentifier, orgIdentifier, secretId, module })}
    />
  )
}

export default (
  <>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toSecrets({ ...accountPathProps })}
      pageName={PAGE_NAME.SecretsPage}
      exact
    >
      <SecretsPage />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toSecretDetails({
        ...accountPathProps,
        ...secretPathProps
      })}
      exact
    >
      <RedirectToSecretDetailHome />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toSecretDetailsOverview({
        ...accountPathProps,
        ...secretPathProps
      })}
      pageName={PAGE_NAME.SecretDetails}
      exact
    >
      <SecretDetailsHomePage>
        <SecretDetails />
      </SecretDetailsHomePage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toSecretDetailsReferences({
        ...accountPathProps,
        ...secretPathProps
      })}
      pageName={PAGE_NAME.SecretReferences}
      exact
    >
      <SecretDetailsHomePage>
        <SecretReferences />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toCreateSecretFromYaml({ ...accountPathProps })}
      pageName={PAGE_NAME.CreateSecretFromYamlPage}
      exact
    >
      <CreateSecretFromYamlPage />
    </RouteWithLayout>
  </>
)
export { RedirectToSecretDetailHome }

export const SecretRouteDestinations: React.FC<{
  moduleParams: ModulePathParams
  licenseRedirectData?: LicenseRedirectProps
  sidebarProps?: SidebarContext
}> = ({ moduleParams, licenseRedirectData, sidebarProps }) => (
  <>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={routesV1.toSecrets({ ...accountPathProps, ...projectPathProps, ...moduleParams })}
      pageName={PAGE_NAME.SecretsPage}
    >
      <SecretsPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={routesV1.toCreateSecretFromYaml({
        ...accountPathProps,
        ...projectPathProps,
        ...orgPathProps,
        ...moduleParams
      })}
      pageName={PAGE_NAME.CreateSecretFromYamlPage}
    >
      <CreateSecretFromYamlPage />
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={routesV1.toSecretDetails({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps,
        ...moduleParams
      })}
    >
      <RedirectToSecretDetailHome />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={routesV1.toSecretDetailsRuntimeUsage({
        ...accountPathProps,
        ...secretPathProps
      })}
      pageName={PAGE_NAME.SecretRuntimeUsage}
      exact
    >
      <SecretDetailsHomePage>
        <SecretRuntimeUsage />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={routesV1.toSecretDetailsRuntimeUsage({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps,
        ...moduleParams
      })}
      pageName={PAGE_NAME.SecretRuntimeUsage}
    >
      <SecretDetailsHomePage>
        <SecretDetailsHomePage />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={routesV1.toSecretDetailsOverview({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps,
        ...moduleParams
      })}
      pageName={PAGE_NAME.SecretDetails}
    >
      <SecretDetailsHomePage>
        <SecretDetails />
      </SecretDetailsHomePage>
    </RouteWithLayout>
    <RouteWithLayout
      exact
      licenseRedirectData={licenseRedirectData}
      sidebarProps={sidebarProps}
      path={routesV1.toSecretDetailsReferences({
        ...accountPathProps,
        ...projectPathProps,
        ...secretPathProps,
        ...moduleParams
      })}
      pageName={PAGE_NAME.SecretReferences}
    >
      <SecretDetailsHomePage>
        <SecretReferences />
      </SecretDetailsHomePage>
    </RouteWithLayout>
  </>
)
