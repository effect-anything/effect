import { RuleSetRule } from "@effect-x/deps/compiled/webpack"
import { assetOutputJoin } from "../../config/utils"

interface IImageRuleOptions {
  output: string
  publicPath: string
}

export const makeMediaRule = (ruleOptions: IImageRuleOptions): RuleSetRule[] => {
  return [
    {
      test: /\.(mp4|webm|ogv|wav|mp3|m4a|aac|oga|flac)$/,
      type: "asset/resource",
      generator: {
        filename: assetOutputJoin(ruleOptions.output, "[name].[hash:8][ext]"),
        publicPath: ruleOptions.publicPath,
      },
    },
  ]
}
