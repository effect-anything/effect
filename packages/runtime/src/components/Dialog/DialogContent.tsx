import React, { FunctionComponent } from "react"
import styled from "styled-components/macro"

const DialogContentContainer = styled.div`
  overflow-y: auto;
  border: none;
  margin: 0;
  /* calc(padding + banner width offset) */
  padding: calc(var(--size-gap-double) + var(--size-gap-half)) var(--size-gap-double);
  height: 100%;
  display: flex;
  flex-direction: column;
`

export const DialogContent: FunctionComponent = ({ children }) => {
  return <DialogContentContainer>{children}</DialogContentContainer>
}
