import type { OpenTab } from "./openTab"

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

export type UpdateAfterCallback = (_: TabIdentity) => void
