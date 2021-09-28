/* eslint-disable node/no-callback-literal */
/* globals __webpack_hash__ */
import { State } from "../state"
import {
  CompilerErrorRecord,
  EnhancedStackFrame,
  ErrorRecord,
  ReceivedEventMessage,
  UpdateEventsEnum,
  UpdateEventsMethodEnum,
} from "../type"
import { WSClient } from "../ws"

const mapError = (compilerErrors: CompilerErrorRecord[]): ErrorRecord[] => {
  const toErrorRecord = (error: CompilerErrorRecord): ErrorRecord => {
    return {
      severity: error.severity,
      category: error.category,
      type: error.type,
      causes: error.causes,
      message: error.message,
      frames: [
        {
          originalCodeFrame: error.frame,
          originalStackFrame: undefined,
          sourceCodeFrame: error.frame,
          sourceStackFrame: {
            methodName: "<unknown>",
            arguments: [],
            file: error.file,
            lineNumber: error.loc?.line ?? 1,
            column: error.loc?.column ?? 1,
          },
        } as EnhancedStackFrame,
      ],
      stack: error.stack,
    }
  }

  return compilerErrors.map(toErrorRecord)
}

export const handler = (state: State, emit: (event: string, data?: any) => void) => {
  const client = new WSClient()

  client.connect()

  const checkDuplicateHash = (): boolean => {
    if (state.previousHash && state.previousHash === state.currentHash) {
      return true
    }

    return false
  }

  const onInvalid = () => {
    if (state.hasCompiling) {
      return
    }

    state.startCompiling()

    emit("compiling")
  }

  const onProgress = () => {
    state.setProgress(0)
  }

  const onProgressUpdate = (progress: UpdateEventsMethodEnum["progress-update"]) => {
    if (isNaN(progress.percent)) {
      return
    }

    state.setProgress(progress.percent)

    emit("progress-update", progress.percent)
  }

  const onHash = (hash: string) => {
    if (state.currentHash === hash) {
      return
    }

    state.previousHash = state.currentHash

    // fresh hash value
    state.currentHash = hash
  }

  const isUpdateAvailable = () => {
    return state.currentHash !== __webpack_hash__
  }

  const canApplyUpdates = () => {
    return module.hot?.status() === "idle"
  }

  const reset = () => {
    state.endCompiling()
    state.setProgress(0)
  }

  interface TryApplyUpdatesParams {
    onDone: (errors?: Error[]) => void
    onUpdate?: (error?: any) => void
  }

  const tryApplyUpdates = ({ onDone, onUpdate }: TryApplyUpdatesParams) => {
    if (!canApplyUpdates() || !isUpdateAvailable()) {
      reset()

      // Nothing has changed
      if (!isUpdateAvailable()) {
        return onDone()
      }

      return onDone([new Error("cannot apply updates")])
    }

    // window unload
    if (state.isUnloading) {
      return
    }

    const directlyReload = () => {
      window.location.reload()
    }

    // eslint-disable-next-line no-undef
    const handleApplyUpdates = (error: Error | null, updatedModules: __WebpackModuleApi.ModuleId[] | null) => {
      // TODO: hasRuntimeErrors
      if (error || !updatedModules) {
        reset()

        if (error) {
          const status = module.hot!.status()
          const hasReactRefresh = process.env.REACT_FAST_REFRESH

          const failStatus = status && ["abort", "fail"].indexOf(status) >= 0

          // apply failed
          if (failStatus && !hasReactRefresh) {
            directlyReload()

            return
          }

          const updateFailed = new Error("update failed: " + error.message)

          updateFailed.stack = error.stack

          // update failed
          onUpdate?.(updateFailed)

          return onDone([updateFailed])
        }

        const updateFailed = new Error("update modules is empty")

        onUpdate?.(updateFailed)

        return onDone([updateFailed])
      }

      // every updated successfully
      onUpdate?.()

      // try latest update
      if (isUpdateAvailable()) {
        return tryApplyUpdates({ onDone, onUpdate })
      }

      reset()

      return onDone()
    }

    module
      .hot!.check(true)
      .then(
        (updatedModules) => {
          return handleApplyUpdates(null, updatedModules)
        },
        (error) => {
          return handleApplyUpdates(error, null)
        }
      )
      .catch((error: Error) => {
        handleApplyUpdates(error, null)
      })
  }

  const onErrors = (errors: UpdateEventsMethodEnum["errors"]) => {
    reset()

    // store errors in state
    state.setCompilerErrors(mapError(errors))

    emit("done")
  }

  const onError = (error: UpdateEventsMethodEnum["error"]) => {
    reset()

    // store errors in state
    state.setCompilerErrors(mapError([error]))

    emit("done")
  }

  const onWarnings = (warnings: UpdateEventsMethodEnum["warnings"]) => {
    reset()

    // store warnings in state
    state.setCompilerWarnings(mapError(warnings))

    tryApplyUpdates({
      onDone(errors) {
        if (errors) {
          state.setRuntimeErrors(errors as any)

          console.log("warning apply fail!", errors)
        }

        emit("done")
      },
    })
  }

  const onOk = () => {
    if (checkDuplicateHash()) {
      state.endCompiling()
      state.setCompilerErrors([])

      emit("done")

      return
    }

    tryApplyUpdates({
      onDone(errors) {
        if (errors) {
          state.setRuntimeErrors(errors as any)

          console.log("error apply fail!", errors)
        }

        state.setCompilerErrors([])

        emit("done")
      },
    })
  }

  // invalid -> hash -> warnings -> errors -> ok event
  const clientMessageHandler = (message: ReceivedEventMessage) => {
    switch (message.type) {
      case UpdateEventsEnum.invalid:
        onInvalid()
        break
      case UpdateEventsEnum.hot:
        break
      case UpdateEventsEnum.liveReload:
        break
      case UpdateEventsEnum.progress:
        onProgress()
        break
      case UpdateEventsEnum.progressUpdate:
        onProgressUpdate(message.data as UpdateEventsMethodEnum["progress-update"])
        break
      case UpdateEventsEnum.hash:
        onHash(message.data as UpdateEventsMethodEnum["hash"])
        break
      case UpdateEventsEnum.stillOk:
      case UpdateEventsEnum.ok:
        onOk()
        break
      case UpdateEventsEnum.warnings:
        onWarnings(message.data as UpdateEventsMethodEnum["warnings"])
        break
      case UpdateEventsEnum.error:
        onError(message.data as UpdateEventsMethodEnum["error"])
        break
      case UpdateEventsEnum.errors:
        onErrors(message.data as UpdateEventsMethodEnum["errors"])
        break
      case UpdateEventsEnum.staticChanged:
      case UpdateEventsEnum.contentChanged:
        // Triggered when a file from `contentBase` changed.
        window.location.reload()
        break
      default:
      // Do nothing.
    }
  }

  client.on("message", clientMessageHandler)

  return () => {
    client.removeListener("message", clientMessageHandler)
    client.disconnect()
  }
}
