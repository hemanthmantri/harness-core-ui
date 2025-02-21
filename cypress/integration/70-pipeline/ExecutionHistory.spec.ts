/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  accountId,
  executionHistoryRoute,
  executionMetadata,
  orgIdentifier,
  pipelineExecutionCall,
  pipelineExecutionSummaryAPI,
  pipelineHealthCall,
  pipelineIdentifier,
  pipelineSummaryCallAPI,
  projectId
} from '../../support/70-pipeline/constants'

describe('Pipeline Execution History', () => {
  beforeEach(() => {
    cy.initializeRoute()
    cy.visit(`${executionHistoryRoute}?listview=true`, {
      timeout: 30000
    })
  })

  it('loads a pipeline with no executions', () => {
    cy.visitPageAssertion()
    cy.findByText('No deployments in your project').should('exist')
    cy.findByText('Run a Pipeline').should('exist').click()
    cy.get('.RunPipelineForm-module_footer_BfhlT2').within(() => {
      cy.findByText('Run Pipeline').should('exist')
      cy.findByText('Cancel').should('exist')
    })
    cy.get('.RunPipelineForm-module_crossIcon__wWY4s').click()
  })

  // Toolbar
  it('interacts with page subheader toolbar', () => {
    cy.intercept(pipelineExecutionSummaryAPI, {
      fixture: 'pipeline/api/executionHistory/executionSummary.json'
    }).as('executionSummary')
    cy.visitPageAssertion()
    // Check Run button in header
    cy.wait('@executionSummary')

    cy.get('.PageSubHeader--container')
      .should('be.visible')
      .within(() => {
        cy.findByText('Run').click()
      })
    cy.get('.RunPipelineForm-module_footer_BfhlT2').within(() => {
      cy.findByText('Run Pipeline').should('exist')
      cy.findByText('Cancel').should('exist')
    })
    cy.get('.RunPipelineForm-module_crossIcon__wWY4s').click()

    // Check my deployments
    cy.get('.PageSubHeader--container').within(() => {
      cy.findByText('My Deployments').click()
      cy.url().should('contain', 'myDeployments=true')
      cy.findByText('My Deployments').click()
      cy.url().should('not.contain', 'myDeployments=true')

      cy.wait('@executionSummary')
      cy.get('[data-testid="status-select"]').click()
    })

    cy.get('.bp3-menu').findByText('Aborted').click().url({ decode: true }).should('contain', 'status[0]=Aborted')
    cy.get('.bp3-menu').findByText('Failed').click().url({ decode: true }).should('contain', 'status[2]=Failed')
    cy.get('.MultiSelectDropDown--counter').should('contain', 2)
    cy.get('body').click(0, 0)

    // Check search
    cy.get('input[type=search]').type('test_search')
    cy.url().should('contain', 'searchTerm=test_search')
    cy.get('.ExpandingSearchInput--btnWrapper > .bp3-button').click()
    cy.get('input[type=search]').should('be.empty')
  })

  // Execution Health
  it('shows pipeline health metris', () => {
    // Fixtures
    cy.intercept('GET', pipelineHealthCall, {
      fixture: 'pipeline/api/executionHistory/pipelineHealth.json'
    }).as('pipelineHealth')

    cy.visitPageAssertion()
    cy.findByTestId('health-and-executions').within(() => {
      cy.findByText('Pipeline health').should('exist')
      cy.findByText('Last 30 days').click()
      cy.findByText('Last 60 days').click({ force: true })
      cy.findByText('Last 60 days').click()
      cy.findByText('Last 7 days').click({ force: true })

      cy.get('[class*=PipelineSummaryCards] > :nth-child(1)').within(() => {
        cy.findByText('Total Executions').should('exist')
        cy.get('[class*=CIDashboardSummaryCards-module_contentMainText]').should('contain.text', '5952')
      })

      cy.get('[class*=PipelineSummaryCards] > :nth-child(2)').within(() => {
        cy.findByText('Success Rate').should('exist')
        cy.get('[class*=CIDashboardSummaryCards-module_contentMainText]').should('contain.text', '0%')
      })

      cy.get('[class*=PipelineSummaryCards] > :nth-child(3)').within(() => {
        cy.findByText('Mean Duration').should('exist')
        cy.get('[class*=CIDashboardSummaryCards-module_contentMainText]').should('contain.text', '14s')
      })

      cy.get('[class*=PipelineSummaryCards] > :nth-child(4)').within(() => {
        cy.findByText('Median Duration').should('exist')
        cy.get('[class*=CIDashboardSummaryCards-module_contentMainText]').should('contain.text', '12s')
      })
    })
  })

  // Executions Chart
  it('shows pipeline executions chart', () => {
    // Fixtures
    cy.intercept(pipelineExecutionCall, {
      fixture: 'pipeline/api/executionHistory/pipelineExecution.json'
    }).as('pipelineExecution')

    cy.visitPageAssertion()
    cy.findByTestId('health-and-executions').within(() => {
      cy.findByText('Executions').should('exist')
      cy.findByText('# of executions').should('exist')
      cy.findByText('Date').should('exist')
      cy.findByText('Successful').should('exist')
      cy.findByText('Failed').should('exist')
      cy.findByText('Aborted').should('exist')
      cy.findByText('Expired').should('exist')

      cy.get('g[class^="highcharts-series highcharts-series-0"]', { timeout: 10000 }).should('be.visible')
    })
  })

  // Execution List
  it('loads successful, aborted and failed pipelines', () => {
    // Fixtures
    cy.intercept('GET', pipelineSummaryCallAPI, {
      fixture: 'pipeline/api/executionHistory/executionSummary.json'
    }).as('executionSummary')

    cy.intercept('POST', pipelineExecutionSummaryAPI, {
      fixture: 'pipeline/api/executionHistory/executionSummary.json'
    }).as('executionSummary')
    cy.visitPageAssertion()

    // Check various status
    // Success
    cy.get('[class*="ExecutionListTable-module"]').within(() => {
      cy.get('[class^="TableV2--row"]').should('have.length', 3)
    })
    cy.get('div[class="TableV2--body"] > :nth-child(1)').within(() => {
      cy.findByText('SUCCESS').should('exist')
      cy.findByText('11s').should('exist')
      cy.contains('John Doe').should('be.visible')

      cy.get('span[data-icon="Options"]').click({ force: true })
    })
    cy.findByText('Re-run from Stage').should('not.exist')
    cy.get('body').type('{esc}')
    cy.get('div[class="TableV2--body"]  > :nth-child(1)').click()
    cy.url().should(
      'contain',
      `account/${accountId}/cd/orgs/${orgIdentifier}/projects/${projectId}/pipelines/${pipelineIdentifier}/executions/jDwNFYhgT2KTW_zVDZdhHg/pipeline`
    )
    cy.go('back')

    // Aborted
    cy.get('div[class="TableV2--body"] > :nth-child(2)').within(() => {
      cy.findByText('ABORTED').should('exist')
      cy.findByText('8s').should('exist')
      cy.contains('John Doe').should('be.visible')

      cy.get('span[data-icon="Options"]').click({ force: true })
    })
    cy.findByText('Re-run from Stage').should('exist')
    cy.get('body').type('{esc}')
    cy.get('div[class="TableV2--body"] > :nth-child(2)').click()
    cy.url().should(
      'contain',
      `account/${accountId}/cd/orgs/${orgIdentifier}/projects/${projectId}/pipelines/${pipelineIdentifier}/executions/2BNrdFYSTCKTcVXlLnhP7Q/pipeline`
    )
    cy.go('back')

    // Failed
    cy.get('div[class="TableV2--body"]  > :nth-child(3)').within(() => {
      cy.findByText('FAILED').should('exist')
      cy.findByText('41s').should('exist')
      cy.contains('John Doe').should('be.visible')

      cy.get('span[data-icon="Options"]').click({ force: true })
    })
    cy.findByText('Re-run from Stage').should('exist')
    cy.get('body').type('{esc}')
    cy.get('div[class="TableV2--body"]  > :nth-child(3)').click()
    cy.url().should(
      'contain',
      `account/${accountId}/cd/orgs/${orgIdentifier}/projects/${projectId}/pipelines/${pipelineIdentifier}/executions/og6igi2RRcWUVLPqUUeAHQ/pipeline`
    )
    cy.go('back')
  })

  it('Compare various executions', () => {
    cy.intercept('GET', pipelineSummaryCallAPI, {
      fixture: 'pipeline/api/executionHistory/executionSummary.json'
    }).as('executionSummary')
    cy.intercept('POST', pipelineExecutionSummaryAPI, {
      fixture: 'pipeline/api/executionHistory/executionSummary.json'
    }).as('executionListSummary')
    cy.intercept('GET', executionMetadata, {
      fixture: 'pipeline/api/pipelineExecution/executionMetadata.json'
    }).as('executionMetadata')

    cy.visitPageAssertion()
    cy.wait('@executionListSummary')
    cy.findAllByRole('button', {
      name: /execution menu actions/i
    })
      .first()
      .click()
    cy.findByText('Compare Pipeline Executions').click()
    cy.findByRole('button', {
      name: /compare/i
    }).should('be.disabled')
    cy.findAllByRole('checkbox').eq(1).click({ force: true })
    cy.findByRole('button', {
      name: /compare/i
    }).click({ force: true })
    cy.wait('@executionMetadata')
    cy.findAllByRole('heading', { name: 'testPipeline_Cypress' }).should('have.length', 2)
  })
})
