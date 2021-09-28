/**
 *
 * @param {import('@effect-x/build-util/types').PackCtx} ctx
 */
module.exports = ({ sources, outputs, transforms, env }) => {
  const cjsConfig = require.resolve("./babel.config.js");

  const src = sources.dir("./src");

  transforms
    .add("babel", {
      input: src,
      output: outputs.output("./lib", {
        deleteDirOnStart: env.hasProduction,
      }),
      options: {
        configFile: cjsConfig,
        sourceMaps: true,
      },
    })
    .add("typescript", {
      tsconfigPath: "tsconfig.type.json",
      output: outputs.output("./lib/_types", {
        deleteDirOnStart: env.hasProduction,
      }),
    });
};
