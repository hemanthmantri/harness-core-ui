import { StringKeys, UseStringsReturn } from 'framework/strings'
import { StringsMap } from 'stringTypes'
import {
  DEPLOYMENT_FLOW_ENUMS,
  DEPLOYMENT_TYPE_TO_DIR_MAP,
  DEPLOYMENT_TYPE_TO_FILE_MAPS,
  GITOPS_DIRECTORY_PATH,
  INFRA_TYPES,
  SERVICE_TYPES
} from './Constants'
import { StepsProgress } from './Store/OnboardingStore'
import { BRANCH_LEVEL } from './TrackingConstants'
import {
  CDOnboardingSteps,
  CLOUD_FUNCTION_TYPES,
  DeploymentStrategyTypes,
  PipelineSetupState,
  SERVERLESS_FUNCTIONS,
  WhatToDeployType,
  WhereAndHowToDeployType
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
  isGitops?: boolean
  agentId?: string
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
  artifactType,
  isGitops,
  agentId
}: GetCommandsParam): string => {
  switch (serviceType) {
    case SERVICE_TYPES?.KubernetesService?.id:
      return getK8sCommands({
        getString,
        dirPath,
        state,
        accountId,
        delegateName,
        artifactSubtype,
        artifactType,
        serviceType,
        isGitops,
        agentId
      })
    case SERVICE_TYPES.ServerlessFunction.id:
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
    case SERVICE_TYPES.TraditionalApp.id:
      return getTraditionalAppsCommands({
        getString,
        dirPath,
        accountId,
        state,
        delegateName,
        artifactSubtype,
        serviceType,
        artifactType
      })
    default:
      return ''
  }
}

