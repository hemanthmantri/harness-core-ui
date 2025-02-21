/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { CellProps, Column, Renderer } from 'react-table'
import {
  Layout,
  Button,
  Text,
  Avatar,
  Popover,
  Container,
  NoDataCard,
  TableV2,
  useConfirmationDialog,
  ListHeader,
  sortByEmail,
  sortByName,
  SortMethod,
  ExpandingSearchInput
} from '@harness/uicore'
import { FontVariation, Intent } from '@harness/design-system'
import { Classes, Menu, Position, PopoverInteractionKind, MenuItem } from '@blueprintjs/core'
import type { ProjectPathProps, UserGroupPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetUsersInUserGroup, useRemoveMember, UserInfo } from 'services/cd-ng'
import { useToaster } from '@common/components'
import { useStrings } from 'framework/strings'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import type { PrincipalScope } from '@common/interfaces/SecretsInterface'
import { AuthenticationMechanisms, getUserGroupQueryParams } from '@rbac/utils/utils'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import css from '../UserGroupDetails.module.scss'

interface MemberListProps {
  ssoLinked?: boolean
  userGroupInherited?: boolean
  managed?: boolean
  linkedSSOType?: string | undefined
  isUserGroupManaged?: boolean | undefined
  onMemberListRefetch?: () => void
}
const RenderColumnUser: Renderer<CellProps<UserInfo>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Avatar name={data.name || data.email} email={data.email} hoverCard={false} />
      <Text lineClamp={1} margin={{ right: 'small' }}>
        {data.name}
      </Text>
    </Layout.Horizontal>
  )
}

const RenderColumnEmail: Renderer<CellProps<UserInfo>> = ({ row }) => {
  const data = row.original

  return <Text lineClamp={1}>{data.email}</Text>
}

