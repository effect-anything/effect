import { EventEmitter } from "events"
import type { History, LocationDescriptor } from "history"
import * as R from "ramda"
import create from "zustand"
import { getRandomKey, LocationTabInfo, OpenTab, ReactChildren } from "./openTab"
// @ts-expect-error
import hash from "hash-string"

export interface HistoryChangeMethodOptions {
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

export interface PushMethodOptions {
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

export interface SwitchToMethodOptions {
  reload?: boolean
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

export interface ReloadMethodOptions {
  tab?: OpenTab | string
  switch?: boolean
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

export interface BackToMethodOptions {
  backTo?: OpenTab | LocationDescriptor
  reload?: boolean
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

export interface CloseMethodOptions {
  tab?: OpenTab | string
  backTo?: OpenTab | LocationDescriptor
  reload?: boolean
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

export interface CloseRightMethodOptions {
  tab?: OpenTab
  callback?: (tab: OpenTab) => void
}

export interface CloseOthersMethodOptions {
  tab?: OpenTab
  callback?: (tab: OpenTab) => void
}

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

  findNext(tabKey?: string): OpenTab | undefined

  buildLocationInfo(location: History["location"]): LocationTabInfo

  findActive(): OpenTab

  historyChange(path: LocationDescriptor, options: HistoryChangeMethodOptions): void

  push(path: LocationDescriptor, options?: PushMethodOptions): void

  switchTo(tabKey: string, options?: SwitchToMethodOptions): void

  goBack(options?: BackToMethodOptions): void

  reload(options?: ReloadMethodOptions): void

  close(options?: CloseMethodOptions): void

  closeRight(options?: CloseRightMethodOptions): void

  closeOthers(options?: CloseOthersMethodOptions): void
}

export const createTabsStore = (history: History, children: ReactChildren) => {
  const store = create<State>((set, get) => ({
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
        return
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
        state: typeof location.state === "undefined" ? {} : location.state,
      }

      const hashStr = hash(JSON.stringify(newLocation))

      return {
        hash: hashStr,
        location: newLocation,
      }
    }),
    findActive() {
      const { tabs, findIndexByLocation, location } = get()

      const index = findIndexByLocation(location)

      return tabs[index]
    },
    historyChange: (path: LocationDescriptor, { replace, callback }: HistoryChangeMethodOptions) => {
      const { event, findByLocation, setHistoryCallbackMap } = get()

      const resolve: HistoryCallbackSave = (location) => {
        const currentTab = findByLocation(location)!
        const name: string = replace ? "replace" : "push"

        event.emit(name, currentTab)

        callback?.(currentTab)
      }

      if (locationEquals(path, history.location)) {
        resolve(history.location)

        return
      }

      const id = JSON.stringify(locationId(path))

      setHistoryCallbackMap((map) => map.set(id, resolve))

      if (replace) {
        history.replace(path)
      } else {
        history.push(path)
      }
    },
    push: (path: LocationDescriptor, options: PushMethodOptions = {}) => {
      const { findByLocation, findIndexByKey, historyChange, setTabs, tabs } = get()

      const existTab = findByLocation(path)

      if (existTab) {
        if (typeof path !== "string") {
          const idx = findIndexByKey(existTab.tabKey)

          existTab.location.state = path.state
          existTab.location.search = path.search || ""

          setTabs(R.update(idx, existTab, tabs))
        }

        const target = {
          state: existTab.location.state,
          pathname: existTab.location.pathname,
          search: existTab.location.search,
        }

        historyChange(target, { replace: options.replace, callback: options.callback })
      } else {
        historyChange(path, {
          replace: options.replace,
          callback: options.callback,
        })
      }
    },
    switchTo: (tabKey: string, options: SwitchToMethodOptions = {}) => {
      const { findActive, findByKey, push } = get()

      const active = findActive()
      const targetTab = findByKey(tabKey)

      if (!targetTab) {
        // TODO: callback
        options.callback?.(active)

        return
      }

      push(targetTab.location, {
        reload: options.reload,
        replace: options.replace,
        callback: options.callback,
      })
    },
    goBack: (options: BackToMethodOptions = {}) => {
      const { findActive, findByLocation, findNext, push, reload } = get()

      const active = findActive()
      const nextTab =
        options.backTo instanceof OpenTab
          ? options.backTo
          : options.backTo
          ? findByLocation(options.backTo)
          : findNext(active.tabKey)

      if (!nextTab) {
        // TODO: callback
        options.callback?.(active)

        return
      }

      push(nextTab.location, {
        replace: options.replace,
        callback: () => {
          if (options.reload) {
            reload({
              tab: nextTab,
              callback: options.callback,
            })
          } else {
            options.callback?.(nextTab)
          }
        },
      })
    },
    reload: (options: ReloadMethodOptions = {}) => {
      const { event, findActive, tabs, setTabs, findByKey, findIndexByKey, push } = get()

      const active = findActive()
      const reloadTab = options.tab instanceof OpenTab ? options.tab : options.tab ? findByKey(options.tab) : active

      if (!reloadTab) {
        // TODO: callback
        options.callback?.(active)

        return
      }

      const isSwitch = options.switch ?? true

      const reloadKey = (tab: OpenTab) => {
        const idx = findIndexByKey(tab.tabKey)
        const newTab = R.assocPath(["properties", "key"], getRandomKey(), tabs[idx])

        setTabs(R.update(idx, newTab, tabs))

        event.emit("reload", newTab)

        options.callback?.(newTab)
      }

      if (reloadTab.tabKey !== active.tabKey && isSwitch) {
        push(reloadTab.location, {
          replace: options.replace,
          callback: () => {
            reloadKey(reloadTab)
          },
        })

        return
      }

      reloadKey(reloadTab)
    },
    close: (options: CloseMethodOptions = {}) => {
      const { findActive, tabs, setTabs, findByKey, findNext, goBack } = get()

      const active = findActive()
      const closeTab = options.tab instanceof OpenTab ? options.tab : options.tab ? findByKey(options.tab) : active
      const closeTabKey = closeTab?.tabKey

      if (!closeTab || !closeTabKey) {
        // TODO: callback
        options.callback?.(active)

        return
      }

      const backTo = closeTabKey === active.tabKey ? findNext(closeTabKey) : options.backTo

      if (!backTo) {
        setTabs(R.reject(tabKeyEq(closeTabKey), tabs))

        options.callback?.(active)

        return
      }

      goBack({
        backTo: backTo,
        reload: options.reload,
        replace: options.replace,
        callback: (tab) => {
          setTabs(R.reject(tabKeyEq(closeTabKey), tabs))

          options.callback?.(tab)
        },
      })
    },
    closeRight: (options: CloseRightMethodOptions = {}) => {
      const { findActive, tabs, setTabs, findIndexByKey, switchTo } = get()

      const active = findActive()
      const tab = options.tab || active
      const index = findIndexByKey(tab.tabKey)

      const start = R.max(index + 1, 0)
      const count = R.max(1, tabs.length - index - 1)

      switchTo(tab.tabKey, {
        callback: () => {
          setTabs(R.remove(start, count, tabs))

          options.callback?.(tab)
        },
      })
    },
    closeOthers: (options: CloseOthersMethodOptions = {}) => {
      const { findActive, tabs, setTabs, switchTo } = get()

      const active = findActive()
      const tab = options.tab || active

      switchTo(tab.tabKey, {
        callback: (tab) => {
          setTabs(R.filter(tabKeyEq(tab.tabKey), tabs))

          options.callback?.(tab)
        },
      })
    },
  }))

  store.getState().update(history.location, children)

  return store
}
