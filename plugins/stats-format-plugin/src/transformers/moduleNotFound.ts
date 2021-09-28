import { RawSourceMap, SourceMapConsumer } from "@effect-x/deps/compiled/source-map"
import { ExtractError } from "../core/extractError"
import { Transformer } from "../core/transformErrors"
import { createOriginalStackFrame } from "../middleware/overlay"
import { WebpackError } from "../webpack/extract"

export interface ModuleNotFoundOriginError {
  name?: string
  message?: string
  loc?: {
    line: number
    column: number
  }
  pos?: number
  code: string
  missingPlugin?: string[]
  reasonCode?: string
}

interface ModuleNotFoundError extends WebpackError {
  originError: WebpackError["originError"] & {
    error?: ModuleNotFoundOriginError
  }
}

type ModuleNotFoundExtractError = ExtractError<ModuleNotFoundError>

const isModuleNotFoundError = (extractError: ModuleNotFoundExtractError): boolean => {
  const { originError } = extractError

  const hasBuildError = originError.name === "ModuleNotFoundError"

  return hasBuildError
}

const getFileLocation = (message: string): NonNullable<ExtractError["loc"]> => {
  const loc = message.match(/\d+:\d+/)

  if (loc) {
    const match = loc[0].matchAll(/\d+/g)

    if (match) {
      const [line, column] = match

      return {
        line: Math.max(1, parseInt(line[0])),
        column: Math.max(1, parseInt(column[0])),
      }
    }
  }
  return {
    line: 1,
    column: 1,
  }
}

export const getCleanError = (extractError: ModuleNotFoundExtractError) => {
  const initial = {
    causes: "Module Not Found",
    message: "",
    file: "",
    loc: {
      line: 1,
      column: 1,
    },
    frame: "",
    stack: "",
  }

  const lines = extractError.message.replace("Module not found: Error: ", "").replace(/\sin\s'.*?'/, "")
  const loc = getFileLocation(extractError.loc as unknown as string)

  initial.message = lines

  initial.file = extractError.originError?.module?.resource || ""

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

  initial.stack = extractError.stack
    ? extractError.stack
        .split("\n")
        .slice(1)
        .map((x) => x.trim())
        .join("\n")
    : ""

  return initial
}

export const transform: Transformer<WebpackError>["transform"] = (extractError) => {
  if (!isModuleNotFoundError(extractError)) {
    return extractError
  }

  extractError.severity = 10

  extractError.category = "webpack"

  extractError.type = "error"

  const cleanError = getCleanError(extractError)

  extractError.message = cleanError.message

  extractError.causes = cleanError.causes

  extractError.file = cleanError.file

  extractError.loc = cleanError.loc

  extractError.frame = cleanError.frame

  extractError.stack = cleanError.stack

  return extractError
}
