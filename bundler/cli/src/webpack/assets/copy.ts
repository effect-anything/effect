import CopyWebpackPlugin from "@effect-x/deps/compiled/copy-webpack-plugin"
import { ConfigHelper } from "../../config/helper"
import { RettProject } from "../../config/projects"

interface ICopyPluginsOptions {
  path?: string
  output: string
}

export const makeCopyPlugin = (
  configHelper: ConfigHelper,
  projectConfig: RettProject,
  options: ICopyPluginsOptions
) => {
  const copyOptions = Object.assign(
    {
      path: "statics",
    },
    options
  )

  return new CopyWebpackPlugin({
    patterns: [
      {
        from: copyOptions.path || "statics",
        to: "./" + options.output,
        noErrorOnMissing: true,
        globOptions: {
          dot: false,
          ignore: ["index.html", "js/**", "css/**", "images/**", "fonts/**", "media/**"], // 防止被覆盖
        },
      },
    ],
  })
}
