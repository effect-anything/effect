import React, { FunctionComponent } from "react"
import styled from "styled-components/macro"
import { useOnClickOutside } from "../../hooks/useOnClickOutside"

const DialogContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-right: auto;
  margin-left: auto;
  outline: none;
  background: #fff;
  border-radius: var(--size-gap);
  overflow-y: hidden;
  border: 1px solid rgba(179, 179, 179, 0.98);
  max-height: calc(100% - 56px);

  @media (min-width: 576px) {
    max-width: 540px;
  }

  @media (min-width: 768px) {
    max-width: 720px;
  }

  @media (min-width: 992px) {
    max-width: 960px;
  }
`

interface DialogProps {
  onClose?: (e: MouseEvent | TouchEvent) => void
}

export const Dialog: FunctionComponent<DialogProps> = ({ onClose, children }) => {
  const [dialog, setDialog] = React.useState<HTMLDivElement | null>(null)
  const onDialog = React.useCallback((node) => {
    setDialog(node)
  }, [])

  useOnClickOutside(dialog, onClose)

  return <DialogContainer ref={onDialog}>{children}</DialogContainer>
}
