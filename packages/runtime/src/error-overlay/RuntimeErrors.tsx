import React, { FunctionComponent, useEffect, useMemo, useState } from "react"
import styled from "styled-components/macro"
import { getStackFrames } from "../source/runtime/utils/get-stack-frames"
import { parse } from "../source/runtime/utils/stack-frame"
import { Dialog } from "../components/Dialog/Dialog"
import { Overlay } from "../components/Overlay/Overlay"
import { EnhancedStackFrame, ErrorRecord } from "../type"
import { DialogHeader } from "../components/Dialog/DialogHeader"
import { DialogContent } from "../components/Dialog/DialogContent"
import { DialogBody } from "../components/Dialog/DialogBody"
import { ErrorItems } from "./ErrorItem"
import { useErrorControl } from "../components/useErrorControl"
import { ErrorHeader } from "./ErrorHeader"
import { Toast } from "../components/Toast/Toast"

interface ErrorRecordItem {
  status: "fetching" | "ok" | "error"
  record: ErrorRecord
}

const ToastErrorsContainerStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;

  & > svg {
    margin-right: var(--size-gap);
  }
`

const ToastErrors: FunctionComponent = ({ children }) => {
  return (
    <ToastErrorsContainerStyled>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {children}
    </ToastErrorsContainerStyled>
  )
}

interface RuntimeErrorsProps {
  errors: Error[]
}

const RuntimeErrors: FunctionComponent<RuntimeErrorsProps> = ({ errors }) => {
  const [isMinimized, setMinimized] = useState(false)
  const [runtimeErrorMap, setRuntimeErrorMap] = useState(new Map<Error, ErrorRecordItem>())

  const minimize = React.useCallback((e?: MouseEvent | TouchEvent) => {
    e?.preventDefault()
    setMinimized(true)
  }, [])

  const reopen = React.useCallback((e?: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e?.preventDefault()
    setMinimized(false)
  }, [])

  const readyErrors = useMemo<ErrorRecordItem[]>(() => {
    return errors
      .map((error) => {
        if (runtimeErrorMap.has(error)) {
          return runtimeErrorMap.get(error)
        }

        return undefined
      })
      .filter((x) => !!x) as unknown as ErrorRecordItem[]
  }, [runtimeErrorMap, errors])

  const { activeError, activeIndex, next, previous } = useErrorControl(readyErrors)

  useEffect(() => {
    errors.forEach((error) => {
      if (runtimeErrorMap.has(error)) {
        return
      }

      const parsedFrames = parse(error.stack || "")

      const makeEnhanceError = (enhanceFrames: EnhancedStackFrame[]): ErrorRecord => {
        return {
          severity: 10,
          category: "runtime",
          type: "error",
          causes: "Unhandled Error",
          message: error.message,
          stack: error.stack,
          frames: enhanceFrames,
        }
      }

      const defaultRecord = makeEnhanceError(
        parsedFrames.map((frame) => ({
          originalCodeFrame: undefined,
          originalStackFrame: undefined,
          sourceCodeFrame: undefined,
          sourceStackFrame: frame,
        }))
      )

      setRuntimeErrorMap((map) => {
        return new Map(map).set(error, {
          status: "fetching",
          record: defaultRecord,
        })
      })

      getStackFrames(parsedFrames, error)
        .then(({ enhanceFrames }) => {
          setRuntimeErrorMap((map) => {
            return new Map(map).set(error, {
              status: "ok",
              record: makeEnhanceError(enhanceFrames),
            })
          })
        })
        .catch((error) => {
          setRuntimeErrorMap((map) => {
            return new Map(map).set(error, {
              status: "error",
              message: error.message,
              record: defaultRecord,
            })
          })
        })
    })
  }, [errors, runtimeErrorMap])

  if (isMinimized) {
    return (
      <Toast onClick={reopen}>
        <ToastErrors>
          <span>
            {readyErrors.length} error{readyErrors.length > 1 ? "s" : ""}
          </span>
        </ToastErrors>
      </Toast>
    )
  }

  return (
    <Overlay>
      <Dialog onClose={minimize}>
        <DialogContent>
          <DialogHeader>
            <ErrorHeader
              count={readyErrors.length}
              error={activeError?.record}
              activeIndex={activeIndex}
              onNext={next}
              onPrevious={previous}
              onClose={minimize}
            />
          </DialogHeader>
          <DialogBody>
            {activeError && <ErrorItems status={activeError.status} error={activeError.record} />}
          </DialogBody>
        </DialogContent>
      </Dialog>
    </Overlay>
  )
}

export default RuntimeErrors
