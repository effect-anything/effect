import { event } from "../entry"

export const handleRuntimeError = (error: Error) => {
  event.state.pushRuntimeError(error)

  event.emit("runtime.done")
}

export const clearRuntimeErrors = () => {
  event.state.setRuntimeErrors([])

  event.emit("runtime.done")
}
