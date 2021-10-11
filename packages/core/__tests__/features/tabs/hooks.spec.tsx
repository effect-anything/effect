/* eslint-env jest */
import "@testing-library/jest-dom"
import { createBrowserHistory, createHashHistory, createMemoryHistory, History } from "history"
import React, { PropsWithChildren } from "react"
import { renderHook, act } from "@testing-library/react-hooks"
import { Router, Route, Switch } from "react-router-dom"
import { Provider as TabsProvider } from "../../../src/features/tabs/provider"
import { useTabsAction, OpenTab } from "../../../src/features/tabs/hooks"

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
      <TabsProvider tabChildren={children} history={history}>
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

describe.each(historyModes)("$name: browser location sync", ({ factory }) => {
  let history: History

  beforeEach(() => {
    window.history.pushState({}, "Test page", "/")
    sessionStorage.clear()
    history = factory()
  })

  it("history.push", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    act(() => {
      history.push("/")
    })

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")
  })

  it("history.go", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

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
    expect(result.current.active.identity.pathname).toEqual("/tab3")

    // [/, tab1, tab2, tab3]
    // go -1 tab2
    await act(async () => {
      history.go(-1)

      await waitForNextUpdate()
    })

    expect(result.current.tabs).toHaveLength(4)
    expect(result.current.activeIndex).toEqual(2)
    expect(result.current.active.identity.pathname).toEqual("/tab2")

    // [/, tab1, tab2, tab3]
    // go 1
    await act(async () => {
      history.go(1)

      await waitForNextUpdate()
    })

    expect(result.current.tabs).toHaveLength(4)
    expect(result.current.activeIndex).toEqual(3)
    expect(result.current.active.identity.pathname).toEqual("/tab3")
  })

  it("history.goBack", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    await act(async () => {
      history.goBack()

      await waitForNextUpdate()
    })

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")
  })

  it("history.goForward", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    await act(async () => {
      history.goBack()

      await waitForNextUpdate()
    })

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    await act(async () => {
      history.goForward()

      await waitForNextUpdate()
    })

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")
  })
})

describe.each(historyModes)("$name: .switchTo", ({ factory }) => {
  let history: History

  beforeEach(() => {
    window.history.pushState({}, "Test page", "/")
    sessionStorage.clear()
    history = factory()
  })

  it("switch", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    await act(async () => {
      await result.current.switchTo(result.current.tabs[0].tabKey)
    })

    // tabs: [/, tab1], current: /
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")
  })

  it("switch#callback", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    const switchToCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      await result.current.switchTo(result.current.tabs[0].tabKey).then(switchToCallbackFn)
    })

    expect(switchToCallbackFn).toHaveBeenCalled()
    expect(switchToCallbackFn).toHaveBeenCalledTimes(1)
    expect(switchToCallbackFn).toHaveBeenCalledWith(
      expect.objectContaining({ identity: result.current.tabs[0].identity })
    )

    // tabs: [/, tab1], current: /
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")
  })

  it("switch to tab that does not exist", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    const successCallbackFn = jest.fn((tab: OpenTab) => tab)
    const failedCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      await result.current.switchTo("NOT_FOUND_KEY").then(successCallbackFn).catch(failedCallbackFn)
    })

    expect(successCallbackFn).toHaveBeenCalledTimes(0)

    expect(failedCallbackFn).toHaveBeenCalled()
    expect(failedCallbackFn).toHaveBeenCalledTimes(1)
    expect(failedCallbackFn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("switchTo tab not found"),
      })
    )

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")
  })

  it("switching to the same tab", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    const switchToCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      await result.current.switchTo(result.current.tabs[0].tabKey).then(switchToCallbackFn)
    })

    expect(switchToCallbackFn).toHaveBeenCalled()
    expect(switchToCallbackFn).toHaveBeenCalledTimes(1)
    expect(switchToCallbackFn).toHaveBeenCalledWith(
      expect.objectContaining({ identity: result.current.tabs[0].identity })
    )

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")
  })

  it("switch#reload", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    // tab1 -> tabKey
    const prevKey = result.current.tabs[0].tabKey

    const switchToCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      await result.current
        .switchTo(result.current.tabs[0].tabKey, {
          reload: true,
        })
        .then(switchToCallbackFn)
    })

    expect(prevKey !== result.current.tabs[0].tabKey)

    expect(switchToCallbackFn).toHaveBeenCalled()
    expect(switchToCallbackFn).toHaveBeenCalledTimes(1)
    expect(switchToCallbackFn).toHaveBeenCalledWith(
      expect.objectContaining({ identity: result.current.tabs[0].identity })
    )

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")
  })
})

