import path from "path"
import HtmlWebpackPlugin from "@effect-x/deps/compiled/html-webpack-plugin"
import { assetOutputJoin } from "../../config/utils"
import { ConfigHelper } from "../../config/helper"
import { RettProject } from "../../config/projects"

interface IHtmlPluginOptions {
  output: string
}

export const makeHtmlPlugin = (configHelper: ConfigHelper, projectConfig: RettProject, options: IHtmlPluginOptions) => {
  const htmlOptions = Object.assign(
    {
      template: path.resolve(__dirname, "../../../templates/index.html"),
      filename: "index.html",
    },
    projectConfig.settings.html
  )

  const projectHtmlOutput = assetOutputJoin(options.output, htmlOptions.filename)

  let enableHtmlPlugin = false

  if (configHelper.hasDev) {
    enableHtmlPlugin = !!projectConfig.settings.html
  } else {
    // production
    // check module federation
    if (configHelper.federationEnabled) {
      // enabled module federation
      if (projectConfig.settings.federation?.entry) {
        enableHtmlPlugin = true
      }
    } else {
      enableHtmlPlugin = !!projectConfig.settings.html
    }
  }

  const htmlPlugin =
    enableHtmlPlugin &&
    new HtmlWebpackPlugin({
      title: htmlOptions.title,
      template: htmlOptions.template,
      filename: projectHtmlOutput,
      publicPath: configHelper.args.publicPath,
      favicon: htmlOptions.favicon,
      minify: configHelper.hasProd
        ? {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
          }
        : undefined,
    })

  return htmlPlugin
}
