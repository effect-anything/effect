import { RuleSetUseItem } from "@effect-x/deps/compiled/webpack"
import { assetOutputJoin } from "../../config/utils"

interface IWorkerOptions {
  publicPath: string
  output: string
  loaders: RuleSetUseItem[]
}

export const makeWorkerRule = (options: IWorkerOptions) => {
  return {
    test: /\.worker\.(js|ts)$/,
    use: [
      {
        loader: require.resolve("@effect-x/deps/compiled/worker-loader"),
        options: {
          publicPath: options.publicPath,
          filename: assetOutputJoin(options.output, "[name].[contenthash:8].worker.js"),
          chunkFilename: assetOutputJoin(options.output, "[name].[contenthash:8].chunk.worker.js"),
          esModule: false,
          inline: "no-fallback",
        },
      },
      ...options.loaders,
    ],
  }
}
