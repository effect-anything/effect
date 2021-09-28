import { NormalModule } from "@effect-x/deps/compiled/webpack"
import { extract, ExtractError, CatchError } from "../core/extractError"

export type WebpackStatsError = {
  message: string
  name?: string
  file?: string
  loc?: string
  moduleId?: string
  stack?: string
  module?: NormalModule
}

interface OriginError extends WebpackStatsError {
  hideStack?: boolean
  module?: NormalModule
}

export type WebpackError = ExtractError<{
  originError: OriginError
}>

export const webpackErrorExtract = (type = "error", _ctx: any) =>
  extract((error: CatchError & WebpackStatsError) => {
    return {
      severity: 10,
      category: "webpack",
      type: type,
      message: error.message,
      causes: "",
      file: error.file,
      loc: error.loc,
      frame: "",
      stack: error.stack,
      originError: error,
    } as ExtractError<WebpackError>
  })
