import type { RuleSetRule } from "@effect-x/deps/compiled/webpack"
import MiniCssExtractPlugin from "@effect-x/deps/compiled/mini-css-extract-plugin"
import { IStyleRuleOptions, makeStyleRule, RuleLoaderBuild, styleLoader } from "./common"
import { postcssLoader } from "./postcss"
import { assetOutputJoin } from "../../config/utils"
import { RettProject } from "../../config/projects"
import { ConfigHelper } from "../../config/helper"

interface ICSSLoaderOptions {
  regex?: string | RegExp
  modules: boolean | any
  restLoaders?: number
  include?: RuleSetRule["include"]
  exclude?: RuleSetRule["exclude"]
}

export const cssLoader: RuleLoaderBuild<ICSSLoaderOptions> =
  (cssOptions: ICSSLoaderOptions) => (options: IStyleRuleOptions) => {
    return {
      loader: require.resolve("@effect-x/deps/compiled/css-loader"),
      options: {
        importLoaders: cssOptions.restLoaders,
        modules: cssOptions.modules
          ? {
              localIdentName: "[name]__[local]--[hash:base64:5]",
              ...cssOptions.modules,
            }
          : false,
        sourceMap: options.sourceMap,
      },
    }
  }

export const makeCssRule = (options: IStyleRuleOptions, cssRuleOptions: ICSSLoaderOptions) => {
  return makeStyleRule(cssRuleOptions.regex!, options, [
    styleLoader(),
    cssLoader({
      modules: cssRuleOptions.modules,
      restLoaders: 1,
    }),
    postcssLoader({
      safeParser: false,
    }),
  ])
}

interface ICSSPluginOptions {
  output: string
}

export const makeCssPlugin = (config: ConfigHelper, projectConfig: RettProject, options: ICSSPluginOptions) => {
  return new MiniCssExtractPlugin({
    filename: assetOutputJoin(options.output, config.hasDev ? "[name].css" : "[name].[chunkhash].css"),
    chunkFilename: assetOutputJoin(options.output, config.hasDev ? "[name].[id].css" : "[name].[id].[chunkhash].css"),
    experimentalUseImportModule: false,
    ignoreOrder: true,
  })
}
