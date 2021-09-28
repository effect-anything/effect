/* globals __webpack_hash__ */
import { ErrorRecord } from "./type"

function uniqBy<T, U>(fn: (a: T) => U, list: readonly T[]): T[] {
  const set = new Set<U>()

  const result = []
  let idx = 0
  let appliedItem, item

  while (idx < list.length) {
    item = list[idx]
    appliedItem = fn(item)

    if (!set.has(appliedItem)) {
      result.push(item)

      set.add(appliedItem)
    }

    idx += 1
  }

  return result
}

export class State {
  private _compilerErrors: ErrorRecord[] = []

  private _compilerWarnings: ErrorRecord[] = []

  private _runtimeErrors: Error[] = []

  private _compiling = false

  private _progress = 0

  public currentHash = typeof __webpack_hash__ !== "undefined" ? __webpack_hash__ : ""

  public previousHash = ""

  public isUnloading = false

  public get hasCompiling() {
    return this._compiling
  }

  public get hasCompilerError() {
    return this._compilerErrors.length > 0
  }

  public get hasCompilerWarning() {
    return this._compilerWarnings.length > 0
  }

  public get hasRuntimeError() {
    return this._runtimeErrors.length > 0
  }

  public get compilerWarnings() {
    return this._compilerWarnings
  }

  public get compilerErrors() {
    return this._compilerErrors
  }

  public get runtimeErrors() {
    return this._runtimeErrors
  }

  public get progress() {
    return this._progress
  }

  public startCompiling() {
    this._compiling = true
  }

  public endCompiling() {
    this._compiling = false
  }

  public setUnloading(status: boolean) {
    this.isUnloading = status
  }

  public setProgress(progress: number) {
    this._progress = progress
  }

  public setCompilerErrors(errors: ErrorRecord[]) {
    this._compilerErrors = errors
  }

  public setCompilerWarnings(errors: ErrorRecord[]) {
    this._compilerWarnings = errors
  }

  public setRuntimeErrors(errors: Error[]) {
    this._runtimeErrors = uniqBy((error) => error.stack + error.message, errors)
  }

  public pushRuntimeError(error: Error) {
    this.setRuntimeErrors(this.runtimeErrors.concat(error))
  }
}
