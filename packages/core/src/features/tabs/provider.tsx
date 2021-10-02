import { History } from "history"
import React, { FunctionComponent, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Provider, useStore } from "./context"
import { ReactChildren } from "./openTab"
import { createTabsStore } from "./state"

interface TabSyncProps {
  location: History["location"]
}

const TabSync: FunctionComponent<TabSyncProps> = ({ location, children }) => {
  const { update } = useStore((state) => ({
    update: state.update,
  }))

  useEffect(() => {
    update(location, children)
  }, [children, location, update])

  return null
}

export const TabView: FunctionComponent<{ tabChildren: ReactChildren }> = ({ tabChildren, children }) => {
  const location = useLocation()

  return (
    <Provider createStore={() => createTabsStore(location, children)}>
      <TabSync location={location}>{children}</TabSync>
      {tabChildren}
    </Provider>
  )
}
