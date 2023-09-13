/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* Generated by restful-react */

import React from 'react'
import { Get, GetProps, useGet, UseGetProps, Mutate, MutateProps, useMutate, UseMutateProps } from 'restful-react'

import { getConfig } from '../config'
export const SPEC_VERSION = '0.0.0'
export type EnumAccessGrant = number

export type EnumCheckPayloadKind = 'external'

export type EnumCheckStatus = 'error' | 'failure' | 'pending' | 'running' | 'success'

export type EnumContentEncodingType = 'base64' | 'utf8'

export type EnumMembershipRole = 'contributor' | 'executor' | 'reader' | 'space_owner'

export type EnumMergeCheckStatus = string

export type EnumMergeMethod = 'merge' | 'squash' | 'rebase'

export type EnumParentResourceType = 'space' | 'repo'

export type EnumPathTargetType = string

export type EnumPrincipalType = 'service' | 'serviceaccount' | 'user'

export type EnumPullReqActivityKind = 'change-comment' | 'comment' | 'system'

export type EnumPullReqActivityType =
  | 'branch-delete'
  | 'branch-update'
  | 'code-comment'
  | 'comment'
  | 'merge'
  | 'review-submit'
  | 'state-change'
  | 'title-change'

export type EnumPullReqCommentStatus = 'active' | 'resolved'

export type EnumPullReqReviewDecision = 'approved' | 'changereq' | 'pending' | 'reviewed'

export type EnumPullReqReviewerType = 'assigned' | 'requested' | 'self_assigned'

export type EnumPullReqState = 'closed' | 'merged' | 'open'

export type EnumTokenType = string

export type EnumWebhookExecutionResult = 'fatal_error' | 'retriable_error' | 'success' | null

export type EnumWebhookParent = 'repo' | 'space'

export type EnumWebhookTrigger =
  | 'branch_created'
  | 'branch_deleted'
  | 'branch_updated'
  | 'pullreq_branch_updated'
  | 'pullreq_created'
  | 'pullreq_reopened'
  | 'tag_created'
  | 'tag_deleted'
  | 'tag_updated'

export interface GitrpcBlamePart {
  commit?: GitrpcCommit
  lines?: string[] | null
}

export type GitrpcCommit = {
  author?: GitrpcSignature
  committer?: GitrpcSignature
  message?: string
  sha?: string
  title?: string
} | null

export type GitrpcFileAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'MOVE'

export interface GitrpcIdentity {
  email?: string
  name?: string
}

export interface GitrpcSignature {
  identity?: GitrpcIdentity
  when?: string
}

export interface OpenapiAdminUsersCreateRequest {
  display_name?: string
  email?: string
  password?: string
  uid?: string
}

export interface OpenapiAdminUsersUpdateRequest {
  display_name?: string | null
  email?: string | null
  password?: string | null
}

export interface OpenapiCalculateCommitDivergenceRequest {
  max_count?: number
  requests?: RepoCommitDivergenceRequest[] | null
}

export interface OpenapiCommentCreatePullReqRequest {
  line_end?: number
  line_end_new?: boolean
  line_start?: number
  line_start_new?: boolean
  parent_id?: number
  path?: string
  source_commit_sha?: string
  target_commit_sha?: string
  text?: string
}

export interface OpenapiCommentStatusPullReqRequest {
  status?: EnumPullReqCommentStatus
}

export interface OpenapiCommentUpdatePullReqRequest {
  text?: string
}

export interface OpenapiCommitFilesRequest {
  actions?: RepoCommitFileAction[] | null
  branch?: string
  message?: string
  new_branch?: string
  title?: string
}

export type OpenapiContent = RepoFileContent | OpenapiDirContent | RepoSymlinkContent | RepoSubmoduleContent

export interface OpenapiContentInfo {
  latest_commit?: TypesCommit
  name?: string
  path?: string
  sha?: string
  type?: OpenapiContentType
}

export type OpenapiContentType = 'file' | 'dir' | 'symlink' | 'submodule'

export interface OpenapiCreateBranchRequest {
  name?: string
  target?: string | null
}

export interface OpenapiCreatePathRequest {
  path?: string
}

export interface OpenapiCreatePullReqRequest {
  description?: string
  is_draft?: boolean
  source_branch?: string
  source_repo_ref?: string
  target_branch?: string
  title?: string
}

export interface OpenapiCreateRepoPathRequest {
  path?: string
}

