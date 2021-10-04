import { History } from "history"
import React, { FunctionComponent, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Provider, useStore } from "./context"
import { ReactChildren } from "./openTab"
import { createTabsStore } from "./state"

const TabSync: FunctionComponent = ({ children }) => {
  const location = useLocation()
  const { sync } = useStore((state) => ({
    sync: state.sync,
  }))

  useEffect(() => {
    sync(location, children)
  }, [children, location, sync])

  return null
}

export const TabView: FunctionComponent<{ history: History; tabChildren?: ReactChildren }> = ({
  history,
  tabChildren,
  children,
}) => {
  return (
    <Provider createStore={() => createTabsStore(history, children)}>
      <TabSync>{children}</TabSync>
      {tabChildren}
    </Provider>
  )
}
