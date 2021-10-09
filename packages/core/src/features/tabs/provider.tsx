import React, { FunctionComponent, useEffect } from "react"
import { TabsStoreProvider, useStore } from "./context"
import { ReactChildren } from "./openTab"
import { createTabsStore } from "./state"
import { TabsAdapter } from "./types"

export const TabsSync: FunctionComponent = ({ children }) => {
  const identity = useStore((state) => state.identity)
  const { update, adapter, updateIdentity } = useStore((state) => ({
    adapter: state.adapter,
    update: state.update,
    updateIdentity: state.updateIdentity,
  }))

  useEffect(() => {
    update(identity, children)
  }, [children, identity, update])

  useEffect(() => {
    const unsubscribe = adapter.listen((identity) => updateIdentity(identity))

    return unsubscribe
  }, [adapter, updateIdentity])

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
