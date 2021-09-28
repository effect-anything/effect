import { StackFrame } from "./stack-frame"
import { EnhancedStackFrame, OriginalStackFrame } from "../../../type"

// https://github.com/ramda/ramda/blob/v0.27.0/source/zip.js
function zip<K, V>(a: K[], b: V[]): Array<[K, V]> {
  const rv: Array<[K, V]> = []
  let idx = 0
  const len = Math.min(a.length, b.length)

  while (idx < len) {
    rv[idx] = [a[idx], b[idx]]
    idx += 1
  }

  return rv
}

const enhance =
  (sources: StackFrame[]) =>
  (originals: OriginalStackFrame[]): EnhancedStackFrame[] => {
    return zip(sources, originals).map(([source, original]) => {
      return {
        sourceStackFrame: source,
        sourceCodeFrame: original?.sourceCodeFrame,
        originalStackFrame: original?.originalStackFrame,
        originalCodeFrame: original?.originalCodeFrame,
      }
    })
  }

const getOriginalStackFrames = (error: Error, sources: StackFrame[]): Promise<OriginalStackFrame[]> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3000)

  return self
    .fetch(`/__original-stack-frame`, {
      method: "post",
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({
        error,
        frames: sources,
      }),
      signal: controller.signal,
    })
    .then((res) => {
      if (!res.ok || res.status === 204) {
        return res.text().then((text) => {
          return Promise.reject(new Error("internal: " + text))
        })
      }

      return res.json()
    })
    .catch((error) => {
      return Promise.reject(new Error("internal: " + error.message))
    })
    .finally(() => {
      clearTimeout(timer)
    })
}

export const getStackFrames = (
  parsedFrames: StackFrame[],
  error: Error
): Promise<{
  enhanceFrames: EnhancedStackFrame[]
}> => {
  return getOriginalStackFrames(error, parsedFrames).then((originals) => {
    return {
      parsedFrames,
      enhanceFrames: enhance(parsedFrames)(originals),
    }
  })
}

export const getFrameSource = (frame: StackFrame): string => {
  let str = ""

  try {
    const u = new URL(frame.file!)

    // Strip the origin for same-origin scripts.
    if (typeof globalThis !== "undefined" && globalThis.location?.origin !== u.origin) {
      // URLs can be valid without an `origin`, so long as they have a
      // `protocol`. However, `origin` is preferred.
      if (u.origin === "null") {
        str += u.protocol
      } else {
        str += u.origin
      }
    }

    // Strip query string information as it's typically too verbose to be
    // meaningful.
    str += u.pathname
    str += " "
  } catch {
    str += (frame.file || "(unknown)") + " "
  }

  if (frame.lineNumber != null) {
    if (frame.column != null) {
      str += `(${frame.lineNumber}:${frame.column}) `
    } else {
      str += `(${frame.lineNumber}) `
    }
  }
  return str.slice(0, -1)
}
