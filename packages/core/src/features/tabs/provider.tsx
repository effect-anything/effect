import { History } from "history"
import React, { FunctionComponent, useEffect } from "react"
import { TabsZustandProvider, useStore } from "./context"
import { ReactChildren } from "./openTab"
import { createTabsStore } from "./state"

export const TabsSync: FunctionComponent<{ history: History }> = ({ history, children }) => {
  const location = useStore((state) => state.location)
  const { update, updateLocation } = useStore((state) => ({
    update: state.update,
    updateLocation: state.updateLocation,
  }))

  useEffect(() => {
    update(location, children)
  }, [children, location, update])

  useEffect(() => {
    const unSubscribe = history.listen((location) => updateLocation(location))

    return () => unSubscribe()
  }, [history, updateLocation])

  return null
}

export const Provider: FunctionComponent<{ history: History; tabChildren?: ReactChildren }> = ({
  history,
  tabChildren,
  children,
}) => {
  return (
    <TabsZustandProvider createStore={() => createTabsStore(history, children)}>
      <TabsSync history={history}>{children}</TabsSync>
      {tabChildren}
    </TabsZustandProvider>
  )
}
