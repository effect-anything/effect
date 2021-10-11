import React, { FunctionComponent, useEffect } from "react"
import { TabsStoreProvider, useStore } from "./context"
import { ReactChildren } from "./openTab"
import { createTabsStore, TabsStoreOptions } from "./state"

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

  const tabs = useStore((state) => state.tabs)

  useEffect(() => {
    adapter.persistence?.(tabs)
  }, [adapter, tabs])

  return null
}

interface ProviderProps {
  adapter?: TabsStoreOptions["adapter"]

  adapterOptions?: TabsStoreOptions["adapterOptions"]

  tabChildren?: ReactChildren
}

export const Provider: FunctionComponent<ProviderProps> = ({ tabChildren, children, ...rest }) => {
  return (
    <TabsStoreProvider createStore={() => createTabsStore(children, rest)}>
      <TabsSync>{children}</TabsSync>
      {tabChildren}
    </TabsStoreProvider>
  )
}
