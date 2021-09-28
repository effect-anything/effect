const UNKNOWN_FUNCTION = "<unknown>"

export interface StackFrameParams {
  file: string | null

  methodName: "<unknown>" | string

  args: string[]

  lineNumber: number | null

  column: number | null
}

export class StackFrame {
  public file: string | null

  public methodName: "<unknown>" | string

  public arguments: string[]

  public lineNumber: number | null

  public column: number | null

  constructor({ file, methodName = "<unknown>", args = [], lineNumber, column }: StackFrameParams) {
    this.file = file

    this.methodName = methodName

    this.arguments = args

    this.lineNumber = lineNumber

    this.column = column
  }
}

/**
 * This parses the different stack traces and puts them into one format
 * This borrows heavily from TraceKit (https://github.com/csnover/TraceKit)
 */
export function parse(stackString: string) {
  const lines = stackString.split("\n")

  return lines.reduce((stack, line) => {
    const parseResult = parseChrome(line) || parseWinjs(line) || parseGecko(line) || parseNode(line) || parseJSC(line)

    if (parseResult) {
      stack.push(parseResult)
    }

    return stack
  }, [] as StackFrame[])
}

const chromeRe =
  /^\s*at (.*?) ?\(((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|\/|[a-z]:\\|\\\\).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i
const chromeEvalRe = /\((\S*)(?::(\d+))(?::(\d+))\)/

function parseChrome(line: string): StackFrame | null {
  const parts = chromeRe.exec(line)

  if (!parts) {
    return null
  }

  const isNative = parts[2] && parts[2].indexOf("native") === 0 // start of line
  const isEval = parts[2] && parts[2].indexOf("eval") === 0 // start of line

  const submatch = chromeEvalRe.exec(parts[2])
  if (isEval && submatch != null) {
    // throw out eval line/column and use top-most line/column number
    parts[2] = submatch[1] // url
    parts[3] = submatch[2] // line
    parts[4] = submatch[3] // column
  }

  return new StackFrame({
    file: !isNative ? parts[2] : null,
    methodName: parts[1] || UNKNOWN_FUNCTION,
    args: isNative ? [parts[2]] : [],
    lineNumber: parts[3] ? +parts[3] : null,
    column: parts[4] ? +parts[4] : null,
  })
}

const winjsRe =
  /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i

function parseWinjs(line: string): StackFrame | null {
  const parts = winjsRe.exec(line)

  if (!parts) {
    return null
  }

  return new StackFrame({
    file: parts[2],
    methodName: parts[1] || UNKNOWN_FUNCTION,
    args: [],
    lineNumber: +parts[3],
    column: parts[4] ? +parts[4] : null,
  })
}

const geckoRe =
  /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|\[native).*?|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i
const geckoEvalRe = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i

function parseGecko(line: string): StackFrame | null {
  const parts = geckoRe.exec(line) as any

  if (!parts) {
    return null
  }

  const isEval = parts[3] && parts[3].indexOf(" > eval") > -1

  const submatch = geckoEvalRe.exec(parts[3])
  if (isEval && submatch != null) {
    // throw out eval line/column and use top-most line number
    parts[3] = submatch[1]
    parts[4] = submatch[2]
    parts[5] = null // no column when eval
  }

  return {
    file: parts[3],
    methodName: parts[1] || UNKNOWN_FUNCTION,
    arguments: parts[2] ? parts[2].split(",") : [],
    lineNumber: parts[4] ? +parts[4] : null,
    column: parts[5] ? +parts[5] : null,
  }
}

const javaScriptCoreRe = /^\s*(?:([^@]*)(?:\((.*?)\))?@)?(\S.*?):(\d+)(?::(\d+))?\s*$/i

function parseJSC(line: string): StackFrame | null {
  const parts = javaScriptCoreRe.exec(line)

  if (!parts) {
    return null
  }

  return new StackFrame({
    file: parts[3],
    methodName: parts[1] || UNKNOWN_FUNCTION,
    args: [],
    lineNumber: +parts[4],
    column: parts[5] ? +parts[5] : null,
  })
}

const nodeRe = /^\s*at (?:((?:\[object object\])?[^\\/]+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i

function parseNode(line: string): StackFrame | null {
  const parts = nodeRe.exec(line)

  if (!parts) {
    return null
  }

  return new StackFrame({
    file: parts[2],
    methodName: parts[1] || UNKNOWN_FUNCTION,
    args: [],
    lineNumber: +parts[3],
    column: parts[4] ? +parts[4] : null,
  })
}
