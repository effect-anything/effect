import { RuleSetUseItem } from "@effect-x/deps/compiled/webpack"
import { makeBabelOptions } from "@effect-x/presets/babel-options"
import type { RettBabelPresetOptions } from "@effect-x/presets/babel-preset-base"
import { ConfigHelper } from "../../config/helper"

interface IBabelLoaderOptions {
  browserTargets: string | string[] | undefined | Record<string, any>
}

export const makeBabelLoader = (configHelper: ConfigHelper, options: IBabelLoaderOptions): RuleSetUseItem => {
  return {
    loader: require.resolve("@effect-x/deps/compiled/babel-loader"),
    options: {
      ...makeBabelOptions({
        browserTargets: options.browserTargets,
        caller: {
          name: "babel-loader",
          supportsDynamicImport: true,
          supportsStaticESM: true,
          supportsTopLevelAwait: true,
          env: configHelper.mode,
        },
      }),
      presets: [
        [
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          require("@effect-x/presets/babel-preset").default,
          {
            hasReactRefresh: configHelper.hotConfig.reactFastRefresh,
            debug: configHelper.args.debug,
          } as RettBabelPresetOptions,
        ],
      ],
    },
  }
}
