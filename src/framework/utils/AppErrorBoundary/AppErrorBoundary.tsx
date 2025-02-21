/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Layout, Container } from '@harness/uicore'
import i18n from './AppErrorBoundary.i18n.json'

interface AppErrorBoundaryProps {
  onRefreshClick?: () => void
}

interface AppErrorBoundaryState {
  error?: Error
}

class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: undefined }

  componentDidCatch(error: Error): boolean {
    this.setState({ error })
    if (window?.bugsnagClient?.notify) {
      window?.bugsnagClient?.notify(error)
    }
    return false
  }

  render(): React.ReactNode {
    const { error } = this.state

    if (error) {
      return (
        <Layout.Vertical spacing="medium" padding="large">
          <Text>{i18n.title}</Text>
          <Text>{i18n.subtitle}</Text>
          <Text>
            {i18n.please}
            <a
              href="#"
              onClick={e => {
                if (this.props.onRefreshClick) {
                  this.props.onRefreshClick()
                } else {
                  e.preventDefault()
                  window.location.reload()
                }
              }}
            >
              {i18n.refresh}
            </a>
            {i18n.continue}
          </Text>
          {__DEV__ && (
            <React.Fragment>
              <Text font="small">{error.message}</Text>
              <Container>
                <details>
                  <summary>{i18n.stackTrace}</summary>
                  <pre>{error.stack}</pre>
                </details>
              </Container>
            </React.Fragment>
          )}
        </Layout.Vertical>
      )
    }

    return <>{this.props.children}</>
  }
}

export default AppErrorBoundary
