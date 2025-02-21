/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { DeployEnvironmentEntityConfig, DeployEnvironmentEntityFormState } from '../../../types'
import { processEnvironmentGroupInitialValues } from '../processEnvironmentGroupInitialValues'
import { processEnvironmentGroupFormValues } from '../processEnvironmentGroupFormValues'

describe('process environment group initial values', () => {
  test('env group is fixed, environments are selected', () => {
    const output = processEnvironmentGroupInitialValues(
      {
        environmentGroup: {
          envGroupRef: 'Env_Group_1',
          deployToAll: false,
          environments: [
            {
              environmentRef: 'Env_1',
              deployToAll: true
            },
            {
              environmentRef: 'Env_2',
              deployToAll: false,
              infrastructureDefinitions: [
                {
                  identifier: 'Infra_1'
                },
                {
                  identifier: 'Infra_2',
                  inputs: {
                    identifier: 'Infra_2',
                    type: 'Kubernetes',
                    spec: {
                      namespace: 'test'
                    }
                  }
                }
              ]
            },
            {
              environmentRef: 'Env_3',
              deployToAll: RUNTIME_INPUT_VALUE as any,
              infrastructureDefinitions: RUNTIME_INPUT_VALUE as any
            }
          ]
        }
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      category: 'group',
      environmentGroup: 'Env_Group_1',
      parallel: true,
      environments: [
        {
          label: 'Env_1',
          value: 'Env_1'
        },
        {
          label: 'Env_2',
          value: 'Env_2'
        },
        {
          label: 'Env_3',
          value: 'Env_3'
        }
      ],
      environmentInputs: {
        Env_1: undefined,
        Env_2: undefined,
        Env_3: undefined
      },
      infrastructures: {
        Env_2: [
          {
            label: 'Infra_1',
            value: 'Infra_1'
          },
          {
            label: 'Infra_2',
            value: 'Infra_2'
          }
        ],
        Env_3: '<+input>' as any
      },
      infrastructureInputs: {
        Env_2: {
          Infra_2: {
            identifier: 'Infra_2',
            type: 'Kubernetes',
            spec: {
              namespace: 'test'
            }
          }
        }
      }
    } as DeployEnvironmentEntityFormState)
  })

  test('env group is fixed and deploy to All environments', () => {
    const output = processEnvironmentGroupInitialValues(
      {
        environmentGroup: {
          envGroupRef: 'Env_Group_1',
          deployToAll: true,
          environments: RUNTIME_INPUT_VALUE as any
        }
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      category: 'group',
      environmentGroup: 'Env_Group_1',
      environmentInputs: {},
      infrastructures: {},
      parallel: true,
      infrastructureInputs: {}
    } as DeployEnvironmentEntityFormState)
  })

  test('env group is runtime', () => {
    const output = processEnvironmentGroupInitialValues(
      {
        environmentGroup: {
          envGroupRef: RUNTIME_INPUT_VALUE,
          deployToAll: RUNTIME_INPUT_VALUE as any,
          environments: RUNTIME_INPUT_VALUE as any
        }
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      category: 'group',
      environmentGroup: RUNTIME_INPUT_VALUE,
      parallel: true
    } as DeployEnvironmentEntityFormState)
  })

  test('env group ref is empty', () => {
    const output = processEnvironmentGroupInitialValues(
      {
        environmentGroup: {
          envGroupRef: ''
        }
      },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      category: 'group',
      parallel: true
    })
  })
})

describe('process environment group form values', () => {
  test('env group is selected and environments are marked as runtime', () => {
    const output = processEnvironmentGroupFormValues(
      { category: 'group', parallel: false, environmentGroup: 'Env_Group_1', environments: RUNTIME_INPUT_VALUE as any },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      environmentGroup: {
        envGroupRef: 'Env_Group_1',
        deployToAll: RUNTIME_INPUT_VALUE as any,
        environments: RUNTIME_INPUT_VALUE as any,
        metadata: {
          parallel: false
        }
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('env group is selected and all environments are selected', () => {
    const output = processEnvironmentGroupFormValues(
      { category: 'group', parallel: false, environmentGroup: 'Env_Group_1' },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      environmentGroup: {
        envGroupRef: 'Env_Group_1',
        deployToAll: true,
        environments: RUNTIME_INPUT_VALUE as any,
        metadata: {
          parallel: false
        }
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('env group is marked as runtime', () => {
    const output = processEnvironmentGroupFormValues(
      { category: 'group', parallel: true, environmentGroup: RUNTIME_INPUT_VALUE },
      { gitOpsEnabled: false }
    )

    expect(output).toEqual({
      environmentGroup: {
        envGroupRef: RUNTIME_INPUT_VALUE,
        deployToAll: RUNTIME_INPUT_VALUE as any,
        environments: RUNTIME_INPUT_VALUE as any,
        metadata: {
          parallel: true
        }
      }
    } as DeployEnvironmentEntityConfig)
  })

  test('env group is not selected', () => {
    const output = processEnvironmentGroupFormValues({ category: 'group' }, { gitOpsEnabled: false })

    expect(output).toEqual({
      environmentGroup: {
        envGroupRef: ''
      }
    })
  })
})
