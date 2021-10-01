import type { LocationDescriptor } from "history"
import * as R from "ramda"
import { EventEmitter } from "events"
import { useLocation } from "react-router-dom"
import { OpenTab } from "./openTab"
import { useStore } from "./context"

export { OpenTab }

export const useTabActive = () => {
  const { active, activeKey, activeIndex } = useStore((state) => ({
    active: state.tabs[state.activeIndex],
    activeKey: state.tabs[state.activeIndex]?.tabKey,
    activeIndex: state.activeIndex,
  }))

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

interface MethodDefaultOptions {
  replace?: boolean
  reload?: boolean
  callback?: (backToTab?: OpenTab) => void
}

export interface IPushOptions extends MethodDefaultOptions {
  force?: boolean
}

export interface IBackToOptions extends MethodDefaultOptions {
  backTo?: OpenTab | LocationDescriptor
}

export interface ICloseOptions extends MethodDefaultOptions {
  backTo?: OpenTab | LocationDescriptor
}

export const useTabs = () => {
  const location = useLocation()

  const { active, activeKey, activeIndex } = useTabActive()

  const { tabs, append, children, findByLocation, findByKey, findNext, event, setTabs } = useStore((state) => ({
    tabs: state.tabs,
    append: state.update,
    children: state.children,
    event: state.event,
    findByLocation: state.findByLocation,
    findByKey: state.findByKey,
    findNext: state.findNext,
    setTabs: state.setTabs,
  }))

  const switchTo = (tabKey: string, replace = false) => {
    const targetTab = findByKey(tabKey)

    if (!targetTab) {
      return
    }

    if (activeKey === targetTab.tabKey) {
      return
    }

    const path = Object.assign(targetTab.location.state ? { state: targetTab.location.state } : {}, {
      pathname: targetTab.location.pathname,
      search: targetTab.location.search,
    })

    if (replace) {
      event.emit("replace", path)
    } else {
      event.emit("push", path)
    }
  }

  const push = (
    path: LocationDescriptor,
    options: IPushOptions = {
      reload: false,
      force: false,
      replace: false,
    }
  ): [OpenTab, string] => {
    const findTab = findByLocation(path)

    if (findTab) {
      switchTo(findTab.tabKey, options.replace)

      if (typeof path !== "string") {
        findTab.location.state = path.state
      }

      if (options?.reload) {
        reload(findTab)
      }

      return [findTab, "switchTo"]
    }

    if (options.replace) {
      event.emit("replace", path)
    } else {
      event.emit("push", path)
    }

    const newTab = append(location, children)

    return [newTab, "push"]
  }

  const goBack = (
    options: IBackToOptions = {
      reload: false,
      replace: false,
    }
  ) => {
    if (options.backTo && options.backTo instanceof OpenTab) {
      const backTo = options.backTo

      switchTo(backTo.tabKey, options.replace)

      if (options.reload) {
        reload(backTo)
      }

      options.callback?.(backTo)
    } else {
      const backTo = options.backTo || findNext()?.location

      if (!backTo) {
        return
      }

      const [tab] = push(backTo, {
        reload: options.reload,
        replace: options.replace,
      })

      options.callback?.(tab)
    }
  }

  const reload = (tab?: OpenTab | OpenTab["tabKey"], isSwitchTo = true) => {
    if (tab && tab instanceof OpenTab) {
      if (tab.tabKey !== activeKey) {
        switchTo(tab.tabKey)
      }

      // TODO:
      // clearPageQuery();

      tab.reload()

      return
    }

    const reloadTab = tab ? findByKey(tab) || active : active

    if (!reloadTab) {
      return
    }

    if (reloadTab.tabKey !== activeKey && isSwitchTo) {
      switchTo(reloadTab.tabKey)
    }

    // TODO:
    // clearPageQuery();

    reloadTab.reload()
  }

  const close = (
    tab: OpenTab | string | undefined,
    options: ICloseOptions = {
      reload: false,
      replace: false,
    }
  ) => {
    const closeTabKey = tab ? (tab instanceof OpenTab ? tab.tabKey : tab) : activeKey

    if (!closeTabKey) {
      return
    }

    // 关掉当前 tab
    if (closeTabKey === activeKey) {
      const backTo = options.backTo || findNext(closeTabKey)?.location

      if (!backTo) {
        return
      }

      if (backTo instanceof OpenTab) {
        setTabs(R.reject((x) => x.tabKey === closeTabKey, tabs))

        switchTo(backTo.tabKey, options.replace)

        if (options.reload) {
          reload(backTo)
        }

        options.callback?.(backTo)
      } else {
        const [tab] = push(backTo, {
          reload: options.reload,
          replace: options.replace,
        })

        setTabs(R.filter((x) => x.tabKey !== closeTabKey, tabs))

        options.callback?.(tab)
      }
    } else {
      setTabs(R.reject((x) => x.tabKey === closeTabKey, tabs))

      const backTo = options.backTo

      if (!backTo) {
        return
      }

      if (backTo instanceof OpenTab) {
        switchTo(backTo.tabKey, options.replace)

        if (options.reload) {
          reload(backTo)
        }

        options.callback?.(backTo)
      } else {
        const [tab] = push(backTo, {
          reload: options.reload,
          replace: options.replace,
        })

        options.callback?.(tab)
      }
    }
  }

  const closeRight = (tab: OpenTab, index: number) => {
    const start = R.max(index + 1, 0)
    const count = R.max(1, tabs.length - index - 1)

    setTabs(R.remove(start, count, tabs))

    if (tab.tabKey !== activeKey) {
      switchTo(tab.tabKey)
    }
  }

  const closeOthers = (tab?: OpenTab) => {
    const key = tab?.tabKey || activeKey

    setTabs(R.reject((x) => x.tabKey !== key, tabs))

    if (key) {
      switchTo(key)
    }
  }

  return { active, activeKey, activeIndex, tabs, switchTo, push, goBack, reload, close, closeRight, closeOthers }
}