export interface OpenapiCreateRepositoryRequest {
  default_branch?: string
  description?: string
  fork_id?: number
  git_ignore?: string
  is_public?: boolean
  license?: string
  parent_ref?: string
  readme?: boolean
  uid?: string
}

export interface OpenapiCreateSpaceRequest {
  description?: string
  is_public?: boolean
  parent_ref?: string
  uid?: string
}

export interface OpenapiCreateTagRequest {
  message?: string | null
  name?: string
  target?: string | null
}

export interface OpenapiCreateTokenRequest {
  grants?: EnumAccessGrant
  lifetime?: TimeDuration
  uid?: string
}

export interface OpenapiCreateWebhookRequest {
  description?: string
  display_name?: string
  enabled?: boolean
  insecure?: boolean
  secret?: string
  triggers?: EnumWebhookTrigger[] | null
  url?: string
}

export interface OpenapiDirContent {
  entries?: OpenapiContentInfo[] | null
}

export interface OpenapiGetContentOutput {
  content?: OpenapiContent
  latest_commit?: TypesCommit
  name?: string
  path?: string
  sha?: string
  type?: OpenapiContentType
}

export interface OpenapiLoginRequest {
  login_identifier?: string
  password?: string
}

export interface OpenapiMergePullReq {
  method?: EnumMergeMethod
  source_sha?: string
}

export interface OpenapiMoveRepoRequest {
  keep_as_alias?: boolean
  parent_ref?: string | null
  uid?: string | null
}

export interface OpenapiMoveSpaceRequest {
  keep_as_alias?: boolean
  parent_ref?: string | null
  uid?: string | null
}

export interface OpenapiRegisterRequest {
  display_name?: string
  email?: string
  password?: string
  uid?: string
}

export interface OpenapiReportStatusCheckResultRequest {
  check_uid?: string
  link?: string
  payload?: TypesCheckPayload
  status?: EnumCheckStatus
  summary?: string
}

export interface OpenapiReviewSubmitPullReqRequest {
  commit_sha?: string
  decision?: EnumPullReqReviewDecision
  message?: string
}

export interface OpenapiReviewerAddPullReqRequest {
  reviewer_id?: number
}

export interface OpenapiStatePullReqRequest {
  is_draft?: boolean
  message?: string
  state?: EnumPullReqState
}

export interface OpenapiUpdateAdminRequest {
  admin?: boolean
}

export interface OpenapiUpdatePullReqRequest {
  description?: string
  title?: string
}

export interface OpenapiUpdateRepoRequest {
  description?: string | null
  is_public?: boolean | null
}

export interface OpenapiUpdateSpaceRequest {
  description?: string | null
  is_public?: boolean | null
}

export interface OpenapiUpdateWebhookRequest {
  description?: string | null
  display_name?: string | null
  enabled?: boolean | null
  insecure?: boolean | null
  secret?: string | null
  triggers?: EnumWebhookTrigger[] | null
  url?: string | null
}

export interface OpenapiWebhookType {
  created?: number
  created_by?: number
  description?: string
  display_name?: string
  enabled?: boolean
  has_secret?: boolean
  id?: number
  insecure?: boolean
  latest_execution_result?: EnumWebhookExecutionResult
  parent_id?: number
  parent_type?: EnumWebhookParent
  triggers?: EnumWebhookTrigger[] | null
  updated?: number
  url?: string
  version?: number
}

export interface RepoBranch {
  commit?: TypesCommit
  name?: string
  sha?: string
}

export interface RepoCommitDivergence {
  ahead?: number
  behind?: number
}

export interface RepoCommitDivergenceRequest {
  from?: string
  to?: string
}

export interface RepoCommitFileAction {
  action?: GitrpcFileAction
  encoding?: EnumContentEncodingType
  path?: string
  payload?: string
  sha?: string
}

export interface RepoCommitFilesResponse {
  commit_id?: string
}

export interface RepoCommitTag {
  commit?: TypesCommit
  is_annotated?: boolean
  message?: string
  name?: string
  sha?: string
  tagger?: TypesSignature
  title?: string
}

// tslint:disable-next-line:no-empty-interface
export interface RepoContent {}

export interface RepoContentInfo {
  latest_commit?: TypesCommit
  name?: string
  path?: string
  sha?: string
  type?: RepoContentType
}

export type RepoContentType = string

