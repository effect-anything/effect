import React from "react"
import { RuntimeComponent } from "../client"
import { Event } from "../event"
import { Portal } from "../components/Portal"
import ErrorOverlay from "./ErrorOverlay"

export const init: RuntimeComponent["init"] = (event: Event, ctx: any) => {
  const onCompilerDone = () => {
    event.emit("ERROR_OVERLAY.UPDATE", {
      type: "compiler",
    })
  }

  const onRuntimeDone = () => {
    event.emit("ERROR_OVERLAY.UPDATE", {
      type: "runtime",
    })
  }

  let initialized = false

  const onMount = () => {
    if (initialized) {
      return
    }

    initialized = true

    onCompilerDone()
    onRuntimeDone()
  }

  const overlay = (
    <Portal key="error-overlay" identifier="error-overlay">
      <ErrorOverlay event={event} onMount={onMount} />
    </Portal>
  )

  // overlay instance
  ctx.addElement(overlay)

  event.on("compiler.done", onCompilerDone)
  event.on("runtime.done", onRuntimeDone)

  return () => {
    initialized = false

    ctx.removeElement(overlay)

    event.removeListener("compiler_done", onCompilerDone)
    event.removeListener("runtime_done", onRuntimeDone)
  }
}
