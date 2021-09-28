import { ExtractError } from "../core/extractError"
import { Transformer } from "../core/transformErrors"
import { WebpackError } from "../webpack/extract"

export interface BabelLoaderOriginError {
  loc?: {
    line: number
    column: number
  }
  code?: string
}

interface BabelError extends WebpackError {
  originError: WebpackError["originError"] & {
    error?: BabelLoaderOriginError
  }
}

export type BabelExtractError = ExtractError<BabelError>

export const ErrorReasonEnum = {
  "Syntax Error": "Syntax Error",
  "Unknown Option": "Unknown Option",
  "Unknown Error": "Unknown Error",
} as const

const isBabelError = (error: BabelExtractError): boolean => {
  const isBabelLoaderError =
    error.originError.name === "ModuleBuildError" &&
    error.originError.error !== undefined &&
    error.originError.error.code !== undefined &&
    error.originError.error.code.indexOf("BABEL") > -1

  return isBabelLoaderError
}

export const getCleanError = (extractError: BabelExtractError) => {
  const lines = extractError.message.replace(/^Module build failed.*:\n/, "").split("\n")

  const initial = {
    causes: "",
    message: "",
    file: "",
    loc: {
      line: 1,
      column: 1,
    },
    frame: "",
    stack: "",
  }

  const data = lines.reduce((acc, line) => {
    if (line === "") {
      return acc
    }

    if (line.startsWith("\x1B[0m")) {
      acc.frame += line + "\n"

      return acc
    }

    if (/\s*at\s.*\n?/.test(line)) {
      acc.stack += line.trim() + "\n"

      return acc
    }

    acc.message += line + "\n"

    return acc
  }, initial)

  if (data.message.startsWith("SyntaxError")) {
    data.causes = ErrorReasonEnum["Syntax Error"]
  }

  if (data.message.startsWith("Error: Unknown option")) {
    data.causes = ErrorReasonEnum["Unknown Option"]
  }

  if (data.causes === ErrorReasonEnum["Unknown Option"]) {
    data.message = data.message.replace("Error: Unknown option: ", "").replace(/\n$/, "")

    data.file = extractError.originError?.module?.resource || ""

    return data
  }

  const fileRegexp = /:\s.*:\s/

  const filenameMatch = data.message.match(fileRegexp)

  if (filenameMatch) {
    const match1 = filenameMatch[0]

    data.file = match1.replace(/:\s/, "").replace(/:\s$/, "")

    data.message = data.message.replace(match1, ": ")
  }

  data.message = data.message.replace("SyntaxError: ", "")

  const multiMessage = data.file.indexOf(":")

  if (multiMessage > -1) {
    const file = data.file.slice(0, multiMessage)
    const restMessage = data.file.slice(multiMessage, data.file.length)

    data.file = file
    data.loc = getFileLocation(restMessage)
    data.message =
      restMessage
        .replace(/:\s/, "")
        .replace(/\(\d+:\d+\)/, "")
        .trim() +
      "\n" +
      data.message
  } else {
    data.loc = getFileLocation(data.message)
    data.message = data.message.replace(/\(\d+:\d+\)/, "")
  }

  data.message = data.message.replace(/\n$/, "").trim()

  return data
}

const getFileLocation = (message: string): NonNullable<ExtractError["loc"]> => {
  const loc = message.match(/\(\d+:\d+\)/)

  if (loc) {
    const match = loc[0].matchAll(/\d+/g)

    if (match) {
      const [line, column] = match

      return {
        line: parseInt(line[0]),
        column: parseInt(column[0]),
      }
    }
  }

  return {
    line: 1,
    column: 1,
  }
}

export const transform: Transformer<WebpackError>["transform"] = (extractError) => {
  if (!isBabelError(extractError)) {
    return extractError
  }

  extractError.severity = 10

  extractError.category = "babel"

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
