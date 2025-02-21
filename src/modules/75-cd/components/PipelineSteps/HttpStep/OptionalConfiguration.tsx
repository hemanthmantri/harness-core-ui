/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FieldArray, FormikProps, useFormikContext } from 'formik'
import { get } from 'lodash-es'
import {
  AllowedTypes,
  Button,
  ButtonVariation,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@harness/uicore'
import { v4 as uuid } from 'uuid'

import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useStrings } from 'framework/strings'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import type { HttpStepFormData, HttpStepHeaderConfig, HttpStepInputVariable, HttpStepOutputVariable } from './types'
import { OptionalVariables } from '../ShellScriptStep/OptionalConfiguration'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './HttpStep.module.scss'

export default function OptionalConfiguration(props: {
  formik: FormikProps<HttpStepFormData>
  readonly?: boolean
  allowableTypes?: AllowedTypes
}): React.ReactElement {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { CDS_HTTP_STEP_NG_CERTIFICATE } = useFeatureFlags()
  const {
    formik: { values: formValues, setFieldValue },
    readonly,
    allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
  } = props

  return (
    <div className={stepCss.stepPanel}>
      <div className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          name="spec.assertion"
          placeholder={getString('pipeline.utilitiesStep.assertion')}
          label={getString('assertionLabel')}
          isOptional
          optionalLabel={getString('common.optionalLabel')}
          disabled={readonly}
          multiTextInputProps={{ expressions, disabled: readonly, allowableTypes }}
        />
        {getMultiTypeFromValue(formValues.spec.assertion) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formValues.spec.assertion}
            type="String"
            variableName="spec.assertion"
            showRequiredField={false}
            showDefaultField={false}
            onChange={value => setFieldValue('spec.assertion', value)}
            isReadonly={readonly}
          />
        )}
      </div>
      {CDS_HTTP_STEP_NG_CERTIFICATE && (
        <>
          <div className={stepCss.formGroup}>
            <MultiTypeSecretInput
              name="spec.certificate"
              label={getString('common.certificate')}
              expressions={expressions}
              allowableTypes={allowableTypes}
              disabled={readonly}
              enableConfigureOptions={true}
              isOptional
            />
          </div>
          <div className={stepCss.formGroup}>
            <MultiTypeSecretInput
              name="spec.certificateKey"
              label={getString('pipeline.utilitiesStep.certificateKey')}
              expressions={expressions}
              allowableTypes={allowableTypes}
              disabled={readonly}
              enableConfigureOptions={true}
              isOptional
            />
          </div>
        </>
      )}
      <div className={stepCss.formGroup}>
        <MultiTypeFieldSelector
          name="spec.headers"
          label={getString('common.headers')}
          isOptional
          optionalLabel={getString('common.optionalLabel')}
          defaultValueToReset={[{ name: '', type: 'String', value: '', id: uuid() }]}
          disableTypeSelection
          tooltipProps={{ dataTooltipId: 'httpStepHeaders' }}
        >
          <FieldArray
            name="spec.headers"
            render={({ push, remove }) => {
              return (
                <div className={css.panel}>
                  <div className={css.headerRow}>
                    <span className={css.label}>Key</span>
                    <span className={css.label}>Value</span>
                  </div>
                  {formValues.spec.headers.map(({ id }: HttpStepHeaderConfig, i: number) => (
                    <div className={css.headerRow} key={id}>
                      <FormInput.Text
                        name={`spec.headers[${i}].key`}
                        placeholder={getString('pipeline.keyPlaceholder')}
                        disabled={readonly}
                      />
                      <FormInput.MultiTextInput
                        name={`spec.headers[${i}].value`}
                        placeholder={getString('common.valuePlaceholder')}
                        disabled={readonly}
                        multiTextInputProps={{
                          allowableTypes: allowableTypes,
                          expressions,
                          disabled: readonly
                        }}
                        label=""
                      />
                      <Button
                        variation={ButtonVariation.ICON}
                        icon="main-trash"
                        data-testid={`remove-header-${i}`}
                        onClick={() => remove(i)}
                        disabled={readonly}
                      />
                    </div>
                  ))}
                  <Button
                    icon="plus"
                    variation={ButtonVariation.LINK}
                    data-testid="add-header"
                    onClick={() => push({ key: '', value: '', id: uuid() })}
                    disabled={readonly}
                    className={css.addButton}
                  >
                    {getString('add')}
                  </Button>
                </div>
              )
            }}
          />
        </MultiTypeFieldSelector>
      </div>
      <div className={stepCss.formGroup}>
        <InputOutputVariablesFieldSelector
          fieldName={'spec.inputVariables'}
          fieldLabel={getString('common.input')}
          dataTooltipId="httpStepInputVariables"
          allowableTypes={allowableTypes}
          readonly={readonly}
          type="input"
        />
      </div>
      <div className={stepCss.formGroup}>
        <InputOutputVariablesFieldSelector
          fieldName={'spec.outputVariables'}
          fieldLabel={getString('outputLabel')}
          dataTooltipId="httpStepOutputVariables"
          allowableTypes={allowableTypes}
          readonly={readonly}
          type="output"
        />
      </div>
    </div>
  )
}

function InputOutputVariablesFieldSelector<T extends HttpStepInputVariable | HttpStepOutputVariable>({
  fieldName,
  fieldLabel,
  dataTooltipId,
  allowableTypes,
  type,
  readonly
}: {
  fieldName: string
  fieldLabel: string
  dataTooltipId: string
  allowableTypes: AllowedTypes
  type: 'input' | 'output'
  readonly?: boolean
}): React.ReactElement {
  const { getString } = useStrings()
  const { values: formValues } = useFormikContext()

  return (
    <MultiTypeFieldSelector
      name={fieldName}
      label={fieldLabel}
      isOptional
      optionalLabel={getString('common.optionalLabel')}
      disableTypeSelection
      tooltipProps={{ dataTooltipId }}
    >
      <FieldArray
        name={fieldName}
        render={({ push, remove }) => {
          return (
            <div className={css.panel}>
              <div className={css.responseMappingRow}>
                <span className={css.label}>Variable Name</span>
                <span className={css.label}>Value</span>
              </div>
              {get(formValues, fieldName, []).map(({ id }: T, i: number) => (
                <div className={css.responseMappingRow} key={id}>
                  <FormInput.Text
                    name={`${fieldName}[${i}].name`}
                    placeholder={getString('name')}
                    disabled={readonly}
                  />
                  <OptionalVariables
                    allowableTypes={allowableTypes}
                    readonly={readonly}
                    variableSpec={`${fieldName}[${i}]`}
                  />
                  <Button
                    variation={ButtonVariation.ICON}
                    icon="main-trash"
                    data-testid={`remove-${type}-response-mapping-${i}`}
                    onClick={() => remove(i)}
                    disabled={readonly}
                  />
                </div>
              ))}
              <Button
                icon="plus"
                variation={ButtonVariation.LINK}
                data-testid={`add-${type}-response-mapping`}
                onClick={() => push({ name: '', value: '', type: 'String', id: uuid() })}
                disabled={readonly}
                className={css.addButton}
              >
                {getString('add')}
              </Button>
            </div>
          )
        }}
      />
    </MultiTypeFieldSelector>
  )
}
