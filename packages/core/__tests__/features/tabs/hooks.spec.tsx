/* eslint-env jest */
import "@testing-library/jest-dom"
import { createBrowserHistory, createHashHistory, createMemoryHistory, History } from "history"
import React, { PropsWithChildren } from "react"
import { renderHook, act } from "@testing-library/react-hooks"
import { Router, Route, Switch } from "react-router-dom"
import { Provider as TabsProvider } from "../../../src/features/tabs/provider"
import { useTabs, OpenTab } from "../../../src/features/tabs/hooks"

const browserHistory = (options?: Parameters<typeof createBrowserHistory>) =>
  createBrowserHistory({
    basename: "",
    ...options,
  })
const memoryHistory = (options?: Parameters<typeof createMemoryHistory>) =>
  createMemoryHistory({
    initialEntries: ["/"],
    ...options,
  })
const hashHistory = (options?: Parameters<typeof createHashHistory>) =>
  createHashHistory({
    hashType: "hashbang",
    ...options,
  })

const historyModes = [
  {
    name: "browser",
    factory: browserHistory,
  },
  {
    name: "memory",
    factory: memoryHistory,
  },
  {
    name: "hash",
    factory: hashHistory,
  },
  // {
  //   name: "slash",
  //   factory: slashHistory,
  // },
  // {
  //   name: "noslash",
  //   factory: noslashHistory,
  // },
]

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

describe.each(historyModes.slice(0, 1))("$name: browser location sync", ({ factory }) => {
  let history: History

  beforeEach(() => {
    window.history.pushState({}, "Test page", "/")

    history = factory()
  })

  it("history.push", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTabs(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    act(() => {
      history.push("/")
    })

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")
  })

  it("history.go", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTabs(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    act(() => {
      history.push("/tab2")
    })

    act(() => {
      history.push("/tab3")
    })

    // [/, tab1, tab2, tab3]
    expect(result.current.tabs).toHaveLength(4)
    expect(result.current.activeIndex).toEqual(3)
    expect(result.current.active.location.pathname).toEqual("/tab3")

    // [/, tab1, tab2, tab3]
    // go -1 tab2
    await act(async () => {
      history.go(-1)

      await waitForNextUpdate()
    })

    expect(result.current.tabs).toHaveLength(4)
    expect(result.current.activeIndex).toEqual(2)
    expect(result.current.active.location.pathname).toEqual("/tab2")

    // [/, tab1, tab2, tab3]
    // go 1
    await act(async () => {
      history.go(1)

      await waitForNextUpdate()
    })

    expect(result.current.tabs).toHaveLength(4)
    expect(result.current.activeIndex).toEqual(3)
    expect(result.current.active.location.pathname).toEqual("/tab3")
  })

  it("history.goBack", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTabs(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    await act(async () => {
      history.goBack()

      await waitForNextUpdate()
    })

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")
  })

  it("history.goForward", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTabs(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    await act(async () => {
      history.goBack()

      await waitForNextUpdate()
    })

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")

    await act(async () => {
      history.goForward()

      await waitForNextUpdate()
    })

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")
  })
})

