import Anser from "@effect-x/deps/compiled/anser"
import React, { FunctionComponent } from "react"
import stripAnsi from "@effect-x/deps/compiled/strip-ansi"
import { getFrameSource } from "../../source/runtime/utils/get-stack-frames"
import { StackFrame } from "../../source/runtime/utils/stack-frame"
import styled from "styled-components/macro"

const FileLocationStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  & :hover {
    text-decoration: underline dotted;
  }

  & > svg {
    width: auto;
    height: 1em;
    margin-left: 8px;
  }

  & > span {
    font-family: var(--font-stack-monospace);
    font-size: var(--size-font-small);
    color: #999;
  }
`

interface CallLocationProps {
  stackFrame: StackFrame
}

const CallLocation: FunctionComponent<CallLocationProps> = ({ stackFrame }: CallLocationProps) => {
  return (
    <FileLocationStyled>
      <span>{getFrameSource(stackFrame)}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </FileLocationStyled>
  )
}

export const CodeFrameContainerStyled = styled.div`
  &:not(:last-of-type) {
    margin-bottom: var(--size-gap);
  }
  & > div {
    margin: var(--size-gap) 0;
  }
`

const CodeFrameStyled = styled.div`
  border-radius: var(--size-gap-half);
  background-color: var(--color-ansi-bg);
  color: var(--color-ansi-fg);

  ::selection,
  *::selection {
    background-color: var(--color-ansi-selection);
  }

  * {
    color: inherit;
    background-color: transparent;
    font-family: var(--font-stack-monospace);
  }

  & > * {
    margin: 0;
    padding: calc(var(--size-gap) + var(--size-gap-half)) calc(var(--size-gap-double) + var(--size-gap-half));
  }

  pre {
    overflow: auto;
  }
`

type CodeFrameProps = { stackFrame: StackFrame; codeFrame: string }

export const CodeFrame: FunctionComponent<CodeFrameProps> = ({ stackFrame, codeFrame }) => {
  // Strip leading spaces out of the code frame:
  const formattedFrame = React.useMemo<string>(() => {
    const lines = codeFrame.split(/\r?\n/g)
    const prefixLength = lines
      .map((line) => /^>? +\d+ +\| ( *)/.exec(stripAnsi(line)))
      .filter(Boolean)
      .map((v) => v!.pop()!)
      .reduce((c, n) => (isNaN(c) ? n.length : Math.min(c, n.length)), NaN)

    if (prefixLength > 1) {
      const p = " ".repeat(prefixLength)
      return lines
        .map((line, a) => (~(a = line.indexOf("|")) ? line.substring(0, a) + line.substring(a).replace(p, "") : line))
        .join("\n")
    }
    return lines.join("\n")
  }, [codeFrame])

  const decoded = React.useMemo(() => {
    if (!formattedFrame) {
      return []
    }

    return Anser.ansiToJson(formattedFrame, {
      json: true,
      use_classes: true,
      remove_empty: true,
    })
  }, [formattedFrame])

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

  // TODO: make the caret absolute
  return (
    <CodeFrameContainerStyled>
      <div role="link" onClick={open} tabIndex={1} title="Click to open in your editor">
        <div>{stackFrame.methodName}</div>
        <CallLocation stackFrame={stackFrame} />
      </div>
      {decoded.length > 0 && (
        <CodeFrameStyled>
          <pre>
            {decoded.map((entry, index) => (
              <span
                key={`frame-${index}`}
                style={{
                  color: entry.fg ? `var(--color-${entry.fg})` : undefined,
                  ...(entry.decoration === "bold"
                    ? { fontWeight: 800 }
                    : entry.decoration === "italic"
                    ? { fontStyle: "italic" }
                    : undefined),
                }}
              >
                {entry.content}
              </span>
            ))}
          </pre>
        </CodeFrameStyled>
      )}
    </CodeFrameContainerStyled>
  )
}