describe.each(historyModes)("$name: .push", ({ factory }) => {
  let history: History

  beforeEach(() => {
    window.history.pushState({}, "Test page", "/")
    sessionStorage.clear()
    history = factory()
  })

  it("push", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    await act(async () => {
      await result.current.push("/")
    })

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")
  })

  it("push exist location should work#callback", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    const pushCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      await result.current.push("/").then(pushCallbackFn)
    })

    expect(pushCallbackFn).toHaveBeenCalled()
    expect(pushCallbackFn).toHaveBeenCalledTimes(1)
    expect(pushCallbackFn).toHaveBeenCalledWith(expect.objectContaining({ identity: result.current.tabs[0].identity }))

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")
  })

  it("push exist location#replace", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    const pushCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      await result.current
        .push("/tab1", {
          replace: true,
        })
        .then(pushCallbackFn)
    })

    expect(pushCallbackFn).toHaveBeenCalled()
    expect(pushCallbackFn).toHaveBeenCalledTimes(1)
    expect(pushCallbackFn).toHaveBeenCalledWith(expect.objectContaining({ identity: result.current.tabs[1].identity }))

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")
  })

  it("push a non-existent location should open a new tab", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history: history,
      },
    })

    // tabs: [/], current: /

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    const pushCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      await result.current.push("/tab1").then(pushCallbackFn)
    })

    expect(pushCallbackFn).toHaveBeenCalled()
    expect(pushCallbackFn).toHaveBeenCalledTimes(1)
    expect(pushCallbackFn).toHaveBeenCalledWith(expect.objectContaining({ identity: result.current.tabs[1].identity }))

    // tabs: [/, tab1], current: tab1

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")
  })
})

