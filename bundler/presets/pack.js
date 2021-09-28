/**
 *
 * @param {import('@effect-x/build-util/types').PackCtx} ctx
 */
module.exports = ({ outputs, transforms, env }) => {
  transforms.add("typescript", {
    tsconfigPath: "tsconfig.build.json",
    output: outputs.output("./lib", {
      deleteDirOnStart: env.hasProduction,
    }),
  })
}
