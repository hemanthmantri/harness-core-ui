/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, get } from 'lodash-es'
import cx from 'classnames'
import { MultiTypeInputType, DataTooltipInterface, FormInput, getMultiTypeFromValue } from '@harness/uicore'
import type { FormMultiTextTypeInputProps } from '@harness/uicore/dist/components/FormikForm/FormikForm'
import type { FormikContextType } from 'formik'
import { connect } from 'formik'
import { shouldRenderRunTimeInputViewWithAllowedValues } from '@pipeline/utils/CIUtils'
import {
  ALLOWED_VALUES_TYPE,
  ConfigureOptions,
  ConfigureOptionsProps
} from '@common/components/ConfigureOptions/ConfigureOptions'
import { useRenderMultiTypeInputWithAllowedValues } from '../utils/utils'
import css from '../InputSetView.module.scss'

interface TextFieldInputSetView extends FormMultiTextTypeInputProps {
  formik?: FormikContextType<any>
  fieldPath: string
  template: any
  tooltipProps?: DataTooltipInterface
  enableConfigureOptions?: boolean
  configureOptionsProps?: Omit<ConfigureOptionsProps, 'value' | 'type' | 'variableName' | 'onChange'>
  variableNamePath?: string
}

function TextFieldInputSet(props: TextFieldInputSetView): JSX.Element {
  const {
    formik,
    fieldPath,
    template,
    enableConfigureOptions = true,
    configureOptionsProps,
    className,
    ...rest
  } = props
  const { name, label, placeholder, tooltipProps, multiTextInputProps, disabled, variableNamePath, onChange } = rest
  const value = get(formik?.values, name, '')
  const variableName = variableNamePath ? get(formik?.values, variableNamePath, name) : name

  const { getMultiTypeInputWithAllowedValues } = useRenderMultiTypeInputWithAllowedValues({
    name,
    labelKey: label as string,
    placeholderKey: placeholder,
    fieldPath: fieldPath,
    allowedTypes: defaultTo(multiTextInputProps?.allowableTypes, [MultiTypeInputType.FIXED]),
    template,
    readonly: disabled,
    tooltipProps,
    onChange
  })

  const inputField = shouldRenderRunTimeInputViewWithAllowedValues(fieldPath, template) ? (
    getMultiTypeInputWithAllowedValues()
  ) : (
    <FormInput.MultiTextInput {...rest} />
  )

  return (
    <div className={cx(css.fieldAndOptions, className)}>
      {inputField}
      {enableConfigureOptions && getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME && (
        <ConfigureOptions
          value={value}
          type={'String'}
          variableName={variableName}
          showRequiredField={false}
          showDefaultField={false}
          onChange={val => formik?.setFieldValue(name, val)}
          style={label ? { marginTop: 'var(--spacing-6)' } : undefined}
          allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
          {...configureOptionsProps}
          isReadonly={disabled}
        />
      )}
    </div>
  )
}

export const TextFieldInputSetView = connect(TextFieldInputSet)