describe.each(historyModes)("$name: .switchTo", ({ factory }) => {
  let history: History

  beforeEach(() => {
    window.history.pushState({}, "Test page", "/")

    history = factory()
  })

  it("switch", async () => {
    const { result } = renderHook(() => useTabs(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    act(() => {
      result.current.switchTo(result.current.tabs[0].tabKey)
    })

    // tabs: [/, tab1], current: /
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")
  })

  it("switch#callback", async () => {
    const { result } = renderHook(() => useTabs(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    const switchToCallbackFn = jest.fn((tab: OpenTab) => tab)

    act(() => {
      result.current.switchTo(result.current.tabs[0].tabKey, {
        callback: switchToCallbackFn,
      })
    })

    expect(switchToCallbackFn).toHaveBeenCalled()
    expect(switchToCallbackFn).toHaveBeenCalledTimes(1)
    expect(switchToCallbackFn).toHaveBeenCalledWith(result.current.tabs[0])

    // tabs: [/, tab1], current: /
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")
  })

  it("switch to tab that does not exist", async () => {
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

    const switchToCallbackFn = jest.fn((tab: OpenTab) => tab)

    act(() => {
      result.current.switchTo("NOT_FOUND_KEY", {
        callback: switchToCallbackFn,
      })
    })

    expect(switchToCallbackFn).toHaveBeenCalled()
    expect(switchToCallbackFn).toHaveBeenCalledTimes(1)
    expect(switchToCallbackFn).toHaveBeenCalledWith(result.current.tabs[0])

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")
  })

  it("switching to the same tab", async () => {
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

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")
  })
})

describe.each(historyModes)("$name: .push", ({ factory }) => {
  let history: History

  beforeEach(() => {
    window.history.pushState({}, "Test page", "/")

    history = factory()
  })

  it("push", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    act(() => {
      result.current.push("/")
    })

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")
  })

  it("push exist location should work#callback", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    const pushCallbackFn = jest.fn((tab: OpenTab) => tab)

    act(() => {
      result.current.push("/", {
        callback: pushCallbackFn,
      })
    })

    expect(pushCallbackFn).toHaveBeenCalled()
    expect(pushCallbackFn).toHaveBeenCalledTimes(1)
    expect(pushCallbackFn).toHaveBeenCalledWith(result.current.tabs[0])

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")
  })

  it("push exist location#reload", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    const prevKey = result.current.tabs[1].properties.key

    const pushCallbackFn = jest.fn((tab: OpenTab) => tab)

    act(() => {
      result.current.push("/tab1", {
        callback: pushCallbackFn,
        reload: true,
      })
    })

    expect(prevKey !== result.current.tabs[1].properties.key)

    expect(pushCallbackFn).toHaveBeenCalled()
    expect(pushCallbackFn).toHaveBeenCalledTimes(1)
    expect(pushCallbackFn).toHaveBeenCalledWith(result.current.tabs[1])

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")
  })

  it("push exist location#replace", async () => {
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

    const pushCallbackFn = jest.fn((tab: OpenTab) => tab)

    act(() => {
      result.current.push("/tab1", {
        callback: pushCallbackFn,
        replace: true,
      })
    })

    expect(pushCallbackFn).toHaveBeenCalled()
    expect(pushCallbackFn).toHaveBeenCalledTimes(1)
    expect(pushCallbackFn).toHaveBeenCalledWith(result.current.tabs[1])

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")
  })

  it("push a non-existent location should open a new tab", () => {
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

    act(() => {
      result.current.push("/tab1", {
        callback: pushCallbackFn,
      })
    })

    expect(pushCallbackFn).toHaveBeenCalled()
    expect(pushCallbackFn).toHaveBeenCalledTimes(1)
    expect(pushCallbackFn).toHaveBeenCalledWith(result.current.tabs[1])

    // tabs: [/, tab1], current: tab1

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")
  })
})

describe.each(historyModes)("$name: .goBack", ({ factory }) => {
  let history: History

  beforeEach(() => {
    window.history.pushState({}, "Test page", "/")

    history = factory()
  })

  it("backTo", async () => {
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

    act(() => {
      history.push("/tab1")
    })
    act(() => {
      history.push("/tab2")
    })

    // tabs: [/, tab1, tab2], current: tab2
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(2)
    expect(result.current.active.location.pathname).toEqual("/tab2")

    await act(async () => {
      result.current.goBack()

      await waitForNextUpdate()
    })

    // tabs: [/, tab1, tab2], current: tab1
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")
  })

  it("first tab, goBack", async () => {
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

    act(() => {
      result.current.goBack()
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")
  })

  it("backTo#callback", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    act(() => {
      history.push("/tab2")
    })

    // tabs: [/, tab1, tab2], current: tab2
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(2)
    expect(result.current.active.location.pathname).toEqual("/tab2")

    const goBackCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      result.current.goBack({
        callback: goBackCallbackFn,
      })

      await waitForNextUpdate()
    })

    expect(goBackCallbackFn).toHaveBeenCalled()
    expect(goBackCallbackFn).toHaveBeenCalledTimes(1)
    expect(goBackCallbackFn).toHaveBeenCalledWith(result.current.tabs[1])

    // tabs: [/, tab1, tab2], current: tab1
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")
  })

  it("backTo#reload", async () => {
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

    act(() => {
      history.push("/tab1")
    })
    act(() => {
      history.push("/tab2")
    })

    // tabs: [/, tab1, tab2], current: tab2
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(2)
    expect(result.current.active.location.pathname).toEqual("/tab2")

    const goBackCallbackFn = jest.fn((tab: OpenTab) => tab)

    // tab1 -> tabKey
    const prevKey = result.current.tabs[1].tabKey

    await act(async () => {
      // back to tab1
      result.current.goBack({
        reload: true,
        callback: goBackCallbackFn,
      })

      await waitForNextUpdate()
    })

    expect(prevKey !== result.current.tabs[1].tabKey)

    expect(goBackCallbackFn).toHaveBeenCalled()
    expect(goBackCallbackFn).toHaveBeenCalledTimes(1)
    expect(goBackCallbackFn).toHaveBeenCalledWith(result.current.tabs[1])

    // tabs: [/, tab1, tab2], current: tab1
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")
  })

  it("include backTo OpenTab parameter", async () => {
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

    act(() => {
      history.push("/tab1")
    })
    act(() => {
      history.push("/tab2")
    })

    // tabs: [/, tab1, tab2], current: tab2
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(2)
    expect(result.current.active.location.pathname).toEqual("/tab2")

    const goBackCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      result.current.goBack({
        backTo: result.current.tabs[0],
        callback: goBackCallbackFn,
      })

      await waitForNextUpdate()
    })

    expect(goBackCallbackFn).toHaveBeenCalled()
    expect(goBackCallbackFn).toHaveBeenCalledTimes(1)
    expect(goBackCallbackFn).toHaveBeenCalledWith(result.current.tabs[0])

    // tabs: [/, tab1, tab2], current: /
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(0)
  })

  it("include backTo string parameter", async () => {
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

    act(() => {
      history.push("/tab1")
    })
    act(() => {
      history.push("/tab2")
    })

    // tabs: [/, tab1, tab2], current: tab2
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(2)
    expect(result.current.active.location.pathname).toEqual("/tab2")

    const goBackCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      result.current.goBack({
        backTo: "/tab1",
        callback: goBackCallbackFn,
      })

      await waitForNextUpdate()
    })

    expect(goBackCallbackFn).toHaveBeenCalled()
    expect(goBackCallbackFn).toHaveBeenCalledTimes(1)
    expect(goBackCallbackFn).toHaveBeenCalledWith(result.current.tabs[1])

    // tabs: [/, tab1, tab2], current: tab1
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")
  })

  it("include backTo not found", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    const goBackCallbackFn = jest.fn((tab: OpenTab) => tab)

    act(() => {
      result.current.goBack({
        backTo: "/NOT_FOUND",
        callback: goBackCallbackFn,
      })
    })

    expect(goBackCallbackFn).toHaveBeenCalled()
    expect(goBackCallbackFn).toHaveBeenCalledTimes(1)
    expect(goBackCallbackFn).toHaveBeenCalledWith(result.current.tabs[1])

    // tabs: [/, tab1, tab2], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")
  })
})

