import type { RouteNode } from "./node"
import type { FunctionComponent } from "react"
import { useEffect } from "react"
import { useHistory, useLocation } from "react-router-dom"

interface IRouteAutoRedirect {
  routeNode: RouteNode
}

/**
 * 重定向到合适的 children 下的 path
 */
export const RouteAutoRedirect: FunctionComponent<IRouteAutoRedirect> = ({ routeNode }) => {
  const { pathname } = useLocation()
  const history = useHistory()

  useEffect(() => {
    const { autoRedirectPath } = routeNode.meta
    const pathHit = routeNode.path === pathname

    /**
     * 如果当前组件 path 不等于当前路由 pathname，此逻辑不生效
     */
    if (!pathHit) {
      return
    }

    if (!autoRedirectPath) {
      return
    }

    /**
     * 重定向登录当前配置 path 或者登录当前路由 pathname
     */
    if (autoRedirectPath === routeNode.path || autoRedirectPath === pathname) {
      return
    }

    history.replace(autoRedirectPath)
  }, [routeNode, history, pathname])

  return null
}

interface RouteRedirectProps {
  routeNode: RouteNode
}

/**
 * 路由重定向
 */
export const RouteRedirect: FunctionComponent<RouteRedirectProps> = ({ routeNode }) => {
  const { pathname } = useLocation()
  const history = useHistory()

  useEffect(() => {
    const { redirect } = routeNode.meta

    if (pathname === routeNode.path && redirect && pathname !== redirect) {
      history.push(redirect)
    }
  }, [routeNode, pathname])

  return null
}
