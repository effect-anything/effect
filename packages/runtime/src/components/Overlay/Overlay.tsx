import React, { FunctionComponent, useEffect } from "react"
import styled from "styled-components/macro"
import { lock, unlock } from "../body-locker"

const OverlayContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
  z-index: 9000;
  display: flex;
  align-content: center;
  align-items: center;
  flex-direction: column;
  padding: 10vh 15px 0;

  @media (max-height: 812px) {
    max-height: calc(100% - 15px);
  }

  @media (max-height: 812px) {
    padding: 15px 15px 0;
  }
`

interface IOverlayOptions {
  fixed?: boolean
}

const OverContainerBackground = styled.div<IOverlayOptions>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(61, 61, 61, 0.59);
  pointer-events: all;
  z-index: -1;
  ${(props) =>
    props.fixed && {
      cursor: "not-allowed",
      "-webkit-backdrop-filter": "blur(8px)",
      "backdrop-filter": "blur(8px)",
    }}
`

interface OverlayProps {
  fixed?: boolean
}

export const Overlay: FunctionComponent<OverlayProps> = ({ fixed, children }) => {
  useEffect(() => {
    lock()
    return () => {
      unlock()
    }
  }, [])

  return (
    <OverlayContainer>
      <OverContainerBackground fixed={fixed} />
      {children}
    </OverlayContainer>
  )
}
