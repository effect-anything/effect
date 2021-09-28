/**
 *
 * @param {import('@effect-x/build-util/types').PackCtx} ctx
 */
module.exports = ({ sources, outputs, transforms, env }) => {
  const esmConfig = require.resolve("./babel.config.esm.js")

  const src = sources.dir("./design-system")

  const themeSrc = sources.dir("./theme")

  transforms
    .add("babel", {
      input: src,
      output: outputs.output("./lib", {
        deleteDirOnStart: env.hasProduction,
      }),
      options: {
        configFile: esmConfig,
        sourceMaps: true,
      },
    })
    .add("babel", {
      input: themeSrc,
      output: outputs.output("./lib/theme", {
        deleteDirOnStart: env.hasProduction,
      }),
      options: {
        configFile: esmConfig,
        sourceMaps: true,
      },
    })
    .add("typescript", {
      tsconfigPath: "tsconfig.type.json",
      output: outputs.output("./lib/_types", {
        deleteDirOnStart: env.hasProduction,
      }),
    })
}
