/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import {
  Formik,
  Layout,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  MultiTypeInputType,
  SelectOption,
  getMultiTypeFromValue,
  FormInput,
  FormikForm
} from '@harness/uicore'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { defaultTo, get, memoize } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { IItemRendererProps } from '@blueprintjs/select'
import { useStrings } from 'framework/strings'
import {
  getConnectorIdValue,
  getArtifactFormData,
  helperTextData,
  shouldHideHeaderAndNavBtns,
  resetFieldValue,
  isAllFieldsAreFixedInGAR,
  isAllFieldsAreFixedForFetchRepos,
  isAllFieldsAreFixedForFetchingPackages
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import {
  ArtifactType,
  GoogleArtifactRegistryProps,
  GoogleArtifactRegistryInitialValuesType,
  TagTypes
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import {
  ConnectorConfigDTO,
  GARBuildDetailsDTO,
  GARPackageDTO,
  GarRepositoryDTO,
  RegionGar,
  useGetBuildDetailsForGoogleArtifactRegistry,
  useGetPackagesForGoogleArtifactRegistry,
  useGetRegionsForGoogleArtifactRegistry,
  useGetRepositoriesForGoogleArtifactRegistry
} from 'services/cd-ng'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { getHelpeTextForTags } from '@pipeline/utils/stageHelpers'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import ItemRendererWithMenuItem from '@modules/10-common/components/ItemRenderer/ItemRendererWithMenuItem'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import { ArtifactIdentifierValidation, ModalViewFor, tagOptions } from '../../../ArtifactHelper'
import { NoTagResults } from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import { GarArtifactDigestField } from './GarArtifactDigestField'
import css from '../../ArtifactConnector.module.scss'

export const repositoryType: SelectOption[] = [
  { label: 'npm', value: 'npm' },
  { label: 'maven', value: 'maven' },
  { label: 'docker', value: 'docker' },
  { label: 'apt', value: 'apt' },
  { label: 'yum', value: 'yum' },
  { label: 'python', value: 'python' },
  { label: 'kubeflow-pipelines', value: 'kubeflow-pipelines' }
]

function FormComponent(
  props: StepProps<ConnectorConfigDTO> &
    GoogleArtifactRegistryProps & { formik: FormikProps<GoogleArtifactRegistryInitialValuesType> }
): React.ReactElement {
  const {
    context,
    expressions,
    allowableTypes,
    prevStepData,
    previousStep,
    initialValues,
    isReadonly = false,
    formik,
    selectedArtifact,
    isMultiArtifactSource,
    formClassName = '',
    editArtifactModePrevStepData
  } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [regions, setRegions] = useState<SelectOption[]>([])
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [repoSelectItems, setRepoSelectItems] = useState<SelectOption[]>([])
  const [packageSelectItems, setPackageSelectItems] = useState<SelectOption[]>([])
  const modifiedPrevStepData = defaultTo(prevStepData, editArtifactModePrevStepData)

  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const connectorRefValue = getConnectorIdValue(modifiedPrevStepData)
  const packageValue = defaultTo(formik.values.spec.package, initialValues?.spec?.package)
  const projectValue = defaultTo(formik.values.spec.project, initialValues?.spec?.project)
  const regionValue = defaultTo(formik.values.spec.region, initialValues?.spec?.region)
  const repositoryNameValue = defaultTo(formik.values?.spec.repositoryName, initialValues?.spec?.repositoryName)
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)
  const isTemplateContext = context === ModalViewFor.Template

  const {
    data: repoDetails,
    refetch: refetchRepoDetails,
    loading: fetchingRepos,
    error: fetchRepoError
  } = useGetRepositoriesForGoogleArtifactRegistry({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue,
      project: projectValue,
      region: regionValue
    }
  })

  const {
    data: buildDetails,
    refetch: refetchBuildDetails,
    loading: fetchingBuilds,
    error
  } = useGetBuildDetailsForGoogleArtifactRegistry({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue,
      package: packageValue,
      project: projectValue,
      region: regionValue,
      repositoryName: repositoryNameValue
    }
  })

  const {
    data: packageDetails,
    refetch: refetchPackageDetails,
    loading: fetchingPackages,
    error: fetchPackagesError
  } = useGetPackagesForGoogleArtifactRegistry({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue,
      project: projectValue,
      region: regionValue,
      repositoryName: repositoryNameValue
    }
  })

  const { data: regionsData, loading: loadingRegionsData } = useGetRegionsForGoogleArtifactRegistry({})

  useEffect(() => {
    if (regionsData?.data) {
      setRegions(
        regionsData?.data?.map((item: RegionGar) => {
          return { label: item.name, value: item.value } as SelectOption
        })
      )
    }
  }, [regionsData])

  const itemRendererForRepo = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingRepos} />
  ))
  const itemRendererForPackage = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingPackages} />
  ))
  const itemRendererForBuild = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingBuilds} />
  ))

  const selectItems = useMemo(() => {
    return buildDetails?.data?.buildDetailsList?.map((builds: GARBuildDetailsDTO) => ({
      value: defaultTo(builds.version, ''),
      label: defaultTo(builds.version, '')
    }))
  }, [buildDetails?.data])

  useEffect(() => {
    if (fetchRepoError) {
      setRepoSelectItems([])
      return
    }
    const repoItems =
      repoDetails?.data?.garRepositoryDTOList?.map((repo: GarRepositoryDTO) => ({
        value: defaultTo(repo.repository, ''),
        label: defaultTo(repo.repository, '')
      })) || []
    setRepoSelectItems(repoItems)
  }, [repoDetails?.data, fetchRepoError])

  useEffect(() => {
    if (fetchPackagesError) {
      setPackageSelectItems([])
      return
    }

    const packageItems =
      packageDetails?.data?.garPackageDTOList?.map((repo: GARPackageDTO) => ({
        value: defaultTo(repo.packageName, ''),
        label: defaultTo(repo.packageName, '')
      })) || []
    setPackageSelectItems(packageItems)
  }, [packageDetails?.data, fetchPackagesError])

  const getBuilds = (): SelectOption[] => {
    if (fetchingBuilds) {
      return [
        {
          label: getString('common.loadingFieldOptions', {
            fieldName: getString('buildText')
          }),
          value: getString('common.loadingFieldOptions', {
            fieldName: getString('buildText')
          })
        }
      ]
    }
    return defaultTo(selectItems, [])
  }

  const getRepos = (): SelectOption[] => {
    if (fetchingRepos) {
      return [
        {
          label: getString('common.loadingFieldOptionsSingular', {
            fieldName: getString('repositories')
          }),
          value: getString('common.loadingFieldOptionsSingular', {
            fieldName: getString('repositories')
          })
        }
      ]
    }
    return defaultTo(repoSelectItems, [])
  }

  const getPackages = (): SelectOption[] => {
    if (fetchingPackages) {
      return [
        {
          label: getString('common.loadingFieldOptionsSingular', {
            fieldName: getString('packagesLabel')
          }),
          value: getString('common.loadingFieldOptionsSingular', {
            fieldName: getString('packagesLabel')
          })
        }
      ]
    }
    return defaultTo(packageSelectItems, [])
  }

  const getConnectorRefQueryData = (): string => {
    return defaultTo(modifiedPrevStepData?.connectorId?.value, modifiedPrevStepData?.identifier)
  }

  const getVersionFieldHelperText = () => {
    return (
      getMultiTypeFromValue(formik.values.spec.version) === MultiTypeInputType.FIXED &&
      getHelpeTextForTags(
        helperTextData(selectedArtifact as ArtifactType, formik, getConnectorRefQueryData()),
        getString,
        false
      )
    )
  }

  const clearRepoAndProjectField = (): void => {
    resetFieldValue(formik, 'spec.repositoryName')
    setRepoSelectItems([])
    resetFieldValue(formik, 'spec.package')
    setPackageSelectItems([])
  }

  return (
    <FormikForm>
      <div className={cx(css.artifactForm, formClassName)}>
        {isMultiArtifactSource && <ArtifactSourceIdentifier />}
        {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
        <div className={css.imagePathContainer}>
          <FormInput.Select
            items={repositoryType}
            name="spec.repositoryType"
            label={getString('repositoryType')}
            placeholder={getString('pipeline.artifactsSelection.repositoryTypePlaceholder')}
            disabled
          />
        </div>
        <div className={css.imagePathContainer}>
          <FormInput.MultiTextInput
            name="spec.project"
            label={getString('pipelineSteps.projectIDLabel')}
            placeholder={getString('pipeline.artifactsSelection.projectIDPlaceholder')}
            disabled={isReadonly}
            onChange={clearRepoAndProjectField}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
          {getMultiTypeFromValue(formik.values.spec.project) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ marginTop: 22 }}
              value={formik.values.spec.project}
              type="String"
              variableName="project"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => formik.setFieldValue('spec.project', value)}
              isReadonly={isReadonly}
              allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
            />
          )}
        </div>
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            label={getString('regionLabel')}
            name="spec.region"
            useValue
            placeholder={getString('pipeline.regionPlaceholder')}
            multiTypeInputProps={{
              onChange: clearRepoAndProjectField,
              onTypeChange: (type: MultiTypeInputType) => formik.setFieldValue('spec.region', type),
              expressions,
              selectProps: {
                allowCreatingNewItems: true,
                addClearBtn: !isReadonly,
                items: regions,
                usePortal: isTemplateContext
              },
              allowableTypes
            }}
            selectItems={regions}
          />
          {getMultiTypeFromValue(formik.values.spec.region) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <SelectConfigureOptions
                options={regions}
                loading={loadingRegionsData}
                value={formik.values.spec.region}
                type="String"
                variableName="region"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => {
                  formik.setFieldValue('spec.region', value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            selectItems={getRepos()}
            name="spec.repositoryName"
            label={getString('common.repositoryName')}
            placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
            useValue
            disabled={isReadonly}
            multiTypeInputProps={{
              expressions,
              allowableTypes,
              selectProps: {
                noResults: (
                  <NoTagResults
                    tagError={fetchRepoError}
                    isServerlessDeploymentTypeSelected={false}
                    defaultErrorText={getString('pipeline.artifactsSelection.validation.noRepo')}
                  />
                ),
                itemRenderer: itemRendererForRepo,
                items: getRepos(),
                allowCreatingNewItems: true,
                usePortal: isTemplateContext
              },
              onChange: () => {
                resetFieldValue(formik, 'spec.package')
                resetFieldValue(formik, 'spec.version')
                resetFieldValue(formik, 'spec.digest')
                setPackageSelectItems([])
              },
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                if (
                  e?.target?.type !== 'text' ||
                  (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                ) {
                  return
                }
                if (isAllFieldsAreFixedForFetchRepos(projectValue, regionValue, connectorRefValue)) {
                  refetchRepoDetails({
                    queryParams: {
                      ...commonParams,
                      connectorRef: connectorRefValue,
                      project: projectValue,
                      region: regionValue
                    }
                  })
                }
              }
            }}
          />
          {getMultiTypeFromValue(formik.values.spec.repositoryName) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ marginTop: 22 }}
              value={formik.values.spec.repositoryName}
              type="String"
              variableName="repositoryName"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => formik.setFieldValue('spec.repositoryName', value)}
              isReadonly={isReadonly}
              allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
            />
          )}
        </div>
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            selectItems={getPackages()}
            name="spec.package"
            label={getString('pipeline.testsReports.callgraphField.package')}
            placeholder={getString('pipeline.manifestType.packagePlaceholder')}
            useValue
            disabled={isReadonly}
            multiTypeInputProps={{
              expressions,
              allowableTypes,
              selectProps: {
                noResults: (
                  <NoTagResults
                    tagError={fetchPackagesError}
                    isServerlessDeploymentTypeSelected={false}
                    defaultErrorText={getString('pipeline.artifactsSelection.validation.noPackage')}
                  />
                ),
                itemRenderer: itemRendererForPackage,
                items: getPackages(),
                allowCreatingNewItems: true,
                usePortal: isTemplateContext
              },
              onChange: () => {
                resetFieldValue(formik, 'spec.version')
                resetFieldValue(formik, 'spec.digest')
              },
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                if (
                  e?.target?.type !== 'text' ||
                  (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                ) {
                  return
                }
                if (
                  isAllFieldsAreFixedForFetchingPackages(
                    projectValue,
                    regionValue,
                    repositoryNameValue,
                    connectorRefValue
                  )
                ) {
                  refetchPackageDetails({
                    queryParams: {
                      ...commonParams,
                      connectorRef: connectorRefValue,
                      project: projectValue,
                      region: regionValue,
                      repositoryName: repositoryNameValue
                    }
                  })
                }
              }
            }}
          />
          {getMultiTypeFromValue(formik.values.spec.package) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ marginTop: 22 }}
              value={formik.values.spec.package}
              type="String"
              variableName="package"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => formik.setFieldValue('spec.package', value)}
              isReadonly={isReadonly}
              allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
            />
          )}
        </div>
        <div className={css.tagGroup}>
          <FormInput.RadioGroup
            label={getString('pipeline.artifactsSelection.versionDetails')}
            name="versionType"
            radioGroup={{ inline: true }}
            items={tagOptions}
            className={css.radioGroup}
            onChange={() => {
              resetFieldValue(formik, 'spec.digest')
              // to clearValues when version is changed
              resetFieldValue(formik, 'spec.version')
              resetFieldValue(formik, 'spec.versionRegex')
            }}
          />
        </div>
        {formik.values.versionType === 'value' ? (
          <div className={css.imagePathContainer}>
            <FormInput.MultiTypeInput
              selectItems={getBuilds()}
              label={getString('version')}
              placeholder={getString('pipeline.artifactsSelection.versionPlaceholder')}
              name="spec.version"
              useValue
              helperText={getVersionFieldHelperText()}
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                selectProps: {
                  noResults: (
                    <NoTagResults
                      tagError={error}
                      isServerlessDeploymentTypeSelected={false}
                      defaultErrorText={getString('pipeline.artifactsSelection.validation.noBuild')}
                    />
                  ),
                  itemRenderer: itemRendererForBuild,
                  items: getBuilds(),
                  allowCreatingNewItems: true,
                  usePortal: isTemplateContext
                },
                onChange: () => {
                  resetFieldValue(formik, 'spec.digest')
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  if (
                    isAllFieldsAreFixedInGAR(
                      projectValue,
                      regionValue,
                      repositoryNameValue,
                      packageValue,
                      connectorRefValue
                    )
                  ) {
                    refetchBuildDetails({
                      queryParams: {
                        ...commonParams,
                        connectorRef: connectorRefValue,
                        package: packageValue,
                        project: projectValue,
                        region: regionValue,
                        repositoryName: repositoryNameValue
                      }
                    })
                  }
                }
              }}
            />
            {getMultiTypeFromValue(formik.values.spec.version) === MultiTypeInputType.RUNTIME && (
              <SelectConfigureOptions
                options={getBuilds()}
                loading={fetchingBuilds}
                style={{ marginTop: 22 }}
                value={defaultTo(formik.values.spec.version, '')}
                type="String"
                variableName="version"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => formik.setFieldValue('spec.version', value)}
                isReadonly={isReadonly}
              />
            )}
          </div>
        ) : (
          <div className={css.imagePathContainer}>
            <FormInput.MultiTextInput
              name="spec.versionRegex"
              label={getString('pipeline.artifactsSelection.versionRegex')}
              placeholder={getString('pipeline.artifactsSelection.versionRegexPlaceholder')}
              disabled={isReadonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
            {getMultiTypeFromValue(formik.values.spec.versionRegex) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                style={{ marginTop: 22 }}
                value={defaultTo(formik.values.spec.versionRegex, '')}
                type="String"
                variableName="versionRegex"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => formik.setFieldValue('spec.versionRegex', value)}
                isReadonly={isReadonly}
                allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
              />
            )}
          </div>
        )}

        <GarArtifactDigestField
          formik={formik}
          expressions={expressions}
          allowableTypes={allowableTypes}
          isReadonly={isReadonly}
          connectorRefValue={getConnectorRefQueryData()}
          isVersionDetailsLoading={fetchingBuilds}
        />
      </div>
      {!hideHeaderAndNavBtns && (
        <Layout.Horizontal spacing="medium">
          <Button
            variation={ButtonVariation.SECONDARY}
            text={getString('back')}
            icon="chevron-left"
            onClick={() => previousStep?.(modifiedPrevStepData)}
          />
          <Button
            variation={ButtonVariation.PRIMARY}
            type="submit"
            text={getString('submit')}
            rightIcon="chevron-right"
          />
        </Layout.Horizontal>
      )}
    </FormikForm>
  )
}

