import { any, clone, compose, identity, ifElse, map, reduce, reduced, reject } from "ramda"
import type { RouteConfig } from "./types"
import { getRouteProps, isRealEmpty, joinPath } from "./utils"

type RouteNodeMeta = RouteConfig["meta"] & {
  /**
   * 原路径
   */
  readonly _path: string

  /**
   * 自动重定向地址
   */
  readonly autoRedirectPath?: string
}

/**
 * 过滤不符合规则配置
 **/
export const rejectIllegalConfig = reject<RouteConfig, "array">((x) => isRealEmpty(x.path) || !x.path)

const defaultRejectChars = ["*", ":", "?", "+", ".", "(", ")", "^", "&"]

export const filterByChars = (path: string, chars: string[] = defaultRejectChars) => {
  return any<string>((char) => path.indexOf(char) > -1, chars)
}

export const filterChildrenByParams = (routesNode?: RouteNode[]): RouteNode[] => {
  if (isRealEmpty(routesNode)) {
    return []
  }

  return routesNode!.filter((routeConfig) => {
    const charHit = filterByChars(routeConfig.path)

    return !charHit
  })
}

export const getRouteNodeParents = (routeNode?: RouteNode, results: RouteNode[] = []): RouteNode[] => {
  return routeNode ? getRouteNodeParents(routeNode.parent, results.concat(routeNode)) : results
}

export const calcAutoRedirectPath = (routesNode?: RouteNode[]): string | undefined => {
  const findPath = reduce(
    (acc, elem) => {
      if (elem.meta.autoRedirectPath) {
        return reduced(elem.meta.autoRedirectPath)
      }

      if (!elem.children) {
        return reduced(elem.path)
      }

      if (elem.hasChildren) {
        const result = calcAutoRedirectPath(elem.children)

        if (result) {
          return reduced(result)
        }

        return acc
      }

      return acc
    },
    undefined as string | undefined,
    filterChildrenByParams(routesNode)
  )

  return findPath
}

export const mapRouteNode =
  (parent: RouteNode | undefined) =>
  (routeConfig: RouteConfig[] | undefined): RouteNode[] =>
    ifElse(
      isRealEmpty,
      identity,
      compose(
        map<RouteConfig, RouteNode>((routeConfig) => {
          const cloneConfig = clone(routeConfig)

          const routeNode = new RouteNode(cloneConfig, parent)

          routeNode.updateChildren(() => mapRouteNode(routeNode)(cloneConfig.children))

          return routeNode
        }),
        rejectIllegalConfig
      )
    )(routeConfig)

export class RouteNode {
  /**
   * 路由 path
   */
  private _path: string

  /**
   * 路由组件
   */
  private _component: RouteConfig["component"]

  /**
   * 路由 Route 标签 props
   */
  private _routeProps: RouteConfig["routeProps"]

  /**
   * 路由 Meta 信息
   */
  private _meta: RouteNodeMeta

  /**
   * 子节点路由列表
   */
  private _children?: RouteNode[]

  /**
   * 子节点路由配置
   */
  private _childrenConfig?: RouteConfig[]

  /**
   * 父节点路由
   */
  private _parent?: RouteNode

  get path(): RouteConfig["path"] {
    const parentPath = this._parent?.path ?? "/"

    // 连接父节点的 path
    return joinPath(parentPath, this._path)
  }

  get routeProps(): RouteConfig["routeProps"] {
    return getRouteProps(this._routeProps)
  }

  get component(): RouteConfig["component"] {
    return this._component
  }

  get meta(): RouteNodeMeta {
    return {
      ...this._meta,
      autoRedirectPath: calcAutoRedirectPath(this._children),
    }
  }

  get children(): RouteNode[] | undefined {
    return this._children
  }

  /**
   * 父级路由节点
   */
  get parent(): RouteNode | undefined {
    return this._parent
  }

  /**
   * sibling nodes
   */
  get sibling(): RouteNode[] {
    return this.parent?.children ?? []
  }

  /**
   * 是否存在子级
   */
  get hasChildren() {
    return this._children && this._children.length > 0
  }

  constructor(routeConfig: RouteConfig, parent?: RouteNode | undefined) {
    this._path = routeConfig.path
    this._component = routeConfig.component
    this._routeProps = routeConfig.routeProps
    this._meta = {
      ...routeConfig.meta,
      _path: routeConfig.path,
    }
    this._parent = parent
    this._childrenConfig = routeConfig.children
  }

  public getParents() {
    return getRouteNodeParents(this)
  }

  public updatePath(fn: (path: RouteNode["path"]) => RouteNode["path"]) {
    this._path = fn(this._path)

    return this
  }

  public updateChildren(fn: (children: RouteNode["_children"]) => RouteNode["_children"]) {
    this._children = fn(this._children)

    return this
  }

  public updateMeta(fn: (meta: RouteNode["_meta"]) => RouteNode["_meta"]) {
    this._meta = fn(this._meta)

    return this
  }

  public clone() {
    return new RouteNode(
      clone({
        path: this._path,
        children: this._childrenConfig,
        component: this._component,
        meta: this._meta,
        routeProps: this._routeProps,
      }),
      this._parent
    ).updateChildren(() => this._children)
  }

  public toJSON(): RouteConfig {
    return {
      path: this.path,
      component: this.component,
      children: this.children?.map((x) => x.toJSON()),
      meta: this.meta,
      routeProps: this.routeProps,
    }
  }
}
