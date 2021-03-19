import React from 'react'
import { Button, ButtonProps, Heading, Layout } from '@wings-software/uicore'
import type { LayoutProps } from '@wings-software/uicore/dist/layouts/Layout'

export interface NoDataProps extends LayoutProps {
  imageURL: string
  message: string
  width?: number
  buttonText?: string
  buttonWidth?: number
  onClick?: ButtonProps['onClick']
}

export const NoData: React.FC<NoDataProps> = ({
  imageURL,
  message,
  width,
  buttonText,
  buttonWidth,
  onClick,
  children,
  ...props
}) => {
  return (
    <Layout.Vertical
      spacing="medium"
      width={width || 470}
      style={{ alignItems: 'center', marginTop: '-48px' }}
      {...props}
    >
      <img src={imageURL} width={220} height={220} />
      <Heading
        level={2}
        style={{
          fontWeight: 600,
          fontSize: '20px',
          lineHeight: '28px',
          color: '#89898F',
          textAlign: 'center',
          padding: '30px 0'
        }}
      >
        {message}
      </Heading>
      {buttonText ? <Button intent="primary" text={buttonText} width={buttonWidth} onClick={onClick} /> : null}
      {children}
    </Layout.Vertical>
  )
}
