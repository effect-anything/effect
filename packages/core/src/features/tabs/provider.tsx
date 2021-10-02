import { History } from "history"
import React, { FunctionComponent, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { Provider, useStore } from "./context"
import { ReactChildren } from "./openTab"
import { createTabsStore } from "./state"

interface TabSyncProps {
  location: History["location"]
}

const TabSync: FunctionComponent<TabSyncProps> = ({ location, children }) => {
  const { sync } = useStore((state) => ({
    sync: state.sync,
  }))

  useEffect(() => {
    sync(location, children)
  }, [children, location, sync])

  return null
}

export const TabView: FunctionComponent<{ tabChildren: ReactChildren }> = ({ tabChildren, children }) => {
  const history = useHistory()

  return (
    <Provider createStore={() => createTabsStore(history, children)}>
      <TabSync location={history.location}>{children}</TabSync>
      {tabChildren}
    </Provider>
  )
}
