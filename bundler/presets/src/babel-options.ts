export interface BabelLoaderOptions {
  browserTargets: string | string[] | undefined | Record<string, any>
  caller?: {
    name?: string
    supportsDynamicImport?: boolean
    supportsStaticESM?: boolean
    supportsExportNamespaceFrom?: boolean
    supportsTopLevelAwait?: boolean
    env?: string
  }
}

export const makeBabelOptions = (options: BabelLoaderOptions) => {
  return {
    babelrc: false,
    cloneInputAst: false,
    configFile: false,
    compact: false,
    sourceType: "unambiguous",
    customize: require.resolve("@effect-x/presets/babel-webpack-overrides"),
    // Webpack 5 has a built-in loader cache
    cacheDirectory: false,
    targets: options.browserTargets,
    caller: options.caller,
  }
}
