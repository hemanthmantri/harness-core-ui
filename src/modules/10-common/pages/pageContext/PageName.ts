/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export enum PAGE_NAME {
  AccountResources = 'AccountResources',
  ProjectListing = 'ProjectListing',
  SmtpDetails = 'SmtpDetails',
  AuditTrailsPage = 'AuditTrailsPage',
  ServiceAccountsPage = 'ServiceAccountsPage',
  UsersPage = 'UsersPage',
  ServiceAccountDetails = 'ServiceAccountDetails',
  UserDetails = 'UserDetails',
  UserGroups = 'UserGroups',
  UserGroupDetails = 'UserGroupDetails',
  ResourceGroups = 'ResourceGroups',
  Roles = 'Roles',
  RoleDetails = 'RoleDetails',
  ResourceGroupDetails = 'ResourceGroupDetails',
  DelegateListing = 'DelegateListing',
  DelegateConfigurations = 'DelegateConfigurations',
  DelegateDetails = 'DelegateDetails',
  DelegateProfileDetails = 'DelegateProfileDetails',
  DelegateTokens = 'DelegateTokens',
  SecretsPage = 'SecretsPage',
  SecretDetails = 'SecretDetails',
  SecretReferences = 'SecretReferences',
  SecretRuntimeUsage = 'SecretRuntimeUsage',
  CreateSecretFromYamlPage = 'CreateSecretFromYamlPage',
  CITrialHomePage = 'CITrialHomePage',
  CIHomePage = 'CIHomePage',
  ConnectorsPage = 'ConnectorsPage',
  VariablesPage = 'VariablesPage',
  DiscoveryPage = 'DiscoveryPage',
  DiscoveryDetails = 'DiscoveryDetails',
  CreateNetworkMap = 'CreateNetworkMap',
  CreateConnectorFromYamlPage = 'CreateConnectorFromYamlPage',
  GitSyncRepoTab = 'GitSyncRepoTab',
  GitSyncEntityTab = 'GitSyncEntityTab',
  GitSyncErrors = 'GitSyncErrors',
  GitSyncConfigTab = 'GitSyncConfigTab',
  Webhooks = 'Webhooks',
  WebhooksDetails = 'WebhooksDetails',
  WebhookEvents = 'WebhookEvents',
  ConnectorDetailsPage = 'ConnectorDetailsPage',
  CIPipelineStudio = 'CIPipelineStudio',
  FullPageLogView = 'FullPageLogView',
  PipelinesPage = 'PipelinesPage',
  PipelineListPage = 'PipelineListPage',
  InputSetList = 'InputSetList',
  DeploymentsList = 'DeploymentsList',
  EnhancedInputSetForm = 'EnhancedInputSetForm',
  InputSetFormV1 = 'InputSetFormV1',
  TriggersPage = 'TriggersPage',
  TriggerDetailPage = 'TriggerDetailPage',
  TriggerActivityHistoryPage = 'TriggerActivityHistoryPage',
  TriggersWizardPage = 'TriggersWizardPage',
  ExecutionPipelineView = 'ExecutionPipelineView',
  ExecutionPolicyEvaluationsView = 'ExecutionPolicyEvaluationsView',
  ExecutionIACMPipelineResources = 'ExecutionIACMPipelineResources',
  ExecutionSecurityView = 'ExecutionSecurityView',
  ExecutionInputsView = 'ExecutionInputsView',
  ExecutionArtifactsView = 'ExecutionArtifactsView',
  ExecutionResilienceView = 'ExecutionResilienceView',
  BuildTests = 'BuildTests',
  BuildCommits = 'BuildCommits',
  CIPipelineDeploymentList = 'CIPipelineDeploymentList',
  TemplatesPage = 'TemplatesPage',
  FreezeWindowsPage = 'FreezeWindowsPage',
  TemplateStudioWrapper = 'TemplateStudioWrapper',
  CDHomePage = 'CDHomePage',
  CDTrialHomePage = 'CDTrialHomePage',
  ChaosTrialHomePage = 'ChaosTrialHomePage',
  Services = 'Services',
  ServiceDetails = 'ServiceDetails',
  ServiceStudio = 'ServiceStudio',
  Environments = 'Environments',
  EnvironmentGroups = 'EnvironmentGroups',
  ServiceOverrides = 'ServiceOverrides',
  CDPipelineStudio = 'CDPipelineStudio',
  CDPipelineDeploymentList = 'CDPipelineDeploymentList',
  CDTemplateStudioWrapper = 'CDTemplateStudioWrapper',
  CITemplateStudioWrapper = 'CITemplateStudioWrapper',
  CFTemplateStudioWrapper = 'CFTemplateStudioWrapper',
  GitOpsPage = 'GitOpsPage',
  FileStorePage = 'FileStorePage',
  AccountConfiguration = 'AccountConfiguration',
  AccountOverview = 'AccountOverview',
  SubscriptionsPage = 'SubscriptionsPage',
  BillingPage = 'BillingPage',
  PlanPage = 'PlanPage',
  GetStartedWithCI = 'GetStartedWithCI',
  GetStartedWithCD = 'GetStartedWithCD',
  CDOnboardingWizard = 'CDOnboardingWizard',
  CFHomePage = 'CFHomePage',
  CFTrialHomePage = 'CFTrialHomePage',
  FeatureFlagsLandingPage = 'FeatureFlagsLandingPage',
  FeatureFlagsDetailPage = 'FeatureFlagsDetailPage',
  TargetGroupDetailPage = 'TargetGroupDetailPage',
  SegmentDetailPage = 'SegmentDetailPage',
  TargetsPage = 'TargetsPage',
  TargetDetailPage = 'TargetDetailPage',
  LegacyTargetDetailPage = 'LegacyTargetDetailPage',
  SegmentsPage = 'SegmentsPage',
  EnvironmentsPage = 'EnvironmentsPage',
  EnvironmentDetails = 'EnvironmentDetails',
  EnvironmentGroupDetails = 'EnvironmentGroupDetails',
  OnboardingPage = 'OnboardingPage',
  OnboardingDetailPage = 'OnboardingDetailPage',
  CFWorkflowsPage = 'CFWorkflowsPage',
  SecretDetailsHomePage = 'SecretDetailsHomePage',
  ChaosHomePage = 'ChaosHomePage',
  CETrialHomePage = 'CETrialHomePage',
  CEHomePage = 'CEHomePage',
  CEOverviewPage = 'CEOverviewPage',
  CECommitmentOrchestrationPage = 'CECommitmentOrchestrationPage',
  CECODashboardPage = 'CECODashboardPage',
  CECORuleDetailsPage = 'CECORuleDetailsPage',
  CECOCreateGatewayPage = 'CECOCreateGatewayPage',
  CECOEditGatewayPage = 'CECOEditGatewayPage',
  CECOLoadBalancersPage = 'CECOLoadBalancersPage',
  CEBudgets = 'CEBudgets',
  CEBudgetDetails = 'CEBudgetDetails',
  CERecommendationList = 'CERecommendationList',
  CERecommendationDetailsPage = 'CERecommendationDetailsPage',
  CENodeRecommendationDetailsPage = 'CENodeRecommendationDetailsPage',
  CEECSRecommendationDetailsPage = 'CEECSRecommendationDetailsPage',
  CEPerspectiveDetailsPage = 'CEPerspectiveDetailsPage',
  CECreatePerspectivePage = 'CECreatePerspectivePage',
  CEPerspectiveListPage = 'CEPerspectiveListPage',
  CEWorkloadDetailsPage = 'CEWorkloadDetailsPage',
  CEServiceDetailsPage = 'CEServiceDetailsPage',
  CENodeDetailsPage = 'CENodeDetailsPage',
  CEAnomaliesOverviewPage = 'CEAnomaliesOverviewPage',
  CEBusinessMapping = 'CEBusinessMapping',
  CEDashboards = 'CEDashboards',
  CECloudIntegration = 'Cloud Integrations',
  ErrorTrackingListPage = 'ErrorTrackingListPage',
  OPAPolicyDashboard = 'OPAPolicyDashboard',
  CODEHomePage = 'CODEHomePage',
  CODERepositories = 'CODERepositories',
  CODERepository = 'CODERepository',
  CODESearch = 'CODESearch',
  CODESettings = 'CODESettings',
  CODEWebhooks = 'CODEWebhooks',
  CODEWebhookNew = 'CODEWebhookNew',
  CODEWebhookDetails = 'CODEWebhookDetails',
  CODEPullRequests = 'CODEPullRequests',
  CODEPullRequestsCompare = 'CODEPullRequestsCompare',
  CODEFileEdit = 'CODEFileEdit',
  CODECommits = 'CODECommits',
  CODEBranches = 'CODEBranches',
  CODETags = 'CODETags',
  ExecutionList = 'ExecutionList',
  CFConfigurePath = 'CFConfigurePath',
  SSCAHomePage = 'SSCAHomePage',
  SSCAOverviewPage = 'SSCAOverviewPage',
  IDPAdminPage = 'IDPAdminPage',
  CETHomePage = 'CETHomePage',
  CETTrialPage = 'CETTrialPage',
  SEIHomePage = 'SEIHomePage',
  IACMCostEstimation = 'IACMCostEstimation',
  AllModePipelineStudio = 'AllModePipelineStudio',
  CCMSettingsPage = 'CCMSettingsPage',
  FeatureFlagsProxy = 'FeatureFlagsProxy',
  Notifications = 'Notifications'
}
