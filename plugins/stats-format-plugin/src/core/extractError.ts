import * as R from "@effect-x/deps/compiled/ramda"

export interface CatchError {
  message: string

  stack?: string
}

export type ExtractError<T = unknown> = T & {
  severity?: number
  category?: string
  type: string
  message: string
  causes?: string
  file?: string
  frame?: string
  loc?: {
    line: number
    column: number
  }
  stack?: string
}

export const extract = R.curryN(
  2,
  (fn: (e: CatchError) => ExtractError, errors: CatchError | CatchError[]): ExtractError[] => {
    return Array.isArray(errors) ? R.map(fn, errors) : [fn(errors)]
  }
)

export const defaultExtract = extract((error) => {
  return {
    severity: undefined,
    category: undefined,
    type: "error",
    message: error.message,
    causes: undefined,
    file: undefined,
    frame: undefined,
    loc: undefined,
    stack: error.stack,
  } as ExtractError
})
