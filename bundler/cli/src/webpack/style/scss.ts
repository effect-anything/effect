import type { RuleSetRule } from "@effect-x/deps/compiled/webpack"
import { IStyleRuleOptions, makeStyleRule, RuleLoaderBuild, styleLoader } from "./common"
import { cssLoader } from "./css"
import { postcssLoader } from "./postcss"

interface ISassLoaderOptions {
  regex: string | RegExp
  modules: boolean | any
  sourceMap?: boolean
  include?: RuleSetRule["include"]
  exclude?: RuleSetRule["exclude"]
}

export const sassLoader: RuleLoaderBuild<ISassLoaderOptions> =
  (sassLoaderOptions: ISassLoaderOptions) => (options: IStyleRuleOptions) => {
    return {
      loader: require.resolve("@effect-x/deps/compiled/sass-loader"),
      options: {
        sourceMap: sassLoaderOptions.sourceMap || options.sourceMap,
        implementation: require.resolve("@effect-x/deps/compiled/sass"),
        sassOptions: {
          // indentWidth: 2,
        },
        // additionalData: "$env: " + process.env.NODE_ENV + ";",
      },
    }
  }

interface IResolveUrlLoaderOptions {
  root?: string
  sourceMap?: boolean
}

export const resolveUrlLoader: RuleLoaderBuild<IResolveUrlLoaderOptions> =
  (resolveUrlLoaderOptions: IResolveUrlLoaderOptions) => (options: IStyleRuleOptions) => {
    return {
      loader: require.resolve("@effect-x/deps/compiled/resolve-url-loader"),
      options: {
        sourceMap: resolveUrlLoaderOptions.sourceMap,
      },
    }
  }

export const makeSassRule = (options: IStyleRuleOptions, sassRuleOptions: ISassLoaderOptions) => {
  return makeStyleRule(sassRuleOptions.regex, options, [
    styleLoader(),
    cssLoader({
      restLoaders: 3,
      modules: sassRuleOptions.modules,
    }),
    postcssLoader({
      safeParser: true,
    }),
    resolveUrlLoader({ sourceMap: sassRuleOptions.sourceMap }),
    sassLoader(sassRuleOptions),
  ])
}
