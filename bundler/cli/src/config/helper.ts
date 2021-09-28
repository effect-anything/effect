import path from "path"
import * as R from "@effect-x/deps/compiled/ramda"
import yargs from "@effect-x/deps/compiled/yargs"
import { fileExist, normalizeProjectName } from "./utils"
import { RettWorkspaces } from "./workspace"
import { RettFilterProjects, RettProject } from "./projects"
import { generateWebpackConfig } from "../webpack/generate"
import { RettBuildArgs, RettDevArgs } from "./types"

interface RettHotConfig {
  hot: boolean
  reactFastRefresh: boolean
}

type Args = yargs.Arguments<RettBuildArgs & RettDevArgs>

type EnvMode = "development" | "production" | "test"

export class ConfigHelper {
  public readonly rettPkg: Record<string, any>

  public readonly rettPkgPath: string

  public readonly hasDev: boolean

  public readonly hasTest: boolean

  public readonly hasProd: boolean

  public readonly mode: EnvMode

  constructor(
    public readonly args: Args,
    public readonly workspaces: RettWorkspaces,
    public readonly projects: RettFilterProjects
  ) {
    const rettPkgPath = path.resolve(__dirname, "../../package.json")

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const rettPkg = require(rettPkgPath)

    if (!fileExist(args.cwd)) {
      throw new Error("package.json not found")
    }

    this.rettPkg = rettPkg
    this.rettPkgPath = rettPkgPath

    this.hasDev = process.env.NODE_ENV === "development"
    this.hasTest = process.env.NODE_ENV === "test"
    this.hasProd = process.env.NODE_ENV === "production"

    switch (process.env.NODE_ENV) {
      case "development":
        this.mode = "development"
        break
      case "test":
        this.mode = "test"
        break
      case "production":
        this.mode = "production"
        break
      default:
        this.mode = "development"
    }
  }

  get projectNames() {
    return R.compose<RettProject[], RettProject[], string[], string[]>(
      R.map(normalizeProjectName),
      R.pluck("name"),
      R.reject<RettProject, "array">((project) => project.settings.federation?.entry === true)
    )(this.projects.include)
  }

  get indexProject(): string | undefined {
    if (this.projects.include.length === 0) {
      return undefined
    }

    const filterEntryProjects = this.projects.include.filter((project) => project.settings.federation?.entry === true)

    const project = R.head(filterEntryProjects) || this.projects.include[0]

    const indexProjectPath = project
      ? path.join(this.args.publicPath, normalizeProjectName(project.name), "index.html")
      : undefined

    return indexProjectPath
  }

  get hotConfig(): RettHotConfig {
    return {
      hot: this.hasDev && this.args.hot,
      reactFastRefresh: this.hasDev && this.args.hot && this.args.reactFastRefresh && !this.federationEnabled,
    }
  }

  get federationEnabled(): boolean {
    return this.projects.all.some((project) => project.settings.federation?.entry === true)
  }

  public generateWebpackConfig() {
    return this.projects.include.map((project) => {
      return generateWebpackConfig(this, project)
    })
  }
}
