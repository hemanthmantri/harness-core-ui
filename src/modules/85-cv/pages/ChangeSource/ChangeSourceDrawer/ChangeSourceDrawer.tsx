/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import { Text, Formik, FormInput, Container, ThumbnailSelect, FormikForm, Layout } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { FormConnectorReferenceField } from '@platform/connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import type { ConnectorReferenceFieldProps } from '@platform/connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import CardWithOuterTitle from '@common/components/CardWithOuterTitle/CardWithOuterTitle'
import {
  createCardOptions,
  createChangeSourceList,
  validateChangeSource,
  getChangeSourceOptions,
  updateSpecByType,
  buildInitialData,
  preSelectChangeSourceConnectorOnCategoryChange
} from './ChangeSourceDrawer.utils'
import type { ChangeSoureDrawerInterface, UpdatedChangeSourceDTO } from './ChangeSourceDrawer.types'
import PageDutyChangeSource from './components/PagerDutyChangeSource/PagerDutyChangeSource'
import { ChangeSourceFieldNames, ChangeSourceTypes, CustomChangeSourceList } from './ChangeSourceDrawer.constants'
import HarnessCDCurrentGenChangeSource from './components/HarnessCDCurrentGenChangeSource/HarnessCDCurrentGenChangeSource'
import KubernetesChangeSource from './components/KubernetesChangeSource/KubernetesChangeSource'
import CustomChangeSource from './components/CustomChangeSource/CustomChangeSource'
import style from './ChangeSourceDrawer.module.scss'

