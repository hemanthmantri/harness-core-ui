export default {
  pipelines: 'Pipelines',
  pipeline: 'Pipeline',
  description: 'Description',
  stages: 'Stages',
  activity: 'ACTIVITY',
  errors: 'ERRORS',
  addPipeline: 'Add Pipeline',
  runPipeline: 'Run Pipeline',
  pipelineStudio: 'Pipeline Studio',
  delete: 'Delete',
  filterBy: 'Filter By',
  collaborators: 'Collaborators',
  admin: 'Admin',
  pipelineStarted: 'Pipeline Started SuccessFully',
  runPipelineFailed: 'Failed to run pipeline',
  tags: 'Tags',
  confirmDeleteTitle: 'Delete Pipeline',
  deleteButton: 'Delete',
  readyToRun: 'Ready To Run',
  cancel: 'Cancel',
  pipelineDeleted: (name: string) => `Pipeline ${name} deleted`,
  confirmDelete: (name: string) => `Are you sure want to delete pipeline ${name}`,
  searchByUser: 'Search by user, tags',
  aboutPipeline:
    'Pipelines define your release process using multiple Workflows and approvals in sequential and/or parallel stages.'
}
