import { EventEmitter } from "events"
import { SerialTask } from "./serial-task"

export const AuthStatus = {
  AUTHORIZED: "AUTHORIZED",
  UNAUTHORIZED: "UNAUTHORIZED",
} as const

export const AuthActionTypes = {
  SIGN_IN: "SIGN_IN",
  SIGN_OUT: "SIGN_OUT",
} as const

export abstract class BaseStrategy<T> {
  public event: EventEmitter

  protected signInTask: SerialTask<T>

  protected signOutTask: SerialTask<T>

  public restoreTask: SerialTask<T>

  public resolveTask: SerialTask<T>

  constructor() {
    this.event = new EventEmitter()

    this.signInTask = new SerialTask()
    this.signOutTask = new SerialTask()
    this.restoreTask = new SerialTask()
    this.resolveTask = new SerialTask()
  }

  protected abstract store: T

  public abstract state: any

  abstract restore(callback: () => void): Promise<void>

  abstract signIn(...args: any): Promise<void>

  abstract signOut(): Promise<void>

  abstract checkLogin(): boolean

  abstract getExtractHeaders(): any
}
