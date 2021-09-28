import { RouteNode } from "../node"
import { reduce } from "./reduce"

export const flat = (routeNodes: RouteNode[]) =>
  reduce<RouteNode, RouteNode[]>((acc, routeNode) => acc.concat(routeNode), [])(routeNodes)
