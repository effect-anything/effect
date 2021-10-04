import { EventEmitter } from "events"
import type { History, LocationDescriptor } from "history"
import * as R from "ramda"
import create from "zustand"
import { buildLocationInfo, OpenTab, ReactChildren } from "./openTab"

export const tabKeyEq = R.propEq("tabKey")

export type State = {
  readonly event: EventEmitter

  readonly children: ReactChildren

  readonly history: History

  readonly location: History["location"]

  readonly tabs: OpenTab[]

  sync(location: History["location"], children: ReactChildren): void

  setTabs(tabs: OpenTab[]): void

  exist(location: LocationDescriptor): boolean

  findByLocation(location: LocationDescriptor): OpenTab | undefined

  findIndexByLocation(location: LocationDescriptor): number

  findByKey(tabKey: string): OpenTab | undefined

  findIndexByKey(tabKey: string): number

  findNext(tabKey?: string): OpenTab | undefined
}

export const createTabsStore = (history: History, children: ReactChildren) => {
  return create<State>((set, get) => ({
    event: new EventEmitter(),
    children,
    history: history,
    location: history.location,
    tabs: [],
    sync: (location, children) =>
      set((state) => {
        const info = buildLocationInfo(location)
        const idx = state.findIndexByLocation(info.location)

        if (idx === -1) {
          const newTab = new OpenTab({
            tabKey: info.hash,
            location: info.location,
            content: children,
          })

          const newTabs = R.append(newTab, state.tabs)

          return {
            location,
            children,
            tabs: newTabs,
          }
        }

        return { location, children, tabs: state.tabs }
      }),
    getSyncValue: () => {
      const { location, children } = get()

      return { location, children }
    },
    setTabs: (tabs) => set({ tabs }),
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
