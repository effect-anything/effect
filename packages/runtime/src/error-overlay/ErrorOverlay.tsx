import React, { FunctionComponent, useEffect, useState } from "react"
import { createGlobalStyle } from "styled-components/macro"
import { Event } from "../event"
import { ErrorRecord } from "../type"
import CompilerErrors from "./CompilerErrors"
import RuntimeErrors from "./RuntimeErrors"

const GlobalStyle = createGlobalStyle`
    :host {
      --size-gap-half: 4px;
      --size-gap: 8px;
      --size-gap-double: 16px;
      --size-gap-quad: 32px;
  
      --size-font-small: 14px;
      --size-font: 16px;
      --size-font-big: 20px;
      --size-font-bigger: 24px;

      --color-accents-1: #808080;
      --color-accents-2: #222222;
      --color-accents-3: #404040;

      --font-stack-monospace: 'SFMono-Regular', Consolas,
        'Liberation Mono', Menlo, Courier, monospace;

      --color-ansi-selection: rgba(95, 126, 151, 0.48);
      --color-ansi-bg: #111111;
      --color-ansi-fg: #cccccc;

      --color-ansi-white: #777777;
      --color-ansi-black: #141414;
      --color-ansi-blue: #00aaff;
      --color-ansi-cyan: #88ddff;
      --color-ansi-green: #98ec65;
      --color-ansi-magenta: #aa88ff;
      --color-ansi-red: #ff5555;
      --color-ansi-yellow: #ffcc33;
      --color-ansi-bright-white: #ffffff;
      --color-ansi-bright-black: #777777;
      --color-ansi-bright-blue: #33bbff;
      --color-ansi-bright-cyan: #bbecff;
      --color-ansi-bright-green: #b6f292;
      --color-ansi-bright-magenta: #cebbff;
      --color-ansi-bright-red: #ff8888;
      --color-ansi-bright-yellow: #ffd966;
    }
`

interface ErrorOverlayProps {
  // eslint-disable-next-line react/no-unused-prop-types
  parent?: HTMLElement
  onMount: () => void
  event: Event
}

type ErrorOverlayReportData = {
  type: "runtime" | "compiler"
}

const ErrorOverlay: FunctionComponent<ErrorOverlayProps> = ({ onMount, event }) => {
  const [compilerErrorState, setCompilerErrorState] = useState(false)
  const [runtimeErrorState, setRuntimeErrorState] = useState(false)
  const [compilerErrors, setCompilerErrors] = useState<ErrorRecord[]>([])
  const [compilerWarnings, setCompilerWarnings] = useState<ErrorRecord[]>([])
  const [runtimeErrors, setRuntimeErrors] = useState<Error[]>([])

  const onUpdate = ({ type }: ErrorOverlayReportData) => {
    const hasCompilerError = event.state.hasCompilerError || event.state.hasCompilerWarning
    const hasRuntimeError = event.state.hasRuntimeError

    switch (type) {
      case "compiler":
        setCompilerErrorState(hasCompilerError)
        setCompilerErrors(event.state.compilerErrors)
        setCompilerWarnings(event.state.compilerWarnings)
        onUpdate({ type: "runtime" })
        break
      case "runtime":
        setRuntimeErrorState(hasRuntimeError)
        setRuntimeErrors(event.state.runtimeErrors)
        break
    }
  }

  useEffect(() => {
    event.on("ERROR_OVERLAY.UPDATE", onUpdate)

    return () => {
      event.removeListener("ERROR_OVERLAY.UPDATE", onUpdate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event])

  useEffect(() => {
    onMount()
  }, [onMount])

  let content: any = null

  if (compilerErrorState) {
    content = <CompilerErrors errors={compilerErrors} warnings={compilerWarnings} />
  } else if (runtimeErrorState) {
    content = <RuntimeErrors errors={runtimeErrors} />
  }

  return (
    <>
      <GlobalStyle />
      {content}
    </>
  )
}

export default ErrorOverlay
