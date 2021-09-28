/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

type ErrorCallback = (error: Error) => void

let boundErrorHandler: ((e: Event) => void) | null = null

function errorHandler(callback: ErrorCallback, ev: Event): void {
  // @ts-expect-error
  const error = ev?.error

  if (!error || !(error instanceof Error) || typeof error.stack !== "string") {
    // A non-error was thrown, we don't have anything to show. :-(
    return
  }

  callback(error)
}

function registerUnhandledError(target: EventTarget, callback: ErrorCallback) {
  if (boundErrorHandler !== null) {
    return
  }

  boundErrorHandler = errorHandler.bind(undefined, callback)

  target.addEventListener("error", boundErrorHandler)
}

function unregisterUnhandledError(target: EventTarget) {
  if (boundErrorHandler === null) {
    return
  }

  target.removeEventListener("error", boundErrorHandler)

  boundErrorHandler = null
}

export { registerUnhandledError as register, unregisterUnhandledError as unregister }
