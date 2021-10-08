import { FunctionComponent, ReactNode, cloneElement, isValidElement } from "react"
import { TabLocation } from "./types"

export type ReactChildren = ReactNode | undefined

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

interface ITabProperties {
  title: string
  key: string
}

interface OpenTabOptions {
  tabKey: string
  identity: TabLocation
  component: ReactChildren
}

export class OpenTab {
  public tabKey: string

  public identity: TabLocation

  public properties: ITabProperties

  public component: FunctionComponent<{
    location: TabLocation
  }>

  constructor({ tabKey, identity, component }: OpenTabOptions) {
    this.tabKey = tabKey + ""

    this.identity = identity

    this.component = withChildren(component)

    this.properties = {
      key: getRandomKey(),
      // TODO:
      title: "title",
    }
  }
}
