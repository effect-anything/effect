import { append, curryN, reduce } from "ramda"
import { RouteNode } from "../node"
import { isRealEmpty } from "../utils"

export const filter = curryN(
  2,
  (predicate: (config: RouteNode) => boolean, routeNodes: RouteNode[] | undefined): RouteNode[] => {
    if (isRealEmpty(routeNodes)) {
      return []
    }

    return reduce(
      (acc, routeNode) => {
        const cloneNode: RouteNode = routeNode.clone()

        if (cloneNode.hasChildren) {
          const filteredChildren = cloneNode.updateChildren((children) => filter(predicate)(children))

          return predicate(filteredChildren) ? append(filteredChildren, acc) : acc
        }
        return predicate(cloneNode) ? append(cloneNode, acc) : acc
      },
      [] as RouteNode[],
      routeNodes!
    )
  }
)
