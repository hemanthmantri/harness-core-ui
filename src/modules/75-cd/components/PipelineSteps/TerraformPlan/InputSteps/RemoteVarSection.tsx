/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { connect, FormikContextType } from 'formik'
import { useParams } from 'react-router-dom'
import { get, map } from 'lodash-es'

import {
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormInput,
  Container,
  Text,
  useToaster,
  SelectOption
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import List from '@pipeline/components/List/List'
import { isValueRuntimeInput } from '@common/utils/utils'
import { FormMultiTypeCheckboxField } from '@common/components'
import { Connectors } from '@platform/connectors/constants'
import { FormMultiTypeConnectorField } from '@platform/connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useGetRepositoriesDetailsForArtifactory } from 'services/cd-ng'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { TerraformPlanProps } from '../../Common/Terraform/TerraformInterfaces'
import { AmazonS3RuntimeView } from '../../Common/ConfigFileStore/AmazonS3Store/AmazonS3StoreRuntimeView'
import { ConnectorMap } from '../../Common/ConfigFileStore/ConfigFileStoreHelper'

function TFRemoteSectionRef(
  props: TerraformPlanProps & {
    remoteVar: any
    index: number
    formik?: FormikContextType<any>
  }
): React.ReactElement {
  const { remoteVar, index, allowableTypes, formik, inputSetData, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const { readonly, initialValues, path } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [connectorRepos, setConnectorRepos] = useState<SelectOption[]>()
  const fieldPath = inputSetData?.template?.spec?.configuration ? 'configuration' : 'cloudCliConfiguration'
  let connectorVal = get(
    formik?.values,
    `${path}.spec.${fieldPath}.varFiles[${index}].varFile.spec.store.spec.connectorRef`
  )
  if (!connectorVal) {
    const varFiles = get(props?.allValues?.spec, `${fieldPath}.varFiles`, [])
    const varID = get(formik?.values, `${path}.spec.${fieldPath}.varFiles[${index}].varFile.identifier`, '')
    varFiles.forEach((file: any) => {
      if (file?.varFile?.identifier === varID) {
        connectorVal = get(file?.varFile, 'spec.store.spec.connectorRef')
      }
    })
  }
  const storeType = get(formik?.values, `${path}.spec.${fieldPath}.varFiles[${index}].varFile.spec.store.type`)
  const reposRequired =
    getMultiTypeFromValue(remoteVar.varFile?.spec?.store?.spec?.repositoryName) === MultiTypeInputType.RUNTIME
  const {
    data: ArtifactRepoData,
    loading: ArtifactRepoLoading,
    refetch: getArtifactRepos,
    error: ArtifactRepoError
  } = useGetRepositoriesDetailsForArtifactory({
    queryParams: {
      connectorRef: connectorVal,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  useEffect(() => {
    if (ArtifactRepoError) {
      showError(getRBACErrorMessage(ArtifactRepoError))
    }
  }, [ArtifactRepoError])

  useEffect(() => {
    if (
      reposRequired &&
      storeType === Connectors.ARTIFACTORY &&
      connectorVal &&
      getMultiTypeFromValue(connectorVal) === MultiTypeInputType.FIXED &&
      !ArtifactRepoData
    ) {
      getArtifactRepos()
    }

    if (ArtifactRepoData) {
      setConnectorRepos(map(ArtifactRepoData.data?.repositories, repo => ({ label: repo, value: repo })))
    }
  }, [ArtifactRepoData, connectorVal, storeType])

  const isRepoRuntime = isValueRuntimeInput(get(remoteVar.varFile, 'spec.store.spec.repoName'))

  return (
    <>
      <Container flex width={300} padding={{ bottom: 'small' }}>
        <Text font={{ weight: 'bold' }}>{getString('cd.varFile')}:</Text>
        {remoteVar.varFile?.identifier}
      </Container>

      {getMultiTypeFromValue(remoteVar.varFile?.spec?.store?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeConnectorField
          accountIdentifier={accountId}
          selected={get(
            initialValues,
            `${path}.spec.${fieldPath}.varFiles[${index}].varFile.spec.store.spec.connectorRef`,
            ''
          )}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={388}
          type={ConnectorMap[storeType]}
          name={`${path}.spec.${fieldPath}.varFiles[${index}].varFile.spec.store.spec.connectorRef`}
          label={getString('connector')}
          placeholder={getString('select')}
          disabled={readonly}
          setRefValue
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          multiTypeProps={{ expressions, allowableTypes }}
        />
      )}

      {isRepoRuntime && (
        <TextFieldInputSetView
          label={getString('pipelineSteps.repoName')}
          name={`${path}.spec.${fieldPath}.varFiles[${index}].varFile.spec.store.spec.repoName`}
          placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={inputSetData?.template}
          fieldPath={`spec.${fieldPath}.varFiles[${index}].varFile.spec.store.spec.repoName`}
        />
      )}

      {getMultiTypeFromValue(remoteVar.varFile?.spec?.store?.spec?.branch) === MultiTypeInputType.RUNTIME && (
        <FormInput.MultiTextInput
          name={`${path}.spec.${fieldPath}.varFiles[${index}].varFile.spec.store.spec.branch`}
          label={getString('pipelineSteps.deploy.inputSet.branch')}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
        />
      )}
      {getMultiTypeFromValue(remoteVar.varFile?.spec?.store?.spec?.commitId) === MultiTypeInputType.RUNTIME && (
        <FormInput.MultiTextInput
          name={`${path}.spec.${fieldPath}.varFiles[${index}].varFile.spec.store.spec.commitId`}
          label={getString('pipeline.manifestType.commitId')}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
        />
      )}
      {getMultiTypeFromValue(remoteVar?.varFile?.spec?.optional) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeCheckboxField
          name={`${path}.spec.${fieldPath}.spec.varFiles[${index}].varFile.spec.optional`}
          label={getString('projectsOrgs.optional')}
          multiTypeTextbox={{ expressions, allowableTypes }}
          enableConfigureOptions={true}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          tooltipProps={{
            dataTooltipId: 'varFileOptional'
          }}
        />
      )}
      {storeType === 'S3' && (
        <AmazonS3RuntimeView
          initialValues={props?.initialValues}
          template={remoteVar}
          allowableTypes={allowableTypes}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          accountId={accountId}
          path={`${path}.spec.${fieldPath}.varFiles[${index}]`}
          formik={formik}
          allValues={props?.allValues}
        />
      )}
      {getMultiTypeFromValue(remoteVar.varFile?.spec?.store?.spec?.paths) === MultiTypeInputType.RUNTIME && (
        <List
          label={getString('filePaths')}
          name={`${path}.spec.${fieldPath}.varFiles[${index}].varFile.spec.store.spec.paths`}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
          isNameOfArrayType
        />
      )}
      {reposRequired && (
        <FormInput.MultiTypeInput
          label={getString('pipelineSteps.repoName')}
          name={`${path}.spec.${fieldPath}.varFiles[${index}].varFile.spec.store.spec.repositoryName`}
          placeholder={getString(ArtifactRepoLoading ? 'common.loading' : 'cd.selectRepository')}
          disabled={readonly}
          useValue
          multiTypeInputProps={{
            selectProps: {
              allowCreatingNewItems: true,
              items: connectorRepos ? connectorRepos : []
            },
            expressions,
            allowableTypes
          }}
          selectItems={connectorRepos ? connectorRepos : []}
        />
      )}
      {getMultiTypeFromValue(remoteVar.varFile?.spec?.store?.spec?.artifactPaths) === MultiTypeInputType.RUNTIME && (
        <List
          label={getString('common.artifactPaths')}
          name={`${path}.spec.${fieldPath}.varFiles[${index}].varFile.spec.store.spec.artifactPaths`}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
          isNameOfArrayType
        />
      )}
    </>
  )
}

const TFRemoteSection = connect(TFRemoteSectionRef)
export default TFRemoteSection
