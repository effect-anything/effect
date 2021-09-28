import path from "path"
import fs from "fs"
import globParent from "./glob-parent"
import { loadPkg } from "./utils"

export interface IRettWorkspaceInfo {
  readonly projectsParentPath: string[]

  readonly nodeModulesPath: any
}

export interface RettWorkspaces {
  readonly workspaceEnable: boolean

  readonly workspacePath: string

  readonly workspacePkg: any

  readonly workspaces: string[]

  readonly workspaceInfo: IRettWorkspaceInfo
}

const getEnableWorkspaces = (pkg: any): string[] | undefined => {
  if (pkg.workspaces) {
    return pkg.workspaces
  }

  return undefined
}

const getWorkspacesInfo = (workspacePath: string, workspaces: string[]): IRettWorkspaceInfo => {
  const projectsParentPath = workspaces.map((workspaceGlob: any) => {
    return path.join(workspacePath, globParent(workspaceGlob))
  })

  return {
    projectsParentPath: projectsParentPath,
    nodeModulesPath: path.join(workspacePath, "node_modules"),
  }
}

export const initWorkspaces = (cwd: string): RettWorkspaces => {
  let workspaceEnable = false
  let workspacePath = ""
  let workspacePkg = {}
  let workspaces: string[] = []
  let workspaceInfo: IRettWorkspaceInfo = {
    projectsParentPath: [],
    nodeModulesPath: undefined,
  }

  const joinPackageName = (p: string) => path.join(p, "./package.json")

  const maybeParentPath = path.resolve(cwd, "../..")

  const maybeParentPkgExist = fs.existsSync(path.join(maybeParentPath, "./", "rett.config.js"))

  const maybeParentPkg = maybeParentPkgExist && loadPkg(joinPackageName(maybeParentPath))

  const maybeParentEnableWorkspace = maybeParentPkg && getEnableWorkspaces(maybeParentPkg)

  //  parent directory is project
  if (maybeParentPkg && maybeParentEnableWorkspace && maybeParentEnableWorkspace.length > 0) {
    workspaceEnable = true
    workspacePath = maybeParentPath
    workspacePkg = maybeParentPkg
    workspaces = maybeParentEnableWorkspace
  } else {
    // init cwd project
    const cwdPkg = loadPkg(joinPackageName(cwd))

    const enableWorkspaces = getEnableWorkspaces(cwdPkg)

    if (enableWorkspaces && enableWorkspaces.length > 0) {
      workspaceEnable = true
      workspacePath = cwd
      workspacePkg = cwdPkg
      workspaces = enableWorkspaces
    } else {
      workspaceEnable = false
      workspacePath = cwd
      workspacePkg = cwdPkg
      workspaces = []
    }
  }

  if (workspaceEnable) {
    workspaceInfo = getWorkspacesInfo(workspacePath, workspaces)
  }

  return {
    workspaceEnable,
    workspaceInfo,
    workspacePath,
    workspacePkg,
    workspaces,
  }
}
