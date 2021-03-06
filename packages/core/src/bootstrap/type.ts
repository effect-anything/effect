import type { History } from "history"
import type { EventEmitter } from "events"

export type CoreCtx<T = unknown> = {
  event: EventEmitter
  history: History
  setupProviders: [any, any][]
  providers: Map<
    any,
    Array<{
      name: string
      value: any
    }>
  >
} & T

export type CoreSetupFn<T extends CoreCtx<unknown>> = (ctx: T) => Promise<void>