describe.each(historyModes)("$name: .reload", ({ factory }) => {
  let history: History

  beforeEach(() => {
    window.history.pushState({}, "Test page", "/")

    history = factory()
  })

  it("reload", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    // tab1 -> tabKey
    const prevKey = result.current.tabs[1].tabKey

    await act(async () => {
      result.current.reload()

      await waitForNextUpdate()
    })

    expect(prevKey !== result.current.tabs[1].tabKey)

    // tabs: [/, tab1, tab2], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")
  })

  it("reload#tab does exist", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    const prevTabs = result.current.tabs

    act(() => {
      result.current.reload({
        tab: "FAKE_TAB_KEY",
      })
    })

    expect(prevTabs === result.current.tabs)

    // tabs: [/, tab1, tab2], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")
  })

  it("reload#callback", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    act(() => {
      history.push("/")
    })

    // tabs: [/, tab1], current: /
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")

    const reloadCallbackFn = jest.fn((tab: OpenTab) => tab)

    // tab1 -> tabKey
    const prevKey = result.current.tabs[1].tabKey

    await act(async () => {
      result.current.reload({
        tab: result.current.tabs[1],
        callback: reloadCallbackFn,
      })

      await waitForNextUpdate()
    })

    expect(prevKey !== result.current.tabs[1].tabKey)

    expect(reloadCallbackFn).toHaveBeenCalled()
    expect(reloadCallbackFn).toHaveBeenCalledTimes(1)
    expect(reloadCallbackFn).toHaveBeenCalledWith(result.current.tabs[1])

    // tabs: [/, tab1, tab2], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")
  })

  it("reload#replace", async () => {})

  it("reload#switch=false", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    act(() => {
      history.push("/")
    })

    // tabs: [/, tab1], current: /
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")

    const reloadCallbackFn = jest.fn((tab: OpenTab) => tab)

    // tab1 -> tabKey
    const prevKey = result.current.tabs[1].tabKey

    await act(async () => {
      result.current.reload({
        tab: result.current.tabs[1],
        callback: reloadCallbackFn,
        switch: false,
      })

      await waitForNextUpdate()
    })

    expect(prevKey !== result.current.tabs[1].tabKey)

    expect(reloadCallbackFn).toHaveBeenCalled()
    expect(reloadCallbackFn).toHaveBeenCalledTimes(1)
    expect(reloadCallbackFn).toHaveBeenCalledWith(result.current.tabs[1])

    // tabs: [/, tab1, tab2], current: /
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")
  })
})

