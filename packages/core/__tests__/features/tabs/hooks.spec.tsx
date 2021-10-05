import "@testing-library/jest-dom"
import { createBrowserHistory, createHashHistory, createMemoryHistory, History } from "history"
import React, { PropsWithChildren } from "react"
import { renderHook, act } from "@testing-library/react-hooks"
import { Router, Route, Switch } from "react-router-dom"
import { Provider as TabsProvider } from "../../../src/features/tabs/provider"
import { useTabs, OpenTab } from "../../../src/features/tabs/hooks"

const wrapper = ({ history, children }: PropsWithChildren<{ history: History }>) => {
  return (
    <Router history={history}>
      <TabsProvider history={history} tabChildren={children}>
        <Switch>
          <Route path="/" exact />
          <Route path="/tab1" />
          <Route path="/tab2" />
          <Route path="/tab3" />
        </Switch>
      </TabsProvider>
    </Router>
  )
}

const historyModes = () => {
  const browserHistory = createBrowserHistory({})
  const memoryHistory = createMemoryHistory({})
  const hashHistory = createHashHistory({
    hashType: "hashbang",
  })
  // const slashHistory = createHashHistory({
  //   hashType: "slash",
  // })
  // const noslashHistory = createHashHistory({
  //   hashType: "noslash",
  // })

  return [
    {
      name: "browser",
      history: browserHistory,
    },
    {
      name: "memory",
      history: memoryHistory,
    },
    {
      name: "hash",
      history: hashHistory,
    },
    // {
    //   name: "slash",
    //   history: slashHistory,
    // },
    // {
    //   name: "noslash",
    //   history: noslashHistory,
    // },
  ]
}

afterEach(() => {
  window.history.pushState({}, "Test page", "/")
})

describe.each(historyModes())("$name: browser location sync", ({ history }) => {
  it("sync history ", () => {
    const { result } = renderHook(() => useTabs(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")

    act(() => history.push("/tab1"))

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    act(() => history.push("/"))

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")
  })
})

describe.each(historyModes())("$name: .switchTo", ({ history }) => {
  it("switchTo", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTabs(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")

    act(() => history.push("/tab1"))

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    // tabs: [/, tab1], current: tab1

    const switchToCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      result.current.switchTo(result.current.tabs[0].tabKey, {
        callback: switchToCallbackFn,
      })

      await waitForNextUpdate()
    })

    expect(switchToCallbackFn).toHaveBeenCalled()
    expect(switchToCallbackFn).toHaveBeenCalledTimes(1)
    expect(switchToCallbackFn).toHaveBeenCalledWith(result.current.tabs[0])

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")

    expect(history.location.pathname).toEqual("/")
  })
})

describe.each(historyModes())("$name: .push", ({ history }) => {
  it("push exist location should work", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTabs(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")

    // tabs: [/, tab1], current: tab1

    act(() => history.push("/tab1"))

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    const pushCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      result.current.push("/", {
        callback: pushCallbackFn,
      })

      await waitForNextUpdate()
    })

    expect(pushCallbackFn).toHaveBeenCalled()
    expect(pushCallbackFn).toHaveBeenCalledTimes(1)
    expect(pushCallbackFn).toHaveBeenCalledWith(result.current.tabs[0])

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")

    expect(history.location.pathname).toEqual("/")
  })

  it("push don't exist location should jump to new tab", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTabs(), {
      wrapper,
      initialProps: {
        history: history,
      },
    })

    // tabs: [/], current: /

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")

    const pushCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      result.current.push("/tab1", {
        callback: pushCallbackFn,
      })

      await waitForNextUpdate()
    })

    expect(pushCallbackFn).toHaveBeenCalled()
    expect(pushCallbackFn).toHaveBeenCalledTimes(1)
    expect(pushCallbackFn).toHaveBeenCalledWith(result.current.tabs[1])

    // tabs: [/, tab1], current: tab1

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    expect(history.location.pathname).toEqual("/tab1")
  })
})

describe.each(historyModes())("$name: .goBack", ({ history }) => {})

describe.each(historyModes())("$name: .reload", ({ history }) => {})

describe.each(historyModes())("$name: .close", ({ history }) => {
  it("close current tab", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTabs(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")

    // tabs: [/, tab1], current: tab1

    act(() => history.push("/tab1"))

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    const closeCallbackFn = jest.fn((tab: OpenTab) => tab)

    // close current "tab1"
    await act(async () => {
      result.current.close(result.current.active, {
        callback: closeCallbackFn,
      })

      await waitForNextUpdate()
    })

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")
  })
})

describe.each(historyModes())("$name: .closeRight", ({ history }) => {})

describe.each(historyModes())("$name: .closeOthers", ({ history }) => {})
