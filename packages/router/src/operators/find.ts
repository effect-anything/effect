import { curryN, reduced } from "ramda"
import { RouteNode } from "../node"
import { isRealEmpty } from "../utils"
import { reduce } from "./reduce"

export const find = curryN(
  2,
  (fn: (node: RouteNode) => boolean, routeNodes: RouteNode[] | undefined): undefined | RouteNode => {
    if (isRealEmpty(routeNodes)) {
      return undefined
    }

    return reduce<RouteNode, RouteNode | undefined>(
      (acc, routeNode) => (fn(routeNode) ? reduced(routeNode) : acc),
      undefined
    )(routeNodes!)
  }
)
