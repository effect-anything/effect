import MiniCssExtractPlugin from "@effect-x/deps/compiled/mini-css-extract-plugin"
import type { RuleSetRule, RuleSetUseItem } from "@effect-x/deps/compiled/webpack"

export interface IStyleRuleOptions {
  sourceMap: boolean
  publicPath: string
  browserTargets: string[] | string | undefined
  include?: RuleSetRule["include"]
  exclude?: RuleSetRule["exclude"]
}

export type RuleLoaderBuild<T = undefined> = T extends undefined
  ? (args?: T) => (options: IStyleRuleOptions) => RuleSetUseItem
  : (args: T) => (options: IStyleRuleOptions) => RuleSetUseItem

type S = (options: IStyleRuleOptions) => RuleSetUseItem

export const makeStyleRule = (regex: string | RegExp, options: IStyleRuleOptions, rules: S[]): RuleSetRule => {
  return {
    test: regex,
    include: options.include,
    exclude: options.exclude,
    sideEffects: true,
    use: rules.map((item) => item(options)),
  }
}

export const styleLoader: RuleLoaderBuild = () => (options: IStyleRuleOptions) => {
  return {
    loader: MiniCssExtractPlugin.loader,
    options: {
      publicPath: options.publicPath,
    },
  }
}
