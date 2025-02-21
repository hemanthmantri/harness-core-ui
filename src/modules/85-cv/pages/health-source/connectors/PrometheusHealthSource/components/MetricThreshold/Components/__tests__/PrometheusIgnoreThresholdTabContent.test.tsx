/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { Formik, FormikForm } from '@harness/uicore'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestWrapper } from '@common/utils/testUtils'

import { formikInitialValuesCriteriaLessThanMock } from '@cv/pages/health-source/common/MetricThresholds/__tests__/MetricThresholds.utils.mock'
import {
  formikInitialValues,
  PrometheusThresholdProps as MockContextValues
} from '../../__tests__/PrometheusMetricThreshold.mock'
import IgnoreThresholdContent from '../IgnoreThresholdsContent'
import { PrometheusMetricThresholdContext } from '../../PrometheusMetricThresholdConstants'

const WrappingComponent = ({ formValues }: { formValues?: any }): JSX.Element => {
  return (
    <TestWrapper>
      <Formik initialValues={formValues || formikInitialValues} onSubmit={jest.fn()} formName="appDHealthSourceform">
        <FormikForm>
          <PrometheusMetricThresholdContext.Provider value={MockContextValues}>
            <IgnoreThresholdContent />
          </PrometheusMetricThresholdContext.Provider>
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('CloudWatch IgnoreThresholdTabContent', () => {
  test('should render the component with all input fields', () => {
    const { container } = render(<WrappingComponent />)

    expect(container.querySelector("[name='ignoreThresholds.0.metricType']")).toBeInTheDocument()
    expect(container.querySelector("[name='ignoreThresholds.0.criteria.type']")).toBeInTheDocument()
    expect(container.querySelector("[name='ignoreThresholds.0.criteria.spec.greaterThan']")).toBeInTheDocument()
    expect(container.querySelector("[name='ignoreThresholds.0.criteria.spec.lessThan']")).toBeInTheDocument()
  })

  test('should render the metricType dropdown with correct options', async () => {
    const { container } = render(<WrappingComponent />)

    expect(container.querySelector(`[name="ignoreThresholds.0.metricType"]`)).toBeDisabled()
    expect(container.querySelector(`[name="ignoreThresholds.0.metricType"]`)).toHaveValue('Custom')
  })

  test('should render the metric name dropdown with all metric names', async () => {
    const { container } = render(<WrappingComponent />)

    expect(container.querySelector(`[name="ignoreThresholds.0.metricName"]`)).not.toBeDisabled()

    const selectCaretMetricName = container
      .querySelector(`[name="ignoreThresholds.0.metricName"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaretMetricName).toBeInTheDocument()
    await userEvent.click(selectCaretMetricName!)
    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(1))
    expect(document.querySelectorAll('[class*="bp3-menu"] li')[0]).toHaveTextContent('Prometheus Metric')
  })
  test('should render the criteria dropdown and other functionalities should work properly', async () => {
    const { container } = render(<WrappingComponent />)

    const greaterThanInput = container.querySelector(`[name="ignoreThresholds.0.criteria.spec.greaterThan"]`)
    const lessThanInput = container.querySelector(`[name="ignoreThresholds.0.criteria.spec.lessThan"]`)

    expect(greaterThanInput).toBeInTheDocument()
    expect(lessThanInput).toBeInTheDocument()

    const selectCaretCriteriaType = container
      .querySelector(`[name="ignoreThresholds.0.criteria.type"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaretCriteriaType).toBeInTheDocument()
    await userEvent.click(selectCaretCriteriaType!)

    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(2))

    expect(document.querySelectorAll('[class*="bp3-menu"] li')[0]).toHaveTextContent(
      'cv.monitoringSources.appD.absoluteValue'
    )
    expect(document.querySelectorAll('[class*="bp3-menu"] li')[1]).toHaveTextContent(
      'cv.monitoringSources.appD.percentageDeviation'
    )

    await act(async () => {
      await userEvent.click(document.querySelectorAll('[class*="bp3-menu"] li')[1])
    })

    expect(greaterThanInput).not.toBeInTheDocument()
    expect(lessThanInput).toBeInTheDocument()
  })

  test('should check whether a new row is added when Add Threshold button is clicked', async () => {
    render(<WrappingComponent />)

    expect(screen.getAllByTestId('ThresholdRow')).toHaveLength(1)

    const addButton = screen.getByTestId('AddThresholdButton')

    await act(async () => {
      await userEvent.click(addButton)
    })

    expect(screen.getAllByTestId('ThresholdRow')).toHaveLength(2)

    await act(async () => {
      await userEvent.click(screen.getAllByText('trash')[0])
    })

    expect(screen.getAllByTestId('ThresholdRow')).toHaveLength(1)
  })

  test('should check whether criteria section works correctly for greaterThan', () => {
    const { container } = render(<WrappingComponent formValues={formikInitialValuesCriteriaLessThanMock} />)

    const lessThanInput = container.querySelector('input[name="ignoreThresholds.0.criteria.spec.lessThan"]')
    const greaterThanInput = container.querySelector('input[name="ignoreThresholds.0.criteria.spec.greaterThan"]')

    expect(lessThanInput).toBeInTheDocument()
    expect(lessThanInput).toHaveValue(21)
    expect(greaterThanInput).toBeNull()
  })
})
