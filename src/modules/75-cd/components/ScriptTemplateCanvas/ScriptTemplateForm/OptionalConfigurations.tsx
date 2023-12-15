/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, AllowedTypes } from '@harness/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import { ShellScriptFormData, variableSchema } from '@cd/components/PipelineSteps/ShellScriptStep/shellScriptTypes'
import OptionalConfiguration from '@cd/components/PipelineSteps/ShellScriptStep/OptionalConfiguration'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { getInitialValues } from '../../PipelineSteps/ShellScriptStep/helper'

interface ShellScriptWidgetProps {
  initialValues: ShellScriptFormData
  updateTemplate?: (data: ShellScriptFormData) => void
  onChange?: (data: ShellScriptFormData) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  fromScriptTemplate?: boolean
}

export function OptionalConfigurations(
  { initialValues, updateTemplate, onChange, allowableTypes, readonly, fromScriptTemplate }: ShellScriptWidgetProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const { getString } = useStrings()

  const validationSchema = Yup.object().shape({
    spec: Yup.object().shape({
      environmentVariables: variableSchema(getString)
    })
  })

  return (
    <Formik<ShellScriptFormData>
      onSubmit={
        /* istanbul ignore next */ submit => {
          updateTemplate?.(submit)
        }
      }
      validate={formValues => {
        onChange?.(formValues)
      }}
      formName="scriptOptionalForm"
      initialValues={getInitialValues(initialValues)}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<ShellScriptFormData>) => {
        setFormikRef(formikRef, formik)

        return (
          <OptionalConfiguration
            formik={formik}
            readonly={readonly}
            allowableTypes={allowableTypes}
            enableOutputVar={false}
            stepName={fromScriptTemplate ? '' : StepType.SHELLSCRIPT}
          />
        )
      }}
    </Formik>
  )
}

export const OptionalConfigurationWithRef = React.forwardRef(OptionalConfigurations)
