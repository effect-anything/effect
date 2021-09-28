import React, { FunctionComponent } from "react"
import { ErrorRecord } from "../type"
import styled from "styled-components/macro"
import { CodeFrame } from "../components/CodeFrame/CodeFrame"
import { CallStackFrame } from "../components/CallStackFrame/CallStackFrame"

const ErrorMessageStyled = styled.div`
  font-size: var(--size-font-big);
  color: var(--color-accents-2);
  margin: 0 0 var(--size-gap) 0;
  padding: 0 0 var(--size-gap) 0;
  border-bottom: 1px solid #f2f2f2;
`

interface RuntimeErrorItemProps {
  status: string
  error: ErrorRecord
}

export const ErrorItems: FunctionComponent<RuntimeErrorItemProps> = ({ status, error }) => {
  return (
    <div>
      <ErrorMessageStyled>{error.message}</ErrorMessageStyled>
      <div>
        {error.frames.map((frame, index) => {
          const stackFrame = frame.originalStackFrame || frame.sourceStackFrame
          const codeFrame = frame.originalCodeFrame || frame.sourceCodeFrame || ""

          if (codeFrame) {
            return <CodeFrame key={index} stackFrame={stackFrame} codeFrame={codeFrame} />
          } else {
            return <CallStackFrame key={index} stackFrame={stackFrame} />
          }
        })}
      </div>
    </div>
  )
}
