import type { History } from "history"
import React, { FunctionComponent, ReactNode, useCallback, useEffect } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { ReactChildren } from "./openTab"
import { Provider, useStore } from "./context"
import { createTabsStore } from "./state"

const useInternalTabs = () => {
  const { event, updateTab } = useStore((state) => ({
    event: state.event,
    updateTab: state.updateTab,
  }))

  const sync = useCallback(
    (location: History["location"], children: ReactChildren) => {
      updateTab(location, children)
    },
    [updateTab]
  )

  return {
    event,
    sync,
  }
}

const useChildrenChange = (children: ReactNode | undefined) => {
  const location = useLocation()
  const { sync } = useInternalTabs()

  useEffect(() => {
    sync(location, children)
  }, [children, location, sync])

  return null
}

const useEventChange = () => {
  const history = useHistory()

  const { event } = useInternalTabs()

  useEffect(() => {
    event.on("push", (path) => {
      history.push(path)
    })

    event.on("replace", (path) => {
      history.replace(path)
    })

    return () => {}
  }, [event, history])

  return null
}

const TabSync: FunctionComponent = ({ children }) => {
  useEventChange()

  useChildrenChange(children)

  return null
}

export const TabView: FunctionComponent<{ tabChildren: ReactChildren }> = ({ tabChildren, children }) => {
  const location = useLocation()

  return (
    <Provider createStore={() => createTabsStore(location, children)}>
      <TabSync>{children}</TabSync>
      {tabChildren}
    </Provider>
  )
}
