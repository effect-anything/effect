import CaseSensitivePathsPlugin from "@effect-x/deps/compiled/case-sensitive-paths-webpack-plugin"
import CircularDependencyPlugin from "@effect-x/deps/compiled/circular-dependency-plugin"
import debugF from "@effect-x/deps/compiled/debug"
import ForkTsCheckerWebpackPlugin from "@effect-x/deps/compiled/fork-ts-checker-webpack-plugin/index"
import * as R from "@effect-x/deps/compiled/ramda"
import ModuleNotFoundPlugin from "@effect-x/deps/compiled/react-dev-utils/ModuleNotFoundPlugin"
import SpeedMeasurePlugin from "@effect-x/deps/compiled/speed-measure-webpack-plugin"
import CssMinimizerPlugin from "@effect-x/deps/compiled/css-minimizer-webpack-plugin"
import TerserPlugin from "@effect-x/deps/compiled/terser-webpack-plugin"
import webpack from "@effect-x/deps/compiled/webpack"
import type { RuleSetRule } from "@effect-x/deps/compiled/webpack"
import { BundleAnalyzerPlugin } from "@effect-x/deps/compiled/webpack-bundle-analyzer"
import path from "path"
import type { RettProject } from "../config/projects"
import { assetOutputJoin, normalizeProjectName } from "../config/utils"
import { makeCopyPlugin } from "./assets/copy"
import { makeFontRule } from "./assets/font"
import { makeHtmlPlugin } from "./assets/html"
import { makeImageRule } from "./assets/image"
import { makeFederationPlugin } from "./features/federation"
import { getReactHotReloadPlugins, getReactPathAlias } from "./framework/react"
import { makeBabelLoader } from "./js/babel"
import { makeJSRules } from "./js/js"
import { makeTSRules } from "./js/ts"
import { makeWasmRule } from "./js/wasm"
import { makeWorkerRule } from "./js/worker"
import { makeCssPlugin, makeCssRule } from "./style/css"
import { makeLessRule } from "./style/less"
import { makeSassRule } from "./style/scss"
import type { ConfigHelper } from "../config/helper"
import WebpackStatsFormatPlugin from "@effect-x/stats-format-plugin/webpack/plugin"
import { makeMediaRule } from "./assets/media"

const debug = debugF("cli:webpack")

export const getWebpackCompiler = (configs: webpack.Configuration[]) => {
  return webpack(configs)
}

const getProjectModuleScopes = (configHelper: ConfigHelper, projectConfig: RettProject) => {
  const ret = []

  if (configHelper.workspaces.workspaceEnable) {
    ret.push(path.join(configHelper.workspaces.workspacePath, "node_modules"))
  }

  ret.push(path.join(projectConfig.projectPath, "node_modules"))

  try {
    const webpackPath = require.resolve("@effect-x/deps/compiled/webpack")

    const compiledPath = path.resolve(webpackPath, "../../")

    if (compiledPath) {
      ret.push(compiledPath)
    }
  } catch (error) {
    debug("getProjectModuleScopes: ", error)
  }

  return R.uniq(ret)
}

const getProjectResolveModules = (configHelper: ConfigHelper, projectConfig: RettProject) => {
  const ret = ["node_modules"]

  if (projectConfig.projectPath) {
    ret.unshift(projectConfig.projectPath)
  }

  if (configHelper.workspaces.workspaceEnable) {
    ret.unshift(configHelper.workspaces.workspacePath)
  }

  return R.uniq(ret)
}

const getProjectScriptIncludes = (configHelper: ConfigHelper, projectConfig: RettProject): string[] => {
  const ret = []

  if (projectConfig.projectPath) {
    ret.push(projectConfig.projectPath)
  }

  if (configHelper.workspaces.workspaceEnable) {
    ret.push(...configHelper.workspaces.workspaceInfo.projectsParentPath)
  }

  // TODO: feature add user custom include path

  return ret
}

function escapeStringRegexp(string: string) {
  if (typeof string !== "string") {
    throw new TypeError("Expected a string")
  }

  // Escape characters with special meaning either inside or outside character sets.
  // Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
  return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d")
}

