import { EventEmitter } from "events"
import { RouteConfig } from "./types"

export class RouteConfigList extends EventEmitter {
  private _routes: RouteConfig[] = []

  get routes() {
    return this._routes
  }

  constructor(routes: RouteConfig[]) {
    super()

    this._routes = routes
  }

  public combine(path: string, routeConfig: RouteConfig) {
    const index = this._routes.findIndex((x) => x.path === path)

    if (index === -1) {
      return
    }

    this._routes[index].children?.push(routeConfig)

    this.update()

    return this
  }

  public add(routeConfig: RouteConfig) {
    this._routes.push(routeConfig)

    this.update()

    return this
  }

  public update() {
    this.emit("update")
  }
}
