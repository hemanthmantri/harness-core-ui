import React from 'react'
import { Container, Heading, Text } from '@wings-software/uicore'
import type { ContainerProps } from '@wings-software/uicore/dist/components/Container/Container'
import { useStrings } from 'framework/exports'
import EmptyContent from './EmptyContent.svg'
import EnvironmentDialog, { EnvironmentDialogProps } from '../CreateEnvironmentDialog/EnvironmentDialog'

export interface NoEnvironmentProps extends ContainerProps {
  onCreated: EnvironmentDialogProps['onCreate']
}

export const NoEnvironment: React.FC<NoEnvironmentProps> = ({ onCreated, style, ...props }) => {
  const { getString } = useStrings()

  return (
    <Container flex style={{ flexDirection: 'column', ...style }} {...props}>
      <img src={EmptyContent} width={220} height={220} />
      <Heading
        level={2}
        style={{ paddingTop: '50px', fontWeight: 600, fontSize: '20px', lineHeight: '28px', color: '#22222A' }}
      >
        {getString('cf.noEnvironment.title')}
      </Heading>
      <Text
        width={325}
        style={{
          padding: 'var(--spacing-large) 0 var(--spacing-xxlarge)',
          fontSize: 'var(--font-size-medium)',
          lineHeight: '18px',
          color: '#22222A',
          textAlign: 'center'
        }}
      >
        {getString('cf.noEnvironment.message')}
      </Text>
      <EnvironmentDialog
        onCreate={onCreated}
        buttonProps={{
          text: getString('cf.environments.create.title')
        }}
      />
    </Container>
  )
}
