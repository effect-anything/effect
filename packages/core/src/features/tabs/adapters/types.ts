import type { EventEmitter } from "events"
import type { GetState } from "zustand"
import type { FunctionComponent } from "react"
import type { OpenTab, ReactChildren, TabProperties } from "../openTab"
import type { State } from "../state"
import { JumpTabIdentity, TabIdentity } from "../types"

export interface DefaultAdapterOptions {
  event: EventEmitter
}

export abstract class TabsAdapter<T = any> {
  public readonly event: EventEmitter

  constructor(options: T & { event: EventEmitter }) {
    this.event = options.event
  }

  public abstract listen(callback: (location: TabIdentity) => void): () => void

  public abstract identity(): TabIdentity

  public abstract getIdentity(id: JumpTabIdentity): TabIdentity

  public abstract equal(a: TabIdentity, b: TabIdentity): boolean

  public abstract exist(tabs: OpenTab[], identity: TabIdentity): boolean

  public abstract push(path: TabIdentity): void

  public abstract replace(path: TabIdentity): void

  public abstract getComponent(
    component: FunctionComponent,
    identity: TabIdentity,
    properties: TabProperties
  ): FunctionComponent

  public abstract persistence?(tabs: OpenTab[]): void

  public abstract recovery?(getState: GetState<State>, children: ReactChildren): OpenTab[]
}
