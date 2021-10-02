import type { LocationDescriptor } from "history"
import * as R from "ramda"
import { EventEmitter } from "events"
import { useRef, useEffect, useCallback } from "react"
import { buildLocationInfo, getRandomKey, OpenTab } from "./openTab"
import { useStore } from "./context"
import { tabKeyEq } from "./state"

export { OpenTab }

type ParamType<T> = T extends () => unknown ? never : T extends (...args: infer P) => unknown ? P : T

type Fn = (() => unknown) | ((...args: any) => unknown)

function useEventCallback<
  T extends Fn,
  F extends ParamType<T> extends never ? () => ReturnType<T> : (...args: ParamType<T>) => ReturnType<T>
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
  reload?: boolean
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

interface SwitchToMethodOptions {
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

interface ReloadMethodOptions {
  switch?: boolean
  callback?: (tab: OpenTab) => void
}

interface BackToMethodOptions {
  backTo?: OpenTab | LocationDescriptor
  reload?: boolean
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

interface CloseMethodOptions {
  backTo?: OpenTab | LocationDescriptor
  reload?: boolean
  replace?: boolean
  callback?: (tab: OpenTab) => void
}

export const useTabs = () => {
  const { active, activeKey, activeIndex } = useTabActive()

  const { event, history, getSyncValue, tabs, setTabs, findByLocation, findByKey, findIndexByKey, findNext } = useStore(
    (state) => ({
      event: state.event,
      history: state.history,
      tabs: state.tabs,
      getSyncValue: state.getSyncValue,
      setTabs: state.setTabs,
      findByLocation: state.findByLocation,
      findByKey: state.findByKey,
      findIndexByKey: state.findIndexByKey,
      findNext: state.findNext,
    })
  )

  const historyChange = (path: LocationDescriptor, { replace, callback }: HistoryMethodOptions) => {
    if (replace) {
      history.replace(path)
    } else {
      history.push(path)
    }

    setTimeout(() => {
      const { location, children } = getSyncValue()

      const locationInfo = buildLocationInfo(location)

      const tab = new OpenTab({
        tabKey: locationInfo.hash,
        location: locationInfo.location,
        content: children,
      })

      const name: string = replace ? "replace" : "push"

      event.emit(name, tab)

      callback?.(tab)
    }, 0)
  }

  const switchTo = useEventCallback((tabKey: string, options: SwitchToMethodOptions = {}) => {
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

    historyChange(path, { replace: options.replace, callback: options.callback })
  })

  const push = useEventCallback((path: LocationDescriptor, options: PushMethodOptions = {}) => {
    const findTab = findByLocation(path)

    if (findTab) {
      switchTo(findTab.tabKey, {
        replace: options.replace,
        callback: () => {
          const idx = findIndexByKey(findTab.tabKey)

          if (typeof path !== "string") {
            setTabs(
              R.adjust(
                idx,
                (tab) => {
                  tab.location.state = path.state

                  return tab
                },
                tabs
              )
            )
          }

          if (options?.reload) {
            reload(findTab, {
              callback: options.callback,
            })
          } else {
            options.callback?.(findTab)
          }
        },
      })

      return
    }

    historyChange(path, {
      replace: options.replace,
      callback: options.callback,
    })
  })

  const goBack = useEventCallback((options: BackToMethodOptions) => {
    if (options.backTo && options.backTo instanceof OpenTab) {
      const backTo = options.backTo

      switchTo(backTo.tabKey, {
        replace: options.replace,
        callback: (tab) => {
          if (options.reload) {
            reload(backTo, {
              callback: options.callback,
            })
          } else {
            options.callback?.(tab)
          }
        },
      })

      return
    }

    const backTo = options.backTo || findNext(activeKey)?.location

    if (!backTo) {
      return
    }

    push(backTo, {
      reload: options.reload,
      replace: options.replace,
      callback: options.callback,
    })
  })

  const reload = useEventCallback((tab: OpenTab | string, options: ReloadMethodOptions = { switch: true }) => {
    const reloadKey = (tab: OpenTab) => {
      const idx = findIndexByKey(tab.tabKey)

      setTabs(
        R.adjust(
          idx,
          (tab) => {
            tab.properties.key = getRandomKey()

            return tab
          },
          tabs
        )
      )

      event.emit("reload", tab)
    }

    if (tab && tab instanceof OpenTab) {
      if (tab.tabKey !== activeKey) {
        switchTo(tab.tabKey, {
          callback: () => {
            reloadKey(tab)

            options.callback?.(tab)
          },
        })
      } else {
        reloadKey(tab)

        options.callback?.(tab)
      }

      return
    }

    const reloadTab = tab ? findByKey(tab) || active : active
    const isSwitch = options.switch ?? true

    if (reloadTab.tabKey !== activeKey && isSwitch) {
      switchTo(reloadTab.tabKey, {
        callback: () => {
          reloadKey(reloadTab)

          options.callback?.(reloadTab)
        },
      })
    } else {
      reloadKey(reloadTab)

      options.callback?.(reloadTab)
    }
  })

  const close = useEventCallback(
    (
      tab: OpenTab | string | undefined,
      options: CloseMethodOptions = {
        reload: false,
        replace: false,
      }
    ) => {
      const closeTab = tab ? (tab instanceof OpenTab ? tab : findByKey(tab)) : active
      const closeTabKey = closeTab?.tabKey

      if (!closeTab || !closeTabKey) {
        return
      }

      if (closeTabKey === activeKey) {
        const backTo = options.backTo || findNext(closeTabKey)?.location

        if (!backTo) {
          return
        }

        if (backTo instanceof OpenTab) {
          console.log(backTo.tabKey, closeTabKey, options)

          switchTo(backTo.tabKey, {
            replace: options.replace,
            callback: (tab) => {
              const cb = () => {
                setTabs(R.reject(tabKeyEq(closeTabKey), tabs))

                options.callback?.(tab)
              }

              if (options.reload) {
                reload(backTo, {
                  callback: cb,
                })
              } else {
                cb()
              }
            },
          })
        } else {
          push(backTo, {
            reload: options.reload,
            replace: options.replace,
            callback: (tab) => {
              setTabs(R.reject(tabKeyEq(closeTabKey), tabs))

              options.callback?.(tab)
            },
          })
        }

        return
      }

      const backTo = options.backTo

      if (!backTo) {
        setTabs(R.reject(tabKeyEq(closeTabKey), tabs))

        options.callback?.(active)

        return
      }

      if (backTo instanceof OpenTab) {
        switchTo(backTo.tabKey, {
          replace: options.replace,
          callback: () => {
            if (options.reload) {
              reload(backTo, {
                callback: () => {
                  setTabs(R.reject(tabKeyEq(closeTabKey), tabs))

                  options.callback?.(backTo)
                },
              })
            } else {
              setTabs(R.reject(tabKeyEq(closeTabKey), tabs))

              options.callback?.(backTo)
            }
          },
        })
      } else {
        push(backTo, {
          reload: options.reload,
          replace: options.replace,
          callback: (tab) => {
            setTabs(R.reject(tabKeyEq(closeTabKey), tabs))

            options.callback?.(tab)
          },
        })
      }
    }
  )

  const closeRight = useEventCallback((tab: OpenTab, index: number, callback?: (tab: OpenTab) => void) => {
    const start = R.max(index + 1, 0)
    const count = R.max(1, tabs.length - index - 1)

    if (tab.tabKey !== activeKey) {
      switchTo(tab.tabKey, {
        callback: () => {
          setTabs(R.remove(start, count, tabs))

          callback?.(tab)
        },
      })
    } else {
      setTabs(R.remove(start, count, tabs))

      callback?.(tab)
    }
  })

  const closeOthers = useEventCallback((tab: OpenTab | undefined, callback?: (tab: OpenTab) => void) => {
    const tabKey = tab?.tabKey ?? activeKey

    switchTo(tabKey, {
      callback: (tab) => {
        setTabs(R.reject(tabKeyEq(tabKey), tabs))

        callback?.(tab)
      },
    })
  })

  return { active, activeKey, activeIndex, tabs, switchTo, push, goBack, reload, close, closeRight, closeOthers }
}
