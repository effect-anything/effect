import React, { FunctionComponent } from "react"
import { createPortal } from "react-dom"
import { PortalWrap } from "./PortalWrap"

export interface PortalWrapProps {
  root?: string
  identifier: string
  enableShadow?: boolean
}

export const Portal: FunctionComponent<PortalWrapProps> = ({
  root = "__hot__",
  identifier,
  enableShadow = true, // check browser support
  children,
}) => {
  const portalNode = React.useRef<HTMLElement | null>(null)
  const shadowNode = React.useRef<HTMLElement | ShadowRoot | null>(null)
  const [, forceUpdate] = React.useState<any>()

  React.useLayoutEffect(() => {
    const ownerDocument = root ? document.getElementById(root) : document.body

    portalNode.current = document.createElement(enableShadow ? identifier : "div")

    if (!enableShadow) {
      portalNode.current.dataset.id = identifier
    }

    shadowNode.current = enableShadow ? portalNode.current.attachShadow({ mode: `open` }) : portalNode.current

    ownerDocument?.appendChild(portalNode.current)

    forceUpdate({})

    return () => {
      if (portalNode.current && ownerDocument) {
        ownerDocument.removeChild(portalNode.current)
      }
    }
  }, [enableShadow, identifier, root])

  return shadowNode.current
    ? createPortal(<PortalWrap parent={shadowNode.current}>{children}</PortalWrap>, shadowNode.current as any)
    : null
}
