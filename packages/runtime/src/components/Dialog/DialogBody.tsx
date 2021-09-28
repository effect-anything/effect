import React, { FunctionComponent } from "react"
import styled from "styled-components/macro"

const DialogBodyContainer = styled.div`
  position: relative;
  flex: 1 1 auto;
`

export const DialogBody: FunctionComponent = ({ children }) => {
  return <DialogBodyContainer>{children}</DialogBodyContainer>
}
