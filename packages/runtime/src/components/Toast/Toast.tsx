import React, { FunctionComponent } from "react"
import styled from "styled-components/macro"

const ToastContainerStyled = styled.div`
  position: fixed;
  bottom: var(--size-gap-double);
  left: var(--size-gap-double);
  max-width: 420px;
  z-index: 9000;
  cursor: pointer;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 440px) {
    max-width: 90vw;
    left: 5vw;
  }
`

const ToastContainerWrapperStyled = styled.div`
  padding: 16px;
  border-radius: var(--size-gap-half);
  font-weight: 500;
  color: var(--color-ansi-bright-white);
  background-color: var(--color-ansi-red);
  box-shadow: 0px var(--size-gap-double) var(--size-gap-quad) rgba(0, 0, 0, 0.25);
`

interface ToastProps {
  onClick?: () => void
}

export const Toast: FunctionComponent<ToastProps> = ({ onClick, children }) => {
  return (
    <ToastContainerStyled onClick={onClick}>
      <ToastContainerWrapperStyled>{children}</ToastContainerWrapperStyled>
    </ToastContainerStyled>
  )
}
