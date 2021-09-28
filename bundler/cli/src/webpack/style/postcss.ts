import PostcssFlexBugsFixes from "@effect-x/deps/compiled/postcss-flexbugs-fixes"
import SafePostCssParser from "@effect-x/deps/compiled/postcss-safe-parser"
import autoprefixer from "@effect-x/deps/compiled/autoprefixer"
import { IStyleRuleOptions, RuleLoaderBuild } from "./common"

interface IPostCSSLoaderOptions {
  safeParser?: boolean
  parser?: any
  syntax?: any
}

export const postcssLoader: RuleLoaderBuild<IPostCSSLoaderOptions> =
  (postcssLoaderOptions: IPostCSSLoaderOptions) => (options: IStyleRuleOptions) => {
    const postcssOptions = {
      ident: "postcss",
      parser: postcssLoaderOptions.safeParser ? SafePostCssParser : postcssLoaderOptions.parser,
      syntax: postcssLoaderOptions.syntax,
      config: false,
      implementation: require.resolve("@effect-x/deps/compiled/postcss"),
      hideNothingWarning: true,
      plugins: [
        PostcssFlexBugsFixes,
        autoprefixer({
          grid: "autoplace",
          overrideBrowserslist: options.browserTargets,
        }),
      ],
    }

    return {
      loader: require.resolve("@effect-x/deps/compiled/postcss-loader"),
      options: {
        postcssOptions,
        sourceMap: options.sourceMap,
        implementation: require.resolve("@effect-x/deps/compiled/postcss"),
      },
    }
  }
