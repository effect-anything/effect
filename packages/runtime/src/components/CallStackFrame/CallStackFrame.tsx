import React, { FunctionComponent } from "react"
import { getFrameSource } from "../../source/runtime/utils/get-stack-frames"
import { StackFrame } from "../../source/runtime/utils/stack-frame"
import styled from "styled-components/macro"
import { CodeFrameContainerStyled } from "../CodeFrame/CodeFrame"

const FileLocationStyled = styled.div`
  & > span {
    margin-top: 0;
    margin-bottom: var(--size-gap);
    font-family: var(--font-stack-monospace);
    font-size: var(--size-font-small);
    color: #999;
  }

  & > svg {
    width: auto;
    height: 1em;
    margin-left: 8px;
  }
`

interface CallLocationProps {
  stackFrame: StackFrame
}

const CallLocation: FunctionComponent<CallLocationProps> = ({ stackFrame }: CallLocationProps) => {
  return (
    <FileLocationStyled>
      <span>{getFrameSource(stackFrame)}</span>
    </FileLocationStyled>
  )
}

type CodeFrameProps = { stackFrame: StackFrame }

export const CallStackFrame: FunctionComponent<CodeFrameProps> = ({ stackFrame }) => {
  const open = React.useCallback(() => {
    const params = new URLSearchParams()
    for (const key in stackFrame) {
      params.append(key, ((stackFrame as any)[key] ?? "").toString())
    }

    self.fetch(`${process.env.__NEXT_ROUTER_BASEPATH || ""}/__nextjs_launch-editor?${params.toString()}`).then(
      () => {},
      () => {
        // TODO: report error
      }
    )
  }, [stackFrame])

  return (
    <CodeFrameContainerStyled>
      <div role="link" onClick={open} tabIndex={1} title="Click to open in your editor">
        <div>{stackFrame.methodName}</div>
        <CallLocation stackFrame={stackFrame} />
      </div>
    </CodeFrameContainerStyled>
  )
}
