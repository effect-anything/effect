import path from "path"
import * as R from "@effect-x/deps/compiled/ramda"
import type { PluginItem } from "@effect-x/deps/compiled/babel"

export interface RettBabelPresetOptions {
  env?: "development" | "production" | "test"
  hasReactRefresh?: boolean
  hasJsxRuntime?: boolean
  presetEnv?: Record<string, any>
  transformRuntime?: Record<string, any>
  debug?: boolean
}

// Taken from https://github.com/babel/babel/commit/d60c5e1736543a6eac4b549553e107a9ba967051#diff-b4beead8ad9195361b4537601cc22532R158
function supportsStaticESM(caller: any): boolean {
  return !!caller?.supportsStaticESM
}

function getCallerEnv(caller: any): boolean {
  return caller?.env
}

export default (api: any, options: RettBabelPresetOptions): PluginItem => {
  const callerEnv = api.caller(getCallerEnv)
  const supportsESM = api.caller(supportsStaticESM)

  options = R.mergeDeepRight(
    {
      env: callerEnv || "development",
    },
    options
  ) as RettBabelPresetOptions

  const hasDev = options.env === "development" || callerEnv === "development"
  const hasProd = options.env === "production" || callerEnv === "production"
  const hasTest = options.env === "test" || callerEnv === "test"

  return {
    presets: [
      [
        require.resolve("@effect-x/deps/compiled/babel/preset-env"),
        {
          exclude: ["transform-typeof-symbol"],
          include: ["@babel/plugin-proposal-optional-chaining", "@babel/plugin-proposal-nullish-coalescing-operator"],
          ...options.presetEnv,
          debug: options.debug,
        },
      ],
      [
        require.resolve("@effect-x/deps/compiled/babel/preset-react"),
        {
          runtime: options.hasJsxRuntime ? "automatic" : "classic",
          development: !hasProd,
        },
      ],
      [
        require.resolve("@effect-x/deps/compiled/babel/preset-typescript"),
        {
          allowNamespaces: true,
        },
      ],
    ],
    plugins: [
      require.resolve("@effect-x/deps/compiled/babel/plugin-macros"),
      [
        require.resolve("@effect-x/deps/compiled/babel/plugin-proposal-optional-chaining"),
        {
          loose: false,
        },
      ],
      [
        require.resolve("@effect-x/deps/compiled/babel/plugin-proposal-nullish-coalescing-operator"),
        {
          loose: false,
        },
      ],
      [
        require.resolve("@effect-x/deps/compiled/babel/plugin-proposal-decorators"),
        {
          legacy: true,
        },
      ],
      require.resolve("@effect-x/deps/compiled/babel/plugin-proposal-class-properties"),
      require.resolve("@effect-x/deps/compiled/babel/plugin-proposal-export-default-from"),
      [
        require.resolve("@effect-x/deps/compiled/babel/plugin-proposal-pipeline-operator"),
        {
          proposal: "minimal",
        },
      ],
      require.resolve("@effect-x/deps/compiled/babel/plugin-proposal-do-expressions"),
      require.resolve("@effect-x/deps/compiled/babel/plugin-proposal-logical-assignment-operators"),
      options.transformRuntime && [
        require.resolve("@effect-x/deps/compiled/babel/plugin-transform-runtime"),
        {
          corejs: false,
          helpers: true,
          absoluteRuntime: path.dirname(require.resolve("@babel/runtime/package.json")),
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          version: require("@babel/runtime/package.json").version,
          useESModules: supportsESM && options.presetEnv?.modules !== "commonjs",
          regenerator: true,
          ...options.transformRuntime,
        },
      ],
      hasProd && [
        require.resolve("@effect-x/deps/compiled/babel/babel-plugin-transform-react-remove-prop-types"),
        {
          removeImport: true,
        },
      ],
    ].filter(Boolean),
    env: {
      development: {
        plugins: options.hasReactRefresh ? [require.resolve("@effect-x/deps/compiled/react-refresh/babel")] : [],
      },
    },
  }
}