describe.each(historyModes)("$name: .goBack", ({ factory }) => {
  let history: History

  beforeEach(() => {
    window.history.pushState({}, "Test page", "/")
    sessionStorage.clear()
    history = factory()
  })

  it("backTo", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history: history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })
    act(() => {
      history.push("/tab2")
    })

    // tabs: [/, tab1, tab2], current: tab2
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(2)
    expect(result.current.active.identity.pathname).toEqual("/tab2")

    await act(async () => {
      await result.current.goBack()
    })

    // tabs: [/, tab1, tab2], current: tab1
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")
  })

  it("first tab, goBack", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history: history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    await act(async () => {
      await result.current.goBack()
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")
  })

  it("backTo#callback", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history: history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    act(() => {
      history.push("/tab2")
    })

    // tabs: [/, tab1, tab2], current: tab2
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(2)
    expect(result.current.active.identity.pathname).toEqual("/tab2")

    const goBackCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      await result.current.goBack().then(goBackCallbackFn)
    })

    expect(goBackCallbackFn).toHaveBeenCalled()
    expect(goBackCallbackFn).toHaveBeenCalledTimes(1)
    expect(goBackCallbackFn).toHaveBeenCalledWith(
      expect.objectContaining({ identity: result.current.tabs[1].identity })
    )

    // tabs: [/, tab1, tab2], current: tab1
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")
  })

  it("backTo#reload", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history: history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })
    act(() => {
      history.push("/tab2")
    })

    // tabs: [/, tab1, tab2], current: tab2
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(2)
    expect(result.current.active.identity.pathname).toEqual("/tab2")

    const goBackCallbackFn = jest.fn((tab: OpenTab) => tab)

    // tab1 -> tabKey
    const prevKey = result.current.tabs[1].tabKey

    await act(async () => {
      // back to tab1
      await result.current
        .goBack({
          reload: true,
        })
        .then(goBackCallbackFn)
    })

    expect(prevKey !== result.current.tabs[1].tabKey)

    expect(goBackCallbackFn).toHaveBeenCalled()
    expect(goBackCallbackFn).toHaveBeenCalledTimes(1)
    expect(goBackCallbackFn).toHaveBeenCalledWith(
      expect.objectContaining({ identity: result.current.tabs[1].identity })
    )

    // tabs: [/, tab1, tab2], current: tab1
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")
  })

  it("include backTo OpenTab parameter", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history: history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })
    act(() => {
      history.push("/tab2")
    })

    // tabs: [/, tab1, tab2], current: tab2
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(2)
    expect(result.current.active.identity.pathname).toEqual("/tab2")

    const goBackCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      await result.current
        .goBack({
          backTo: result.current.tabs[0],
        })
        .then(goBackCallbackFn)
    })

    expect(goBackCallbackFn).toHaveBeenCalled()
    expect(goBackCallbackFn).toHaveBeenCalledTimes(1)
    expect(goBackCallbackFn).toHaveBeenCalledWith(
      expect.objectContaining({ identity: result.current.tabs[0].identity })
    )

    // tabs: [/, tab1, tab2], current: /
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(0)
  })

  it("include backTo string parameter", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history: history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })
    act(() => {
      history.push("/tab2")
    })

    // tabs: [/, tab1, tab2], current: tab2
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(2)
    expect(result.current.active.identity.pathname).toEqual("/tab2")

    const goBackCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      await result.current
        .goBack({
          backTo: "/tab1",
        })
        .then(goBackCallbackFn)
    })

    expect(goBackCallbackFn).toHaveBeenCalled()
    expect(goBackCallbackFn).toHaveBeenCalledTimes(1)
    expect(goBackCallbackFn).toHaveBeenCalledWith(
      expect.objectContaining({ identity: result.current.tabs[1].identity })
    )

    // tabs: [/, tab1, tab2], current: tab1
    expect(result.current.tabs).toHaveLength(3)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")
  })

  it("include backTo not found", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history: history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    const goBackCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      await result.current
        .goBack({
          backTo: "/NOT_FOUND",
        })
        .then(goBackCallbackFn)
    })

    expect(goBackCallbackFn).toHaveBeenCalled()
    expect(goBackCallbackFn).toHaveBeenCalledTimes(1)
    expect(goBackCallbackFn).toHaveBeenCalledWith(
      expect.objectContaining({ identity: result.current.tabs[1].identity })
    )

    // tabs: [/, tab1, tab2], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")
  })
})

