import type { History } from "history"
import { FunctionComponent, ReactNode, cloneElement, isValidElement } from "react"
// @ts-expect-error
import hash from "hash-string"
import * as R from "ramda"

export type ReactChildren = ReactNode | undefined

export type TabLocation = Omit<History["location"], "hash" | "key">

export interface LocationTabInfo {
  hash: string
  location: TabLocation
}

interface ITabProperties {
  title: string
  key: string
}

interface OpenTabOptions {
  tabKey: string
  location: TabLocation
  content: ReactChildren
}

const withChildren = (children: ReactNode): FunctionComponent => {
  const displayName = "TabChildren"

  if (isValidElement(children)) {
    const Wrap: FunctionComponent = (props) => cloneElement(children, props)

    Wrap.displayName = displayName

    return Wrap
  }

  const Wrap: FunctionComponent = () => null

  return Wrap
}

export const getRandomKey = () => Math.ceil(Math.random() * 10000) + ""

export class OpenTab {
  public tabKey: string

  public location: TabLocation

  public properties: ITabProperties

  public content: FunctionComponent<{
    location: TabLocation
  }>

  constructor({ tabKey, location, content }: OpenTabOptions) {
    this.tabKey = tabKey + ""

    this.location = location

    this.content = withChildren(content)

    this.properties = {
      key: getRandomKey(),
      // TODO:
      title: "title",
    }
  }
}

export const buildLocationInfo = R.memoizeWith(JSON.stringify, (location: History["location"]): LocationTabInfo => {
  const newLocation = {
    pathname: location.pathname,
    search: location.search ? decodeURIComponent(location.search) : "",
    state: typeof location.state !== "undefined" ? location.state : undefined,
  }

  const hashStr = hash(JSON.stringify(newLocation))

  return {
    hash: hashStr,
    location: newLocation,
  }
})
