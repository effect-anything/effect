import fs from "fs"
// @ts-expect-error
import { codeFrameColumns } from "@effect-x/deps/compiled/babel/code-frame"
import { ExtractError } from "../core/extractError"
import { Transformer } from "../core/transformErrors"
import { WebpackError } from "../webpack/extract"
import { getFileLocation } from "./postcss"

export interface BabelLoaderOriginError {
  name: string
  message: string
  error?: {
    loc: {
      line: number
      column: number
    }
    originalSassError?: {
      line: number
      column: number
      file: string
    }
  }
}

interface SassWebpackError extends WebpackError {
  originError: WebpackError["originError"] & {
    error?: BabelLoaderOriginError
  }
}

type SassError = SassWebpackError

type SassExtractError = ExtractError<SassError>

const isSassError = (error: SassExtractError): boolean => {
  const isBabelLoaderError =
    error.originError.name === "ModuleBuildError" &&
    error.originError.error !== undefined &&
    (error.originError.error.message.indexOf("SassError:") > -1 ||
      error.originError.error.message.indexOf("resolve-url-loader") > -1)

  return isBabelLoaderError
}

const getCleanError = (extractError: SassExtractError) => {
  const lines = extractError.message
    .replace(/^Module build failed.*:\n/, "")
    .replace(/^ModuleBuildError:.*:\s/, "")
    .replace(/Error: resolve-url-loader: error processing CSS\n\s/, "")
    .split("\n")

  const initial = {
    causes: "Syntax Error",
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

  const messageMatchRegexp = /:\s.*\n/

  const messageLoc = getFileLocation(data.message)

  const messageMatchResult = data.message.match(messageMatchRegexp)

  if (messageMatchResult) {
    const message = messageMatchResult[0].replace(/:\s/, "").replace(/(.|\n)$/, "")

    data.message = message
  }

  data.file =
    extractError.originError.error?.error?.originalSassError?.file || extractError.originError?.module?.resource || ""

  const loc = {
    line: Math.max(
      1,
      extractError.originError.error?.error?.loc?.line ||
        extractError.originError.error?.error?.originalSassError?.line ||
        messageLoc.line
    ),
    column: Math.max(
      1,
      extractError.originError.error?.error?.loc?.column ||
        extractError.originError.error?.error?.originalSassError?.column ||
        messageLoc.column
    ),
  }

  data.loc = loc

  if (data.file) {
    const originalCodeFrame = codeFrameColumns(
      fs.readFileSync(data.file, "utf8"),
      {
        start: loc,
      },
      { forceColor: true }
    ) as string

    initial.frame = originalCodeFrame
  }

  return data
}

export const transform: Transformer<SassError>["transform"] = (extractError) => {
  if (!isSassError(extractError)) {
    return extractError
  }

  extractError.severity = 10

  extractError.category = "sass"

  const cleanError = getCleanError(extractError)

  extractError.message = cleanError.message

  extractError.causes = cleanError.causes

  extractError.file = cleanError.file

  extractError.loc = cleanError.loc

  extractError.frame = cleanError.frame

  extractError.stack = cleanError.stack

  return extractError
}