describe.each(historyModes)("$name: .close", ({ factory }) => {
  let history: History

  beforeEach(() => {
    window.history.pushState({}, "Test page", "/")

    history = factory()
  })

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

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    // default close current "tab1"
    await act(async () => {
      result.current.close()

      await waitForNextUpdate()
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")
  })

  it("close first tab", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    act(() => {
      history.push("/")
    })

    // default close current "tab1"
    await act(async () => {
      result.current.close()

      await waitForNextUpdate()
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/tab1")
  })

  it("close#tab does not exist", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    const closeCallbackFn = jest.fn((tab: OpenTab) => tab)

    // close /
    act(() => {
      result.current.close({
        tab: "FAKE_TAB_KEY",
        callback: closeCallbackFn,
      })
    })

    expect(closeCallbackFn).toHaveBeenCalled()
    expect(closeCallbackFn).toHaveBeenCalledTimes(1)
    expect(closeCallbackFn).toHaveBeenCalledWith(result.current.tabs[1])

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")
  })

  it("close#callback", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    const closeCallbackFn = jest.fn((tab: OpenTab) => tab)

    // close current "tab1"
    await act(async () => {
      result.current.close({
        callback: closeCallbackFn,
      })

      await waitForNextUpdate()
    })

    expect(closeCallbackFn).toHaveBeenCalled()
    expect(closeCallbackFn).toHaveBeenCalledTimes(1)
    expect(closeCallbackFn).toHaveBeenCalledWith(result.current.tabs[0])

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")
  })

  it("close#backTo", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    const closeCallbackFn = jest.fn((tab: OpenTab) => tab)

    // close current "tab1"
    await act(async () => {
      result.current.close({
        callback: closeCallbackFn,
      })

      await waitForNextUpdate()
    })

    expect(closeCallbackFn).toHaveBeenCalled()
    expect(closeCallbackFn).toHaveBeenCalledTimes(1)
    expect(closeCallbackFn).toHaveBeenCalledWith(result.current.tabs[0])

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")
  })

  it("close#backTo2", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    const closeCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      result.current.close({
        backTo: "NOT_FOUND",
        callback: closeCallbackFn,
      })

      await waitForNextUpdate()
    })

    expect(closeCallbackFn).toHaveBeenCalled()
    expect(closeCallbackFn).toHaveBeenCalledTimes(1)
    expect(closeCallbackFn).toHaveBeenCalledWith(result.current.tabs[0])

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")
  })

  it("close#backTo3", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")

    const closeCallbackFn = jest.fn((tab: OpenTab) => tab)

    // close /
    await act(async () => {
      result.current.close({
        tab: result.current.tabs[0],
        callback: closeCallbackFn,
      })

      await waitForNextUpdate()
    })

    expect(closeCallbackFn).toHaveBeenCalled()
    expect(closeCallbackFn).toHaveBeenCalledTimes(1)
    expect(closeCallbackFn).toHaveBeenCalledWith(result.current.tabs[0])

    // tabs: [tab1], current: tab1
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/tab1")
  })

  it("close#replace", async () => {})
})