export function ChangeSourceDrawer({
  isEdit,
  rowdata,
  tableData,
  onSuccess,
  hideDrawer,
  isTemplate,
  expressions,
  monitoredServiceType
}: ChangeSoureDrawerInterface): JSX.Element {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()

  const onSuccessWrapper = (data: UpdatedChangeSourceDTO): void => {
    const isCustom = CustomChangeSourceList.includes(data?.type as ChangeSourceTypes)
    // for PagerDuty
    if (data.type === ChangeSourceTypes.PagerDuty || isCustom) {
      data.enabled = true
    }
    data['spec'] = updateSpecByType(data)
    const updatedChangeSources = createChangeSourceList(tableData, data)
    onSuccess(updatedChangeSources)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const categoryOptions = useMemo(
    () => getChangeSourceOptions({ getString, type: monitoredServiceType }),
    [monitoredServiceType]
  )

  const renderChangeSource = useCallback(
    (formik: FormikProps<any>): React.ReactNode => {
      const changeSourceType = formik.values?.type as string
      const isCustom = CustomChangeSourceList.includes(changeSourceType as ChangeSourceTypes)
      if (!changeSourceType || changeSourceType === ChangeSourceTypes.HarnessCDNextGen) {
        return null
      }

      let changeSource = null

      switch (changeSourceType) {
        case ChangeSourceTypes.PagerDuty:
          changeSource = (
            <PageDutyChangeSource formik={formik} isEdit={isEdit} isTemplate={isTemplate} expressions={expressions} />
          )
          break
        case ChangeSourceTypes.HarnessCD:
          changeSource = <HarnessCDCurrentGenChangeSource formik={formik} />
          break
        case ChangeSourceTypes.K8sCluster:
          changeSource = <KubernetesChangeSource formik={formik} isEdit={isEdit} />
          break
        case ChangeSourceTypes.CustomFF:
        case ChangeSourceTypes.CustomDeploy:
        case ChangeSourceTypes.CustomIncident:
        case ChangeSourceTypes.CustomInfrastructure:
          changeSource = isEdit ? <CustomChangeSource /> : null
          break
        default:
          changeSource = (
            <FormConnectorReferenceField
              width={400}
              formik={formik}
              type={changeSourceType as ConnectorReferenceFieldProps['type']}
              name={'spec.connectorRef'}
              disabled={isEdit}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              placeholder={getString('cv.healthSource.connectors.selectConnector', {
                sourceType: formik?.values?.type
              })}
              label={
                <Text color={Color.BLACK} font={'small'} margin={{ bottom: 'small' }}>
                  {getString('platform.connectors.selectConnector')}
                </Text>
              }
            />
          )
      }

      return changeSource ? (
        <CardWithOuterTitle title={isCustom ? '' : getString('cv.changeSource.connectChangeSource')}>
          {changeSource}
        </CardWithOuterTitle>
      ) : (
        <></>
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountId, orgIdentifier, projectIdentifier]
  )

  return (
    <Formik
      formName={'changeSourceaForm'}
      initialValues={rowdata?.category ? rowdata : buildInitialData(categoryOptions)}
      onSubmit={onSuccessWrapper}
      validate={values => validateChangeSource(values, tableData, isEdit, getString)}
      enableReinitialize
    >
      {formik => {
        const changeSourceType = formik.values?.type as string
        const isCustomChangeSource = CustomChangeSourceList.includes(changeSourceType as ChangeSourceTypes)
        const isCustomIncident = changeSourceType === ChangeSourceTypes.CustomIncident
        return (
          <FormikForm className={style.formFullHeight}>
            <CardWithOuterTitle title={getString('cv.changeSource.defineChangeSource')} className={style.outerCard}>
              <Text className={style.selectChangeSource}>{getString('cv.changeSource.selectChangeSource')}</Text>
              <Container
                margin={{ bottom: 'large' }}
                className={cx({
                  [style.removeEditButton]: createCardOptions(formik.values?.category, getString).length === 1
                })}
                width="300px"
              >
                <div className={style.alignHorizontal}>
                  <Text
                    color={Color.BLACK}
                    font={'small'}
                    margin={{ bottom: 'small' }}
                    tooltipProps={{ dataTooltipId: 'changeSourceProviderType' }}
                  >
                    {getString('platform.connectors.docker.dockerProvideType')}
                  </Text>
                  <FormInput.Select
                    name={ChangeSourceFieldNames.CATEGORY}
                    disabled={isEdit}
                    items={categoryOptions}
                    onChange={categoryName =>
                      formik.setValues({
                        [ChangeSourceFieldNames.CATEGORY]: categoryName?.value || ('' as string),
                        [ChangeSourceFieldNames.TYPE]: preSelectChangeSourceConnectorOnCategoryChange(
                          categoryName?.value as string
                        ),
                        spec: {}
                      })
                    }
                  />
                </div>
                {formik.values?.category && (
                  <ThumbnailSelect
                    isReadonly={isEdit}
                    name={ChangeSourceFieldNames.TYPE}
                    items={createCardOptions(formik.values?.category, getString)}
                  />
                )}
              </Container>
              <hr className={style.divider} />
              <Layout.Horizontal margin={{ top: 'large' }} spacing={'large'} color={Color.BLACK}>
                <Container width="400px">
                  <FormInput.InputWithIdentifier
                    inputLabel={getString('cv.changeSource.sourceName')}
                    isIdentifierEditable={!isEdit}
                  />
                </Container>
                {isCustomIncident && (
                  <Container width="400px">
                    <FormInput.Text
                      name={ChangeSourceFieldNames.AUTHORIZATION_TOKEN}
                      label={getString('cv.onboarding.changeSourceTypes.Custom.authorizationToken')}
                    />
                  </Container>
                )}
              </Layout.Horizontal>
              {isCustomChangeSource && !isEdit && (
                <Text font={{ variation: FontVariation.SMALL }} icon="info" iconProps={{ color: Color.BLUE_400 }}>
                  {getString('cv.onboarding.changeSourceTypes.Custom.note')}
                </Text>
              )}
            </CardWithOuterTitle>
            {renderChangeSource(formik)}
            <DrawerFooter isSubmit onPrevious={hideDrawer} onNext={formik.submitForm} />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
