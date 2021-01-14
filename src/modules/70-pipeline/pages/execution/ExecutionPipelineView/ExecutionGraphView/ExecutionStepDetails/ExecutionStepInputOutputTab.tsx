import React from 'react'
import { isPlainObject, toPairs, startCase } from 'lodash-es'
import { Collapse as BPCollapse, Icon } from '@blueprintjs/core'
import cx from 'classnames'

import { useStrings } from 'framework/exports'
import css from './ExecutionStepDetails.module.scss'

function Collapse(props: React.PropsWithChildren<{ title: string }>): React.ReactElement {
  const [isOpen, setIsOpen] = React.useState(true)

  function toggle(): void {
    setIsOpen(status => !status)
  }

  return (
    <div className={css.panel} data-status={isOpen ? 'open' : 'close'}>
      <div className={css.panelTitle} onClick={toggle}>
        <Icon icon="chevron-up" />
        <span>{props.title}</span>
      </div>
      <BPCollapse isOpen={isOpen}>{props.children}</BPCollapse>
    </div>
  )
}

export interface ExecutionStepInputOutputTabRowProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
  level: number
}

export function ExecutionStepInputOutputTabRow(props: ExecutionStepInputOutputTabRowProps): React.ReactElement {
  return (
    <React.Fragment>
      {toPairs(props.data).map(([key, value]) => {
        if (key.startsWith('_')) return null

        if (typeof value === 'string') {
          return (
            <div className={css.ioRow} key={key}>
              <div className={css.key}>{startCase(key)}</div>
              <div className={css.value}>{value}</div>
            </div>
          )
        } else if (isPlainObject(value)) {
          return (
            <Collapse key={key} title={startCase(key)}>
              <ExecutionStepInputOutputTabRow data={value} level={props.level + 1} />
            </Collapse>
          )
        }

        return null
      })}
    </React.Fragment>
  )
}

export interface ExecutionStepInputOutputTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Array<Record<string, any>>
  mode: 'input' | 'output'
}

export default function ExecutionStepInputOutputTab(props: ExecutionStepInputOutputTabProps): React.ReactElement {
  const { getString } = useStrings()

  return (
    <div className={css.ioTab}>
      <div className={cx(css.ioRow, css.header)}>
        <div>{getString(props.mode === 'input' ? 'inputName' : 'outputName')}</div>
        <div>{getString(props.mode === 'input' ? 'inputValue' : 'outputValue')}</div>
      </div>
      {props.data.map((row, i) => (
        <ExecutionStepInputOutputTabRow data={row} key={i} level={0} />
      ))}
    </div>
  )
}