describe.each(historyModes)("$name: .closeRight", ({ factory }) => {
  let history: History

  beforeEach(() => {
    window.history.pushState({}, "Test page", "/")

    history = factory()
  })

  it("close right", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    act(() => {
      history.push("/tab2")
    })

    act(() => {
      history.push("/tab3")
    })

    // tabs: [/, tab1, tab2, tab3], current: tab3
    expect(result.current.tabs).toHaveLength(4)
    expect(result.current.activeIndex).toEqual(3)
    expect(result.current.active.location.pathname).toEqual("/tab3")

    await act(async () => {
      result.current.closeRight()

      await waitForNextUpdate()
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(4)
    expect(result.current.activeIndex).toEqual(3)
    expect(result.current.active.location.pathname).toEqual("/tab3")
  })

  it("close right#tab", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    act(() => {
      history.push("/tab2")
    })

    act(() => {
      history.push("/tab3")
    })

    // tabs: [/, tab1, tab2, tab3], current: tab3
    expect(result.current.tabs).toHaveLength(4)
    expect(result.current.activeIndex).toEqual(3)
    expect(result.current.active.location.pathname).toEqual("/tab3")

    await act(async () => {
      result.current.closeRight({
        tab: result.current.tabs[1],
      })

      await waitForNextUpdate()
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")
  })

  it("close right#callback", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    act(() => {
      history.push("/tab2")
    })

    act(() => {
      history.push("/tab3")
    })

    // tabs: [/, tab1, tab2, tab3], current: tab3
    expect(result.current.tabs).toHaveLength(4)
    expect(result.current.activeIndex).toEqual(3)
    expect(result.current.active.location.pathname).toEqual("/tab3")

    const closeRightCallback = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      result.current.closeRight({
        tab: result.current.tabs[1],
        callback: closeRightCallback,
      })

      await waitForNextUpdate()
    })

    expect(closeRightCallback).toHaveBeenCalled()
    expect(closeRightCallback).toHaveBeenCalledTimes(1)
    expect(closeRightCallback).toHaveBeenCalledWith(result.current.tabs[1])

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")
  })
})

describe.each(historyModes)("$name: .closeOthers", ({ factory }) => {
  let history: History

  beforeEach(() => {
    window.history.pushState({}, "Test page", "/")

    history = factory()
  })

  it("close others", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    act(() => {
      history.push("/tab2")
    })

    act(() => {
      history.push("/tab3")
    })

    // tabs: [/, tab1, tab2, tab3], current: tab3
    expect(result.current.tabs).toHaveLength(4)
    expect(result.current.activeIndex).toEqual(3)
    expect(result.current.active.location.pathname).toEqual("/tab3")

    await act(async () => {
      result.current.closeOthers()

      await waitForNextUpdate()
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/tab3")
  })

  it("close others#callback", async () => {
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

    act(() => {
      history.push("/tab1")
    })

    act(() => {
      history.push("/tab2")
    })

    act(() => {
      history.push("/tab3")
    })

    // tabs: [/, tab1, tab2, tab3], current: tab3
    expect(result.current.tabs).toHaveLength(4)
    expect(result.current.activeIndex).toEqual(3)
    expect(result.current.active.location.pathname).toEqual("/tab3")

    const closeRightCallback = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      result.current.closeRight({
        tab: result.current.tabs[1],
        callback: closeRightCallback,
      })

      await waitForNextUpdate()
    })

    expect(closeRightCallback).toHaveBeenCalled()
    expect(closeRightCallback).toHaveBeenCalledTimes(1)
    expect(closeRightCallback).toHaveBeenCalledWith(result.current.tabs[1])

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab1")
  })
})
