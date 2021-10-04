import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { Scope } from '@common/interfaces/SecretsInterface'
import ScopedTitle from '../ScopedTitle'

const titleArray = [
  {
    [Scope.PROJECT]: 'project scope',
    [Scope.ORG]: 'org scope',
    [Scope.ACCOUNT]: 'acc scope'
  },
  'testTitle'
]

describe('Title test', () => {
  test('Account Scope ', () => {
    titleArray.forEach(title => {
      const { container } = render(
        <TestWrapper
          path={routes.toSecrets({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <ScopedTitle title={title} />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
  })
  test('Org Scope ', () => {
    titleArray.forEach(title => {
      const { container } = render(
        <TestWrapper
          path={routes.toSecrets({ ...orgPathProps })}
          pathParams={{ accountId: 'testAcc', orgIdentifier: 'testOrg' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <ScopedTitle title={title} />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
  })
  test('Project Scope ', () => {
    titleArray.forEach(title => {
      const { container } = render(
        <TestWrapper
          path={routes.toSecrets({ ...projectPathProps })}
          pathParams={{ accountId: 'testAcc', orgIdentifier: 'testOrg', projectIdentifier: 'test' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <ScopedTitle title={title} />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
  })
})
