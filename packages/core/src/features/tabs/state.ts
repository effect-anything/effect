import { EventEmitter } from "events"
import * as R from "ramda"
import create from "zustand"
import { getRandomKey, OpenTab, ReactChildren, tabKeyEq } from "./openTab"
// @ts-expect-error
import hash from "hash-string"
import {
  UpdateAfterCallback,
  JumpTabIdentity,
  TabIdentity,
  TabKey,
  TabsAdapter,
  OnChangeMethodOptions,
  PushMethodOptions,
  SwitchToMethodOptions,
  BackToMethodOptions,
  ReloadMethodOptions,
  CloseMethodOptions,
  CloseRightMethodOptions,
  CloseOthersMethodOptions,
} from "./types"
import { adapter as ReactRouterAdapter } from "./adapters/react-router"

export type State = {
  readonly event: EventEmitter

  readonly identity: TabIdentity

  readonly tabs: OpenTab[]

  readonly updateAfterCallback: UpdateAfterCallback | undefined

  readonly adapter: ReturnType<TabsAdapter>

  update(identity: TabIdentity, children: ReactChildren): void

  updateIdentity(identity: TabIdentity): void

  findByIdentity(identity: TabIdentity): OpenTab | undefined

  findIndexByIdentity(identity: TabIdentity): number

  findByKey(tabKey: TabKey): OpenTab | undefined

  findIndexByKey(tabKey: TabKey): number

  findNext(tabKey: TabKey): OpenTab | undefined

  findActive(): OpenTab

  onChange(path: TabIdentity, options: OnChangeMethodOptions): Promise<OpenTab>

  push(path: TabIdentity | JumpTabIdentity, options?: PushMethodOptions): Promise<OpenTab>

  switchTo(tabKey: TabKey, options?: SwitchToMethodOptions): Promise<OpenTab>

  goBack(options?: BackToMethodOptions): Promise<OpenTab>

  reload(options?: ReloadMethodOptions): Promise<OpenTab>

  close(options?: CloseMethodOptions): Promise<OpenTab>

  closeRight(options?: CloseRightMethodOptions): Promise<OpenTab>

  closeOthers(options?: CloseOthersMethodOptions): Promise<OpenTab>
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

  const store = create<State>((set, get) => ({
    event,
    adapter: adapterApi,
    identity: initialIdentity,
    tabs: [],
    updateAfterCallback: undefined,
    update: (identity, children) => {
      const { updateAfterCallback, tabs, adapter, findIndexByIdentity } = get()

      const exist = adapter.exist(tabs, identity)

      if (exist) {
        const index = findIndexByIdentity(identity)

        set({
          tabs: R.adjust(
            index,
            (tab) => {
              if (!R.eqBy(JSON.stringify, tab.identity, identity)) {
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
          getState: get,
          tabKey: info.hash,
          identity: info.identity,
          component: children,
        })

        set({
          tabs: R.append(newTab, tabs),
        })
      }

      if (updateAfterCallback) {
        try {
          updateAfterCallback(identity)
        } catch {}

        set({
          updateAfterCallback: undefined,
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
    onChange: (changeTabIdentity, { replace }) => {
      const { event, adapter, identity, findByIdentity } = get()

      return new Promise<OpenTab>((resolve) => {
        const afterCallback: UpdateAfterCallback = (identity) => {
          const currentTab = findByIdentity(identity)!
          const name = replace ? "replace" : "push"

          event.emit(name, currentTab)

          resolve(currentTab)
        }

        if (R.equals(changeTabIdentity, identity)) {
          afterCallback(identity)

          return
        }

        set({
          updateAfterCallback: afterCallback,
        })

        if (replace) {
          adapter.replace(changeTabIdentity)
        } else {
          adapter.push(changeTabIdentity)
        }
      })
    },
    push: (pushIdentity, options = {}) => {
      const { findByIdentity, findIndexByKey, onChange, tabs, adapter } = get()

      const identity = adapter.getIdentity(pushIdentity)

      const existTab = findByIdentity(identity)

      if (existTab) {
        if (!R.eqBy(JSON.stringify, existTab.identity, identity)) {
          const index = findIndexByKey(existTab.tabKey)
          const { hash } = buildIdentityInfoMemoize(identity)

          existTab.identity.state = identity.state
          existTab.identity.search = identity.search
          existTab.identity.hash = identity.hash
          existTab.tabKey = hash

          set({ tabs: R.update(index, existTab, tabs) })
        }

        return onChange(existTab.identity, {
          replace: options.replace,
        })
      }

      return onChange(identity, {
        replace: options.replace,
      })
    },
    switchTo: (tabKey, options = {}) => {
      const { findByKey, push, reload } = get()

      const targetTab = findByKey(tabKey)

      if (!targetTab) {
        return Promise.reject(new Error("switchTo tab not found"))
      }

      return push(targetTab.identity, {
        replace: options.replace,
      }).then((tab) => {
        if (options.reload) {
          return reload({
            tab: tab,
          })
        }

        return tab
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
        return Promise.resolve(active)
      }

      return push(nextTab.identity, {
        replace: options.replace,
      }).then((tab) => {
        if (options.reload) {
          return reload({
            tab: tab,
          })
        }

        return tab
      })
    },
    reload: (options = {}) => {
      const { event, findActive, tabs, findByKey, findIndexByKey, push } = get()

      const active = findActive()
      const reloadTab = options.tab instanceof OpenTab ? options.tab : options.tab ? findByKey(options.tab) : active

      if (!reloadTab) {
        return Promise.reject(new Error("reload tab not found"))
      }

      const isSwitch = options.switch ?? true

      const reloadKey = (tab: OpenTab) => {
        const index = findIndexByKey(tab.tabKey)

        set({
          tabs: R.adjust(
            index,
            (tab) => {
              tab.properties.key = getRandomKey()

              return tab
            },
            tabs
          ),
        })

        event.emit("reload", tabs[index])

        return Promise.resolve(tabs[index])
      }

      if (reloadTab.tabKey !== active.tabKey && isSwitch) {
        return push(reloadTab.identity, {
          replace: options.replace,
        }).then((tab) => reloadKey(tab))
      }

      return reloadKey(reloadTab)
    },
    close: (options = {}) => {
      const { findActive, tabs, findByKey, findNext, goBack } = get()

      const active = findActive()
      const closeTab = options.tab instanceof OpenTab ? options.tab : options.tab ? findByKey(options.tab) : active
      const closeTabKey = closeTab?.tabKey

      if (!closeTab || !closeTabKey) {
        return Promise.reject(new Error("close tab not found"))
      }

      const backTo = closeTabKey === active.tabKey ? findNext(closeTabKey) : options.backTo

      if (!backTo) {
        set({ tabs: R.reject(tabKeyEq(closeTabKey), tabs) })

        return Promise.resolve(active)
      }

      return goBack({
        backTo: backTo,
        reload: options.reload,
        replace: options.replace,
      }).then((tab) => {
        set({ tabs: R.reject(tabKeyEq(closeTabKey), tabs) })

        return tab
      })
    },
    closeRight: (options = {}) => {
      const { findActive, tabs, findIndexByKey, switchTo } = get()

      const active = findActive()
      const tab = options.tab || active
      const index = findIndexByKey(tab.tabKey)

      const start = R.max(index + 1, 0)
      const count = R.max(1, tabs.length - index - 1)

      return switchTo(tab.tabKey, {}).then((tab) => {
        set({ tabs: R.remove(start, count, tabs) })

        return tab
      })
    },
    closeOthers: (options = {}) => {
      const { findActive, tabs, switchTo } = get()

      const active = findActive()
      const tab = options.tab || active

      return switchTo(tab.tabKey, {}).then((tab) => {
        set({ tabs: R.filter(tabKeyEq(tab.tabKey), tabs) })

        return tab
      })
    },
  }))

  const initialTabs = [
    new OpenTab({
      getState: store.getState,
      tabKey: initialTabInfo.hash,
      identity: initialTabInfo.identity,
      component: children,
    }),
  ]

  store.setState({
    tabs: initialTabs,
  })

  return store
}
