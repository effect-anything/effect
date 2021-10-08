import React, { FunctionComponent, useEffect } from "react"
import { TabsStoreProvider, useStore } from "./context"
import { ReactChildren } from "./openTab"
import { createTabsStore } from "./state"
import { TabsAdapter } from "./types"

export const TabsSync: FunctionComponent = ({ children }) => {
  const location = useStore((state) => state.location)
  const { update, adapter, updateLocation } = useStore((state) => ({
    adapter: state.adapter,
    update: state.update,
    updateLocation: state.updateLocation,
  }))

  useEffect(() => {
    update(location, children)
  }, [children, location, update])

  useEffect(() => {
    const unSubscribe = adapter.listen((location) => updateLocation(location))

    return unSubscribe
  }, [adapter, updateLocation])

  return null
}

export const Provider: FunctionComponent<{ adapter?: TabsAdapter; tabChildren?: ReactChildren }> = ({
  tabChildren,
  children,
  ...rest
}) => {
  return (
    <TabsStoreProvider createStore={() => createTabsStore(children, rest)}>
      <TabsSync>{children}</TabsSync>
      {tabChildren}
    </TabsStoreProvider>
  )
}
