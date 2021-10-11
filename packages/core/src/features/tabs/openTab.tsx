import React, { FunctionComponent, ReactNode, cloneElement, isValidElement } from "react"
import * as R from "ramda"
import { CloseMethodOptions, CloseRightMethodOptions, ReloadMethodOptions, TabIdentity } from "./types"
import type { State } from "./state"
import type { GetState } from "zustand"

export type ReactChildren = ReactNode | undefined

const withChildren = (children: ReactNode): FunctionComponent => {
  const displayName = "TabChildren"

  if (isValidElement(children)) {
    const Wrap: FunctionComponent = (props) => cloneElement(children, props)

    Wrap.displayName = displayName

    return Wrap
  }

  const Wrap: FunctionComponent = () => null

  return Wrap
}

export const getRandomKey = () => Math.ceil(Math.random() * 10000) + ""

export const tabKeyEq = R.propEq("tabKey")

export interface TabProperties {
  title: string
  key: string
}

interface OpenTabOptions {
  getState: GetState<State>
  tabKey: string
  identity: TabIdentity
  component: ReactChildren
}

export class OpenTab {
  private readonly getState: GetState<State>

  public tabKey: string

  public readonly identity: TabIdentity

  public readonly properties: TabProperties

  public children: ReactChildren

  public component: FunctionComponent

  public get index() {
    return this.getState().findIndexByKey(this.tabKey)
  }

  public get isHead() {
    return this.index === 0
  }

  public get isLast() {
    return this.index === this.getState().tabs.length - 1
  }

  public get canClose() {
    return this.getState().tabs.length > 1
  }

  public get canCloseRight() {
    return this.getState().tabs.length > 1 && !this.isLast
  }

  public get canCloseOthers() {
    return this.getState().tabs.length > 1
  }

  constructor({ getState, tabKey, identity, component }: OpenTabOptions) {
    this.getState = getState

    this.tabKey = tabKey

    this.identity = identity

    this.properties = {
      key: getRandomKey(),
      // TODO:
      title: "TODO",
    }

    this.component = getState().adapter.getComponent(withChildren(component), this.identity, this.properties)
  }

  public reload(options?: Omit<ReloadMethodOptions, "tab">) {
    return this.getState().reload({ ...options, tab: this })
  }

  public close(options?: Omit<CloseMethodOptions, "tab">) {
    return this.getState().close({ ...options, tab: this })
  }

  public closeRight(options?: Omit<CloseRightMethodOptions, "tab">) {
    return this.getState().closeRight({ ...options, tab: this })
  }

  public closeOthers(options?: Omit<CloseRightMethodOptions, "tab">) {
    return this.getState().closeOthers({ ...options, tab: this })
  }
}
