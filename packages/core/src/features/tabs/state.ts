import { EventEmitter } from "events"
import * as R from "ramda"
import create from "zustand"
import { getRandomKey, OpenTab, ReactChildren } from "./openTab"
// @ts-expect-error
import hash from "hash-string"
import { HistoryCallbackSave, JumpTabLocation, TabLocation, TabsAdapter } from "./types"
import { adapter as ReactRouterAdapter } from "./adapters/react-router"

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
  backTo?: OpenTab | JumpTabLocation
  reload?: boolean
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

export interface CloseMethodOptions {
  tab?: OpenTab | string
  backTo?: OpenTab | JumpTabLocation
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

export const locationId = (location: JumpTabLocation | TabLocation) => {
  const isString = typeof location === "string"

  return {
    pathname: isString ? location : location.pathname,
    search: isString ? "" : location.search || "",
    state: isString ? {} : location.state || {},
  }
}

export const locationEquals = (location: JumpTabLocation | TabLocation, tabLocation: JumpTabLocation | TabLocation) => {
  return R.eqBy(locationId, location, tabLocation)
}

export const tabKeyEq = R.propEq("tabKey")

export type State = {
  readonly event: EventEmitter

  readonly location: TabLocation

  readonly tabs: OpenTab[]

  readonly historyChangeCallback: HistoryCallbackSave | null

  readonly adapter: ReturnType<TabsAdapter>

  update(location: TabLocation, children: ReactChildren): void

  updateLocation(location: TabLocation): void

  setTabs(tabs: OpenTab[]): void

  findByLocation(location: TabLocation | JumpTabLocation): OpenTab | undefined

  findIndexByLocation(location: TabLocation): number

  findByKey(tabKey: string): OpenTab | undefined

  findIndexByKey(tabKey: string): number

  findNext(tabKey?: string): OpenTab | undefined

  findActive(): OpenTab

  onChange(path: JumpTabLocation, options: HistoryChangeMethodOptions): void

  push(path: JumpTabLocation, options?: PushMethodOptions): void

  switchTo(tabKey: string, options?: SwitchToMethodOptions): void

  goBack(options?: BackToMethodOptions): void

  reload(options?: ReloadMethodOptions): void

  close(options?: CloseMethodOptions): void

  closeRight(options?: CloseRightMethodOptions): void

  closeOthers(options?: CloseOthersMethodOptions): void
}

interface TabsStoreOptions {
  adapter?: TabsAdapter
}

export const createTabsStore = (
  children: ReactChildren,
  { adapter = ReactRouterAdapter, ...rest }: TabsStoreOptions
) => {
  const event = new EventEmitter()
  const adapterApi = adapter({
    ...rest,
    event,
  })

  const initialLocation = adapterApi.identity()

  const buildLocationInfo = R.memoizeWith(JSON.stringify, (location: TabLocation) => {
    const newLocation = {
      pathname: location.pathname,
      search: location.search ? decodeURIComponent(location.search) : "",
      state: typeof location.state === "undefined" ? {} : location.state || {},
      hash: location.hash ? location.hash : "",
    }

    const hashStr = hash(JSON.stringify(newLocation))

    return {
      hash: hashStr,
      location: newLocation,
    }
  })

  const initialTabInfo = buildLocationInfo(initialLocation)
  const initialTabs = [
    new OpenTab({
      tabKey: initialTabInfo.hash,
      identity: initialTabInfo.location,
      component: children,
    }),
  ]

  const store = create<State>((set, get) => ({
    event,
    adapter: adapterApi,
    location: initialLocation,
    tabs: initialTabs,
    historyChangeCallback: null,
    update: (location, children) => {
      const { historyChangeCallback, tabs, findIndexByLocation } = get()

      const idx = findIndexByLocation(location)

      if (idx === -1) {
        const info = buildLocationInfo(location)

        const newTab = new OpenTab({
          tabKey: info.hash,
          identity: info.location,
          component: children,
        })

        set({
          tabs: R.append(newTab, tabs),
        })
      }

      if (historyChangeCallback) {
        historyChangeCallback(location)

        set({
          historyChangeCallback: null,
        })
      }
    },
    updateLocation: (location) => set({ location }),
    setTabs: (tabs) => set({ tabs }),
    findByLocation: (location) => {
      const { tabs } = get()

      return R.find((tab) => locationEquals(tab.identity, location), tabs)
    },
    findIndexByLocation: (location) => {
      const { tabs } = get()

      return R.findIndex((tab) => locationEquals(tab.identity, location), tabs)
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
    findActive() {
      const { tabs, findIndexByLocation, location } = get()

      const index = findIndexByLocation(location)

      return tabs[index]
    },
    onChange: (path, { replace, callback }) => {
      const { event, adapter, location, findByLocation } = get()

      const resolve: HistoryCallbackSave = (location) => {
        const currentTab = findByLocation(location)!
        const name: string = replace ? "replace" : "push"

        event.emit(name, currentTab)

        callback?.(currentTab)
      }

      if (locationEquals(path, location)) {
        resolve(location)

        return
      }

      set({
        historyChangeCallback: resolve,
      })

      if (replace) {
        adapter.replace(path)
      } else {
        adapter.push(path)
      }
    },
    push: (path, options = {}) => {
      const { findByLocation, findIndexByKey, onChange, setTabs, tabs } = get()

      const existTab = findByLocation(path)

      if (existTab) {
        if (typeof path !== "string") {
          const idx = findIndexByKey(existTab.tabKey)

          existTab.identity.state = path.state || {}
          existTab.identity.search = path.search || ""

          setTabs(R.update(idx, existTab, tabs))
        }

        onChange(existTab.identity, {
          replace: options.replace,
          callback: options.callback,
        })
      } else {
        onChange(path, {
          replace: options.replace,
          callback: options.callback,
        })
      }
    },
    switchTo: (tabKey, options = {}) => {
      const { findActive, findByKey, push } = get()

      const targetTab = findByKey(tabKey)

      if (!targetTab) {
        const active = findActive()

        // TODO: callback
        options.callback?.(active)

        return
      }

      push(targetTab.identity, {
        reload: options.reload,
        replace: options.replace,
        callback: options.callback,
      })
    },
    goBack: (options = {}) => {
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

      push(nextTab.identity, {
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
    reload: (options = {}) => {
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
        push(reloadTab.identity, {
          replace: options.replace,
          callback: () => {
            reloadKey(reloadTab)
          },
        })

        return
      }

      reloadKey(reloadTab)
    },
    close: (options = {}) => {
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
    closeRight: (options = {}) => {
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
    closeOthers: (options = {}) => {
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

  return store
}
