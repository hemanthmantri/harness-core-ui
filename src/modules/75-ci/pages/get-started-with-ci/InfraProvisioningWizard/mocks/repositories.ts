/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const repos = [
  {
    namespace: 'wings-software',
    name: 'wings-software/someverylongnameforarepothatisprobablymeantotestoverflowwhileselectinguserrepotostartusingciasaproduct'
  },
  {
    namespace: 'harness',
    name: 'wings-software/nextgenui'
  },
  {
    namespace: 'wings-software',
    name: 'wings-software/learning'
  },
  {
    namespace: 'user1',
    name: 'wings-software/portal'
  },
  {
    namespace: 'community',
    name: 'wings-software/wingsui'
  }
]

export const gitnessRepos = [
  {
    uid: 'someverylongnameforarepothatisprobablymeantotestoverflowwhileselectinguserrepotostartusingciasaproduct'
  },
  {
    uid: 'nextgenui'
  },
  {
    uid: 'learning'
  }
]

export const connectorRepoCombos = [
  {
    connector: {
      spec: {
        url: 'https://www.github.com/shaurya-harness'
      }
    },
    repo: 'shaurya-harness/goHelloWorldServer',
    expectedResult: 'goHelloWorldServer'
  },
  {
    connector: {
      spec: {
        url: 'https://www.github.com/harness'
      }
    },
    repo: 'harness/harness-core-ui',
    expectedResult: 'harness-core-ui'
  },
  {
    connector: {
      spec: {
        url: 'https://www.github.com'
      }
    },
    repo: 'harness/harness-core-ui',
    expectedResult: 'harness/harness-core-ui'
  }
]
