import type { RouteNode } from "./node"
import type { ComponentType, FunctionComponent } from "react"
import type { RouteComponentProps, RouteProps } from "react-router-dom"

export type RouteComponent =
  | ComponentType<RouteComponentProps<any>>
  | ComponentType<any>
  | FunctionComponent<RouteProps>

export type RouteTagType = ComponentType<RouteProps> | FunctionComponent<RouteProps>

export type RouteLocation = RouteProps["location"]

export interface BreadcrumbMatchResult {
  /**
   * breadcrumb text
   */
  text: string
  /**
   * breadcrumb path
   */
  to?: string
}

export interface BreadcrumbConfigObjectFunctionParams {
  /**
   * node path
   */
  path: string
  /**
   * location pathname
   */
  pathname: string
  /**
   * url query
   */
  query: Record<any, any>
  /**
   * path match result
   */
  match: RegExpExecArray | null
}

export type IBreadcrumbConfigObjectFn = (args: BreadcrumbConfigObjectFunctionParams) => string

export interface IBreadcrumbConfigObject {
  text?: string | IBreadcrumbConfigObjectFn
  to?: string | IBreadcrumbConfigObjectFn
}

export type BreadcrumbConfigObjectArray = IBreadcrumbConfigObject[]

export type BreadcrumbConfigFn = (
  args: BreadcrumbConfigObjectFunctionParams
) => BreadcrumbMatchResult | BreadcrumbMatchResult[]

export type BreadcrumbConfig = string | IBreadcrumbConfigObject | BreadcrumbConfigObjectArray | BreadcrumbConfigFn

export interface InputRouteMeta {
  breadcrumb?: Record<string, BreadcrumbConfig>
  redirect?: string
  [k: string]: any
}

/**
 * input route config
 */
export interface RouteConfig {
  /**
   * path
   */
  path: string
  /**
   * Route Component
   */
  component?: RouteComponent
  /**
   * metadata
   */
  meta?: InputRouteMeta
  /**
   * <Route /> props
   */
  routeProps?: {
    exact?: boolean
    sensitive?: boolean
    strict?: boolean
  }
  /**
   * Children Route Config
   */
  children?: RouteConfig[]
}

export type PipeFn = (nodes: RouteNode[], ...args: any) => RouteNode[]
