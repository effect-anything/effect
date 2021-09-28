import type { CompilerOptions } from "typescript"
import type { PackEnv } from "../../bin"
import { ProcessBuildTask } from "../task"

export interface TypescriptTaskConfig {
  output: {
    outputPath: string
    deleteDirOnStart?: boolean
  }
  tsconfigPath: string
  options?: CompilerOptions
}

class TypescriptBuildTask extends ProcessBuildTask {
  constructor(public readonly env: PackEnv, public readonly options: TypescriptTaskConfig) {
    super("typescript", require.resolve("./child"), env)
  }

  public onStart(): void {
    this.send({
      type: "build",
      args: {
        watch: this.env.watch,
        output: this.options.output,
        tsconfigPath: this.options.tsconfigPath,
        options: this.options.options,
      },
    })
  }

  public onStop(): void {}
}

export const create =
  (env: PackEnv) =>
  (config: TypescriptTaskConfig): TypescriptBuildTask => {
    return new TypescriptBuildTask(env, config)
  }
