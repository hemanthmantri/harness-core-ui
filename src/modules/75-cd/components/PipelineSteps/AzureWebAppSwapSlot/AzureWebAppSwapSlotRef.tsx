/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import * as Yup from 'yup'
import { Formik, FormInput, getMultiTypeFromValue, MultiTypeInputType, AllowedTypes } from '@harness/uicore'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useQueryParams } from '@common/hooks'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { getAllowableTypes, isMultiEnv } from '../AzureSlotDeployment/utils'
import { AzureSwapSlotDeploymentDynamicField } from './AzureWebAppSwapSlotField'

import type { AzureWebAppSwapSlotProps } from './SwapSlot.types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const AzureWebAppSwapSlotRef = (
  props: AzureWebAppSwapSlotProps,
  formikRef: StepFormikFowardRef
): JSX.Element => {
  /* istanbul ignore next */
  const {
    allowableTypes,
    isNewStep = true,
    readonly = false,
    initialValues,
    onUpdate,
    onChange,
    stepViewType,
    selectedStage
  } = props
  const { getString } = useStrings()
  const query = useQueryParams()
  const sectionId = (query as any).sectionId || ''
  const { expressions } = useVariablesExpression()
  const { CDS_AZURE_WEBAPP_NG_LISTING_APP_NAMES_AND_SLOTS } = useFeatureFlags()

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      formName={`AzureWebAppSwapSlot-${sectionId}`}
      validate={values => {
        const payload = {
          ...values
        }
        /* istanbul ignore next */
        onChange?.(payload)
      }}
      onSubmit={values => {
        const payload = {
          ...values
        }
        /* istanbul ignore next */
        onUpdate?.(payload)
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          targetSlot: Yup.string().required(
            getString('common.validation.fieldIsRequired', {
              name: 'Target slot'
            })
          )
        })
      })}
    >
      {formik => {
        setFormikRef(formikRef, formik)
        return (
          <>
            {stepViewType !== StepViewType.Template && (
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.InputWithIdentifier
                  inputLabel={getString('name')}
                  isIdentifierEditable={isNewStep}
                  inputGroupProps={{
                    disabled: readonly
                  }}
                />
              </div>
            )}
            <div className={cx(stepCss.formGroup, stepCss.sm)}>
              <FormMultiTypeDurationField
                name="timeout"
                label={getString('pipelineSteps.timeoutLabel')}
                multiTypeDurationProps={{ enableConfigureOptions: true, expressions, allowableTypes }}
                disabled={readonly}
              />
            </div>
            <div className={stepCss.divider} />
            {CDS_AZURE_WEBAPP_NG_LISTING_APP_NAMES_AND_SLOTS ? (
              <AzureSwapSlotDeploymentDynamicField {...props} />
            ) : (
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTextInput
                  name="spec.targetSlot"
                  placeholder={getString('cd.steps.azureWebAppInfra.targetSlotSpecify')}
                  label={getString('cd.steps.azureWebAppInfra.targetSlotTitle')}
                  multiTextInputProps={{
                    expressions,
                    multitypeInputValue:
                      CDS_AZURE_WEBAPP_NG_LISTING_APP_NAMES_AND_SLOTS && isMultiEnv(selectedStage)
                        ? MultiTypeInputType.EXPRESSION
                        : getMultiTypeFromValue(get(formik.values, 'spec.targetSlot')),
                    allowableTypes:
                      CDS_AZURE_WEBAPP_NG_LISTING_APP_NAMES_AND_SLOTS && isMultiEnv(selectedStage)
                        ? (getAllowableTypes(selectedStage) as AllowedTypes)
                        : allowableTypes
                  }}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(get(formik, 'values.spec.targetSlot')) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={get(formik, 'values.spec.targetSlot') as string}
                    type="String"
                    variableName="spec.targetSlot"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={
                      /* istanbul ignore next */ value => {
                        formik?.setFieldValue('spec.targetSlot', value)
                      }
                    }
                    isReadonly={readonly}
                  />
                )}
              </div>
            )}
          </>
        )
      }}
    </Formik>
  )
}
