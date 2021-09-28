import React, { FunctionComponent } from "react"
import styled from "styled-components/macro"

const DialogHeaderContainer = styled.div`
  flex-shrink: 0;
  margin-bottom: var(--size-gap-double);
`

export const DialogHeader: FunctionComponent = ({ children }) => {
  return <DialogHeaderContainer>{children}</DialogHeaderContainer>
}
