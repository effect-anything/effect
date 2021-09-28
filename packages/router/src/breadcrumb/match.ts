import pathToRegexp from "path-to-regexp"
import { chain, compose, keys, map, reduce, reject } from "ramda"
import type { RouteNode } from "../node"
import {
  BreadcrumbConfig,
  BreadcrumbConfigObjectFunctionParams,
  IBreadcrumbConfigObject,
  BreadcrumbMatchResult,
} from "../types"
import { isRealEmpty } from "../utils"

const of = <T>(list: T | T[]): T[] => (Array.isArray(list) ? list : [list])

const mapObj = <T, R, K extends string = string>(fn: (key: K, value: T) => R | R[], obj: Record<K, T>) => {
  return reduce((acc, key) => acc.concat(of(fn(key, obj[key]))), [] as R[], keys(obj))
}

export const breadcrumbRegexPathJoin = (...paths: string[]): string => {
  const fullPath = paths
    .filter(Boolean)
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

export const getMetaBreadcrumb = compose(
  (x) => x.reverse(),
  reject<RouteNode, "array">((x) => isRealEmpty(x.meta?.breadcrumb))
)

interface BreadcrumbMatchLocation {
  pathname: string
  query: Record<string, any> | undefined
}

export const matchRouteNodeBreadcrumb = (
  location: BreadcrumbMatchLocation,
  routeNodePath: string,
  breadcrumbRegexpPath: string,
  breadcrumbConfig: BreadcrumbConfig
): BreadcrumbMatchResult[] => {
  const pathMatch = pathToRegexp(breadcrumbRegexpPath).exec(location.pathname)

  if (!pathMatch) {
    return []
  }

  const exec = <T extends string | BreadcrumbMatchResult | BreadcrumbMatchResult[]>(
    fn: (args: BreadcrumbConfigObjectFunctionParams) => T
  ) => {
    const args: BreadcrumbConfigObjectFunctionParams = {
      path: routeNodePath,
      pathname: location.pathname,
      query: location.query || {},
      match: pathMatch,
    }

    return fn(args)
  }

  const assignDefault = (result: BreadcrumbMatchResult[]): BreadcrumbMatchResult[] => {
    return result.map((value) => {
      return {
        text: value.text,
        to: value.to || routeNodePath,
      }
    })
  }

  if (typeof breadcrumbConfig === "string") {
    return [
      {
        text: breadcrumbConfig,
        to: routeNodePath,
      },
    ]
  }

  if (typeof breadcrumbConfig === "function") {
    return assignDefault(of(exec(breadcrumbConfig)))
  }

  return compose(
    assignDefault,
    map<IBreadcrumbConfigObject, BreadcrumbMatchResult>((configItem) => {
      return {
        text: typeof configItem.text === "function" ? exec(configItem.text) : configItem.text || "",
        to: typeof configItem.to === "function" ? exec(configItem.to) : configItem.to,
      }
    })
  )(of(breadcrumbConfig))
}

export const getBreadcrumbs = (
  location: BreadcrumbMatchLocation,
  routeNode: RouteNode | undefined
): BreadcrumbMatchResult[] => {
  const parents = routeNode?.getParents() ?? []

  if (parents.length === 0) {
    return []
  }

  const routeNodeToBreadcrumbs = compose(
    reject<BreadcrumbMatchResult, "array">(isRealEmpty),
    chain<RouteNode, BreadcrumbMatchResult>((routeNode) => {
      const routeNodePath = routeNode.meta.autoRedirectPath || routeNode.meta.redirect || routeNode.path

      return mapObj<BreadcrumbConfig, BreadcrumbMatchResult>((breadcrumbConfigPath, breadcrumbConfig) => {
        const breadcrumbRegexpPath = breadcrumbRegexPathJoin(routeNode.path, breadcrumbConfigPath)

        return matchRouteNodeBreadcrumb(location, routeNodePath, breadcrumbRegexpPath, breadcrumbConfig)
      }, routeNode.meta.breadcrumb!)
    })
  )

  return compose(routeNodeToBreadcrumbs, getMetaBreadcrumb)(parents)
}