describe.each(historyModes)("$name: .reload", ({ factory }) => {
  let history: History

  beforeEach(() => {
    window.history.pushState({}, "Test page", "/")
    sessionStorage.clear()
    history = factory()
  })

  it("reload", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history: history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    // tab1 -> tabKey
    const prevKey = result.current.tabs[1].tabKey

    await act(async () => {
      await result.current.reload()
    })

    expect(prevKey !== result.current.tabs[1].tabKey)

    // tabs: [/, tab1, tab2], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")
  })

  it("reload#tab does exist", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history: history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    const failedCallbackFn = jest.fn((tab: OpenTab) => tab)

    const prevTabs = result.current.tabs

    await act(async () => {
      await result.current
        .reload({
          tab: "FAKE_TAB_KEY",
        })
        .catch(failedCallbackFn)
    })

    expect(prevTabs === result.current.tabs)

    expect(failedCallbackFn).toHaveBeenCalled()
    expect(failedCallbackFn).toHaveBeenCalledTimes(1)
    expect(failedCallbackFn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("reload tab not found"),
      })
    )

    // tabs: [/, tab1, tab2], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")
  })

  it("reload#callback", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history: history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    act(() => {
      history.push("/")
    })

    // tabs: [/, tab1], current: /
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    const reloadCallbackFn = jest.fn((tab: OpenTab) => tab)

    // tab1 -> tabKey
    const prevKey = result.current.tabs[1].tabKey

    await act(async () => {
      await result.current
        .reload({
          tab: result.current.tabs[1],
        })
        .then(reloadCallbackFn)
    })

    expect(prevKey !== result.current.tabs[1].tabKey)

    expect(reloadCallbackFn).toHaveBeenCalled()
    expect(reloadCallbackFn).toHaveBeenCalledTimes(1)
    expect(reloadCallbackFn).toHaveBeenCalledWith(
      expect.objectContaining({ identity: result.current.tabs[1].identity })
    )

    // tabs: [/, tab1, tab2], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")
  })

  it("reload#replace", async () => {})

  it("reload#switch=false", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history: history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    act(() => {
      history.push("/")
    })

    // tabs: [/, tab1], current: /
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    const reloadCallbackFn = jest.fn((tab: OpenTab) => tab)

    // tab1 -> tabKey
    const prevKey = result.current.tabs[1].tabKey

    await act(async () => {
      await result.current
        .reload({
          tab: result.current.tabs[1],
          switch: false,
        })
        .then(reloadCallbackFn)
    })

    expect(prevKey !== result.current.tabs[1].tabKey)

    expect(reloadCallbackFn).toHaveBeenCalled()
    expect(reloadCallbackFn).toHaveBeenCalledTimes(1)
    expect(reloadCallbackFn).toHaveBeenCalledWith(
      expect.objectContaining({ identity: result.current.tabs[1].identity })
    )

    // tabs: [/, tab1, tab2], current: /
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")
  })
})

describe.each(historyModes)("$name: .close", ({ factory }) => {
  let history: History

  beforeEach(() => {
    window.history.pushState({}, "Test page", "/")
    sessionStorage.clear()
    history = factory()
  })

  it("close current tab", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    // default close current "tab1"
    await act(async () => {
      await result.current.close()
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")
  })

  it("close first tab", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    act(() => {
      history.push("/")
    })

    // default close current "tab1"
    await act(async () => {
      await result.current.close()
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/tab1")
  })

  it("close#tab does not exist", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    const successCallbackFn = jest.fn((tab: OpenTab) => tab)
    const failedCallbackFn = jest.fn((tab: OpenTab) => tab)

    // close /
    await act(async () => {
      await result.current
        .close({
          tab: "FAKE_TAB_KEY",
        })
        .then(successCallbackFn)
        .catch(failedCallbackFn)
    })

    expect(successCallbackFn).toHaveBeenCalledTimes(0)

    expect(failedCallbackFn).toHaveBeenCalled()
    expect(failedCallbackFn).toHaveBeenCalledTimes(1)
    expect(failedCallbackFn).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("close tab not found"),
      })
    )

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")
  })

  it("close#callback", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    const closeCallbackFn = jest.fn((tab: OpenTab) => tab)

    // close current "tab1"
    await act(async () => {
      await result.current.close().then(closeCallbackFn)
    })

    expect(closeCallbackFn).toHaveBeenCalled()
    expect(closeCallbackFn).toHaveBeenCalledTimes(1)
    expect(closeCallbackFn).toHaveBeenCalledWith(expect.objectContaining({ identity: result.current.tabs[0].identity }))

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")
  })

  it("close#backTo", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    const closeCallbackFn = jest.fn((tab: OpenTab) => tab)

    // close current "tab1"
    await act(async () => {
      await result.current.close().then(closeCallbackFn)
    })

    expect(closeCallbackFn).toHaveBeenCalled()
    expect(closeCallbackFn).toHaveBeenCalledTimes(1)
    expect(closeCallbackFn).toHaveBeenCalledWith(expect.objectContaining({ identity: result.current.tabs[0].identity }))

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")
  })

  it("close#backTo2", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    const closeCallbackFn = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      await result.current
        .close({
          backTo: "NOT_FOUND",
        })
        .then(closeCallbackFn)
    })

    expect(closeCallbackFn).toHaveBeenCalled()
    expect(closeCallbackFn).toHaveBeenCalledTimes(1)
    expect(closeCallbackFn).toHaveBeenCalledWith(expect.objectContaining({ identity: result.current.tabs[0].identity }))

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")
  })

  it("close#backTo3", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

    act(() => {
      history.push("/tab1")
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")

    const closeCallbackFn = jest.fn((tab: OpenTab) => tab)

    // close /
    await act(async () => {
      await result.current
        .close({
          tab: result.current.tabs[0],
        })
        .then(closeCallbackFn)
    })

    expect(closeCallbackFn).toHaveBeenCalled()
    expect(closeCallbackFn).toHaveBeenCalledTimes(1)
    expect(closeCallbackFn).toHaveBeenCalledWith(expect.objectContaining({ identity: result.current.tabs[0].identity }))

    // tabs: [tab1], current: tab1
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/tab1")
  })

  it("close#replace", async () => {})
})

