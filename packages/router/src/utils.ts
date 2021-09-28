import { either, isEmpty, isNil, pick } from "ramda"
import { RouteConfig } from "./types"

export const isRealEmpty = either(isEmpty, isNil)

export const joinPath = (...paths: string[]): string => {
  const fullPath = paths
    .filter(Boolean)
    .map((str) => {
      if (str[0] !== "/") {
        return "/" + str
      }

      return str
    })
    .join("")
    .replace(/\/{1,}\//g, "/")

  if (fullPath === "/") {
    return fullPath
  }

  if (fullPath[fullPath.length - 1] === "/") {
    return fullPath.slice(0, fullPath.length - 1)
  }

  return fullPath
}

export const getRouteProps = (obj: RouteConfig["routeProps"]) => {
  return pick(["exact", "sensitive"], obj || {})
}

export const isClassComponent = (component: unknown): boolean => {
  return typeof component === "function" && component?.prototype?.isReactComponent
}

export const isFunctionComponent = (component: unknown): boolean => {
  return typeof component === "function" && String(component).includes("createElement")
}

export const isReactComponent = (component: unknown) => {
  return isClassComponent(component) || isFunctionComponent(component)
}
