import { EventEmitter } from "events"
import * as R from "ramda"
import create from "zustand"
import { getRandomKey, OpenTab, ReactChildren, tabKeyEq } from "./openTab"
// @ts-expect-error
import hash from "hash-string"
import { HistoryCallbackSave, JumpTabIdentity, TabIdentity, TabKey, TabsAdapter } from "./types"
import { adapter as ReactRouterAdapter } from "./adapters/react-router"

export interface OnChangeMethodOptions {
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
  tab?: OpenTab | TabKey
  switch?: boolean
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

export interface BackToMethodOptions {
  backTo?: OpenTab | JumpTabIdentity
  reload?: boolean
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

export interface CloseMethodOptions {
  tab?: OpenTab | TabKey
  backTo?: OpenTab | JumpTabIdentity
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

export type State = {
  readonly event: EventEmitter

  readonly identity: TabIdentity

  readonly tabs: OpenTab[]

  readonly historyChangeCallback: HistoryCallbackSave | null

  readonly adapter: ReturnType<TabsAdapter>

  update(identity: TabIdentity, children: ReactChildren): void

  updateIdentity(identity: TabIdentity): void

  findByIdentity(identity: TabIdentity): OpenTab | undefined

  findIndexByIdentity(identity: TabIdentity): number

  findByKey(tabKey: TabKey): OpenTab | undefined

  findIndexByKey(tabKey: TabKey): number

  findNext(tabKey: TabKey): OpenTab | undefined

  findActive(): OpenTab

  onChange(path: TabIdentity, options: OnChangeMethodOptions): void

  push(path: TabIdentity | JumpTabIdentity, options?: PushMethodOptions): void

  switchTo(tabKey: TabKey, options?: SwitchToMethodOptions): void

  goBack(options?: BackToMethodOptions): void

  reload(options?: ReloadMethodOptions): void

  close(options?: CloseMethodOptions): void

  closeRight(options?: CloseRightMethodOptions): void

  closeOthers(options?: CloseOthersMethodOptions): void
}

interface TabsStoreOptions {
  adapter?: TabsAdapter
}

const buildIdentityInfo = (id: TabIdentity) => {
  const hashStr = hash(JSON.stringify(id))

  return {
    hash: hashStr + "",
    identity: id,
  }
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

  const initialIdentity = adapterApi.identity()

  const buildIdentityInfoMemoize = R.memoizeWith(JSON.stringify, buildIdentityInfo)

  const initialTabInfo = buildIdentityInfoMemoize(initialIdentity)

  const initialTabs = [
    new OpenTab({
      tabKey: initialTabInfo.hash,
      identity: initialTabInfo.identity,
      component: children,
    }),
  ]

  const store = create<State>((set, get) => ({
    event,
    adapter: adapterApi,
    identity: initialIdentity,
    tabs: initialTabs,
    historyChangeCallback: null,
    update: (identity, children) => {
      const { historyChangeCallback, tabs, adapter, findIndexByIdentity } = get()

      const exist = adapter.exist(tabs, identity)

      if (exist) {
        const index = findIndexByIdentity(identity)

        set({
          tabs: R.adjust(
            index,
            (tab) => {
              if (!R.equals(tab.identity, identity)) {
                const { hash } = buildIdentityInfoMemoize(identity)

                tab.identity.state = identity.state
                tab.identity.search = identity.search
                tab.identity.hash = identity.hash
                tab.tabKey = hash
              }

              return tab
            },
            tabs
          ),
        })
      } else {
        const info = buildIdentityInfoMemoize(identity)

        const newTab = new OpenTab({
          tabKey: info.hash,
          identity: info.identity,
          component: children,
        })

        set({
          tabs: R.append(newTab, tabs),
        })
      }

      if (historyChangeCallback) {
        historyChangeCallback(identity)

        set({
          historyChangeCallback: null,
        })
      }
    },
    updateIdentity: (identity) => set({ identity: identity }),
    findByIdentity: (identity) => {
      const { tabs, adapter } = get()

      return R.find((tab) => adapter.equal(tab.identity, identity), tabs)
    },
    findIndexByIdentity: (identity) => {
      const { tabs, adapter } = get()

      return R.findIndex((tab) => adapter.equal(tab.identity, identity), tabs)
    },
    findByKey: (tabKey) => {
      const { tabs } = get()

      return R.find(tabKeyEq(tabKey), tabs)
    },
    findIndexByKey: (tabKey) => {
      const { tabs } = get()

      return R.findIndex(tabKeyEq(tabKey), tabs)
    },
    findNext: (tabKey) => {
      const { tabs } = get()

      if (tabs.length === 1) {
        return
      }

      const currentIndex = R.findIndex(tabKeyEq(tabKey), tabs)

      // last -> index -1
      // middle -> index + 1
      // head -> index +1
      const nextIndex = currentIndex === tabs.length - 1 ? currentIndex - 1 : currentIndex + 1

      const nextTab = tabs[nextIndex]

      return nextTab
    },
    findActive() {
      const { identity, findByIdentity } = get()

      return findByIdentity(identity)!
    },
    onChange: (changeTabIdentity, { replace, callback }) => {
      const { event, adapter, identity, findByIdentity } = get()

      const resolve: HistoryCallbackSave = (identity) => {
        const currentTab = findByIdentity(identity)!
        const name = replace ? "replace" : "push"

        event.emit(name, currentTab)

        callback?.(currentTab)
      }

      if (R.equals(changeTabIdentity, identity)) {
        resolve(identity)

        return
      }

      set({
        historyChangeCallback: resolve,
      })

      if (replace) {
        adapter.replace(changeTabIdentity)
      } else {
        adapter.push(changeTabIdentity)
      }
    },
    push: (pushIdentity, options = {}) => {
      const { findByIdentity, findIndexByKey, onChange, tabs, adapter } = get()

      const identity = adapter.getIdentity(pushIdentity)

      const existTab = findByIdentity(identity)

      if (existTab) {
        if (!R.equals(existTab.identity, identity)) {
          const index = findIndexByKey(existTab.tabKey)

          existTab.identity.state = identity.state
          existTab.identity.search = identity.search
          existTab.identity.hash = identity.hash

          set({ tabs: R.update(index, existTab, tabs) })
        }

        onChange(existTab.identity, {
          replace: options.replace,
          callback: options.callback,
        })
      } else {
        onChange(identity, {
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
      const { push, reload, adapter, findActive, findByIdentity, findNext } = get()

      const active = findActive()
      const nextTab =
        options.backTo instanceof OpenTab
          ? options.backTo
          : options.backTo
          ? findByIdentity(adapter.getIdentity(options.backTo))
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
      const { event, findActive, tabs, findByKey, findIndexByKey, switchTo } = get()

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

        set({ tabs: R.update(idx, newTab, tabs) })

        event.emit("reload", newTab)

        options.callback?.(newTab)
      }

      if (reloadTab.tabKey !== active.tabKey && isSwitch) {
        switchTo(reloadTab.tabKey, {
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
      const { findActive, tabs, findByKey, findNext, goBack } = get()

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
        set({ tabs: R.reject(tabKeyEq(closeTabKey), tabs) })

        options.callback?.(active)

        return
      }

      goBack({
        backTo: backTo,
        reload: options.reload,
        replace: options.replace,
        callback: (tab) => {
          set({ tabs: R.reject(tabKeyEq(closeTabKey), tabs) })

          options.callback?.(tab)
        },
      })
    },
    closeRight: (options = {}) => {
      const { findActive, tabs, findIndexByKey, switchTo } = get()

      const active = findActive()
      const tab = options.tab || active
      const index = findIndexByKey(tab.tabKey)

      const start = R.max(index + 1, 0)
      const count = R.max(1, tabs.length - index - 1)

      switchTo(tab.tabKey, {
        callback: () => {
          set({ tabs: R.remove(start, count, tabs) })

          options.callback?.(tab)
        },
      })
    },
    closeOthers: (options = {}) => {
      const { findActive, tabs, switchTo } = get()

      const active = findActive()
      const tab = options.tab || active

      switchTo(tab.tabKey, {
        callback: (tab) => {
          set({ tabs: R.filter(tabKeyEq(tab.tabKey), tabs) })

          options.callback?.(tab)
        },
      })
    },
  }))

  return store
}
