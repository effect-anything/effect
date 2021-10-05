import type { LocationDescriptor } from "history"
import * as R from "ramda"
import { EventEmitter } from "events"
import { useRef, useEffect, useCallback } from "react"
import { getRandomKey, OpenTab } from "./openTab"
import { useStore } from "./context"
import { tabKeyEq, HistoryCallbackSave, locationId, locationEquals } from "./state"

export { OpenTab }

type ParamType<T> = T extends (...args: infer P) => unknown ? P : T

type Fn = (() => unknown) | ((...args: any) => unknown)

function useEventCallback<
  T extends Fn,
  F extends ParamType<T> extends [] ? () => ReturnType<T> : (...args: ParamType<T>) => ReturnType<T>
>(fn: T, deps: ReadonlyArray<unknown> = []) {
  const ref = useRef<T>(fn)

  useEffect(() => {
    ref.current = fn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, ...deps])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    ((...args: any) => {
      const callback = ref.current

      // eslint-disable-next-line node/no-callback-literal
      return callback(...args)
    }) as F,
    [ref]
  )
}

export const useTabActive = () => {
  const { active, activeKey, activeIndex } = useStore((state) => {
    const idx = state.findIndexByLocation(state.location)

    return {
      active: state.tabs[idx],
      activeKey: state.tabs[idx]?.tabKey,
      activeIndex: idx,
    }
  })

  return {
    active,
    activeKey,
    activeIndex,
  }
}

export const useTabEvent = (): EventEmitter => {
  const event = useStore((state) => state.event)

  return event
}

interface HistoryMethodOptions {
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

interface PushMethodOptions {
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

interface SwitchToMethodOptions {
  reload?: boolean
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

interface ReloadMethodOptions {
  tab?: OpenTab | string
  switch?: boolean
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

interface BackToMethodOptions {
  backTo?: OpenTab | LocationDescriptor
  reload?: boolean
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

interface CloseMethodOptions {
  tab?: OpenTab | string
  backTo?: OpenTab | LocationDescriptor
  reload?: boolean
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

export const useTabs = () => {
  const { active, activeKey, activeIndex } = useTabActive()

  const { event, setHistoryCallbackMap, setTabs, findByLocation, findByKey, findIndexByKey, findNext } = useStore(
    (state) => ({
      event: state.event,
      setHistoryCallbackMap: state.setHistoryCallbackMap,
      setTabs: state.setTabs,
      findByLocation: state.findByLocation,
      findByKey: state.findByKey,
      findIndexByKey: state.findIndexByKey,
      findNext: state.findNext,
    })
  )

  const { history, tabs } = useStore((state) => ({
    history: state.history,
    tabs: state.tabs,
  }))

  const historyChange = useEventCallback((path: LocationDescriptor, { replace, callback }: HistoryMethodOptions) => {
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
  })

  const push = useEventCallback((path: LocationDescriptor, options: PushMethodOptions = {}) => {
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
  })

  const switchTo = useEventCallback((tabKey: string, options: SwitchToMethodOptions = {}) => {
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
  })

  const goBack = useEventCallback((options: BackToMethodOptions = {}) => {
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
  })

  const reload = useEventCallback((options: ReloadMethodOptions = {}) => {
    const isSwitch = options.switch ?? true

    const reloadTab = options.tab instanceof OpenTab ? options.tab : options.tab ? findByKey(options.tab) : active

    if (!reloadTab) {
      // TODO: callback
      options.callback?.(active)

      return
    }

    const reloadKey = (tab: OpenTab) => {
      const idx = findIndexByKey(tab.tabKey)

      const newTab = R.assocPath(["properties", "key"], getRandomKey(), tabs[idx])

      setTabs(R.update(idx, newTab, tabs))

      event.emit("reload", newTab)

      options.callback?.(newTab)
    }

    if (reloadTab.tabKey !== activeKey && isSwitch) {
      push(reloadTab.location, {
        replace: options.replace,
        callback: () => {
          reloadKey(reloadTab)
        },
      })

      return
    }

    reloadKey(reloadTab)
  })

  const close = useEventCallback((options: CloseMethodOptions = {}) => {
    const closeTab = options.tab instanceof OpenTab ? options.tab : options.tab ? findByKey(options.tab) : active

    const closeTabKey = closeTab?.tabKey

    if (!closeTab || !closeTabKey) {
      // TODO: callback
      options.callback?.(active)

      return
    }

    const backTo = closeTabKey === activeKey ? findNext(closeTabKey) : options.backTo

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
  })

  const closeRight = useEventCallback((tab: OpenTab, index: number, callback?: (tab: OpenTab) => void) => {
    switchTo(tab.tabKey, {
      callback: () => {
        const start = R.max(index + 1, 0)
        const count = R.max(1, tabs.length - index - 1)

        setTabs(R.remove(start, count, tabs))

        callback?.(tab)
      },
    })
  })

  const closeOthers = useEventCallback((tab?: OpenTab, callback?: (tab: OpenTab) => void) => {
    const tabKey = tab?.tabKey ?? activeKey

    switchTo(tabKey, {
      callback: (tab) => {
        setTabs(R.filter(tabKeyEq(tabKey), tabs))

        callback?.(tab)
      },
    })
  })

  return { active, activeKey, activeIndex, tabs, switchTo, push, goBack, reload, close, closeRight, closeOthers }
}
