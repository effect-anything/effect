import type { EventEmitter } from "events"

export type TabLocation = {
  pathname: string
  search: string
  state: unknown
  hash: string | undefined
}

export type JumpTabLocation =
  | string
  | {
      pathname: string
      search?: string
      state?: unknown
      hash: string | undefined
    }

export type TabsAdapter<T = any> = (t: T & { event: EventEmitter }) => {
  listen(callback: (location: TabLocation) => void): () => void

  push(path: JumpTabLocation): void

  replace(path: JumpTabLocation): void

  identity(): TabLocation
}

export type HistoryCallbackSave = (_: TabLocation) => void