describe.each(historyModes)("$name: .closeRight", ({ factory }) => {
  let history: History

  beforeEach(() => {
    window.history.pushState({}, "Test page", "/")
    sessionStorage.clear()
    history = factory()
  })

  it("close right", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history: history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

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
    expect(result.current.active.identity.pathname).toEqual("/tab3")

    await act(async () => {
      await result.current.closeRight()
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(4)
    expect(result.current.activeIndex).toEqual(3)
    expect(result.current.active.identity.pathname).toEqual("/tab3")
  })

  it("close right#tab", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history: history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

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
    expect(result.current.active.identity.pathname).toEqual("/tab3")

    await act(async () => {
      await result.current.closeRight({
        tab: result.current.tabs[1],
      })
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")
  })

  it("close right#callback", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history: history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

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
    expect(result.current.active.identity.pathname).toEqual("/tab3")

    const closeRightCallback = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      await result.current
        .closeRight({
          tab: result.current.tabs[1],
        })
        .then(closeRightCallback)
    })

    expect(closeRightCallback).toHaveBeenCalled()
    expect(closeRightCallback).toHaveBeenCalledTimes(1)
    expect(closeRightCallback).toHaveBeenCalledWith(
      expect.objectContaining({ identity: result.current.tabs[1].identity })
    )

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")
  })
})

describe.each(historyModes)("$name: .closeOthers", ({ factory }) => {
  let history: History

  beforeEach(() => {
    window.history.pushState({}, "Test page", "/")
    sessionStorage.clear()
    history = factory()
  })

  it("close others", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history: history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

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
    expect(result.current.active.identity.pathname).toEqual("/tab3")

    await act(async () => {
      await result.current.closeOthers()
    })

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/tab3")
  })

  it("close others#callback", async () => {
    const { result } = renderHook(() => useTabsAction(), {
      wrapper,
      initialProps: {
        history: history,
      },
    })

    // tabs: [/], current: /
    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.identity.pathname).toEqual("/")

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
    expect(result.current.active.identity.pathname).toEqual("/tab3")

    const closeRightCallback = jest.fn((tab: OpenTab) => tab)

    await act(async () => {
      await result.current
        .closeRight({
          tab: result.current.tabs[1],
        })
        .then(closeRightCallback)
    })

    expect(closeRightCallback).toHaveBeenCalled()
    expect(closeRightCallback).toHaveBeenCalledTimes(1)

    expect(closeRightCallback).toHaveBeenCalledWith(
      expect.objectContaining({ identity: result.current.tabs[1].identity })
    )

    // tabs: [/, tab1], current: tab1
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.identity.pathname).toEqual("/tab1")
  })
})