export function GoogleArtifactRegistry(
  props: StepProps<ConnectorConfigDTO> & GoogleArtifactRegistryProps
): React.ReactElement {
  const { getString } = useStrings()
  const {
    context,
    handleSubmit,
    initialValues,
    prevStepData,
    selectedArtifact,
    artifactIdentifiers,
    editArtifactModePrevStepData
  } = props

  const modifiedPrevStepData = defaultTo(prevStepData, editArtifactModePrevStepData)
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!props.isMultiArtifactSource
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)

  const getInitialValues = (): GoogleArtifactRegistryInitialValuesType => {
    return getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      isIdentifierAllowed
    ) as GoogleArtifactRegistryInitialValuesType
  }

  const submitFormData = (formData: GoogleArtifactRegistryInitialValuesType, connectorId?: string): void => {
    const versionData =
      formData.versionType === TagTypes.Value
        ? {
            version: defaultTo(formData.spec.version, ''),
            digest: defaultTo(get(formData.spec.digest, 'value'), formData.spec.digest)
          }
        : {
            versionRegex: defaultTo(formData.spec.versionRegex, ''),
            digest: formData.spec.digest
          }
    const identifierData = isIdentifierAllowed
      ? {
          identifier: formData.identifier
        }
      : {}
    handleSubmit({
      ...identifierData,
      spec: {
        connectorRef: connectorId,
        repositoryType: formData.spec.repositoryType,
        project: formData.spec.project,
        region: defaultTo(formData.spec.region.value, formData.spec.region),
        repositoryName: formData.spec.repositoryName,
        package: formData.spec.package,
        ...versionData
      }
    })
  }

  const handleValidate = (formData: GoogleArtifactRegistryInitialValuesType) => {
    const submitObject = {
      ...formData,
      spec: { ...formData.spec }
    }
    if (hideHeaderAndNavBtns) {
      submitFormData(submitObject, getConnectorIdValue(modifiedPrevStepData))
    }
  }

  const commonSpecSchemaObject = {
    repositoryType: Yup.string().required(getString('pipeline.artifactsSelection.validation.repositoryType')),
    project: Yup.string().required(getString('fieldRequired', { field: getString('projectLabel') })),
    region: Yup.string().required(getString('fieldRequired', { field: getString('regionLabel') })),
    repositoryName: Yup.string().required(getString('fieldRequired', { field: getString('common.repositoryName') })),
    package: Yup.string().required(
      getString('fieldRequired', { field: getString('pipeline.testsReports.callgraphField.package') })
    )
  }

  const schemaObject = {
    versionType: Yup.string().required(
      getString('fieldRequired', { field: getString('pipeline.artifactsSelection.versionDetails') })
    ),
    spec: Yup.object().when('versionType', {
      is: 'regex',
      then: Yup.object().shape({
        ...commonSpecSchemaObject,
        versionRegex: Yup.string()
          .trim()
          .required(getString('fieldRequired', { field: getString('pipeline.artifactsSelection.versionRegex') }))
      }),
      otherwise: Yup.object().shape({
        ...commonSpecSchemaObject,
        version: Yup.string()
          .trim()
          .required(getString('fieldRequired', { field: getString('version') }))
      })
    })
  }

  const primarySchema = Yup.object().shape(schemaObject)
  const schemaWithIdentifier = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      getString,
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      {!hideHeaderAndNavBtns && (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
          {getString('pipeline.artifactsSelection.artifactDetails')}
        </Text>
      )}
      <Formik
        initialValues={getInitialValues()}
        formName="imagePath"
        validationSchema={isIdentifierAllowed ? schemaWithIdentifier : primarySchema}
        validate={handleValidate}
        onSubmit={formData => {
          const submitObject = {
            ...formData,
            spec: { ...formData.spec }
          }

          submitFormData(submitObject, getConnectorIdValue(modifiedPrevStepData))
        }}
      >
        {formik => {
          return <FormComponent {...props} formik={formik} />
        }}
      </Formik>
    </Layout.Vertical>
  )
}
