import { PackEnv } from "./bin"

class Outputs {
  constructor(public readonly env: PackEnv) {}

  public output(outputPath: string, options: any) {
    return {
      outputPath,
      options,
    }
  }
}

export const create = (env: PackEnv) => new Outputs(env)
