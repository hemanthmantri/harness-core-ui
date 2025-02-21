/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'

const AllowedValuesField: React.FC = () => {
  const { getString } = useStrings()
  return (
    <>
      <FormInput.Text name="defaultValue" label={getString('platform.variables.defaultValue')} />
      <FormInput.KVTagInput label={getString('platform.variables.allowedValues')} name="allowedValues" isArray={true} />
    </>
  )
}

export default AllowedValuesField
