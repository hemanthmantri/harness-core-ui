import { StringKeys, UseStringsReturn } from 'framework/strings'
import { DEPLOYMENT_TYPE_TO_DIR_MAP, DEPLOYMENT_TYPE_TO_FILE_MAPS, SERVICE_TYPES } from './Constants'
import { StepsProgress } from './Store/OnboardingStore'
import { BRANCH_LEVEL } from './TrackingConstants'
import {
  CDOnboardingSteps,
  CLOUD_FUNCTION_TYPES,
  DeploymentStrategyTypes,
  PipelineSetupState,
  SERVERLESS_FUNCTIONS,
  WhatToDeployType
} from './types'
interface GetCommandsParam {
  getString: UseStringsReturn['getString']
  dirPath: string
  state: PipelineSetupState
  accountId: string
  serviceType?: string
  delegateName?: string
  artifactSubtype?: string
  artifactType?: string
}
export const getCommandStrWithNewline = (cmd: string[]): string => cmd.join(' \n')

export const getCommandsByDeploymentType = ({
  getString,
  dirPath,

  accountId,
  state,
  delegateName,
  artifactSubtype,
  serviceType,
  artifactType
}: GetCommandsParam): string => {
  if (serviceType === SERVICE_TYPES?.KubernetesService?.id) {
    return getK8sCommands({
      getString,
      dirPath,
      state,
      accountId,
      delegateName,
      artifactSubtype,
      serviceType
    })
  }
  return getServerLessCommands({
    getString,
    dirPath,
    accountId,
    state,
    delegateName,
    artifactSubtype,
    serviceType,
    artifactType
  })
}

const getK8sCommands = ({
  getString,
  dirPath,
  accountId,
  state,
  delegateName,
  artifactSubtype
}: GetCommandsParam): string => {
  const { service, infrastructure, env } = DEPLOYMENT_TYPE_TO_FILE_MAPS[artifactSubtype as string] || {}
  return getCommandStrWithNewline([
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.cloneRepo'
    ),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.clonecmd', {
      gitUser:
        state?.githubUsername ||
        getString(
          'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.gitusernamePlaceholder'
        )
    }),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.cdDir'),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.cddir'),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.login'),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.logincmd', {
      accId: accountId,
      apiKey: state?.apiKey
    }),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createSecret'
    ),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.createsecret', {
      gitPat:
        state?.githubPat ||
        getString(
          'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.gitpatPlaceholder'
        ),
      type: dirPath
    }),

    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createGitIcon'
    ),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.k8s.createGithubcon',
      {
        gitUser:
          state?.githubUsername ||
          getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.gitusernamePlaceholder'
          ),
        type: dirPath
      }
    ),

    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createK8scon'
    ),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.k8s.createk8scon', {
      delegateName,
      type: dirPath
    }),

    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createSvc'
    ),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.k8s.createsvccmd', {
      type: dirPath,
      service: service || 'service'
    }),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createEnv'
    ),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.k8s.createenvcmd', {
      type: dirPath,
      environment: env || 'environment'
    }),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createInfra'
    ),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.k8s.createinfracmd',
      {
        type: dirPath,
        infrastructureDefinition: infrastructure || 'infrastructure-definition'
      }
    )
  ])
}

const isGCPFunction = (artifactType = ''): boolean => artifactType === SERVERLESS_FUNCTIONS.GOOGLE_CLOUD_FUNCTION

