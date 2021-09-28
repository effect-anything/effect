import { createContext, useContext } from "react"
import type { RouteNode } from "./node"

export interface RouterContextState {
  routes: RouteNode[]
  elements: JSX.Element | null
}

const createNamedContext = (name: string) => {
  const context = createContext<RouterContextState>({
    routes: [],
    elements: null,
  })

  context.displayName = name

  return context
}

export const context = /* #__PURE__ */ createNamedContext("RettRouterContext")

export const useRoutes = (): RouteNode[] => {
  return useContext(context).routes
}

export const useRoutesElement = (): JSX.Element | null => {
  return useContext(context).elements
}
