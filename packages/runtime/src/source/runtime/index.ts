/* eslint-disable node/no-callback-literal */
import {
  register as registerStackTraceLimit,
  unregister as unregisterStackTraceLimit,
} from "../../effects/stack-trace-limit"
import { register as registerError, unregister as unregisterError } from "../../effects/unhandled-error"
import { register as registerPromise, unregister as unregisterPromise } from "../../effects/unhandled-rejection"
import { State } from "../../state"

type CrashCallback = (_: Error) => void

const crashWithFrames = (crash: CrashCallback) => (error: Error) => {
  if (error.message.indexOf("internal:") > -1) {
    return
  }

  crash(error)
}

const listenRuntimeErrors =
  (eventTarget: EventTarget = window) =>
  (crash: CrashCallback) => {
    const crashWithFramesRunTime = crashWithFrames(crash)
    registerError(eventTarget, (error) => {
      crashWithFramesRunTime(error)
    })
    registerPromise(eventTarget, (error) => {
      crashWithFramesRunTime(error)
    })
    registerStackTraceLimit()

    return function stopListening() {
      unregisterStackTraceLimit()
      unregisterPromise(window)
      unregisterError(window)
    }
  }

export const handler = (state: State, emit: (event: string, data?: any) => void) => {
  const stopListenRuntimeErrors = listenRuntimeErrors(window)((error) => {
    state.pushRuntimeError(error)

    emit("done")
  })

  return () => {
    stopListenRuntimeErrors()
  }
}
