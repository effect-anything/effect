import type { History } from "history"
import type { EventEmitter } from "events"

export type CoreCtx<T = unknown> = {
  event: EventEmitter
  history: History
  providers: [any, any][]
} & T

export type CoreSetupFn<T extends CoreCtx<unknown>> = (ctx: T) => Promise<void>
