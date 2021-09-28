import pathToRegexp from "path-to-regexp"
import { compose, map, mergeDeepRight, pipe } from "ramda"
import React, { FunctionComponent, memo, useRef, useState } from "react"
import { Redirect, Route, RouteComponentProps, Switch } from "react-router-dom"
import { context as RouterContext } from "./context"
import { mapRouteNode, RouteNode } from "./node"
import { DefaultNotFoundComponent } from "./notFound"
import * as operators from "./operators"
import { RouteAutoRedirect, RouteRedirect } from "./redirect"
import { PipeFn, RouteComponent, RouteConfig, RouteLocation, RouteTagType } from "./types"
import { isRealEmpty } from "./utils"

export const findRouteNodeByPathname = (pathname: string, routeNodes: RouteNode[] | undefined) => {
  return operators.find((routeNode) => {
    if (pathname === routeNode.path) {
      return true
    }

    const match = pathToRegexp(routeNode.path, {
      sensitive: routeNode.routeProps?.sensitive,
      strict: routeNode.routeProps?.strict,
    }).exec(pathname)

    return !!match
  })(routeNodes)
}

export class NotFoundRoute extends RouteNode {
  constructor(matchAll: boolean, parent: RouteNode | undefined, notFoundComponent: RouteComponent) {
    super(
      {
        path: matchAll ? "*" : "/*",
        component: notFoundComponent,
      },
      parent
    )
  }
}

export const createRouteNodeFromConfig = (routeConfig: RouteConfig[], fns: PipeFn[] = []): RouteNode[] => {
  const _p = (routes: RouteNode[]): RouteNode[] => {
    if (isRealEmpty(fns)) {
      return routes
    }

    // @ts-ignore
    return pipe(...fns)(routes) as RouteNode[]
  }

  return compose<RouteConfig[], RouteNode[], RouteNode[]>(_p, mapRouteNode(undefined))(routeConfig)
}

const ComponentNotDefined: FunctionComponent = () => {
  return <div>Route Component Undefined</div>
}

export interface BuildElementsOptions {
  routeTag?: RouteTagType
  notFound?: RouteComponent
}

/**
 * 获取生成的 Route jsx 标签结构
 */
export const createRouteElements = (
  routeNodes: RouteNode[] = [],
  elementsOptions?: BuildElementsOptions
): JSX.Element => {
  const RouteTag = elementsOptions?.routeTag || Route
  const NotFoundComponent = elementsOptions?.notFound || DefaultNotFoundComponent

  const mapToElements = map<RouteNode, JSX.Element>((routeNode: RouteNode) => {
    const { path, meta, children = [], component: Component } = routeNode

    const routeProps = mergeDeepRight(
      {
        exact: false,
        strict: true,
        sensitive: false,
      },
      routeNode.routeProps || {}
    )

    if (!routeNode.hasChildren) {
      if (meta.redirect) {
        return <Redirect key={path} from={path} to={meta.redirect} exact strict />
      }

      const RenderComponent = Component || ComponentNotDefined

      return <RouteTag {...routeProps} key={path} path={path} component={RenderComponent} />
    }

    return (
      <RouteTag
        {...routeProps}
        key={path}
        path={path}
        render={(props: RouteComponentProps<any>) => {
          const childrenContent = Component ? (
            <Component {...props}>{transformNodeToElement(children, props.location)}</Component>
          ) : (
            transformNodeToElement(children, props.location)
          )

          if (meta.redirect) {
            return (
              <>
                <RouteRedirect routeNode={routeNode} />
                {childrenContent}
              </>
            )
          }

          return (
            <>
              <RouteAutoRedirect routeNode={routeNode} />
              {childrenContent}
            </>
          )
        }}
      />
    )
  })

  const transformNodeToElement = (routeNodes: RouteNode[], location: RouteLocation): JSX.Element => {
    const wrapSwitchTag = (elements: JSX.Element[]) => <Switch location={location}>{elements}</Switch>

    const addNotFound = operators.map((node) => {
      if (node.hasChildren) {
        return node.updateChildren((children) => children?.concat(new NotFoundRoute(false, node, NotFoundComponent)))
      }

      return node
    })

    return compose(wrapSwitchTag, mapToElements, addNotFound)(routeNodes)
  }

  const fullRouteNodes = routeNodes.concat(new NotFoundRoute(false, undefined, NotFoundComponent))

  return transformNodeToElement(fullRouteNodes, undefined)
}

export interface RouterViewProps {
  routes: RouteNode[]
  elements: JSX.Element | null
}

const makeRoutes = (
  routeConfig: RouteConfig[],
  fns: PipeFn[] = [],
  options: BuildElementsOptions = {
    routeTag: Route,
    notFound: DefaultNotFoundComponent,
  }
) => {
  const routes = createRouteNodeFromConfig(routeConfig, fns)
  const elements = createRouteElements(routes, {
    routeTag: options.routeTag,
    notFound: options.notFound,
  })

  return {
    routes,
    elements,
  }
}

export const useRouterView = (getRouteConfig: () => RouteConfig[], fns?: PipeFn[], options?: BuildElementsOptions) => {
  const [routes, setRoutes] = useState<RouteNode[]>([])
  const [elements, setElements] = useState<JSX.Element | null>(null)
  const update = useRef(() => {
    const result = makeRoutes(getRouteConfig(), fns, options)

    setRoutes(result.routes)
    setElements(result.elements)
  })

  const RouteView = memo(() => (
    <RouterContext.Provider
      value={{
        routes: routes,
        elements: elements,
      }}
    >
      {elements}
    </RouterContext.Provider>
  ))

  RouteView.displayName = "RouteView"

  return {
    refresh: update.current,
    View: RouteView,
  }
}
