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

let id = 1

export class OpenTab {
  public id: number

  public tabKey: string

  public location: TabLocation

  public properties: ITabProperties

  public content: FunctionComponent<{
    location: TabLocation
  }>

  constructor({ tabKey, location, content }: OpenTabOptions) {
    this.id = id++

    this.tabKey = tabKey + ""

    this.location = location

    this.content = withChildren(content)

    this.properties = {
      key: Math.random() + "",
      title: "TODO",
    }
  }

  public reload() {
    this.properties.key = Math.random() + ""

    return this
  }
}

const buildLocationInfo = R.memoizeWith(JSON.stringify, (location: History["location"]) => {
  const locationOmit = R.omit(["key", "hash"], location)

  const newLocation = {
    pathname: locationOmit.pathname,
    search: locationOmit.search ? decodeURIComponent(locationOmit.search) : "",
    state: typeof locationOmit.state !== "undefined" ? locationOmit.state : undefined,
  }

  const hashStr = hash(JSON.stringify(newLocation))

  return {
    hash: hashStr,
    location: newLocation,
  }
})

export const buildTab = (location: History["location"], children: ReactChildren): OpenTab => {
  const l = buildLocationInfo(location)

  return new OpenTab({
    tabKey: l.hash,
    content: children,
    location: location,
  })
}
