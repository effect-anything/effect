/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

let boundRejectionHandler: any = null

type ErrorCallback = (error: Error) => void

function rejectionHandler(callback: ErrorCallback, eve: PromiseRejectionEvent): void {
  const { reason } = eve

  if (!reason || !(reason instanceof Error) || typeof reason.stack !== "string") {
    // A non-error was thrown, we don't have anything to show. :-(
    return
  }

  return callback(reason)
}

function registerUnhandledRejection(target: EventTarget, callback: ErrorCallback) {
  if (boundRejectionHandler !== null) {
    return
  }

  boundRejectionHandler = rejectionHandler.bind(undefined, callback)

  target.addEventListener("unhandledrejection", boundRejectionHandler)
}

function unregisterUnhandledRejection(target: EventTarget) {
  if (boundRejectionHandler === null) {
    return
  }

  target.removeEventListener("unhandledrejection", boundRejectionHandler)

  boundRejectionHandler = null
}

export { registerUnhandledRejection as register, unregisterUnhandledRejection as unregister }
