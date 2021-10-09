import type { EventEmitter } from "events"
import type { OpenTab } from "./openTab"

export type TabKey = string

export type TabPathname = string

export type TabIdentity = {
  pathname: string
  search: string
  state: unknown
  hash: string
}

export type JumpTabIdentity =
  | TabPathname
  | {
      pathname: string
      search?: string
      state?: unknown
      hash?: string
    }

export interface TabItem {
  index: number

  tabKey: TabKey

  identity: TabIdentity

  getComponent: () => JSX.Element

  properties: Record<string, any>

  isHead: boolean

  isLast: boolean

  reload(): void

  canClose: boolean

  close(): void

  canCloseRight: boolean

  closeRight(): void

  canCloseOthers: boolean

  closeOthers(): void
}

export type TabsAdapter<T = any> = (t: T & { event: EventEmitter }) => {
  listen(callback: (location: TabIdentity) => void): () => void

  identity(): TabIdentity

  getIdentity(id: JumpTabIdentity): TabIdentity

  equal(a: TabIdentity, b: TabIdentity): boolean

  exist(tabs: OpenTab[], identity: TabIdentity): boolean

  push(path: TabIdentity): void

  replace(path: TabIdentity): void
}

export type HistoryCallbackSave = (_: TabIdentity) => void
