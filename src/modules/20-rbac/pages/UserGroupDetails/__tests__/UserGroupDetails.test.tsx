import React from 'react'
import { act, fireEvent, getByText, queryByText, render, RenderResult, waitFor } from '@testing-library/react'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, userGroupPathProps } from '@common/utils/routeUtils'
import type { ResponseBoolean } from 'services/cd-ng'
import UserGroupDetails from '../UserGroupDetails'
import { mockResponse, userGroupInfo } from './mock'

const deleteMember = jest.fn()
const deleteMemberMock = (): ResponseBoolean => {
  deleteMember()
  return mockResponse
}

jest.mock('services/cd-ng', () => ({
  useGetUserGroupAggregate: jest.fn().mockImplementation(() => {
    return { data: userGroupInfo, refetch: jest.fn(), error: null, loading: false }
  }),
  useRemoveMember: jest.fn().mockImplementation(() => {
    return { mutate: deleteMemberMock }
  })
}))

jest.mock('react-timeago', () => () => 'dummy date')

describe('UserGroupDetails Test', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path={routes.toUserGroupDetails({ ...accountPathProps, ...userGroupPathProps })}
        pathParams={{ accountId: 'testAcc', userGroupIdentifier: 'New_RG' }}
      >
        <UserGroupDetails />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
    await waitFor(() => getAllByText('accessControl'))
  })
  test('render data', () => {
    expect(container).toMatchSnapshot()
  }),
    test('Delete Member', async () => {
      deleteMember.mockReset()
      const menu = container.querySelector(`[data-testid="menu-${userGroupInfo.data?.users?.[0].uuid}"]`)
      fireEvent.click(menu!)
      const popover = findPopoverContainer()
      const deleteMenu = getByText(popover as HTMLElement, 'common.remove')
      await act(async () => {
        fireEvent.click(deleteMenu!)
        await waitFor(() => getByText(document.body, 'rbac.userGroupPage.userList.deleteTitle'))
        const form = findDialogContainer()
        expect(form).toBeTruthy()
        const deleteBtn = queryByText(form as HTMLElement, 'common.remove')
        fireEvent.click(deleteBtn!)
        expect(deleteMember).toBeCalled()
      })
    })
})