function ignoredFiles(appSrc: string) {
  const project = path.normalize(appSrc + "/")

  const first = project.split(path.sep)[1]

  const reg = [
    `^(?!${escapeStringRegexp(project.replace(/[\\]+/g, "/"))}?)`,
    `${escapeStringRegexp(project)}.*${first}.*`,
    "/bundler/packages/",
    ".*/node_modules.*",
  ]

  return new RegExp(reg.join("|"))
}

const cssModuleRegex = /\.module\.css$/
const cssGlobalRegex = /\.css$/

const lessModuleRegex = /\.module\.less$/
const lessGlobalRegex = /\.less$/

const sassModuleRegex = /\.module\.(scss|sass)$/
const sassGlobalRegex = /\.(scss|sass)$/

const jsFilePath = "/js"
const cssFilePath = "/css"
const imageFilePath = "/images"
const fontFilePath = "/fonts"
const assetFilePath = "/media"

export const generateWebpackConfig = (
  configHelper: ConfigHelper,
  projectConfig: RettProject
): webpack.Configuration => {
  const { mode, args, hasDev, hasProd, workspaces, hotConfig, federationEnabled } = configHelper
  const { projectPath, name, pkg, settings } = projectConfig

  const projectName = normalizeProjectName(name)

  const projectNodeModules = path.resolve(projectPath, "./node_modules")
  const projectTsConfig = path.resolve(projectPath, "./tsconfig.json")

  const publicPath = args.publicPath

  const getAssetsPath = (projectName: string) => (outputPath: string) => {
    if (federationEnabled) {
      return assetOutputJoin(projectName, outputPath)
    }

    return outputPath.replace(/^\//, "")
  }

  const getOutputPath = getAssetsPath(projectName)
  const jsOutputPath = getOutputPath(jsFilePath)
  const cssOutputPath = getOutputPath(cssFilePath)
  const imageOutputPath = getOutputPath(imageFilePath)
  const fontOutputPath = getOutputPath(fontFilePath)
  const assetOutputPath = getOutputPath(assetFilePath)

  const projectEnv = {
    REACT_FAST_REFRESH: hotConfig.reactFastRefresh,
  }

  const entry = []

  if (pkg.main) {
    entry.push(pkg.main)
  } else {
    entry.push("index.js")
  }

  if (hotConfig.hot) {
    entry.unshift(require.resolve("@effect-x/runtime/entry"))
  }

  const outputPath = federationEnabled
    ? path.join(projectPath, args.output)
    : path.join(workspaces.workspacePath, args.output)

  const deps = pkg.dependencies || {}

  let pathAlias = {
    "@": projectPath,
    events: "@effect-x/deps/compiled/events",
  }

  if (deps.react) {
    pathAlias = Object.assign(pathAlias, getReactPathAlias(configHelper))
  }

  if (settings.alias) {
    pathAlias = Object.assign(pathAlias, settings.alias)
  }

  const browserTargets = settings.browserslist || ["defaults"]

  const hotReloadPlugins: any[] = []

  if (hotConfig.hot) {
    hotReloadPlugins.push(new webpack.HotModuleReplacementPlugin())

    hotReloadPlugins.push(...getReactHotReloadPlugins(configHelper))
  }

  // @ts-ignore
  const customEnv = R.map(JSON.stringify, R.merge(projectEnv, settings.env || {}))

  // @ts-ignore
  const federationEnvs = R.map(
    JSON.stringify,
    federationEnabled
      ? {
          MODULE_FEDERATION_ENABLED: true,
          RETT_DEV_INCLUDE_PROJECTS: hasDev
            ? configHelper.projects.include
                .filter((x) => !x.settings.federation?.entry)
                .map((x) => normalizeProjectName(x.name))
            : [],
          RETT_RELEASE_PROJECTS: hasDev ? [] : R.split(",", process.env.RETT_RELEASE_PROJECTS || ""),
        }
      : {
          MODULE_FEDERATION_ENABLED: false,
          RETT_DEV_INCLUDE_PROJECTS: [],
          RETT_RELEASE_PROJECTS: [],
        }
  )

  const plugins: any = [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(mode),
        PUBLIC_PATH: JSON.stringify(publicPath),
        HOT_RELOAD: JSON.stringify(hotConfig.hot),
        ...federationEnvs,
        ...customEnv,
      },
    }),
    new webpack.ProvidePlugin({
      process: require.resolve("@effect-x/deps/compiled/node-libs-browser/process"),
      events: require.resolve("@effect-x/deps/compiled/node-libs-browser/events"),
    }),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    deps.moment &&
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),
    ...hotReloadPlugins,
    new ModuleNotFoundPlugin(projectPath),
    // check
    args.check && new CaseSensitivePathsPlugin(),
    args.check &&
      new CircularDependencyPlugin({
        exclude: /node_modules/, // exclude node_modules
        failOnError: false, // show a warning when there is a circular dependency
      }),
    args.check &&
      new ForkTsCheckerWebpackPlugin({
        async: hasDev,
        // @ts-ignore
        typescript: {
          enable: true,
          typescriptPath: require.resolve("typescript", {
            paths: [projectConfig.projectPath, workspaces.workspacePath],
          }),
          configFile: projectTsConfig,
          context: projectPath,
          diagnosticOptions: {
            syntactic: true,
          },
          mode: "write-references",
        },
        issue: {
          include: [{ file: "../**/*.{ts,tsx}" }, { file: "**/*.{ts,tsx}" }],
          exclude: [
            { file: "**/__tests__/**" },
            { file: "**/?(*.){spec|test}.*" },
            {
              origin: "eslint",
              severity: "warning",
            },
          ],
        },
        // @ts-ignore
        eslint: {
          enabled: true,
          files: "./**/*.{ts,tsx,js,jsx}",
        },
        // @ts-ignore
        logger: {
          infrastructure: "silent",
          issues: "console",
        },
      }),
    args.analyze &&
      new BundleAnalyzerPlugin({
        analyzerPort: "auto",
      }),
    new webpack.SourceMapDevToolPlugin({
      module: true,
      columns: true,
      append: hasDev ? undefined : false,
      noSources: false,
      filename: "[file].map",
      moduleFilenameTemplate: ({ absoluteResourcePath }: any) => {
        if (hasProd) {
          return path.relative(projectPath, absoluteResourcePath).replace(/\\/g, "/")
        }

        const str = path.relative(projectPath, absoluteResourcePath)

        if (str.indexOf("../") > -1) {
          const resource = str.replace(/.\.\//g, "")

          if (resource.startsWith("node_modules")) {
            return "webpack://app/" + resource
          }

          if (resource.startsWith("webpack")) {
            return "webpack://" + resource
          }

          return "webpack://external/" + resource
        }

        return "webpack://app/" + str
      },
      fallbackModuleFilenameTemplate: ({ absoluteResourcePath, hash }: any) => {
        if (hasProd) {
          return path.relative(projectPath, absoluteResourcePath).replace(/\\/g, "/")
        }

        const str = path.relative(projectPath, absoluteResourcePath)

        if (str.indexOf("../") > -1) {
          const resource = str.replace(/.\.\//g, "") + "?" + hash

          if (resource.startsWith("node_modules")) {
            return "webpack://app/" + resource
          }

          if (resource.startsWith("webpack")) {
            return "webpack://" + resource
          }

          return "webpack://external/" + resource
        }

        return "webpack://app/" + str + "?" + hash
      },
      sourceRoot: "",
      namespace: "",
    }),
    makeHtmlPlugin(configHelper, projectConfig, {
      output: getOutputPath(""),
    }),
    makeCssPlugin(configHelper, projectConfig, {
      output: cssOutputPath,
    }),
    makeCopyPlugin(configHelper, projectConfig, {
      path: settings.statics,
      output: federationEnabled ? projectName : "",
    }),
    makeFederationPlugin(configHelper, projectConfig, {
      output: jsOutputPath,
    }),
    new WebpackStatsFormatPlugin(),
  ].filter(Boolean)

  const projectModuleScopes = getProjectModuleScopes(configHelper, projectConfig)
  const projectResolveModules = getProjectResolveModules(configHelper, projectConfig)
  const scriptIncludes = getProjectScriptIncludes(configHelper, projectConfig)

  debug("projectModuleScopes", projectModuleScopes)
  debug("projectResolveModules", projectResolveModules)
  debug("scriptIncludes", scriptIncludes)

  let webpackCacheConfig: any = false

  if (args.cache) {
    const configVars = JSON.stringify({
      hot: hotConfig.hot,
      reactFastRefresh: hotConfig.reactFastRefresh,
      federationEnabled: federationEnabled,
    })

    const webpackCacheVersion = `${configHelper.rettPkg.version}|${configVars}`

    const webpackCacheDirectory = path.join(configHelper.workspaces.workspacePath, "node_modules", ".cache/webpack")

    const webpackCacheBuildDependenciesConfigs = [__filename]

    webpackCacheConfig = {
      version: webpackCacheVersion,
      name: `${projectName}-${mode}`,
      type: "filesystem",
      // 2 week
      maxAge: 1000 * 60 * 60 * 24 * 14,
      // 默认路径是 node_modules/.cache/webpack
      cacheDirectory: webpackCacheDirectory,
      // 缓存依赖，当缓存依赖修改时，缓存失效
      buildDependencies: {
        // 将你的配置添加依赖，更改配置时，使得缓存失效
        config: webpackCacheBuildDependenciesConfigs,
      },
    }

    debug("webpack cache, version: %s, path: %s", webpackCacheVersion, webpackCacheDirectory)
  }

  const babelLoaderRule = makeBabelLoader(configHelper, {
    browserTargets,
  })

  const styleOptions = {
    sourceMap: args.sourceMap,
    publicPath,
    browserTargets,
  }

  const moduleOneOfRules: RuleSetRule[] = [
    makeWorkerRule({
      output: jsOutputPath,
      publicPath,
      loaders: [babelLoaderRule],
    }),
    makeJSRules({
      include: scriptIncludes,
      exclude: /node_modules/,
      loaders: [babelLoaderRule],
    }),
    makeTSRules({
      include: scriptIncludes,
      exclude: /node_modules/,
      loaders: [babelLoaderRule],
    }),
    makeWasmRule(),
    makeCssRule(styleOptions, {
      modules: {
        mode: "local",
      },
      exclude: cssGlobalRegex,
      regex: cssModuleRegex,
    }),
    makeCssRule(styleOptions, {
      modules: {
        mode: "icss",
      },
      regex: cssGlobalRegex,
    }),
    makeLessRule(styleOptions, {
      modules: {
        mode: "local",
      },
      exclude: lessGlobalRegex,
      regex: lessModuleRegex,
    }),
    makeLessRule(styleOptions, {
      modules: {
        mode: "icss",
      },
      regex: lessGlobalRegex,
    }),
    makeSassRule(styleOptions, {
      modules: {
        mode: "local",
      },
      exclude: sassGlobalRegex,
      regex: sassModuleRegex,
      // resolve-url-loader need open
      sourceMap: true,
    }),
    makeSassRule(styleOptions, {
      modules: {
        mode: "icss",
      },
      regex: sassGlobalRegex,
      // resolve-url-loader need open
      sourceMap: true,
    }),
    makeFontRule({
      output: fontOutputPath,
      publicPath: publicPath,
    }),
    ...makeImageRule({
      limit: settings.imageSizeLimit,
      output: imageOutputPath,
      publicPath: publicPath,
    }),
    ...makeMediaRule({
      output: assetOutputPath,
      publicPath: publicPath,
    }),
    {
      // Exclude `js` files to keep "css" loader working as it injects
      // its runtime that would otherwise be processed through "file" loader.
      // Also exclude `html` and `json` extensions so they get processed
      // by webpacks internal loaders.
      exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
      type: "asset/resource",
    },
  ]

  const makeMinimizer = hasProd
    ? [
        new TerserPlugin({
          exclude: [/\.min\.js$/],
          extractComments: false,
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
            },
            format: {
              // ecma: 5 默认为5 不需要设置
              beautify: false,
              comments: false,
              ascii_only: true,
            },
          },
          parallel: true,
        }),
        new CssMinimizerPlugin({
          parallel: true,
          minimizerOptions: {
            preset: [
              "default",
              {
                discardComments: { removeAll: true },
              },
            ],
          },
        }) as any,
      ]
    : []

  const s: webpack.ExternalsPlugin["externals"] = [
    // ({ context, contextInfo, dependencyType, getResolve, request }, callback) => {
    //   callback()
    // },
  ]

  let webpackConfig: webpack.Configuration = {
    name: projectName,
    stats: "none",
    mode: mode === "production" ? "production" : "development",
    infrastructureLogging: {
      level: args.webpackLogLevel || "none",
    },
    target: browserTargets.length > 0 ? ["browserslist:" + browserTargets.join(",")] : ["web"],
    bail: hasProd,
    devtool: false,
    // externals: [],
    // externalsType: "module",
    context: projectPath,
    entry: entry,
    cache: webpackCacheConfig,
    externalsPresets: {
      web: true,
      webAsync: true,
    },
    experiments: {
      // TODO:
      lazyCompilation: false,
      topLevelAwait: true,
      asyncWebAssembly: true,
      syncWebAssembly: true,
      outputModule: true,
      layers: true,
    },
    output: {
      path: outputPath,
      clean: hasProd,
      pathinfo: hasDev,
      library: "__EFFECT",
      libraryTarget: "assign",
      crossOriginLoading: "anonymous",
      publicPath: publicPath,
      filename: assetOutputJoin(jsOutputPath, hasDev ? "bundle.js" : "[name].[contenthash:8].js"),
      chunkFilename: assetOutputJoin(jsOutputPath, hasDev ? "[name].js" : "[name].[contenthash:8].chunk.js"),
      assetModuleFilename: assetOutputJoin(assetOutputPath, "[name].[hash][ext]"),
      hotUpdateChunkFilename: assetOutputJoin("_hot", "[id].[fullhash].hot-update.js"),
      hotUpdateMainFilename: assetOutputJoin("_hot", "[runtime].[fullhash].hot-update.json"),
      strictModuleErrorHandling: true,
    },
    resolve: {
      extensions: [".mjs", ".js", ".jsx", ".wasm", ".json", ".ts", ".tsx"],
      alias: pathAlias,
      modules: projectResolveModules,
      symlinks: true,
      cacheWithContext: true,
      unsafeCache: true,
      fallback: {
        // add node polyfill
        ...["process", "path", "url", "events", "querystring", "punycode"].reduce((acc, key) => {
          acc[key] = require.resolve("@effect-x/deps/compiled/node-libs-browser/" + key)
          return acc
        }, {}),
        crypto: false,
        http: false,
        https: false,
      },
      exportsFields: ["exports"],
      mainFields: ["browser", "module", "main"],
    },
    resolveLoader: {
      // modules: []
    },
    module: {
      unsafeCache: true,
      parser: {
        javascript: {
          requireEnsure: false,
          strictExportPresence: true,
          strictThisContextOnImports: true,
        },
      },
      rules: [
        {
          oneOf: moduleOneOfRules,
        },
      ],
    },
    optimization: {
      chunkIds: hasDev ? "named" : undefined,
      moduleIds: hasDev ? "named" : undefined,
      emitOnErrors: false,
      checkWasmTypes: false,
      nodeEnv: false,
      minimize: hasProd,
      minimizer: makeMinimizer,
    },
    watchOptions: {
      // followSymlinks: true,
      aggregateTimeout: 200,
      // ignored: ignoredFiles(workspaces.workspacePath),
    },
    plugins: plugins,
    performance: false,
  }

  if (settings.modify) {
    webpackConfig = settings.modify(webpackConfig)
  }

  if (args.measure) {
    const smp = new SpeedMeasurePlugin()

    return smp.wrap(webpackConfig)
  }

  return webpackConfig
}
