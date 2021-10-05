import { EventEmitter } from "events"
import type { History, LocationDescriptor } from "history"
import * as R from "ramda"
import create from "zustand"
import { buildLocationInfo, OpenTab, ReactChildren } from "./openTab"

export const tabKeyEq = R.propEq("tabKey")

export type HistoryCallbackSave = (_: History["location"]) => void

export type State = {
  readonly event: EventEmitter

  readonly history: History

  readonly location: History["location"]

  readonly tabs: OpenTab[]

  readonly historyPromises: Map<string, HistoryCallbackSave[]>

  update(location: History["location"], children: ReactChildren): void

  updateLocation(location: History["location"]): void

  setHistoryCallbackMap(fn: (map: Map<string, HistoryCallbackSave[]>) => Map<string, HistoryCallbackSave[]>): void

  setTabs(tabs: OpenTab[]): void

  exist(location: LocationDescriptor): boolean

  findByLocation(location: LocationDescriptor): OpenTab | undefined

  findIndexByLocation(location: LocationDescriptor): number

  findByKey(tabKey: string): OpenTab | undefined

  findIndexByKey(tabKey: string): number

  findNext(tabKey?: string): OpenTab | undefined
}

export const createTabsStore = (history: History) => {
  return create<State>((set, get) => ({
    event: new EventEmitter(),
    history,
    location: history.location,
    tabs: [],
    historyPromises: new Map(),
    update: (location, children) => {
      if (!location || !children) {
        return
      }

      const { findIndexByLocation, historyPromises, tabs } = get()

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

      const id = JSON.stringify({
        pathname: location.pathname,
        state: location.state || undefined,
        search: location.search || "",
      })

      const resolves = historyPromises.get(id)

      if (resolves && Array.isArray(resolves)) {
        resolves.forEach((fn) => fn(location))

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
    exist: (location) => {
      const { findByLocation } = get()

      return !!findByLocation(location)
    },
    findByLocation: (location) => {
      const { tabs, findIndexByLocation } = get()

      const idx = findIndexByLocation(location)

      return tabs[idx]
    },
    findIndexByLocation: (location) => {
      const { tabs } = get()

      return R.findIndex((tab) => {
        if (typeof location === "string") {
          let fullPath = tab.location.pathname

          if (tab.location.search) {
            fullPath += tab.location.search
          }

          return fullPath === location
        }

        const pathLocation = {
          pathname: location.pathname,
          search: location.search || undefined,
          state: undefined,
        }

        const tabLocation = {
          pathname: tab.location.pathname,
          search: tab.location.search || undefined,
          state: undefined,
        }

        return R.equals(pathLocation, tabLocation)
      }, tabs)
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
        return
      }

      const removeIndex = R.findIndex(tabKeyEq(key), tabs)

      const nextIndex = removeIndex >= 1 ? removeIndex - 1 : removeIndex + 1

      const nextTab = tabs[nextIndex]

      return nextTab
    },
  }))
}