export interface RepoFileContent {
  data?: string
  data_size?: number
  encoding?: EnumContentEncodingType
  size?: number
}

export interface RepoMergeCheck {
  conflict_files?: string[]
  mergeable?: boolean
}

export interface RepoSubmoduleContent {
  commit_sha?: string
  url?: string
}

export interface RepoSymlinkContent {
  size?: number
  target?: string
}

export type TimeDuration = number

export interface TypesCheck {
  created?: number
  id?: number
  link?: string
  metadata?: {}
  payload?: TypesCheckPayload
  reported_by?: TypesPrincipalInfo
  status?: EnumCheckStatus
  summary?: string
  uid?: string
  updated?: number
}

export interface TypesCheckPayload {
  data?: {}
  kind?: EnumCheckPayloadKind
  version?: string
}

export interface TypesCodeCommentFields {
  line_new?: number
  line_old?: number
  merge_base_sha?: string
  outdated?: boolean
  path?: string
  source_sha?: string
  span_new?: number
  span_old?: number
}

export interface TypesCommit {
  author?: TypesSignature
  committer?: TypesSignature
  message?: string
  sha?: string
  title?: string
}

export interface TypesDiffStats {
  commits?: number
  files_changed?: number
}

export interface TypesIdentity {
  email?: string
  name?: string
}

export interface TypesListCommitResponse {
  commits?: TypesCommit[] | null
  rename_details?: TypesRenameDetails[] | null
}

export interface TypesMembership {
  added_by?: TypesPrincipalInfo
  created?: number
  principal?: TypesPrincipalInfo
  role?: EnumMembershipRole
  updated?: number
}

export interface TypesPath {
  created?: number
  created_by?: number
  id?: number
  is_primary?: boolean
  target_id?: number
  target_type?: EnumPathTargetType
  updated?: number
  value?: string
}

export interface TypesPrincipalInfo {
  created?: number
  display_name?: string
  email?: string
  id?: number
  type?: EnumPrincipalType
  uid?: string
  updated?: number
}

export interface TypesPullReq {
  author?: TypesPrincipalInfo
  created?: number
  description?: string
  edited?: number
  is_draft?: boolean
  merge_base_sha?: string
  merge_check_status?: EnumMergeCheckStatus
  merge_conflicts?: string | null
  merge_method?: EnumMergeMethod
  merge_sha?: string | null
  merge_target_sha?: string | null
  merged?: number | null
  merger?: TypesPrincipalInfo
  number?: number
  source_branch?: string
  source_repo_id?: number
  source_sha?: string
  state?: EnumPullReqState
  stats?: TypesPullReqStats
  target_branch?: string
  target_repo_id?: number
  title?: string
}

export interface TypesPullReqActivity {
  author?: TypesPrincipalInfo
  code_comment?: TypesCodeCommentFields
  created?: number
  deleted?: number | null
  edited?: number
  id?: number
  kind?: EnumPullReqActivityKind
  metadata?: { [key: string]: any } | null
  order?: number
  parent_id?: number | null
  payload?: {}
  pullreq_id?: number
  repo_id?: number
  resolved?: number | null
  resolver?: TypesPrincipalInfo
  sub_order?: number
  text?: string
  type?: EnumPullReqActivityType
}

export interface TypesPullReqReviewer {
  added_by?: TypesPrincipalInfo
  created?: number
  latest_review_id?: number | null
  review_decision?: EnumPullReqReviewDecision
  reviewer?: TypesPrincipalInfo
  sha?: string
  type?: EnumPullReqReviewerType
  updated?: number
}

export interface TypesPullReqStats {
  commits?: number
  conversations?: number
  files_changed?: number
  unresolved_count?: number
}

export interface TypesRenameDetails {
  commit_sha_after?: string
  commit_sha_before?: string
  new_path?: string
  old_path?: string
}

export interface TypesRepository {
  created?: number
  created_by?: number
  default_branch?: string
  description?: string
  fork_id?: number
  git_url?: string
  id?: number
  is_public?: boolean
  num_closed_pulls?: number
  num_forks?: number
  num_merged_pulls?: number
  num_open_pulls?: number
  num_pulls?: number
  parent_id?: number
  path?: string
  uid?: string
  updated?: number
}

export interface TypesServiceAccount {
  admin?: boolean
  blocked?: boolean
  created?: number
  display_name?: string
  email?: string
  parent_id?: number
  parent_type?: EnumParentResourceType
  uid?: string
  updated?: number
}

