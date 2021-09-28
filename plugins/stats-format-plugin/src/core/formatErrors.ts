import * as R from "@effect-x/deps/compiled/ramda"
import { ExtractError } from "./extractError"

export const defaultFormat = (extractError: ExtractError): FormattedMessage => {
  return {
    severity: 0,
    category: "internal",
    type: extractError.type,
    message: extractError.message,
    causes: extractError.causes || "",
    file: extractError.file,
    loc: {
      line: 1,
      column: 1,
    },
    stack: extractError.stack,
  }
}

export interface FormattedMessage {
  severity: number
  category: string
  type: string
  message: string
  causes: string
  file: string | undefined
  loc: {
    line: number
    column: number
  }
  stack?: string
}

export interface Formatter {
  format(error: FormattedMessage): FormattedMessage
}

export const formatters = (formatters: Formatter[]) => (errors: ExtractError[]) => {
  const format = (error: FormattedMessage, formatter: Formatter) => formatter.format(error)
  const apply = (error: FormattedMessage) =>
    R.reduce((acc, elem) => acc.concat(format(error, elem)), [] as FormattedMessage[], formatters)

  const fn = R.compose(apply, defaultFormat as unknown as (e: ExtractError) => FormattedMessage)

  return R.chain(fn, errors)
}
