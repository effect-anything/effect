import path from "path"
import webpack, { Configuration, StatsCompilation } from "@effect-x/deps/compiled/webpack"
import StatsFormatPlugin from "../../src/webpack/plugin"
// @ts-ignore
import MemoryFileSystem from "memory-fs"

interface IOptions {
  entry?: string
  hasSourceMap?: boolean
  hasBabel?: boolean
  hasJsx?: boolean
  babelOptions?: any
  rules?: any
  plugins?: any
}

export const webpackPromise = function (fixturePath: string, options?: IOptions) {
  const { entry, hasSourceMap, hasBabel, babelOptions, hasJsx, rules, plugins } = Object.assign(
    {},
    {
      entry: "./index.js",
      hasSourceMap: true,
      hasBabel: false,
      hasJsx: false,
      rules: [],
      plugins: [],
    },
    options
  )

  const context = path.resolve(__dirname, fixturePath)

  const rulesTemp = []

  if (hasBabel) {
    rulesTemp.push({
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: require.resolve("@effect-x/deps/compiled/babel-loader"),
      options: {
        presets: hasJsx ? [require.resolve("@effect-x/deps/compiled/babel/preset-react")] : [],
        ...babelOptions,
      },
    })
  }

  if (rules && rules.length > 0) {
    rulesTemp.push(...rules)
  }

  const pluginsTemp = [new StatsFormatPlugin()]

  if (plugins && plugins.length > 0) {
    pluginsTemp.push(...plugins)
  }

  let compiler: webpack.Compiler

  try {
    const baseConfig: Configuration = {
      mode: "development",
      entry: entry,
      stats: "none",
      context: context,
      // uniq name
      name: fixturePath,
      devtool: hasSourceMap ? "eval-source-map" : false,
      output: {
        path: "/dist",
        filename: "bundle.js",
      },
      module: {
        rules: rulesTemp,
      },
      plugins: pluginsTemp,
    }

    compiler = webpack(baseConfig)

    compiler.outputFileSystem = new MemoryFileSystem()
  } catch (error) {
    return Promise.reject(error)
  }

  return new Promise<StatsCompilation>((resolve, reject) => {
    try {
      compiler.run((error, stats) => {
        if (error) {
          return reject(error)
        }

        if (!stats) {
          return reject(new Error("No compilation stats available"))
        }

        compiler.close((closeError) => {
          if (closeError) {
            return reject(closeError)
          }

          resolve(
            stats.toJson({
              all: false,
              errors: true,
              warnings: true,
            })
          )
        })
      })
    } catch (error) {
      reject(error)
    }
  })
}

// function filename(filePath) {
//   return path.join(__dirname, path.normalize(filePath))
// }

// it("integration : should display eslint warnings", async () => {
//   const logs = await executeAndGetLogs("./fixtures/eslint-warnings/webpack.config.js")
// })

// it("integration : webpack multi compiler : success", async () => {
//   // We apply the plugin directly to the compiler when targeting multi-compiler
//   const logs = await executeAndGetLogs("./fixtures/multi-compiler-success/webpack.config")
// })

// it("integration : webpack multi compiler : module-errors", async () => {
//   // We apply the plugin directly to the compiler when targeting multi-compiler
//   const logs = await executeAndGetLogs("./fixtures/multi-compiler-module-errors/webpack.config")
// })

// it("integration : postcss-loader : warnings", async () => {
//   const logs = await executeAndGetLogs("./fixtures/postcss-warnings/webpack.config")
// })

// it("integration : postcss-loader : warnings (multi-compiler version)", async () => {
//   const logs = await executeAndGetLogs("./fixtures/multi-postcss-warnings/webpack.config")
// })
