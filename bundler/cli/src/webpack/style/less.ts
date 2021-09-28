import { RuleSetRule } from "@effect-x/deps/compiled/webpack"
import { IStyleRuleOptions, makeStyleRule, RuleLoaderBuild, styleLoader } from "./common"
import { cssLoader } from "./css"
import { postcssLoader } from "./postcss"

interface ILessLoaderOptions {
  regex: string | RegExp
  modules: boolean | any
  root?: string
  sourceMap?: boolean
  include?: RuleSetRule["include"]
  exclude?: RuleSetRule["exclude"]
}

export const lessLoader: RuleLoaderBuild<ILessLoaderOptions> =
  (lessLoaderOptions: ILessLoaderOptions) => (options: IStyleRuleOptions) => {
    return {
      loader: require.resolve("@effect-x/deps/compiled/less-loader"),
      options: {
        sourceMap: lessLoaderOptions.sourceMap || options.sourceMap,
        implementation: require.resolve("@effect-x/deps/compiled/less"),
        lessOptions: { javascriptEnabled: true },
      },
    }
  }

export const makeLessRule = (options: IStyleRuleOptions, lessRuleOptions: ILessLoaderOptions) => {
  return makeStyleRule(lessRuleOptions.regex, options, [
    styleLoader(),
    cssLoader({
      restLoaders: 2,
      modules: lessRuleOptions.modules,
    }),
    postcssLoader({
      safeParser: true,
    }),
    lessLoader(lessRuleOptions),
  ])
}
