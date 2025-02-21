/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { CookieCutterStep } from './CookieCutterStep/CookieCutterStep'
import { CreateRepoStep } from './CreateRepoStep/CreateRepoStep'
import { DirectPushStep } from './DirectPushStep/DirectPushStep'
import { RegisterCatalogStep } from './RegisterCatalogStep/RegisterCatalogStep'
import { CreateCatalogStep } from './CreateCatalogStep/CreateCatalogStep'
import { SlackNotifyStep } from './SlackNotifyStep/SlackNotifyStep'

export function registerIDPPipelineStep(): void {
  factory.registerStep(new CookieCutterStep())
  factory.registerStep(new CreateRepoStep())
  factory.registerStep(new DirectPushStep())
  factory.registerStep(new RegisterCatalogStep())
  factory.registerStep(new CreateCatalogStep())
  factory.registerStep(new SlackNotifyStep())
}
