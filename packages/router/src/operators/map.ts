import { RouteNode } from "../node"
import { isRealEmpty } from "../utils"
import { curryN, map as _map } from "ramda"

export const map = curryN(
  2,
  (fn: (config: RouteNode) => RouteNode, routeNodes: RouteNode[] | undefined): RouteNode[] => {
    if (isRealEmpty(routeNodes)) {
      return []
    }

    return _map((routeNode) => {
      const cloneNode: RouteNode = routeNode.clone()

      if (cloneNode.hasChildren) {
        return fn(cloneNode).updateChildren((children) => map(fn)(children))
      }

      return fn(cloneNode)
    }, routeNodes!)
  }
)
