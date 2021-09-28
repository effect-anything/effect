import { StackFrame } from "./source/runtime/utils/stack-frame"

export type OriginalStackFrame = {
  sourceCodeFrame: string | undefined

  originalStackFrame: StackFrame

  originalCodeFrame: string | undefined
}

export interface EnhancedStackFrame {
  sourceStackFrame: StackFrame

  sourceCodeFrame: string | undefined

  originalStackFrame: StackFrame | undefined

  originalCodeFrame: string | undefined
}

export interface ErrorRecord {
  severity: number

  category: string

  type: string

  causes: string

  message: string

  frames: EnhancedStackFrame[]

  stack: string | undefined
}

export interface CompilerErrorRecord {
  severity: number

  category: string

  type: string

  causes: string

  message: string

  file: string

  loc?: {
    line: number

    column: number
  }

  frame: string | undefined

  stack: string | undefined
}

type MakeMethodEnum<
  K extends Record<string, string>,
  V extends {
    [k in K[keyof K]]: unknown
  }
> = V

export const UpdateEventsEnum = {
  invalid: "invalid",
  hot: "hot",
  liveReload: "live-reload",
  progress: "progress",
  progressUpdate: "progress-update",
  hash: "hash",
  stillOk: "still-ok",
  ok: "ok",
  warnings: "warnings",
  error: "error",
  errors: "errors",
  contentChanged: "content-changed",
  staticChanged: "static-changed",
} as const

export type UpdateEventsMethodEnum = MakeMethodEnum<
  typeof UpdateEventsEnum,
  {
    [UpdateEventsEnum.invalid]: unknown
    [UpdateEventsEnum.hot]: unknown
    [UpdateEventsEnum.liveReload]: unknown
    [UpdateEventsEnum.progress]: unknown
    [UpdateEventsEnum.progressUpdate]: {
      pluginName?: string
      percent: number
      msg: string
    }
    [UpdateEventsEnum.hash]: string
    [UpdateEventsEnum.stillOk]: unknown
    [UpdateEventsEnum.ok]: unknown
    [UpdateEventsEnum.warnings]: CompilerErrorRecord[]
    [UpdateEventsEnum.error]: CompilerErrorRecord
    [UpdateEventsEnum.errors]: CompilerErrorRecord[]
    [UpdateEventsEnum.contentChanged]: unknown
    [UpdateEventsEnum.staticChanged]: unknown
  }
>

export type ReceivedEventMessage<T extends keyof UpdateEventsMethodEnum = keyof UpdateEventsMethodEnum> = {
  type: T
  data: UpdateEventsMethodEnum[T]
}