const RenderColumnMenu: Renderer<CellProps<UserInfo>> = ({ row, column }) => {
  const data = row.original
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [menuOpen, setMenuOpen] = useState(false)
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  const { mutate: deleteUser } = useRemoveMember({
    identifier: data.uuid || '',
    pathParams: {
      identifier: (column as any).userGroupIdentifier
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { openDialog } = useConfirmationDialog({
    contentText: getString('rbac.userGroupPage.userList.deleteConfirmation', { name: data.name }),
    titleText: getString('rbac.userGroupPage.userList.deleteTitle'),
    confirmButtonText: getString('common.remove'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async didConfirm => {
      /* istanbul ignore else */ if (didConfirm && data) {
        try {
          const deleted = await deleteUser(data.uuid || '', {
            headers: { 'content-type': 'application/json' }
          })
          /* istanbul ignore else */ if (deleted) {
            showSuccess(
              getString('rbac.userGroupPage.userList.deleteSuccessMessage', {
                name: data.name
              })
            )
            ;(column as any).refetchMembers?.()
          } else {
            /* istanbul ignore next */
            showSuccess(
              getString('rbac.userGroupPage.userList.deleteFailureMessage', {
                name: data.name
              })
            )
          }
        } catch (err) {
          /* istanbul ignore next */
          showError(err?.data?.message || err?.message)
        }
      }
    }
  })

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    openDialog()
  }

  return (column as any).ssoLinked || (column as any).userGroupInherited ? null : (
    <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.BOTTOM_RIGHT}
      >
        <Button
          minimal
          icon="Options"
          data-testid={`menu-${data.uuid}`}
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu>
          {(column as any).isUserGroupManaged ? (
            <Popover
              position={Position.TOP}
              fill
              usePortal
              inheritDarkTheme={false}
              interactionKind={PopoverInteractionKind.HOVER}
              hoverCloseDelay={50}
              content={
                <div className={css.popover}>
                  <Text font={{ variation: FontVariation.SMALL }}>{getString('rbac.unableToEditSCIMMembership')}</Text>
                </div>
              }
            >
              <div
                onClick={(event: React.MouseEvent<HTMLElement, MouseEvent>) => {
                  event.stopPropagation()
                }}
              >
                <MenuItem icon="trash" text={getString('common.remove')} onClick={handleDelete} disabled />
              </div>
            </Popover>
          ) : (
            <RbacMenuItem
              icon="trash"
              text={getString('common.remove')}
              onClick={handleDelete}
              permission={{
                resourceScope: {
                  accountIdentifier: accountId,
                  orgIdentifier,
                  projectIdentifier
                },
                resource: {
                  resourceType: ResourceType.USERGROUP,
                  resourceIdentifier: (column as any).userGroupIdentifier
                },
                permission: PermissionIdentifier.MANAGE_USERGROUP
              }}
            />
          )}
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const MemberList: React.FC<MemberListProps> = ({
  ssoLinked,
  userGroupInherited,
  managed,
  linkedSSOType,
  isUserGroupManaged,
  onMemberListRefetch
}) => {
  const { getString } = useStrings()
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState<number>(0)
  const { accountId, orgIdentifier, projectIdentifier, userGroupIdentifier } = useParams<
    ProjectPathProps & UserGroupPathProps
  >()
  const { parentScope } = useQueryParams<{ parentScope: PrincipalScope }>()
  const { preference: sortPreference = SortMethod.NameAsc, setPreference: setSortPreference } =
    usePreferenceStore<SortMethod>(PreferenceScope.USER, `sort-${PAGE_NAME.UserGroupDetails}`)

  const { data, refetch } = useMutateAsGet(useGetUsersInUserGroup, {
    body: {
      searchTerm
    },
    identifier: userGroupIdentifier,
    queryParams: {
      ...getUserGroupQueryParams(accountId, orgIdentifier, projectIdentifier, parentScope),
      pageIndex: page,
      pageSize: 10,
      sortOrders: sortPreference
    }
  })

  const users = useMemo(() => data?.data?.content, [data?.data])

  const columns: Column<UserInfo>[] = useMemo(() => {
    return [
      {
        Header: getString('users'),
        id: 'user',
        accessor: (row: UserInfo) => row.name,
        width: '45%',
        Cell: RenderColumnUser
      },
      {
        Header: getString('email'),
        id: 'email',
        accessor: (row: UserInfo) => row.email,
        width: '50%',
        Cell: RenderColumnEmail
      },
      {
        Header: '',
        id: 'menu',
        accessor: (row: UserInfo) => row.uuid,
        width: '5%',
        Cell: managed ? <></> : RenderColumnMenu,
        refetchMembers: () => {
          refetch()
          onMemberListRefetch?.()
        },
        userGroupIdentifier: userGroupIdentifier,
        disableSortBy: true,
        ssoLinked,
        userGroupInherited,
        isUserGroupManaged
      }
    ]
  }, [refetch, data, onMemberListRefetch])

  return (
    <Container className={css.memberList}>
      <Layout.Horizontal>
        <ListHeader
          selectedSortMethod={sortPreference}
          sortOptions={[...sortByName, ...sortByEmail]}
          onSortMethodChange={option => {
            setSortPreference(option.value as SortMethod)
          }}
          totalCount={data?.data?.totalItems}
          className={css.listHeader}
        />
        <ExpandingSearchInput
          alwaysExpanded
          width={200}
          placeholder={getString('search')}
          throttle={200}
          autoFocus={false}
          defaultValue={searchTerm}
          onChange={(query: string) => {
            setSearchTerm(query)
          }}
        />
      </Layout.Horizontal>
      {users?.length ? (
        <TableV2<UserInfo>
          data={users}
          columns={columns}
          hideHeaders={true}
          pagination={{
            itemCount: data?.data?.totalItems || 0,
            pageSize: data?.data?.pageSize || 10,
            pageCount: data?.data?.totalPages || 0,
            pageIndex: data?.data?.pageIndex || 0,
            gotoPage: (pageNumber: number) => setPage(pageNumber)
          }}
        />
      ) : (
        <Text font={{ variation: FontVariation.BODY }}>{getString('common.filters.noResultsFound')}</Text>
      )}
    </Container>
  )
  return (
    <NoDataCard
      icon="nav-project"
      message={
        linkedSSOType && linkedSSOType === AuthenticationMechanisms.LDAP
          ? getString('rbac.userDetails.userGroup.linkedSSOLdapUsersMessage')
          : getString('rbac.userDetails.noMembersMessage')
      }
    />
  )
}

export default MemberList
