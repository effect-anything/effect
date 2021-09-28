import { RawSourceMap, SourceMapConsumer } from "@effect-x/deps/compiled/source-map"
import { ExtractError } from "../core/extractError"
import { Transformer } from "../core/transformErrors"
import { createOriginalStackFrame } from "../middleware/overlay"
import { WebpackError } from "../webpack/extract"

interface ModuleNotFoundOriginError {
  message: string
  name: string
  loc: {
    start: {
      line: number
      column: number
    }
    end: {
      line: number
      column: number
    }
  }
}

interface ModuleNotFoundError extends WebpackError {
  originError: WebpackError["originError"] & {
    error?: ModuleNotFoundOriginError
  }
}

type ModuleNotFoundExtractError = ExtractError<ModuleNotFoundError>

const isWebpackModuleDepWarning = (extractError: ModuleNotFoundExtractError): boolean => {
  const { originError } = extractError

  return originError.name === "ModuleDependencyWarning"
}

export const getCleanError = (extractError: ModuleNotFoundExtractError) => {
  const initial = {
    causes: "Import Error",
    message: "",
    file: "",
    loc: {
      line: 1,
      column: 1,
    },
    frame: "",
    stack: "",
  }

  const message = extractError.message || extractError.originError?.error?.message || ""

  const lines = message
    .replace(
      /^.*export '(.+?)' was not found in '(.+?)'.*$/gm,
      `Attempted import error: '$1' is not exported from '$2'.`
    )
    .replace(
      /^.*export 'default' \(imported as '(.+?)'\) was not found in '(.+?)'.*$/gm,
      `Attempted import error: '$2' does not contain a default export (imported as '$1').`
    )
    .replace(
      /^.*export '(.+?)' \(imported as '(.+?)'\) was not found in '(.+?)'.*$/gm,
      `Attempted import error: '$1' is not exported from '$3' (imported as '$2').`
    )

  initial.message = lines

  initial.file = extractError.originError?.module?.resource || ""

  const loc = {
    line: Math.max(1, extractError.originError?.error?.loc?.start?.line ?? 1),
    column: Math.max(1, extractError.originError?.error?.loc?.start?.column ?? 1),
  }

  initial.loc = loc

  if (extractError.originError.module) {
    const rawSource = extractError.originError.module.originalSource()

    if (rawSource) {
      const consumer = new SourceMapConsumer(rawSource.map() as RawSourceMap)

      const originalCodeFrame =
        createOriginalStackFrame({
          line: loc.line,
          column: loc.column,
          rootDirectory: "",
          consumer,
          frame: null,
          moduleId: extractError.originError.moduleId,
        })?.originalCodeFrame || ""

      initial.frame = originalCodeFrame
    }
  }

  initial.stack = ""

  return initial
}

export const transform: Transformer<WebpackError>["transform"] = (extractError) => {
  if (!isWebpackModuleDepWarning(extractError)) {
    return extractError
  }

  extractError.severity = 10

  extractError.category = "webpack"

  const cleanError = getCleanError(extractError)

  extractError.message = cleanError.message

  extractError.causes = cleanError.causes

  extractError.file = cleanError.file

  extractError.loc = cleanError.loc

  extractError.frame = cleanError.frame

  extractError.stack = cleanError.stack

  return extractError
}
