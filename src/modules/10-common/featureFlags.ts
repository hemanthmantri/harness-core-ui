/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export enum FeatureFlag {
  CVNG_ENABLED = 'CVNG_ENABLED',
  SEI_ENABLED = 'SEI_ENABLED',
  CDS_ASG_V2 = 'CDS_ASG_V2',
  CDS_NG_K8S_SERVICE_RELEASE_NAME = 'CDS_NG_K8S_SERVICE_RELEASE_NAME',
  CDS_BASIC_ASG = 'CDS_BASIC_ASG',
  CDS_OCI_HELM_ECR_CONFIG_SUPPORT_NG = 'CDS_OCI_HELM_ECR_CONFIG_SUPPORT_NG',
  CODE_ENABLED = 'CODE_ENABLED',
  SSCA_ENABLED = 'SSCA_ENABLED',
  OPA_RBAC_FEATURE = 'OPA_RBAC_FEATURE',
  CDS_PCF_SUPPORT_BG_WITH_2_APPS_NG = 'CDS_PCF_SUPPORT_BG_WITH_2_APPS_NG',
  OPA_AIDA_WIDGET = 'OPA_AIDA_WIDGET',
  SSCA_SLSA_COMPLIANCE = 'SSCA_SLSA_COMPLIANCE',
  NG_DASHBOARDS = 'NG_DASHBOARDS',
  CUSTOM_DASHBOARD_V2 = 'CUSTOM_DASHBOARD_V2',
  CI_TI_DASHBOARDS_ENABLED = 'CI_TI_DASHBOARDS_ENABLED',
  TI_CALLGRAPH = 'TI_CALLGRAPH',
  NG_LICENSES_ENABLED = 'NG_LICENSES_ENABLED',
  FF_GITSYNC = 'FF_GITSYNC',
  CDS_ASG_SHIFT_TRAFFIC_STEP_NG = 'CDS_ASG_SHIFT_TRAFFIC_STEP_NG',
  FFM_3959_FF_MFE_Environment_Detail = 'FFM_3959_FF_MFE_Environment_Detail',
  FFM_5939_MFE_TARGET_GROUPS_LISTING = 'FFM_5939_MFE_TARGET_GROUPS_LISTING',
  FFM_6666_FF_MFE_Target_Group_Detail = 'FFM_6666_FF_MFE_Target_Group_Detail',
  FFM_5256_FF_MFE_Environment_Listing = 'FFM_5256_FF_MFE_Environment_Listing',
  FFM_5951_FF_MFE_Targets_Listing = 'FFM_5951_FF_MFE_Targets_Listing',
  FFM_6665_FF_MFE_Target_Detail = 'FFM_6665_FF_MFE_Target_Detail',
  FFM_6800_FF_MFE_ONBOARDING = 'FFM_6800_FF_MFE_ONBOARDING',
  FFM_7127_FF_MFE_ONBOARDING_DETAIL = 'FFM_7127_FF_MFE_ONBOARDING_DETAIL',
  FFM_7258_INTERCOM_VIDEO_LINKS = 'FFM_7258_INTERCOM_VIDEO_LINKS',
  FFM_8261_EXPRESSIONS_IN_PIPELINE_STEP = 'FFM_8261_EXPRESSIONS_IN_PIPELINE_STEP',
  FFM_8344_FLAG_CLEANUP = 'FFM_8344_FLAG_CLEANUP',
  FFM_8184_FEATURE_FLAG_TAGGING = 'FFM_8184_FEATURE_FLAG_TAGGING',
  FFM_9497_PROXY_KEY_MANAGEMENT = 'FFM_9497_PROXY_KEY_MANAGEMENT',
  FEATURE_ENFORCEMENT_ENABLED = 'FEATURE_ENFORCEMENT_ENABLED',
  FREE_PLAN_ENFORCEMENT_ENABLED = 'FREE_PLAN_ENFORCEMENT_ENABLED',
  VIEW_USAGE_ENABLED = 'VIEW_USAGE_ENABLED',
  CI_VM_INFRASTRUCTURE = 'CI_VM_INFRASTRUCTURE',
  FFM_1859 = 'FFM_1859', // development only flag for epic https://harness.atlassian.net/browse/FFM-1638,
  TEST_INTELLIGENCE = 'TEST_INTELLIGENCE',
  CCM_DEV_TEST = 'CCM_DEV_TEST',
  CCM_SUSTAINABILITY = 'CCM_SUSTAINABILITY',
  NG_FILE_STORE = 'NG_FILE_STORE',
  NG_SVC_ENV_REDESIGN = 'NG_SVC_ENV_REDESIGN',
  CVNG_TEMPLATE_VERIFY_STEP = 'CVNG_TEMPLATE_VERIFY_STEP',
  FFM_3938_STALE_FLAGS_ACTIVE_CARD_HIDE_SHOW = 'FFM_3938_STALE_FLAGS_ACTIVE_CARD_HIDE_SHOW',
  TI_DOTNET = 'TI_DOTNET',
  CVNG_TEMPLATE_MONITORED_SERVICE = 'CVNG_TEMPLATE_MONITORED_SERVICE',
  ACCOUNT_BASIC_ROLE = 'ACCOUNT_BASIC_ROLE',
  SRM_LICENSE_ENABLED = 'SRM_LICENSE_ENABLED',
  JDK11_UPGRADE_BANNER = 'JDK11_UPGRADE_BANNER',
  CVNG_SPLUNK_METRICS = 'CVNG_SPLUNK_METRICS',
  FFM_2134_FF_PIPELINES_TRIGGER = 'FFM_2134_FF_PIPELINES_TRIGGER',
  GITOPS_FLUX_FLAMINGO = 'GITOPS_FLUX_FLAMINGO',
  OPA_GIT_GOVERNANCE = 'OPA_GIT_GOVERNANCE',
  DISABLE_TEMPLATE_SCHEMA_VALIDATION = 'DISABLE_TEMPLATE_SCHEMA_VALIDATION',
  HOSTED_BUILDS = 'HOSTED_BUILDS',
  CCM_COMMORCH = 'CCM_COMMORCH',
  CD_TRIGGERS_REFACTOR = 'CD_TRIGGERS_REFACTOR',
  CD_GIT_WEBHOOK_POLLING = 'CD_GIT_WEBHOOK_POLLING',
  CIE_HOSTED_VMS = 'CIE_HOSTED_VMS',
  ALLOW_USER_TYPE_FIELDS_JIRA = 'ALLOW_USER_TYPE_FIELDS_JIRA',
  AUTO_FREE_MODULE_LICENSE = 'AUTO_FREE_MODULE_LICENSE',
  CREATE_DEFAULT_PROJECT = 'CREATE_DEFAULT_PROJECT',
  AZURE_WEBAPP_NG_S3_ARTIFACTS = 'AZURE_WEBAPP_NG_S3_ARTIFACTS',
  SRM_ET_RESOLVED_EVENTS = 'SRM_ET_RESOLVED_EVENTS',
  SRM_ET_CRITICAL_EVENTS = 'SRM_ET_CRITICAL_EVENTS',
  SRM_ET_JIRA_INTEGRATION = 'SRM_ET_JIRA_INTEGRATION',
  SRM_CODE_ERROR_NOTIFICATIONS = 'SRM_CODE_ERROR_NOTIFICATIONS',
  CET_EVENTS_CHART = 'CET_EVENTS_CHART',
  CET_CD_INTEGRATION = 'CET_CD_INTEGRATION',
  CET_PLATFORM_MONITORED_SERVICE = 'CET_PLATFORM_MONITORED_SERVICE',
  CET_AGENT_WIZARD = 'CET_AGENT_WIZARD',
  CET_SAVED_SEARCH = 'CET_SAVED_SEARCH',
  CET_SAVED_SEARCH_NOTIFICATION = 'CET_SAVED_SEARCH_NOTIFICATION',
  CET_SINGLE_NOTIFICATION = 'CET_SINGLE_NOTIFICATION',
  SRM_ENABLE_VERIFY_STEP_LONG_DURATION = 'SRM_ENABLE_VERIFY_STEP_LONG_DURATION',
  CI_DOCKER_INFRASTRUCTURE = 'CI_DOCKER_INFRASTRUCTURE',
  ENABLE_VERIFY_STEP_LONG_DURATION = 'ENABLE_VERIFY_STEP_LONG_DURATION',
  TI_MFE_ENABLED = 'TI_MFE_ENABLED',
  SRM_SLO_ANNOTATIONS = 'SRM_SLO_ANNOTATIONS',
  CCM_CLUSTER_ORCH = 'CCM_CLUSTER_ORCH',
  CCM_MSP = 'CCM_MSP',
  LANDING_OVERVIEW_PAGE_V2 = 'LANDING_OVERVIEW_PAGE_V2',
  CCM_CURRENCY_PREFERENCES = 'CCM_CURRENCY_PREFERENCES',
  CVNG_LICENSE_ENFORCEMENT = 'CVNG_LICENSE_ENFORCEMENT',
  CDS_ASG_NG = 'CDS_ASG_NG',
  BAMBOO_ARTIFACT_NG = 'BAMBOO_ARTIFACT_NG',
  CDS_ARTIFACTORY_REPOSITORY_URL_MANDATORY = 'CDS_ARTIFACTORY_REPOSITORY_URL_MANDATORY',
  NG_K8_COMMAND_FLAGS = 'NG_K8_COMMAND_FLAGS',
  IACM_ENABLED = 'IACM_ENABLED',
  CD_NG_DYNAMIC_PROVISIONING_ENV_V2 = 'CD_NG_DYNAMIC_PROVISIONING_ENV_V2',
  CD_TRIGGER_V2 = 'CD_TRIGGER_V2',
  CDS_TERRAFORM_SUPPORT_OPTIONAL_VAR_FILE_PATHS_NG = 'CDS_TERRAFORM_SUPPORT_OPTIONAL_VAR_FILE_PATHS_NG',
  CIE_HOSTED_VMS_WINDOWS = 'CIE_HOSTED_VMS_WINDOWS',
  SPG_MODULE_VERSION_INFO = 'SPG_MODULE_VERSION_INFO',
  PIE_PIPELINE_SETTINGS_ENFORCEMENT_LIMIT = 'PIE_PIPELINE_SETTINGS_ENFORCEMENT_LIMIT',
  ENABLE_K8_BUILDS = 'ENABLE_K8_BUILDS',
  CD_TRIGGER_CATALOG_API_ENABLED = 'CD_TRIGGER_CATALOG_API_ENABLED',
  FF_FLAG_SYNC_THROUGH_GITEX_ENABLED = 'FF_FLAG_SYNC_THROUGH_GITEX_ENABLED',
  STO_ALL_ISSUES_PAGE = 'STO_ALL_ISSUES_PAGE',
  STO_BASELINE_REGEX = 'STO_BASELINE_REGEX',
  STO_JIRA_INTEGRATION = 'STO_JIRA_INTEGRATION',
  STO_STEPS_TEST_MODE = 'STO_STEPS_TEST_MODE',
  STO_STEP_PALETTE_AQUASEC = 'STO_STEP_PALETTE_AQUASEC',
  STO_STEP_PALETTE_BURP_ENTERPRISE = 'STO_STEP_PALETTE_BURP_ENTERPRISE',
  STO_STEP_PALETTE_CODEQL = 'STO_STEP_PALETTE_CODEQL',
  STO_STEP_PALETTE_COVERITY = 'STO_STEP_PALETTE_COVERITY',
  STO_STEP_PALETTE_FOSSA = 'STO_STEP_PALETTE_FOSSA',
  STO_STEP_PALETTE_GIT_LEAKS = 'STO_STEP_PALETTE_GIT_LEAKS',
  STO_STEP_PALETTE_SEMGREP = 'STO_STEP_PALETTE_SEMGREP',
  STO_STEP_PALETTE_SYSDIG = 'STO_STEP_PALETTE_SYSDIG',
  STO_TIMEBOUND_EXEMPTIONS = 'STO_TIMEBOUND_EXEMPTIONS',
  CI_YAML_VERSIONING = 'CI_YAML_VERSIONING',
  CI_REMOTE_DEBUG = 'CI_REMOTE_DEBUG',
  IDP_ENABLED = 'IDP_ENABLED',
  CDC_SERVICE_DASHBOARD_REVAMP_NG = 'CDC_SERVICE_DASHBOARD_REVAMP_NG',
  PL_NEW_PAGE_SIZE = 'PL_NEW_PAGE_SIZE',
  FFM_6683_ALL_ENVIRONMENTS_FLAGS = 'FFM_6683_ALL_ENVIRONMENTS_FLAGS',
  FFM_4737_JIRA_INTEGRATION = 'FFM_4737_JIRA_INTEGRATION',
  CDS_NG_UPDATE_MULTIPLE_SNOW_CHANGE_REQUEST = 'CDS_NG_UPDATE_MULTIPLE_SNOW_CHANGE_REQUEST',
  CHAOS_LINUX_ENABLED = 'CHAOS_LINUX_ENABLED',
  CHAOS_PROBE_ENABLED = 'CHAOS_PROBE_ENABLED',
  CDS_V1_EOL_BANNER = 'CDS_V1_EOL_BANNER',
  PLG_ENABLE_CROSS_GENERATION_ACCESS = 'PLG_ENABLE_CROSS_GENERATION_ACCESS',
  SRM_LOG_FEEDBACK_ENABLE_UI = 'SRM_LOG_FEEDBACK_ENABLE_UI',
  SRM_ENABLE_REQUEST_SLO = 'SRM_ENABLE_REQUEST_SLO',
  CD_ONBOARDING_HELP_ENABLED = 'CD_ONBOARDING_HELP_ENABLED',
  PLG_NO_INTENT_EXPOSURE_ENABLED = 'PLG_NO_INTENT_EXPOSURE_ENABLED',
  PLG_NO_INTENT_AB = 'PLG_NO_INTENT_AB',
  CDS_AZURE_WEBAPP_NG_LISTING_APP_NAMES_AND_SLOTS = 'CDS_AZURE_WEBAPP_NG_LISTING_APP_NAMES_AND_SLOTS',
  PL_IP_ALLOWLIST_NG = 'PL_IP_ALLOWLIST_NG',
  PLG_SERVICE_DELEGATE_EXPOSURE_ENABLED = 'PLG_SERVICE_DELEGATE_EXPOSURE_ENABLED',
  PLG_SERVICE_DELEGATE_AB = 'PLG_SERVICE_DELEGATE_AB',
  NG_EXPRESSIONS_NEW_INPUT_ELEMENT = 'NG_EXPRESSIONS_NEW_INPUT_ELEMENT',
  SRM_ENABLE_JIRA_INTEGRATION = 'SRM_ENABLE_JIRA_INTEGRATION',
  CHAOS_DASHBOARD_ENABLED = 'CHAOS_DASHBOARD_ENABLED',
  BUILD_CREDITS_VIEW = 'BUILD_CREDITS_VIEW',
  PIE_GITX_OAUTH = 'PIE_GITX_OAUTH',
  USE_OLD_GIT_SYNC = 'USE_OLD_GIT_SYNC',
  CDS_K8S_SERVICE_HOOKS_NG = 'CDS_K8S_SERVICE_HOOKS_NG',
  POST_PROD_ROLLBACK = 'POST_PROD_ROLLBACK',
  CDS_HTTP_STEP_NG_CERTIFICATE = 'CDS_HTTP_STEP_NG_CERTIFICATE',
  PIE_MULTISELECT_AND_COMMA_IN_ALLOWED_VALUES = 'PIE_MULTISELECT_AND_COMMA_IN_ALLOWED_VALUES',
  PL_ENABLE_MULTIPLE_IDP_SUPPORT = 'PL_ENABLE_MULTIPLE_IDP_SUPPORT',
  CDB_MFE_ENABLED = 'CDB_MFE_ENABLED',
  CDB_AIDA_WIDGET = 'CDB_AIDA_WIDGET',
  CDP_AWS_SAM = 'CDP_AWS_SAM',
  PLG_CD_GET_STARTED_AB = 'PLG_CD_GET_STARTED_AB',
  PLG_GET_STARTED_EXPOSURE_ENABLED = 'PLG_GET_STARTED_EXPOSURE_ENABLED',
  CUSTOM_DASHBOARDS_NEXT = 'CUSTOM_DASHBOARDS_NEXT',
  CDS_SERVICE_OVERRIDES_2_0 = 'CDS_SERVICE_OVERRIDES_2_0',
  SRM_ENABLE_GRAFANA_LOKI_LOGS = 'SRM_ENABLE_GRAFANA_LOKI_LOGS',
  CI_PYTHON_TI = 'CI_PYTHON_TI',
  CI_RUBY_TI = 'CI_RUBY_TI',
  CDS_NG_TRIGGER_MULTI_ARTIFACTS = 'CDS_NG_TRIGGER_MULTI_ARTIFACTS',
  CDS_SUPPORT_SERVICE_INPUTS_AS_EXECUTION_INPUTS = 'CDS_SUPPORT_SERVICE_INPUTS_AS_EXECUTION_INPUTS',
  CI_ENABLE_DLC = 'CI_ENABLE_DLC',
  SRM_MICRO_FRONTEND = 'SRM_MICRO_FRONTEND',
  SRM_ENABLE_BASELINE_BASED_VERIFICATION = 'SRM_ENABLE_BASELINE_BASED_VERIFICATION',
  PL_DISCOVERY_ENABLE = 'PL_DISCOVERY_ENABLE',
  PL_ENABLE_JIT_USER_PROVISION = 'PL_ENABLE_JIT_USER_PROVISION',
  CDS_PIPELINE_STUDIO_UPGRADES = 'CDS_PIPELINE_STUDIO_UPGRADES',
  IDP_ENABLE_EDIT_HARNESS_CI_CD_PLUGIN = 'IDP_ENABLE_EDIT_HARNESS_CI_CD_PLUGIN',
  CDS_AUTO_APPROVAL = 'CDS_AUTO_APPROVAL',
  CDS_CONTAINER_STEP_GROUP = 'CDS_CONTAINER_STEP_GROUP',
  PL_FAVORITES = 'PL_FAVORITES',
  PIE_RETRY_STEP_GROUP = 'PIE_RETRY_STEP_GROUP',
  PIE_STATIC_YAML_SCHEMA = 'PIE_STATIC_YAML_SCHEMA',
  PL_HELM2_DELEGATE_BANNER = 'PL_HELM2_DELEGATE_BANNER',
  CI_AI_ENHANCED_REMEDIATIONS = 'CI_AI_ENHANCED_REMEDIATIONS',
  CHAOS_SECURITY_GOVERNANCE = 'CHAOS_SECURITY_GOVERNANCE',
  SRM_ENABLE_SIMPLE_VERIFICATION = 'SRM_ENABLE_SIMPLE_VERIFICATION',
  PL_AI_SUPPORT_CHATBOT = 'PL_AI_SUPPORT_CHATBOT',
  CCM_ENABLE_AZURE_CLOUD_ASSET_GOVERNANCE_UI = 'CCM_ENABLE_AZURE_CLOUD_ASSET_GOVERNANCE_UI',
  CDS_SERVERLESS_V2 = 'CDS_SERVERLESS_V2',
  CDS_HELM_FETCH_CHART_METADATA_NG = 'CDS_HELM_FETCH_CHART_METADATA_NG',
  CHAOS_IMAGE_REGISTRY_DEV = 'CHAOS_IMAGE_REGISTRY_DEV',
  CDS_MULTI_SERVICE_PROPAGATION = 'CDS_MULTI_SERVICE_PROPAGATION',
  CV_UI_DISPLAY_NODE_REGEX_FILTER = 'CV_UI_DISPLAY_NODE_REGEX_FILTER',
  SPG_LOG_SERVICE_ENABLE_DOWNLOAD_LOGS = 'SPG_LOG_SERVICE_ENABLE_DOWNLOAD_LOGS',
  PLG_CD_CLI_WIZARD_ENABLED = 'PLG_CD_CLI_WIZARD_ENABLED',
  CV_UI_DISPLAY_SHOULD_USE_NODES_FROM_CD_CHECKBOX = 'CV_UI_DISPLAY_SHOULD_USE_NODES_FROM_CD_CHECKBOX',
  CDS_HELM_MULTIPLE_MANIFEST_SUPPORT_NG = 'CDS_HELM_MULTIPLE_MANIFEST_SUPPORT_NG',
  CDS_ENABLE_LOAD_FROM_CACHE_FOR_RETRY_FORM = 'CDS_ENABLE_LOAD_FROM_CACHE_FOR_RETRY_FORM',
  CDS_GITHUB_APP_AUTHENTICATION = 'CDS_GITHUB_APP_AUTHENTICATION',
  SRM_ENABLE_AZURE_LOGS = 'SRM_ENABLE_AZURE_LOGS',
  PIE_ERROR_ENHANCEMENTS = 'PIE_ERROR_ENHANCEMENTS',
  CDS_SHELL_VARIABLES_EXPORT = 'CDS_SHELL_VARIABLES_EXPORT',
  CDS_MERGED_RUN_AND_RETRY_PIPELINE_COMPONENT = 'CDS_MERGED_RUN_AND_RETRY_PIPELINE_COMPONENT',
  FFM_8823_AIDA_SDK_CODE_SAMPLE = 'FFM_8823_AIDA_SDK_CODE_SAMPLE',
  CDS_NAV_2_0 = 'CDS_NAV_2_0',
  CDS_SERVICE_GITX = 'CDS_SERVICE_GITX',
  PIE_GIT_BI_DIRECTIONAL_SYNC = 'PIE_GIT_BI_DIRECTIONAL_SYNC',
  CDS_YAML_SIMPLIFICATION = 'CDS_YAML_SIMPLIFICATION',
  BOOKING_RECOMMENDATIONS = 'BOOKING_RECOMMENDATIONS',
  CCM_BUDGET_CASCADES = 'CCM_BUDGET_CASCADES',
  CCM_GOVERNANCE_GENAI_ENABLE = 'CCM_GOVERNANCE_GENAI_ENABLE',
  CCM_COMM_SETUP = 'CCM_COMM_SETUP',
  PL_EULA_ENABLED = 'PL_EULA_ENABLED',
  SRM_ENABLE_ANALYZE_DEPLOYMENT_STEP = 'SRM_ENABLE_ANALYZE_DEPLOYMENT_STEP',
  CDS_CUSTOM_STAGE_WITH_ENV_INFRA = 'CDS_CUSTOM_STAGE_WITH_ENV_INFRA',
  IDP_ENABLE_SCORECARDS = 'IDP_ENABLE_SCORECARDS',
  CDS_JIRA_UPDATE_SELECT_FIELDS_ENABLED = 'CDS_JIRA_UPDATE_SELECT_FIELDS_ENABLED',
  IACM_OPA_WORKSPACE_GOVERNANCE = 'IACM_OPA_WORKSPACE_GOVERNANCE',
  PL_ALLOW_TO_SET_PUBLIC_ACCESS = 'PL_ALLOW_TO_SET_PUBLIC_ACCESS',
  CDS_TERRAGRUNT_CLI_OPTIONS_NG = 'CDS_TERRAGRUNT_CLI_OPTIONS_NG',
  CHAOS_SANDBOX_ENVIRONMENT = 'CHAOS_SANDBOX_ENVIRONMENT',
  IACM_COST_ESTIMATION = 'IACM_COST_ESTIMATION',
  CDS_K8S_APPLY_MANIFEST_WITHOUT_SERVICE_NG = 'CDS_K8S_APPLY_MANIFEST_WITHOUT_SERVICE_NG',
  PL_GCP_OIDC_AUTHENTICATION = 'PL_GCP_OIDC_AUTHENTICATION',
  SRM_CV_UI_HEALTHSOURCE_SERVICE_INSTANCE_PREVIEW = 'SRM_CV_UI_HEALTHSOURCE_SERVICE_INSTANCE_PREVIEW',
  CDS_ECS_BASIC_DEPLOYMENT_STRATEGY = 'CDS_ECS_BASIC_DEPLOYMENT_STRATEGY',
  CDS_ENV_GITX = 'CDS_ENV_GITX',
  CDS_INFRA_GITX = 'CDS_INFRA_GITX',
  CDS_SERVICENOW_FETCH_FIELDS = 'CDS_SERVICENOW_FETCH_FIELDS',
  CDS_GET_SERVICENOW_STANDARD_TEMPLATE = 'CDS_GET_SERVICENOW_STANDARD_TEMPLATE',
  PL_CENTRAL_NOTIFICATIONS = 'PL_CENTRAL_NOTIFICATIONS',
  CDS_SCOPE_INFRA_TO_SERVICES = 'CDS_SCOPE_INFRA_TO_SERVICES',
  CDS_JIRA_TRANSITION_LIST = 'CDS_JIRA_TRANSITION_LIST',
  SRM_AUTO_DISCOVERY_ENABLE = 'SRM_AUTO_DISCOVERY_ENABLE',
  CHAOS_V2_ONBOARDING = 'CHAOS_V2_ONBOARDING',
  IDP_ENABLE_STAGE = 'IDP_ENABLE_STAGE',
  CV_UI_DISPLAY_FAIL_IF_ANY_CUSTOM_METRIC_IN_NO_ANALYSIS = 'CV_UI_DISPLAY_FAIL_IF_ANY_CUSTOM_METRIC_IN_NO_ANALYSIS',
  CI_CREDIT_CARD_ONBOARDING = 'CI_CREDIT_CARD_ONBOARDING',
  CDS_ENABLE_TAS_ARTIFACT_AS_MANIFEST_SOURCE_NG = 'CDS_ENABLE_TAS_ARTIFACT_AS_MANIFEST_SOURCE_NG',
  CDS_DISABLE_MAX_TIMEOUT_CONFIG = 'CDS_DISABLE_MAX_TIMEOUT_CONFIG',
  CDS_AIDA_SUPPORT_DEFLECTION = 'CDS_AIDA_SUPPORT_DEFLECTION'
}
