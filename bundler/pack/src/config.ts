import type { PackEnv } from "./bin"
import * as Sources from "./sources"
import * as Outputs from "./outputs"
import * as Transforms from "./transforms"
import { PackCtx } from "./types"

export class Config {
  public configModule: any

  constructor(userConfig: string, public readonly env: PackEnv) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    this.configModule = require(userConfig)
  }

  public run() {
    if (!this.configModule || typeof this.configModule !== "function") {
      return
    }

    const NODE_ENV = process.env.NODE_ENV
    const hasProduction = NODE_ENV === "production"
    const hasDevelopment = NODE_ENV === "development" || !NODE_ENV
    const hasTest = NODE_ENV === "test"

    const ctx: PackCtx = {
      cwd: this.env.cwd,
      sources: Sources.create(this.env),
      outputs: Outputs.create(this.env),
      transforms: Transforms.create(this.env),
      env: {
        hasProduction,
        hasDevelopment,
        hasTest,
      },
    }

    this.configModule(ctx)

    ctx.transforms.start()
  }
}
