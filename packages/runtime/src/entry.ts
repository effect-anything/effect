import * as Client from "./client"
import * as Event from "./event"
import * as ErrorOverlay from "./error-overlay/init"
import * as Indicator from "./indicator/init"
import * as Logger from "./logger/init"

// TODO: rename

// @ts-expect-error
const hot = window.__hot__ ?? {
  logger: undefined,
  client: undefined,
  event: undefined,
  customHandlers: undefined,
}

if (!hot.logger) {
  hot.logger = Logger.create()
}

if (!hot.event) {
  hot.event = new Event.Event()
}

if (!hot.client) {
  hot.client = new Client.Hot(hot.event, [Indicator, ErrorOverlay])

  // init container
  hot.client.init()
  // init components/dataSource
  hot.client.open()
}

export const client = hot.client as Client.Hot

export const event = hot.event as Event.Event

export const overlay = hot.overlay as any
