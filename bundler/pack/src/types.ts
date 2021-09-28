import * as Sources from "./sources"
import * as Outputs from "./outputs"
import * as Transforms from "./transforms"

export type PackCtx = {
  cwd: string
  env: {
    hasProduction: boolean
    hasDevelopment: boolean
    hasTest: boolean
  }
  sources: ReturnType<typeof Sources.create>
  outputs: ReturnType<typeof Outputs.create>
  transforms: ReturnType<typeof Transforms.create>
}
