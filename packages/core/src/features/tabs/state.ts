import { EventEmitter } from "events"
import type { History, LocationDescriptor } from "history"
import * as R from "ramda"
import create from "zustand"
import { buildTab, OpenTab, ReactChildren } from "./openTab"

const tabKeyEq = R.propEq("tabKey")

export type State = {
  readonly event: EventEmitter

  readonly children: ReactChildren

  readonly location: History["location"]

  readonly tabs: OpenTab[]

  readonly activeIndex: number

  updateTab(location: History["location"], children: ReactChildren): OpenTab

  setTabs(tabs: OpenTab[]): void

  exist(location: LocationDescriptor): boolean

  findByLocationIndex(location: LocationDescriptor): number

  findByLocation(location: LocationDescriptor): OpenTab | undefined

  findByKey(tabKey: string): OpenTab | undefined

  getNext(key?: string): OpenTab | undefined
}

export const createTabsStore = (location: History["location"], children: ReactChildren) => {
  return create<State>((set, get) => ({
    event: new EventEmitter(),
    children,
    location,
    tabs: [],
    activeIndex: 0,
    updateTab: (location, children) => {
      const tab = buildTab(location, children)

      set((state) => {
        const idx = state.findByLocationIndex(location)

        if (idx === -1) {
          const newTabs = R.append(tab, state.tabs)

          return {
            location,
            children,
            activeIndex: newTabs.length - 1,
            tabs: newTabs,
          }
        }

        return { location, children, activeIndex: idx, tabs: state.tabs }
      })

      return tab
    },
    setTabs: (tabs) => set({ tabs }),
    exist: (location) => !!get().findByLocation(location),
    findByLocationIndex: (location) => {
      const { tabs } = get()

      return tabs.findIndex((tab) => {
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

        return JSON.stringify(pathLocation) === JSON.stringify(tabLocation)
      })
    },
    findByLocation: (location) => {
      const { tabs, findByLocationIndex } = get()

      const idx = findByLocationIndex(location)

      return tabs[idx]
    },
    findByKey: (tabKey) => {
      const { tabs } = get()

      return R.find(tabKeyEq(tabKey), tabs)
    },
    getNext: (key) => {
      const { tabs } = get()

      if (tabs.length === 1) {
        return
      }

      const removeIndex = tabs.findIndex(tabKeyEq(key))

      const nextIndex = removeIndex >= 1 ? removeIndex - 1 : removeIndex + 1

      const nextTab = tabs[nextIndex]

      return nextTab
    },
  }))
}