export interface TypesSignature {
  identity?: TypesIdentity
  when?: string
}

export interface TypesSpace {
  created?: number
  created_by?: number
  description?: string
  id?: number
  is_public?: boolean
  parent_id?: number
  path?: string
  uid?: string
  updated?: number
}

export interface TypesToken {
  created_by?: number
  expires_at?: number
  grants?: EnumAccessGrant
  issued_at?: number
  principal_id?: number
  type?: EnumTokenType
  uid?: string
}

export interface TypesTokenResponse {
  access_token?: string
  token?: TypesToken
}

export interface TypesUser {
  admin?: boolean
  blocked?: boolean
  created?: number
  display_name?: string
  email?: string
  uid?: string
  updated?: number
}

export interface TypesWebhookExecution {
  created?: number
  duration?: number
  error?: string
  id?: number
  request?: TypesWebhookExecutionRequest
  response?: TypesWebhookExecutionResponse
  result?: EnumWebhookExecutionResult
  retrigger_of?: number | null
  retriggerable?: boolean
  trigger_type?: EnumWebhookTrigger
  webhook_id?: number
}

export interface TypesWebhookExecutionRequest {
  body?: string
  headers?: string
  url?: string
}

export interface TypesWebhookExecutionResponse {
  body?: string
  headers?: string
  status?: string
  status_code?: number
}

export interface UserUpdateInput {
  display_name?: string | null
  email?: string | null
  password?: string | null
}

export interface UsererrorError {
  message?: string
  values?: { [key: string]: any }
}

export interface CreateRepositoryQueryParams {
  /**
   * path of parent space (Not needed in standalone).
   */
  space_path?: string
}

export type CreateRepositoryProps = Omit<
  MutateProps<TypesRepository, UsererrorError, CreateRepositoryQueryParams, OpenapiCreateRepositoryRequest, void>,
  'path' | 'verb'
>

export const CreateRepository = (props: CreateRepositoryProps) => (
  <Mutate<TypesRepository, UsererrorError, CreateRepositoryQueryParams, OpenapiCreateRepositoryRequest, void>
    verb="POST"
    path={`/repos`}
    base={getConfig('code/api/v1')}
    {...props}
  />
)

export type UseCreateRepositoryProps = Omit<
  UseMutateProps<TypesRepository, UsererrorError, CreateRepositoryQueryParams, OpenapiCreateRepositoryRequest, void>,
  'path' | 'verb'
>

export const useCreateRepository = (props: UseCreateRepositoryProps) =>
  useMutate<TypesRepository, UsererrorError, CreateRepositoryQueryParams, OpenapiCreateRepositoryRequest, void>(
    'POST',
    `/repos`,
    { base: getConfig('code/api/v1'), ...props }
  )

export interface ListReposQueryParams {
  /**
   * The substring which is used to filter the repositories by their path name.
   */
  query?: string
  /**
   * The data by which the repositories are sorted.
   */
  sort?: 'uid' | 'path' | 'created' | 'updated'
  /**
   * The order of the output.
   */
  order?: 'asc' | 'desc'
  /**
   * The page to return.
   */
  page?: number
  /**
   * The maximum number of results to return.
   */
  limit?: number
}

export interface ListReposPathParams {
  space_ref: string
}

export type ListReposProps = Omit<
  GetProps<TypesRepository[], UsererrorError, ListReposQueryParams, ListReposPathParams>,
  'path'
> &
  ListReposPathParams

export const ListRepos = ({ space_ref, ...props }: ListReposProps) => (
  <Get<TypesRepository[], UsererrorError, ListReposQueryParams, ListReposPathParams>
    path={`/spaces/${space_ref}/repos`}
    base={getConfig('code/api/v1')}
    {...props}
  />
)

export type UseListReposProps = Omit<
  UseGetProps<TypesRepository[], UsererrorError, ListReposQueryParams, ListReposPathParams>,
  'path'
> &
  ListReposPathParams

export const useListRepos = ({ space_ref, ...props }: UseListReposProps) =>
  useGet<TypesRepository[], UsererrorError, ListReposQueryParams, ListReposPathParams>(
    (paramsInPath: ListReposPathParams) => `/spaces/${paramsInPath.space_ref}/repos`,
    { base: getConfig('code/api/v1'), pathParams: { space_ref }, ...props }
  )
