import fs from "fs"
// @ts-expect-error
import { codeFrameColumns } from "@effect-x/deps/compiled/babel/code-frame"
import { ExtractError } from "../core/extractError"
import { Transformer } from "../core/transformErrors"
import { WebpackError } from "../webpack/extract"

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

const isPostcssError = (error: SassExtractError): boolean => {
  const isBabelLoaderError =
    error.originError.name === "ModuleBuildError" &&
    error.originError.error !== undefined &&
    (error.originError.error.message.indexOf("postcss-loader") > -1 ||
      error.originError.error.message.indexOf("Loading PostCSS") > -1)

  return isBabelLoaderError
}

export const getFileLocation = (message: string): NonNullable<ExtractError["loc"]> => {
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

// https://github.com/webpack-contrib/postcss-loader/blob/master/src/Error.js#L26
const getCleanError = (extractError: SassExtractError) => {
  const lines = extractError.message
    .replace(/^Module build failed.*:\n/, "")
    .replace(/^ModuleBuildError:.*:\s/, "")
    .replace(/^ModuleError: Module Error.*:\s/, "")
    .replace("SyntaxError\n\n", "SyntaxError ")
    .replace("<css input> ", "")
    .split("\n")

  const initial = {
    causes: "SyntaxError",
    message: "",
    file: "",
    loc: {
      line: 1,
      column: 1,
    },
    frame: "",
    stack: "",
  }

  initial.message = lines.slice(0, 1).join("")

  if (initial.message.indexOf("SyntaxError") > -1) {
    initial.causes = "Syntax Error"
    initial.message = initial.message.replace("SyntaxError ", "")
  } else if (initial.message.indexOf("Loading PostCSS") > -1) {
    initial.causes = "PostCSS Error"
    initial.message = initial.message
      .replace("Loading PostCSS", "")
      .replace(/"(.+?)" plugin failed.*$/, `Cannot find plugin: '$1'`)
  }

  initial.file = extractError.originError?.module?.resource || ""

  lines.slice(1).forEach((line) => {
    if (line === "") {
      return
    }

    if (/\s*at\s.*\n?/.test(line)) {
      initial.stack += line.trim() + "\n"
    }
  })

  initial.loc = getFileLocation(initial.message)

  initial.message = initial.message
    .replace(/\(\d+:\d+\)/, "")
    .replace(initial.file, "")
    .trim()

  if (initial.file && initial.causes === "Syntax Error") {
    const originalCodeFrame = codeFrameColumns(
      fs.readFileSync(initial.file, "utf8"),
      {
        start: initial.loc,
      },
      { forceColor: true }
    ) as string

    initial.frame = originalCodeFrame
  }

  return initial
}

export const transform: Transformer<SassError>["transform"] = (extractError) => {
  if (!isPostcssError(extractError)) {
    return extractError
  }

  extractError.severity = 10

  extractError.category = "postcss"

  const cleanError = getCleanError(extractError)

  extractError.message = cleanError.message

  extractError.causes = cleanError.causes

  extractError.file = cleanError.file

  extractError.loc = cleanError.loc

  extractError.frame = cleanError.frame

  extractError.stack = cleanError.stack

  return extractError
}
