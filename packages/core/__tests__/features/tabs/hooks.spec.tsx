import "@testing-library/jest-dom"
import { createBrowserHistory, History } from "history"
import React, { PropsWithChildren } from "react"
import { renderHook, act } from "@testing-library/react-hooks"
import { Router, Route } from "react-router-dom"
import { Provider as TabsProvider } from "../../../src/features/tabs/provider"
import { useTabs, OpenTab } from "../../../src/features/tabs/hooks"

const wrapper = ({ history, children }: PropsWithChildren<{ history: History }>) => {
  return (
    <Router history={history}>
      <TabsProvider history={history} tabChildren={children}>
        <Route path="/" />
      </TabsProvider>
    </Router>
  )
}

describe("first test", () => {
  let history = createBrowserHistory()

  beforeEach(() => {
    history = createBrowserHistory()
  })

  it("sync history", () => {
    const { result } = renderHook(() => useTabs(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")

    act(() => history.push("/tab"))

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.active.location.pathname).toEqual("/tab")

    act(() => history.push("/"))

    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")
  })

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

  it("push don't exist location should jump to new tab", () => {})

  it("close tab", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useTabs(), {
      wrapper,
      initialProps: {
        history,
      },
    })

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")

    act(() => history.push("/tab"))

    expect(result.current.activeIndex).toEqual(1)
    expect(result.current.tabs).toHaveLength(2)
    expect(result.current.active.location.pathname).toEqual("/tab")

    // close current "tab"
    await act(async () => {
      result.current.close(result.current.active)

      await waitForNextUpdate()
    })

    expect(result.current.tabs).toHaveLength(1)
    expect(result.current.activeIndex).toEqual(0)
    expect(result.current.active.location.pathname).toEqual("/")
  })
})
