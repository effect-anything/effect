import { RuleSetRule } from "@effect-x/deps/compiled/webpack"
import { assetOutputJoin } from "../../config/utils"

interface IFontRuleOptions {
  output: string
  publicPath: string
}

export const makeFontRule = (ruleOptions: IFontRuleOptions): RuleSetRule => {
  return {
    test: /\.(woff|woff2|ttf|eot)(\?t=[\s\S]+)?$/,
    type: "asset/resource",
    generator: {
      filename: assetOutputJoin(ruleOptions.output, "[name].[hash:8][ext]"),
      publicPath: ruleOptions.publicPath,
    },
  }
}
