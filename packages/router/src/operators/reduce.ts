import { Reduced, reduced, reduce as _reduce } from "ramda"
import { RouteNode } from "../node"
import { isRealEmpty } from "../utils"

export const reduce = <T extends RouteNode, TResult>(
  reduceFn: (acc: TResult, routeNode: T) => TResult | Reduced<TResult>,
  init: TResult
) => {
  return (routeNodes?: T[]): TResult => {
    if (isRealEmpty(routeNodes)) {
      return init
    }

    return _reduce<T, TResult>(
      (acc, routeNode) => {
        const cloneNode = routeNode.clone()
        const accResult = reduceFn(acc, routeNode)

        if (accResult && accResult["@@transducer/reduced"]) {
          return reduced(accResult["@@transducer/value"])
        }

        if (cloneNode.hasChildren) {
          return reduce(reduceFn, accResult as TResult)(cloneNode.children as T[])
        }

        return accResult
      },
      init,
      routeNodes!
    )
  }
}
