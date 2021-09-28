import webpack from "@effect-x/deps/compiled/webpack"
import type { container } from "@effect-x/deps/compiled/webpack"
import { ConfigHelper } from "../../config/helper"
import type { RettProject } from "../../config/projects"
import { assetOutputJoin, normalize, normalizeProjectName } from "../../config/utils"

const ModuleFederationPlugin = webpack.container.ModuleFederationPlugin

type ModuleFederationPluginType = container.ModuleFederationPlugin

interface IFederationPluginOptions {
  output: string
}

export const makeFederationPlugin = (
  configHelper: ConfigHelper,
  projectConfig: RettProject,
  options: IFederationPluginOptions
): ModuleFederationPluginType | false => {
  const federationPlugin =
    configHelper.federationEnabled &&
    new ModuleFederationPlugin({
      name: normalize(normalizeProjectName(projectConfig.name)),
      filename: assetOutputJoin(options.output, "remoteEntry.js"),
      exposes: projectConfig.settings.federation?.exposes || {},
      shared: projectConfig.settings.federation?.shared || {},
    })

  return federationPlugin
}
