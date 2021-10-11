import type { EventEmitter } from "events"
import type { GetState } from "zustand"
import type { FunctionComponent } from "react"
import type { OpenTab, ReactChildren, TabProperties } from "./openTab"
import type { State } from "./state"

export type TabKey = string

export type TabPathname = string

export type TabIdentity = {
  pathname: string
  search: string
  state: unknown
  hash: string
}

export type JumpTabIdentity = TabPathname | Partial<TabIdentity>

export interface OnChangeMethodOptions {
  replace?: boolean
}

export interface PushMethodOptions {
  replace?: boolean
}

export interface SwitchToMethodOptions {
  reload?: boolean
  replace?: boolean
}

export interface ReloadMethodOptions {
  tab?: OpenTab | TabKey
  switch?: boolean
  replace?: boolean
}

export interface BackToMethodOptions {
  backTo?: OpenTab | JumpTabIdentity
  reload?: boolean
  replace?: boolean
}

export interface CloseMethodOptions {
  tab?: OpenTab | TabKey
  backTo?: OpenTab | JumpTabIdentity
  reload?: boolean
  replace?: boolean
}

export interface CloseRightMethodOptions {
  tab?: OpenTab
}

export interface CloseOthersMethodOptions {
  tab?: OpenTab
}

export type TabsAdapter<T = any> = (t: T & { event: EventEmitter }) => {
  listen(callback: (location: TabIdentity) => void): () => void

  identity(): TabIdentity

  getIdentity(id: JumpTabIdentity): TabIdentity

  equal(a: TabIdentity, b: TabIdentity): boolean

  exist(tabs: OpenTab[], identity: TabIdentity): boolean

  push(path: TabIdentity): void

  replace(path: TabIdentity): void

  getComponent(component: FunctionComponent, identity: TabIdentity, properties: TabProperties): FunctionComponent

  persistence?(tabs: OpenTab[]): void

  recovery?(getState: GetState<State>, children: ReactChildren): OpenTab[]
}

export type UpdateAfterCallback = (_: TabIdentity) => void
