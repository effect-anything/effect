import React from "react"
import { Portal } from "../components/Portal"
import { RuntimeComponent } from "../client"
import { Event } from "../event"
import IndicatorOverlay from "./Indicator"

export const init: RuntimeComponent["init"] = (event: Event, ctx: any) => {
  const overlay = (
    <Portal key="indicator-overlay" identifier="indicator-overlay">
      <IndicatorOverlay event={event} />
    </Portal>
  )

  // overlay instance
  ctx.addElement(overlay)

  const handleCompiling = () => {
    event.emit("INDICATOR.RUNNING")
  }

  const handleCompilerDone = () => {
    event.emit("INDICATOR.DONE")
  }

  event.on("compiler.compiling", handleCompiling)
  event.on("compiler.done", handleCompilerDone)

  return () => {
    ctx.removeElement(overlay)

    event.removeListener("compiler_compiling", handleCompiling)
    event.removeListener("compiler_done", handleCompilerDone)
  }
}