const getK8sCommands = ({
  getString,
  dirPath,
  accountId,
  state,
  delegateName,
  artifactSubtype,
  artifactType,
  isGitops,
  agentId
}: GetCommandsParam): string => {
  const loginCommands = [
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
    })
  ]
  if (isGitops) {
    const folderPath = GITOPS_DIRECTORY_PATH[artifactSubtype ? artifactSubtype : (artifactType as string)]

    return getCommandStrWithNewline([
      ...loginCommands,
      getString(
        'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createGitopsRepo'
      ),
      getString(
        'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.gitops.createRepo',
        { agentId, dirPath: folderPath }
      ),
      getString(
        'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createGitopsCluster'
      ),
      getString(
        'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.gitops.createCluster',
        { agentId, dirPath: folderPath }
      ),
      getString(
        'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createGitopsApp'
      ),
      getString(
        'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.gitops.createApplication',
        { agentId, dirPath: folderPath }
      )
    ])
  }
  const { service, infrastructure, env } = DEPLOYMENT_TYPE_TO_FILE_MAPS[artifactSubtype as string] || {}
  return getCommandStrWithNewline([
    ...loginCommands,
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
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createGitcon'
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
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createGitcon'
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
        ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.serverless.gcp.creategcpcon'
        : 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.serverless.aws.createawscon',
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

const getTraditionalAppsCommands = ({
  getString,
  dirPath,
  accountId,
  state,
  delegateName,
  artifactSubtype = '',
  artifactType = ''
}: GetCommandsParam): string => {
  const directory = dirPath
  const isAWS = artifactType === INFRA_TYPES.TraditionalApp.TraditionalAWS.id
  const isSSH = artifactSubtype.includes('SSH')
  const { infrastructure, env } = DEPLOYMENT_TYPE_TO_FILE_MAPS[artifactSubtype as string] || {}

  const infraSecret: Record<string, StringKeys> = {
    command: isSSH
      ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.traditional.pdc.createSSHSecret'
      : 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.traditional.pdc.createWINRMSecret',
    comment: isSSH
      ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createSSHSecret'
      : 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createWINRMSecret'
  }

  const commandSnippet = getCommandStrWithNewline([
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

    getString(infraSecret.comment),
    getString(infraSecret.command, {
      secret: state.infraInfo?.privateKeyFile || state.infraInfo?.password,
      username: state.infraInfo?.username,
      port: state.infraInfo?.port,
      domain: state.infraInfo?.domain
    }),

    ...(isAWS
      ? [
          getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createAWSSecret'
          ),
          getString(
            'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.serverless.aws.createAwsSecret',

            {
              type: directory,
              cloudType: 'aws',
              secret: state.infraInfo?.svcKeyOrSecretKey
            }
          )
        ]
      : []),

    getString(
      isAWS
        ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createAWScon'
        : 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createPDCCon'
    ),
    getString(
      isAWS
        ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.serverless.aws.createawscon'
        : isSSH
        ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.traditional.pdc.createPDCCon'
        : 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.traditional.pdc.createPDCConWinRM',
      {
        delegateName,
        type: directory,
        region: state.infraInfo?.region,
        rolearn: state.infraInfo?.awsArn,
        accessKey: state.infraInfo?.accessKey,
        port: state.infraInfo?.port,
        hostIp: state.infraInfo?.hostIP
      }
    ),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createArtifactorycon'
    ),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.traditional.pdc.createArtifactoryCon',
      {
        type: directory
      }
    ),

    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createSvc'
    ),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.traditional.pdc.createsvccmd',
      {
        type: directory,
        bucket: state.infraInfo?.bucketName,
        project: state.infraInfo?.projectName,
        region: state.infraInfo?.region
      }
    ),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createEnv'
    ),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.traditional.pdc.createenvcmd',
      {
        type: directory,
        environment: env || 'environment'
      }
    ),
    getString(
      'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.comments.createInfra'
    ),
    getString(
      isAWS
        ? 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.traditional.cloud.createinfracmdaws'
        : 'cd.getStartedWithCD.flowByQuestions.deploymentSteps.steps.pipelineSetupStep.commands.traditional.pdc.createinfracmd',
      {
        type: directory,
        infrastructureDefinition: infrastructure || 'infrastructure-definition',
        region: state.infraInfo?.region,
        project: state.infraInfo?.projectName,
        instanceName: state.infraInfo?.instanceName
      }
    )
  ])
  return commandSnippet
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
    case SERVICE_TYPES.TraditionalApp.id:
      return getTraditionalAppsPipelineCommands({
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
  const dirPath =
    DEPLOYMENT_TYPE_TO_DIR_MAP[
      deploymentData.artifactSubType?.id
        ? deploymentData.artifactSubType?.id
        : (deploymentData.artifactType?.id as string)
    ]
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

export const getTraditionalAppsPipelineCommands = ({
  getString,
  deploymentData,
  strategy
}: {
  getString: UseStringsReturn['getString']
  deploymentData: WhatToDeployType
  strategy: DeploymentStrategyTypes
}): string => {
  const dirPath =
    DEPLOYMENT_TYPE_TO_DIR_MAP[
      deploymentData.artifactSubType?.id
        ? deploymentData.artifactSubType?.id
        : (deploymentData.artifactType?.id as string)
    ]
  const pipelineFileName = DEPLOYMENT_TYPE_TO_FILE_MAPS[deploymentData.artifactSubType?.id as string]?.[strategy.id]
  return getString(strategy?.pipelineCommand, {
    type: dirPath,
    pipeline: pipelineFileName || strategy?.pipelineName
  })
}
export const getBranchingProps = (
  state: StepsProgress,
  getString: UseStringsReturn['getString']
): { [key: string]: string | undefined } => {
  const branchDetails: { [key: string]: string | undefined } = {
    [BRANCH_LEVEL.BRANCH_LEVEL_1]: getString(
      (state?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData as WhatToDeployType)?.svcType?.label as keyof StringsMap
    ),
    [BRANCH_LEVEL.BRANCH_LEVEL_2]: getString(
      (state?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData as WhatToDeployType)?.artifactType?.label as keyof StringsMap
    )
  }
  if ((state?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData as WhatToDeployType)?.artifactSubType?.label) {
    branchDetails[BRANCH_LEVEL.BRANCH_LEVEL_3] = getString(
      (state?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData as WhatToDeployType)?.artifactSubType
        ?.label as keyof StringsMap
    )
  }

  return branchDetails
}

export const getDelegateTypeString = (data: WhatToDeployType, getString: UseStringsReturn['getString']): string => {
  return data.svcType?.id === SERVICE_TYPES.KubernetesService.id
    ? getString('kubernetesText')
    : getString('delegate.cardData.docker.name')
}

export const isGitopsFlow = (stepsProgress: StepsProgress): boolean =>
  (stepsProgress?.[CDOnboardingSteps.HOW_N_WHERE_TO_DEPLOY]?.stepData as WhereAndHowToDeployType)?.type?.id ===
  DEPLOYMENT_FLOW_ENUMS.Gitops

export const isK8sSwimlane = (stepsProgress: StepsProgress): boolean =>
  (stepsProgress?.[CDOnboardingSteps.WHAT_TO_DEPLOY]?.stepData as WhatToDeployType)?.svcType?.id ===
  SERVICE_TYPES.KubernetesService.id
