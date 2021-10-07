import { EventEmitter } from "events"
import type { History, LocationDescriptor } from "history"
import * as R from "ramda"
import create from "zustand"
import { LocationTabInfo, OpenTab, ReactChildren } from "./openTab"
// @ts-expect-error
import hash from "hash-string"

export const locationId = (location: History["location"] | LocationDescriptor) => {
  const isString = typeof location === "string"

  return {
    pathname: isString ? location : location.pathname,
    search: isString ? "" : location.search || "",
    state: isString ? undefined : location.state,
  }
}

export const locationEquals = (
  location: History["location"] | LocationDescriptor,
  tabLocation: History["location"] | LocationDescriptor
) => {
  return R.equals(locationId(location), locationId(tabLocation))
}

export const tabKeyEq = R.propEq("tabKey")

export type HistoryCallbackSave = (_: History["location"]) => void

export type State = {
  readonly event: EventEmitter

  readonly history: History

  readonly location: History["location"]

  readonly tabs: OpenTab[]

  readonly historyPromises: Map<string, HistoryCallbackSave>

  update(location: History["location"], children: ReactChildren): void

  updateLocation(location: History["location"]): void

  setHistoryCallbackMap(fn: (map: Map<string, HistoryCallbackSave>) => Map<string, HistoryCallbackSave>): void

  setTabs(tabs: OpenTab[]): void

  findByLocation(location: LocationDescriptor): OpenTab | undefined

  findIndexByLocation(location: LocationDescriptor): number

  findByKey(tabKey: string): OpenTab | undefined

  findIndexByKey(tabKey: string): number

  findNext(tabKey?: string): OpenTab

  buildLocationInfo(location: History["location"]): LocationTabInfo
}

export const createTabsStore = (history: History) => {
  return create<State>((set, get) => ({
    event: new EventEmitter(),
    history,
    location: history.location,
    tabs: [],
    historyPromises: new Map(),
    update: (location, children) => {
      const { historyPromises, tabs, findIndexByLocation, buildLocationInfo } = get()

      const info = buildLocationInfo(location)
      const idx = findIndexByLocation(location)

      if (idx === -1) {
        const newTab = new OpenTab({
          tabKey: info.hash,
          location: info.location,
          content: children,
        })

        set({
          tabs: R.append(newTab, tabs),
        })
      }

      const id = JSON.stringify(locationId(location))

      const resolve = historyPromises.get(id)

      if (resolve) {
        resolve(location)

        historyPromises.delete(id)

        set({
          historyPromises: historyPromises,
        })
      }
    },
    updateLocation: (location) => set({ location }),
    setTabs: (tabs) => set({ tabs }),
    setHistoryCallbackMap: (fn) =>
      set({
        historyPromises: fn(get().historyPromises),
      }),
    findByLocation: (location) => {
      const { tabs, findIndexByLocation } = get()

      const idx = findIndexByLocation(location)

      return tabs[idx]
    },
    findIndexByLocation: (location) => {
      const { tabs } = get()

      return R.findIndex((tab) => locationEquals(tab.location, location), tabs)
    },
    findByKey: (tabKey) => {
      const { tabs } = get()

      return R.find(tabKeyEq(tabKey), tabs)
    },
    findIndexByKey: (tabKey) => {
      const { tabs } = get()

      return R.findIndex(tabKeyEq(tabKey), tabs)
    },
    findNext: (key) => {
      const { tabs } = get()

      if (tabs.length === 1) {
        return tabs[0]
      }

      const currentIndex = R.findIndex(tabKeyEq(key), tabs)

      // last -> index -1
      // middle -> index + 1
      // head -> index +1
      const nextIndex = currentIndex === tabs.length - 1 ? currentIndex - 1 : currentIndex + 1

      const nextTab = tabs[nextIndex]

      return nextTab
    },
    buildLocationInfo: R.memoizeWith(JSON.stringify, (location: History["location"]): LocationTabInfo => {
      const newLocation = {
        pathname: location.pathname,
        search: location.search ? decodeURIComponent(location.search) : "",
        state: typeof location.state !== "undefined" ? location.state : undefined,
      }

      const hashStr = hash(JSON.stringify(newLocation))

      return {
        hash: hashStr,
        location: newLocation,
      }
    }),
  }))
}
