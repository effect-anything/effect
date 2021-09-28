import type { TransformOptions } from "@effect-x/deps/compiled/babel"
import type { PackEnv } from "../../bin"
import type { SourceInput } from "../../sources"
import { BuildTask } from "../task"
import type { ProcessEventTypeEnum } from "./child"
import { build, singleBuild } from "./child"

export interface BabelBuildTaskConfig {
  input: SourceInput
  output: {
    outputPath: string
    deleteDirOnStart?: boolean
  }
  options?: TransformOptions
}

class BabelBuildTask extends BuildTask {
  constructor(public readonly env: PackEnv, public readonly options: BabelBuildTaskConfig) {
    super("babel", env)
  }

  public onStart() {
    this.build()

    // listen
    if (this.env.watch) {
      this.options.input.event.on("add", this.buildOnChange.bind(this))
      this.options.input.event.on("change", this.buildOnChange.bind(this))
    }
  }

  public onStop() {
    this.options.input.stop()
  }

  private build() {
    const payload: ProcessEventTypeEnum["build"] = {
      id: this.id,
      cwd: this.env.cwd,
      path: this.options.input.watchList,
      output: this.options.output,
      options: this.options.options,
    }

    build(payload, this.onMessage.bind(this))
  }

  private buildOnChange(changeFilePath: string) {
    const payload: ProcessEventTypeEnum["singleBuild"] = {
      id: this.id,
      cwd: this.env.cwd,
      path: this.options.input.watchList,
      changePath: changeFilePath,
      output: this.options.output,
      options: this.options.options,
    }

    singleBuild(payload, this.onMessage.bind(this))
  }
}

export const create =
  (env: PackEnv) =>
  (config: BabelBuildTaskConfig): BabelBuildTask => {
    return new BabelBuildTask(env, config)
  }