const getServerLessCommands = ({
  getString,
  dirPath,
  accountId,
  state,
  delegateName,
  artifactSubtype = '',
  artifactType = ''
}: GetCommandsParam): string => {
  const directory = dirPath
  const isGCP = isGCPFunction(artifactType)
  const cloudType = isGCP ? 'gcp' : 'aws'
  const gcpTypes: Record<string, string> = {
    [CLOUD_FUNCTION_TYPES.GCPGen1]: '1st_gen',
    [CLOUD_FUNCTION_TYPES.GCPGen2]: '2nd_gen'
  }

  const subDirName = gcpTypes[artifactSubtype] || undefined

  const { infrastructure, env } = DEPLOYMENT_TYPE_TO_FILE_MAPS[artifactSubtype as string] || {}

  const infraSecret: Record<string, StringKeys> = {
    command: isGCP
      ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.serverless.gcp.createGcpSecret'
      : 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.serverless.aws.createAwsSecret',
    comment: isGCP
      ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createGCPSecret'
      : 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createAWSSecret'
  }
  const secret = state.infraInfo?.svcKeyOrSecretKey

  return getCommandStrWithNewline([
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.cloneRepo'
    ),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.clonecmd', {
      gitUser:
        state?.githubUsername ||
        getString(
          'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.gitusernamePlaceholder'
        )
    }),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.cdDir'),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.cddir'),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.login'),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.logincmd', {
      accId: accountId,
      apiKey: state?.apiKey
    }),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createSecret'
    ),
    getString('cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.createsecret', {
      gitPat:
        state?.githubPat ||
        getString(
          'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.gitpatPlaceholder'
        ),
      type: directory
    }),
    getString(infraSecret.comment),
    getString(infraSecret.command, {
      gitPat:
        state?.githubPat ||
        getString(
          'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.gitpatPlaceholder'
        ),
      type: directory,
      cloudType,
      secret
    }),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createGitIcon'
    ),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.serverless.gcp.createGithubcon',
      {
        gitUser:
          state?.githubUsername ||
          getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.gitusernamePlaceholder'
          ),
        type: directory
      }
    ),

    getString(
      isGCP
        ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createGCPcon'
        : 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createAWScon'
    ),
    getString(
      isGCP
        ? `cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.serverless.gcp.creategcpcon`
        : `cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.serverless.aws.createawscon`,
      {
        delegateName,
        type: directory,
        region: state.infraInfo?.region,
        rolearn: state.infraInfo?.awsArn,
        accessKey: state.infraInfo?.accessKey
      }
    ),

    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createSvc'
    ),
    getString(
      `cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.serverless.${cloudType}.createsvccmd`,
      {
        type: isGCP ? `${directory}/${subDirName}` : directory,
        bucket: state.infraInfo?.bucketName,
        project: state.infraInfo?.projectName,
        region: state.infraInfo?.region
      }
    ),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createEnv'
    ),
    getString(
      `cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.serverless.${cloudType}.createenvcmd`,
      {
        type: directory,
        environment: env || 'environment'
      }
    ),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createInfra'
    ),
    getString(
      `cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.serverless.${cloudType}.createinfracmd`,
      {
        type: directory,
        infrastructureDefinition: infrastructure || 'infrastructure-definition',
        region: state.infraInfo?.region,
        project: state.infraInfo?.projectName
      }
    )
  ])
}

export const getPipelineCommands = ({
  getString,
  deploymentData,
  strategy
}: {
  getString: UseStringsReturn['getString']
  deploymentData: WhatToDeployType
  strategy: DeploymentStrategyTypes
}): string => {
  switch (deploymentData.svcType?.id) {
    case SERVICE_TYPES.ServerlessFunction.id:
      return getServerlessPipelineCommands({
        getString,
        deploymentData,
        strategy
      })
    default:
      return getK8sPipelineCommands({
        getString,
        deploymentData,
        strategy
      })
  }
}

export const getK8sPipelineCommands = ({
  getString,
  deploymentData,
  strategy
}: {
  getString: UseStringsReturn['getString']
  deploymentData: WhatToDeployType
  strategy: DeploymentStrategyTypes
}): string => {
  const dirPath = DEPLOYMENT_TYPE_TO_DIR_MAP[deploymentData.artifactType?.id as string]
  const pipelineFileName = DEPLOYMENT_TYPE_TO_FILE_MAPS[deploymentData.artifactSubType?.id as string]?.[strategy.id]
  return getString(strategy?.pipelineCommand, {
    type: `${dirPath}/harnesscd-pipeline`,
    pipeline: pipelineFileName || strategy?.pipelineName
  })
}

export const getServerlessPipelineCommands = ({
  getString,
  deploymentData,
  strategy
}: {
  getString: UseStringsReturn['getString']
  deploymentData: WhatToDeployType
  strategy: DeploymentStrategyTypes
}): string => {
  const isGCP = isGCPFunction(deploymentData?.artifactType?.id)
  const dirPath =
    DEPLOYMENT_TYPE_TO_DIR_MAP[
      deploymentData.artifactSubType?.id
        ? deploymentData.artifactSubType?.id
        : (deploymentData.artifactType?.id as string)
    ]
  const pipelineFileName = DEPLOYMENT_TYPE_TO_FILE_MAPS[deploymentData.artifactSubType?.id as string]?.[strategy.id]
  return isGCP
    ? getString(strategy?.pipelineCommand, {
        type: dirPath,
        pipeline: pipelineFileName || strategy?.pipelineName
      })
    : getString(strategy?.pipelineCommand, {
        type: dirPath,
        pipeline: pipelineFileName || strategy?.pipelineName
      })
}
export const getBranchingProps = (state: StepsProgress): { [key: string]: string | undefined } => {
  const branchDetails: { [key: string]: string | undefined } = {
    [BRANCH_LEVEL.BRANCH_LEVEL_1]: (state?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData as WhatToDeployType)?.svcType
      ?.label,
    [BRANCH_LEVEL.BRANCH_LEVEL_2]: (state?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData as WhatToDeployType)
      ?.artifactType?.label
  }
  if ((state?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData as WhatToDeployType)?.artifactSubType?.label) {
    branchDetails[BRANCH_LEVEL.BRANCH_LEVEL_3] = (
      state?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData as WhatToDeployType
    )?.artifactSubType?.label
  }

  return branchDetails
}

export const getDelegateTypeString = (data: WhatToDeployType, getString: UseStringsReturn['getString']): string => {
  return data.svcType?.id === SERVICE_TYPES.KubernetesService.id
    ? getString('kubernetesText')
    : getString('delegate.cardData.docker.name')
}
