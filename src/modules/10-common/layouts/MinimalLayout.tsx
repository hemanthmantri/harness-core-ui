/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import MainNav from '@common/navigation/MainNav'

import css from './layouts.module.scss'

export function MinimalLayout(props: React.PropsWithChildren<unknown>): React.ReactElement {
  return (
    <div className={css.main} data-layout="minimal">
      <MainNav />
      <div className={css.children}>{props.children}</div>
    </div>
  )
}
