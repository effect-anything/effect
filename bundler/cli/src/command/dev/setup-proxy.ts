import path from "path"
import * as R from "@effect-x/deps/compiled/ramda"
import { ConfigHelper } from "../../config/helper"

export const setupProxy = (configHelper: ConfigHelper) => {
  if (!configHelper.hasDev) {
    return {}
  }

  const proxyFiles: string[] = []

  const proxyFile = configHelper.args.proxyFile || "setupProxy.js"

  if (configHelper.workspaces.workspaceEnable) {
    const { projectsParentPath } = configHelper.workspaces.workspaceInfo

    projectsParentPath.forEach((p: any) => {
      const filePath = path.join(p, proxyFile)

      proxyFiles.push(filePath)
    })
  } else {
    const filePath = path.join(configHelper.workspaces.workspacePath, proxyFile)

    proxyFiles.push(filePath)
  }

  let proxyConfig: any = {}

  const paths = R.uniq(proxyFiles)

  paths.forEach((filePath) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const proxyFn = require(filePath)

      if (proxyFn && typeof proxyFn === "function") {
        const ret = proxyFn(configHelper)

        if (ret && typeof ret === "object") {
          proxyConfig = R.mergeDeepRight(proxyConfig, ret)
        }
      }
    } catch (error) {}
  })

  return proxyConfig
}
