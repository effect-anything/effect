import React, { FunctionComponent } from "react"
import { StyleSheetManager } from "styled-components/macro"

interface PortalWrapProps {
  parent?: HTMLElement | ShadowRoot | any
}

export const PortalWrap: FunctionComponent<PortalWrapProps> = ({ parent, children }) => {
  return <StyleSheetManager target={parent?.shadowRoot || parent}>{children}</StyleSheetManager>
}
