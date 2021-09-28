import * as R from "@effect-x/deps/compiled/ramda"
import { Compiler } from "@effect-x/deps/compiled/webpack"
import { transforms } from "../core/transformErrors"
import { webpackErrorExtract } from "./extract"

class StatsFormatPlugin {
  private defaultTransformers: any[]

  constructor() {
    this.defaultTransformers = [
      require("../transformers/moduleNotFound"),
      require("../transformers/webpack"),
      require("../transformers/babel"),
      require("../transformers/sass"),
      require("../transformers/postcss"),
    ]
  }

  apply(compiler: Compiler) {
    const getTransform = (type: string, ctx: any) =>
      R.compose(
        // formatters(this.defaultFormatters),
        transforms(this.defaultTransformers),
        webpackErrorExtract(type, ctx)
      )

    compiler.hooks.compilation.tap("FormatPlugin", (compilation) => {
      compilation.hooks.statsFactory.tap("FormatPluginStatsFactory", (stats) => {
        stats.hooks.extract.for("error").tap(
          {
            name: "FormatPluginStatsFactoryError",
            stage: 999, // Make sure that after default extract
          },
          (object, error, ctx) => {
            const transform = getTransform("error", ctx)

            const errorObj = Object.assign({}, error, object)

            const newObj = transform(errorObj)

            Object.assign(object, newObj[0])

            // delete object.stack
            // @ts-expect-error
            delete object.stats
            // @ts-expect-error
            delete object.originError
            // @ts-expect-error
            delete object.moduleIdentifier
            // @ts-expect-error
            delete object.module
            // @ts-expect-error
            delete object.moduleName
          }
        )

        stats.hooks.extract.for("warning").tap(
          {
            name: "FormatPluginStatsFactoryError",
            stage: 999, // Make sure that after default extract
          },
          (object, error, ctx) => {
            const transform = getTransform("warning", ctx)

            const errorObj = Object.assign({}, error, object)

            const newObj = transform(errorObj)

            Object.assign(object, newObj[0])

            // delete object.stack
            // @ts-expect-error
            delete object.stats
            // @ts-expect-error
            delete object.originError
            // @ts-expect-error
            delete object.moduleIdentifier
            // @ts-expect-error
            delete object.module
            // @ts-expect-error
            delete object.moduleName
          }
        )
      })
    })
  }
}

export default StatsFormatPlugin
