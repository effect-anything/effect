import type { History } from "history"
import type { RouteConfigList } from "@effect-x/router/config"

export type FederationProjectLoad = (ctx: { routes: RouteConfigList; history: History }) => Promise<any>
