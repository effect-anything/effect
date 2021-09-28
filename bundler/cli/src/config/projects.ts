import fs from "fs"
import path from "path"
import * as R from "@effect-x/deps/compiled/ramda"
import webpack from "@effect-x/deps/compiled/webpack"
import glob from "@effect-x/deps/compiled/glob"
import { normalizeProjectName, fileExist, loadPkg } from "./utils"
import { RettWorkspaces } from "./workspace"

export interface RettProjectSettings {
  projects?: string
  alias: Record<string, any>
  browserslist: string[]
  imageSizeLimit: number
  statics: string
  html?: {
    title?: string
    favicon?: string
    template?: string
    filename?: string
  }
  federation?: {
    entry?: boolean
    exposes?: Record<string, string>
    shared?: Record<string, string>
  }
  settings?: Record<string, RettProjectSettings>
  modify?(config: webpack.Configuration): webpack.Configuration
}

const configName = "rett.config.js"

export const loadProjectDefaultSettings = (workspaces: RettWorkspaces) => {
  const defaultProjectSettings: Partial<RettProjectSettings> = {
    html: {
      title: "Rett App",
    },
    imageSizeLimit: 10000,
    statics: "statics",
    browserslist: ["defaults"],
  }

  const configPath = path.join(workspaces.workspacePath, configName)

  const maybeConfigExist = fs.existsSync(configPath)

  const globalSettings = (maybeConfigExist ? loadPkg(configPath) : {}) as Partial<RettProjectSettings>

  const globalProjectSettings = R.omit(["settings", "modify"], globalSettings) as RettProjectSettings

  const defaultSettings = R.mergeDeepRight(defaultProjectSettings, globalProjectSettings) as RettProjectSettings

  return {
    defaultSettings,
    globalSettings,
  }
}

export const loadProjectSettings = (
  projectInfo: { name: string; projectPath: string },
  defaultSettings: Partial<RettProjectSettings>,
  globalSettings: Partial<RettProjectSettings>
): RettProjectSettings => {
  const rootProjectSettings = globalSettings.settings?.[projectInfo.name] ?? {}

  const projectCustomSettingsPath = path.join(projectInfo.projectPath, configName)

  if (fileExist(projectCustomSettingsPath)) {
    const projectCustomSetting = loadPkg(projectCustomSettingsPath)

    return R.mergeDeepRight(
      R.mergeDeepRight(defaultSettings, rootProjectSettings),
      projectCustomSetting
    ) as RettProjectSettings
  }

  return R.mergeDeepRight(defaultSettings, rootProjectSettings) as RettProjectSettings
}

const globFindProject = (cwd: string, projects: string | undefined): string[] => {
  const searchPath = projects ? path.join(projects, "/", "package.json") : "./package.json"

  const projectFiles = glob.sync(searchPath, {
    cwd: cwd,
    absolute: true,
  })

  return projectFiles
}

export interface RettProject {
  name: string
  projectPath: string
  pkg: any
  settings: RettProjectSettings
}

export interface RettFilterProjects {
  globalSettings: RettProjectSettings
  all: RettProject[]
  include: RettProject[]
  exclude: RettProject[]
}

interface GetProjectsOptions {
  cwd: string
  include: string[]
  exclude: string[]
}

export const getProjectsFormWorkspace = (
  options: GetProjectsOptions,
  workspaces: RettWorkspaces
): RettFilterProjects => {
  const { defaultSettings, globalSettings } = loadProjectDefaultSettings(workspaces)

  const projectsPkgFile = globFindProject(workspaces.workspacePath, globalSettings.projects)

  const allProjects = R.map((projectPkgPath: string) => {
    const projectPath = path.dirname(projectPkgPath)
    const projectPkg = JSON.parse(fs.readFileSync(projectPkgPath).toString())

    if (!projectPkg.name) {
      throw new Error("project name is required")
    }

    const projectInfo = {
      name: projectPkg.name,
      projectPath,
    }

    return {
      name: projectPkg.name,
      pkg: projectPkg,
      projectPath: projectPath,
      settings: loadProjectSettings(projectInfo, defaultSettings, globalSettings),
    } as RettProject
  }, projectsPkgFile)

  const { include, exclude } = options

  if (options.cwd !== workspaces.workspacePath && include.length === 0) {
    const currentProject = allProjects.find((project) => project.projectPath === options.cwd)

    if (currentProject) {
      include.push(normalizeProjectName(currentProject.name))
    }
  }

  const includes = R.flip(R.includes)

  const filterByProjectName = (fn: (name: any) => any) => (list: any) =>
    R.compose(fn, normalizeProjectName, R.prop<any, any>("name"))(list)

  const filterExcludes = includes(exclude)

  const filterIncludes = (name: any) => (include.length > 0 ? includes(include, name) : true)

  // step1. reject exclude
  const [excludeProjects, availableProjects] = R.partition(filterByProjectName(filterExcludes), allProjects)

  // step2. include project
  const includeProjects = R.filter(filterByProjectName(filterIncludes), availableProjects)

  return {
    globalSettings,
    all: allProjects,
    include: includeProjects,
    exclude: excludeProjects,
  } as RettFilterProjects
}
