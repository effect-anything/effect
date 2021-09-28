import { RuleSetRule } from "@effect-x/deps/compiled/webpack"
import { assetOutputJoin } from "../../config/utils"

interface IImageRuleOptions {
  output: string
  limit: number
  publicPath: string
}

export const makeImageRule = (ruleOptions: IImageRuleOptions): RuleSetRule[] => {
  return [
    {
      test: /\.(ico|bpm|jpg|jpeg|png|gif|webp|avif)(\?.*)?$/,
      type: "asset/resource",
      parser: {
        dataUrlCondition: {
          maxSize: ruleOptions.limit,
        },
      },
      generator: {
        filename: assetOutputJoin(ruleOptions.output, "[name].[hash:8][ext]"),
        publicPath: ruleOptions.publicPath,
      },
    },
    {
      test: /\.svg$/,
      use: [
        {
          loader: require.resolve("@effect-x/deps/compiled/@svgr/webpack"),
          options: {
            prettier: false,
            svgo: false,
            svgoConfig: {
              plugins: [{ removeViewBox: false }],
            },
            titleProp: true,
            ref: true,
          },
        },
        {
          loader: require.resolve("@effect-x/deps/compiled/url-loader"),
          options: {
            name: assetOutputJoin(ruleOptions.output, "[name].[hash:8][ext]"),
          },
        },
      ],
      issuer: {
        and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
      },
    },
  ]
}
