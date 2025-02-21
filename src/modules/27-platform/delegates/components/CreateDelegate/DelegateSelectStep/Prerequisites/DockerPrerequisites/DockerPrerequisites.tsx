/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { Text } from '@harness/uicore'
import { useGetCommunity } from '@common/utils/utils'
import { useStrings } from 'framework/strings'
import css from './DockerPrerequisites.module.scss'

const DockerPrerequisites = () => {
  const { getString } = useStrings()
  const isCommunity = useGetCommunity()
  return (
    <div>
      <Text className={css.prereqTitle}>
        {getString('platform.delegates.delegateCreation.dockerPrerequisites.title')}
      </Text>
      <Text font={{ size: 'normal' }} className={css.ensureText}>
        {getString('platform.delegates.delegateCreation.dockerPrerequisites.ensureInst')}
      </Text>
      <Text font={{ size: 'normal' }} className={css.prereqText}>
        {getString('platform.delegates.delegateCreation.dockerPrerequisites.sysReq')}
      </Text>
      <Text font={{ size: 'normal' }} className={css.prereqText}>
        {getString('platform.delegates.delegateCreation.dockerPrerequisites.minCPU')}
      </Text>
      <Text font={{ size: 'normal' }} className={css.prereqText}>
        {isCommunity
          ? getString('platform.delegates.delegateCreation.dockerPrerequisites.minMemCommunity')
          : getString('platform.delegates.delegateCreation.dockerPrerequisites.minMem')}
      </Text>
    </div>
  )
}

export default DockerPrerequisites
