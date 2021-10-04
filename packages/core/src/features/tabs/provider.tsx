import { History } from "history"
import React, { FunctionComponent, useEffect } from "react"
import { Provider, useStore } from "./context"
import { ReactChildren } from "./openTab"
import { createTabsStore } from "./state"

const TabSync: FunctionComponent<{ history: History }> = ({ history, children }) => {
  const location = useStore((state) => state.location)
  const { update, updateLocation, setHistoryPromises } = useStore((state) => ({
    update: state.update,
    updateLocation: state.updateLocation,
    setHistoryPromises: state.setHistoryCallbackMap,
  }))

  useEffect(() => {
    update(location, children)
  }, [children, location, update])

  useEffect(() => {
    const checkHistoryCallback = (location: History["location"]) => {
      const id = JSON.stringify({
        pathname: location.pathname,
        state: location.state,
        search: location.search,
      })

      setHistoryPromises((map) => {
        if (!map.get(id)) {
          return map
        }

        const task = map.get(id)!

        task.resolve(location)

        map.delete(id)

        return map
      })
    }

    const subscribe = history.listen((location) => {
      updateLocation(location)

      checkHistoryCallback(location)
    })

    return () => subscribe()
  }, [history, setHistoryPromises, updateLocation])

  return null
}

export const TabView: FunctionComponent<{ history: History; tabChildren?: ReactChildren }> = ({
  history,
  tabChildren,
  children,
}) => {
  return (
    <Provider createStore={() => createTabsStore(history, children)}>
      <TabSync history={history}>{children}</TabSync>
      {tabChildren}
    </Provider>
  )
}
