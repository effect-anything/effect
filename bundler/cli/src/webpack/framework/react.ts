import path from "path"
import ReactRefreshWebpackPlugin from "@effect-x/deps/compiled/react-refresh-webpack-plugin"
import { ConfigHelper } from "../../config/helper"

export const getReactPathAlias = (configHelper: ConfigHelper) => {
  if (configHelper.args.profile) {
    return {
      "react-dom$": "react-dom/profiling",
      "scheduler/tracing": "scheduler/tracing-profiling",
    }
  }

  return {}
}

export const getReactHotReloadPlugins = (configHelper: ConfigHelper) => {
  const ret: any = []

  if (configHelper.hotConfig.reactFastRefresh) {
    const entry = require.resolve("@effect-x/runtime/entry")
    const compiledPath = path.resolve(entry, "../../")

    const excludes = [/node_modules/, compiledPath]

    ret.push(
      new ReactRefreshWebpackPlugin({
        exclude: excludes,
        overlay: {
          entry,
          module: require.resolve("@effect-x/runtime/source/refreshOverlayInterop"),
          sockIntegration: false,
        },
      })
    )
  }

  return ret
}
