import * as R from "@effect-x/deps/compiled/ramda"
import type { PluginItem } from "@effect-x/deps/compiled/babel"
import { RettBabelPresetOptions } from "./babel-preset-base"

export default (api: any, options: RettBabelPresetOptions): PluginItem => {
  options = R.mergeDeepRight(
    {
      hasReactRefresh: true,
      hasJsxRuntime: true,
      presetEnv: {
        // Allow importing core-js in entrypoint and use browserlist to select polyfills
        useBuiltIns: "entry",
        // Set the corejs version we are using to avoid warnings in console
        corejs: 3,
        targets: {
          // Minimum support node14
          node: "node 14",
        },
        modules: "commonjs",
        exclude: ["transform-typeof-symbol"],
        bugfixes: true,
      },
    },
    options
  ) as RettBabelPresetOptions

  return {
    presets: [[require.resolve("./babel-preset-base"), options]],
  }
}
