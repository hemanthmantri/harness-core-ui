/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { TestWrapper, findPopoverContainer } from '@common/utils/testUtils'
import { DEFAULT_PAGE_SIZE_OPTION } from '@modules/10-common/constants/Pagination'
import { useGetProjectAggregateDTOList } from 'services/cd-ng'
import { ProjectSelector } from '../ProjectSelector'

import projects from './projects.json'

jest.mock('services/cd-ng', () => ({
  useGetProjectAggregateDTOList: jest.fn().mockImplementation(() => {
    return { data: projects, refetch: jest.fn(), error: null }
  }),
  useDeleteProject: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  getOrganizationListPromise: jest.fn().mockImplementation(() => {
    return Promise.resolve({
      data: {
        content: [
          {
            label: 'org1',
            value: 'org1'
          }
        ]
      }
    })
  })
}))

describe('ProjectSelector', () => {
  test('render with projects', async () => {
    const handleSelect = jest.fn()

    const { container, getByText, getByTestId } = render(
      <TestWrapper path="/account/:accountId/cd/home" pathParams={{ accountId: 'dummy' }} projects={projects as any}>
        <ProjectSelector onSelect={handleSelect} moduleFilter="CD" />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    await act(async () => {
      fireEvent.click(getByTestId('project-select-button'))
    })

    const popover = findPopoverContainer()
    expect(popover).toBeDefined()
    expect(popover).toMatchSnapshot()

    expect(getByText('Online Banking')).toBeDefined()

    act(() => {
      fireEvent.click(getByText('Online Banking'))
    })

    expect(handleSelect).toHaveBeenCalled()
  })

  test('render list view', async () => {
    const handleSelect = jest.fn()

    const { getByTestId, getByText } = render(
      <TestWrapper path="/account/:accountId/cd/home" pathParams={{ accountId: 'dummy' }} projects={projects as any}>
        <ProjectSelector onSelect={handleSelect} />
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.click(getByTestId('project-select-button'))
    })

    const popover = findPopoverContainer()

    expect(popover).toBeDefined()
    expect(getByText('Online Banking')).toBeDefined()

    await act(async () => {
      fireEvent.click(popover!, getByTestId('list-view'))
    })

    expect(popover).toMatchSnapshot()
  })

  test('render list view using fallback account id, when account is not present in path', async () => {
    ;(useGetProjectAggregateDTOList as jest.Mock).mockImplementation(() => {
      return { data: projects, refetch: jest.fn(), error: null }
    })
    const handleSelect = jest.fn()
    render(
      <TestWrapper pathParams={{ accountId: '' }} projects={projects as any}>
        <ProjectSelector onSelect={handleSelect} fallbackAccountId="fallbackAccountId" />
      </TestWrapper>
    )

    expect(useGetProjectAggregateDTOList).toBeCalledWith({
      debounce: 300,
      queryParamStringifyOptions: { arrayFormat: 'repeat' },
      queryParams: {
        accountIdentifier: 'fallbackAccountId',
        onlyFavorites: false,
        orgIdentifier: undefined,
        pageIndex: 0,
        pageSize: DEFAULT_PAGE_SIZE_OPTION,
        searchTerm: undefined,
        sortOrders: ['lastModifiedAt,DESC']
      }
    })
  })
})
