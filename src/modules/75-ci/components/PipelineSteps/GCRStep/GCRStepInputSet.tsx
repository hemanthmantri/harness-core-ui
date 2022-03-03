/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect } from 'formik'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import StepCommonFieldsInputSet from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFieldsInputSet'
import type { GCRStepProps } from './GCRStep'
import { CIStep } from '../CIStep/CIStep'
import { ArtifactStepCommon } from '../CIStep/ArtifactStepCommon'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const GCRStepInputSetBasic: React.FC<GCRStepProps> = ({
  template,
  path,
  readonly,
  allowableTypes,
  stepViewType,
  formik
}) => {
  const { getString } = useStrings()

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      <CIStep
        readonly={readonly}
        stepViewType={stepViewType}
        enableFields={{
          ...(getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && {
            'spec.connectorRef': {
              label: (
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  tooltipProps={{ dataTooltipId: 'gcrConnector' }}
                >
                  {getString('pipelineSteps.gcpConnectorLabel')}
                </Text>
              ),
              type: Connectors.GCP
            }
          }),
          ...(getMultiTypeFromValue(template?.spec?.host) === MultiTypeInputType.RUNTIME && {
            'spec.host': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.projectID) === MultiTypeInputType.RUNTIME && {
            'spec.projectID': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.imageName) === MultiTypeInputType.RUNTIME && {
            'spec.imageName': {}
          })
        }}
        path={path || ''}
      />
      <ArtifactStepCommon
        path={path}
        readonly={readonly}
        template={template}
        allowableTypes={allowableTypes}
        stepViewType={stepViewType}
        formik={formik}
        artifactConnectorType={Connectors.GCP}
      />
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} stepViewType={stepViewType} />
    </FormikForm>
  )
}

const GCRStepInputSet = connect(GCRStepInputSetBasic)
export { GCRStepInputSet }
