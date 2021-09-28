const { join, dirname, relative, basename, resolve } = require("path")
const fs = require("fs")
const { Module } = require("module")
const R = require("ramda")

const m = new Module(resolve(__dirname, "bundles", "_"))
m.filename = m.id
m.paths = Module._nodeModulePaths(m.id)
const bundleRequire = m.require
bundleRequire.resolve = (request, options) => {
  return Module._resolveFilename(request, m, false, options)
}

/**
 * Look ma, it's cp -R.
 * @param {string} src  The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 */
const copyRecursiveSync = function (src, dest) {
  const exists = fs.existsSync(src)
  const stats = exists && fs.statSync(src)
  const isDirectory = exists && stats.isDirectory()
  if (isDirectory) {
    fs.mkdirSync(dest)
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(join(src, childItemName), join(dest, childItemName))
    })
  } else {
    fs.copyFileSync(src, dest)
  }
}

const externals = {
  // Browserslist (post-css plugins)
  browserslist: "browserslist",
  "caniuse-lite": "caniuse-lite", // FIXME: `autoprefixer` will still bundle this because it uses direct imports
  "caniuse-lite/data/features/border-radius": "caniuse-lite/data/features/border-radius",
  "caniuse-lite/data/features/css-featurequeries.js": "caniuse-lite/data/features/css-featurequeries",
}

externals["strip-ansi"] = "@effect-x/deps/compiled/strip-ansi"
export async function ncc_strip_ansi(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("./reexported/strip-ansi")))
    .ncc({ packageName: "strip-ansi", externals })
    .target("compiled/strip-ansi")
}

export async function ncc_semver(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("semver")))
    .ncc({ packageName: "semver", externals })
    .target("compiled/semver")
}

externals.address = "@effect-x/deps/compiled/address"
export async function ncc_address(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("address")))
    .ncc({ packageName: "address", externals })
    .target("compiled/address")
}

externals["detect-port-alt"] = "@effect-x/deps/compiled/detect-port-alt"
export async function ncc_detect_port_alt(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("detect-port-alt")))
    .ncc({ packageName: "detect-port-alt", externals })
    .target("compiled/detect-port-alt")
}

externals.prompts = "@effect-x/deps/compiled/prompts"
export async function ncc_prompts(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("prompts")))
    .ncc({ packageName: "prompts", externals })
    .target("compiled/prompts")
}

externals.chokidar = "@effect-x/deps/compiled/chokidar"
export async function ncc_chokidar(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("chokidar")))
    .ncc({ packageName: "chokidar", externals })
    .target("compiled/chokidar")
}

externals.chalk = "@effect-x/deps/compiled/chalk"
export async function ncc_chalk(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("chalk")))
    .ncc({ packageName: "chalk", externals })
    .target("compiled/chalk")
}

externals.lodash = "@effect-x/deps/compiled/lodash"
export async function ncc_lodash(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("lodash")))
    .ncc({ packageName: "lodash", externals })
    .target("compiled/lodash")
}

externals.yargs = "@effect-x/deps/compiled/yargs"
export async function ncc_yargs(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("yargs")))
    .ncc({ packageName: "yargs", externals })
    .target("compiled/yargs")
}

externals.ramda = "@effect-x/deps/compiled/ramda"
export async function ncc_ramda(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("ramda")))
    .ncc({ packageName: "ramda", externals })
    .target("compiled/ramda")
}

externals.debug = "@effect-x/deps/compiled/debug"
export async function ncc_debug(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("debug")))
    .ncc({ packageName: "debug", externals })
    .target("compiled/debug")
}

externals.glob = "@effect-x/deps/compiled/glob"
export async function ncc_glob(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("glob")))
    .ncc({ packageName: "glob", externals })
    .target("compiled/glob")
}

externals["core-js"] = "@effect-x/deps/compiled/core-js"
export async function ncc_core_js(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("core-js")))
    .ncc({ packageName: "core-js", externals })
    .target("compiled/core-js")
}

externals.events = "@effect-x/deps/compiled/events"
export async function ncc_events(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("events/")))
    .ncc({ packageName: "events", externals })
    .target("compiled/events")
}

externals.punycode = "@effect-x/deps/compiled/punycode"
export async function ncc_punycode(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("punycode/punycode")))
    .ncc({ packageName: "punycode", externals })
    .target("compiled/punycode")
}

export async function ncc_source_map(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("source-map-js")))
    .ncc({ packageName: "source-map-js", bundleName: "source-map", externals })
    .target("compiled/source-map")
}

externals.dotenv = "@effect-x/deps/compiled/dotenv"
export async function ncc_dotenv(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("dotenv")))
    .ncc({ packageName: "dotenv", externals })
    .target("compiled/dotenv")
}

externals["dotenv-expand"] = "@effect-x/deps/compiled/dotenv-expand"
export async function ncc_dotenv_expand(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("dotenv-expand")))
    .ncc({ packageName: "dotenv-expand", externals })
    .target("compiled/dotenv-expand")
}

export async function ncc_querystring(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("querystring-es3")))
    .ncc({ packageName: "querystring", externals })
    .target("compiled/querystring")
}

export async function ncc_node_libs_browser(task, opts) {
  await task
    .source(opts.src || "bundles/node-libs-browser/*")
    .ncc({
      externals: {
        ...externals,
        querystring: "@effect-x/deps/compiled/querystring",
      },
    })
    .target("compiled/node-libs-browser/")
}

// ------------------------------------------------------
// default 2.0.0
externals["loader-utils"] = "@effect-x/deps/compiled/loader-utils"
export async function ncc_loader_utils(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("loader-utils")))
    .ncc({ packageName: "loader-utils", externals })
    .target("compiled/loader-utils")
}

// babel-loader 使用的 loader-utils@1.4.0
export async function ncc_loader_utils1(task, opts) {
  await task
    .source(opts.src || relative(__dirname, bundleRequire.resolve("loader-utils1")))
    .ncc({ packageName: "loader-utils1", bundleName: "loader-utils1", externals })
    .target("compiled/loader-utils1")
}

externals.tapable = "@effect-x/deps/compiled/tapable"
export async function ncc_tapable(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("tapable")))
    .ncc({
      packageName: "tapable",
      externals: externals,
      customEmit(path) {
        if (path === "util") {
          return '"./util-browser"'
        }
      },
    })
    .target("compiled/tapable")

  fs.copyFileSync(require.resolve("tapable/lib/util-browser.js"), join(__dirname, "./compiled/tapable/util-browser.js"))
}

export async function ncc_tapable1(task, opts) {
  await task
    .source(opts.src || relative(__dirname, bundleRequire.resolve("tapable1")))
    .ncc({
      packageName: "tapable",
      bundleName: "tapable1",
      externals: {
        ...R.omit(["tapable"], externals),
      },
    })
    .target("compiled/tapable1")
}

// default 2.6.5
externals["schema-utils"] = "@effect-x/deps/compiled/schema-utils"
export async function ncc_schema_utils(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("schema-utils")))
    .ncc({ packageName: "schema-utils", externals })
    .target("compiled/schema-utils")
}

// schema-utils 3
export async function ncc_schema_utils3(task, opts) {
  await task
    .source(opts.src || relative(__dirname, bundleRequire.resolve("schema-utils3")))
    .ncc({ packageName: "schema-utils3", bundleName: "schema-utils3", externals })
    .target("compiled/schema-utils3")
}

// default 3
externals["webpack-sources"] = "@effect-x/deps/compiled/webpack-sources"
export async function ncc_webpack_sources(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("webpack-sources")))
    .ncc({
      packageName: "webpack-sources",
      externals: {
        ...externals,
        "source-map": "@effect-x/deps/compiled/source-map",
      },
    })
    .target("compiled/webpack-sources")
}

Object.assign(externals, require("./bundles/webpack/innerFiles").getExternalsMap())

externals.webpack = "@effect-x/deps/compiled/webpack"
export async function ncc_webpack(task, opts) {
  await task
    .source(opts.src || "bundles/webpack/webpack.js")
    .ncc({
      packageName: "webpack5",
      bundleName: "webpack",
      customEmit(path) {
        if (path.endsWith(".runtime.js")) {
          return `'./${basename(path)}'`
        }
      },
      externals: {
        ...externals,
        "schema-utils": "@effect-x/deps/compiled/schema-utils3",
      },
      minify: false,
      postCode(log, file, code) {
        if (file.dir === "bundles/webpack" && file.base === "webpack.js") {
          return code.replaceAll("/*require.resolve*/(957)", 'require.resolve("@effect-x/deps/compiled/watchpack")')
        }

        return code
      },
    })
    .target("compiled/webpack/5")
}

export async function ncc_webpack_bundle_packages(task, opts) {
  await task.source("bundles/webpack/packages/*").target("compiled/webpack/")
}

export async function ncc_webpack_bundle_client_bundle(task, opts) {
  await task
    .source(opts.src || "bundles/webpack/client.js")
    .ncc({
      externals: {
        ...externals,
        "schema-utils": "@effect-x/deps/compiled/schema-utils3",
        "tapable/lib/SyncBailHook": "@effect-x/deps/compiled/webpack/path-fixtures/tapableLibPathFix",
      },
    })
    .target("compiled/webpack/client")
}

export async function ncc_webpack_bundle_client_packages(task, opts) {
  await task.source(opts.src || "bundles/webpack/client/*").target("compiled/webpack/client/")
}

export async function ncc_webpack_bundle_hot_bundle(task, opts) {
  fs.mkdirSync(join(__dirname, "./compiled/webpack/5"), {
    recursive: true,
  })

  fs.copyFileSync(
    bundleRequire.resolve("webpack5/lib/hmr/HotModuleReplacement.runtime"),
    join(__dirname, "./compiled/webpack/5/HotModuleReplacement.runtime.js")
  )

  fs.copyFileSync(
    bundleRequire.resolve("webpack5/lib/hmr/JavascriptHotModuleReplacement.runtime"),
    join(__dirname, "./compiled/webpack/5/JavascriptHotModuleReplacement.runtime.js")
  )

  const copyFiles = [
    "dev-server.js",
    "emitter.js",
    "log-apply-result.js",
    "log.js",
    "only-dev-server.js",
    "poll.js",
    "signal.js",
  ]

  fs.mkdirSync(join(__dirname, "./compiled/webpack/hot"), {
    recursive: true,
  })

  copyFiles.forEach((file) => {
    fs.copyFileSync(bundleRequire.resolve("webpack5/hot/" + file), join(__dirname, "./compiled/webpack/hot/" + file))
  })
}

export async function ncc_webpack_bundle_path_fixtures(task, opts) {
  await task.source(opts.src || "bundles/webpack/path-fixtures/*").target("compiled/webpack/path-fixtures/")
}

// watchpack
externals.watchpack = "@effect-x/deps/compiled/watchpack"
export async function ncc_watchpack(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("watchpack")))
    .ncc({ packageName: "watchpack", externals })
    .target("compiled/watchpack")
}

// -----------------------------------------------------

externals["ansi-html"] = "@effect-x/deps/compiled/ansi-html"
export async function ncc_ansi_html(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("ansi-html-community")))
    .ncc({ packageName: "ansi-html", externals })
    .target("compiled/ansi-html")
}

externals.anser = "@effect-x/rett-deps/compiled/anser"
export async function ncc_anser(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("anser")))
    .ncc({ packageName: "anser", externals })
    .target("compiled/anser")
}

externals["data-uri-to-buffer"] = "@effect-x/rett-deps/compiled/data-uri-to-buffer"
export async function ncc_data_uri_to_buffer(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("data-uri-to-buffer")))
    .ncc({ packageName: "data-uri-to-buffer", externals })
    .target("compiled/data-uri-to-buffer")
}

externals["html-entities"] = "@effect-x/deps/compiled/html-entities"
export async function ncc_html_entities(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("html-entities")))
    .ncc({ packageName: "html-entities", externals })
    .target("compiled/html-entities")
}

externals.express = "@effect-x/deps/compiled/express"
export async function ncc_express(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("express")))
    .ncc({ packageName: "express", externals })
    .target("compiled/express")
}

externals.ws = "@effect-x/deps/compiled/ws"
export async function ncc_ws(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("ws")))
    .ncc({ packageName: "ws", externals, esm: false })
    .target("compiled/ws")
}

externals.sockjs = "@effect-x/deps/compiled/sockjs"
export async function ncc_sockjs(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("sockjs")))
    .ncc({ packageName: "sockjs", externals })
    .target("compiled/sockjs")
}

externals["sockjs-client"] = "@effect-x/deps/compiled/sockjs-client"
externals["sockjs-client/dist/sockjs"] = "@effect-x/deps/compiled/sockjs-client"
externals["sockjs-client/dist/sockjs.js"] = "@effect-x/deps/compiled/sockjs-client"
export async function ncc_sockjs_client(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("sockjs-client")))
    .ncc({ packageName: "sockjs-client", externals })
    .target("compiled/sockjs-client")
}

externals["http-proxy-middleware"] = "@effect-x/deps/compiled/http-proxy-middleware"
export async function ncc_http_proxy_middleware(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("http-proxy-middleware")))
    .ncc({ packageName: "http-proxy-middleware", externals })
    .target("compiled/http-proxy-middleware")
}

externals["webpack-dev-server"] = "@effect-x/deps/compiled/webpack-dev-server"
export async function ncc_webpack_dev_server(task, opts) {
  const devServerModulePath = relative(__dirname, bundleRequire.resolve("webpack-dev-server4"))

  await task
    .source(opts.src || devServerModulePath)
    .ncc({
      packageName: "webpack-dev-server4",
      bundleName: "webpack-dev-server",
      externals: {
        ...externals,
        webpack: "@effect-x/deps/compiled/webpack",
        "schema-utils": "@effect-x/deps/compiled/schema-utils3",
      },
      minify: false,
      customEmit(path) {
        if (path.indexOf("ws/index.js") > -1) {
          return "'@effect-x/deps/compiled/webpack-dev-server/client/clients/WebSocketClient'"
        }

        if (/webpack-dev-server4\/client\/modules\/sockjs-client\/index.js/.test(path)) {
          return `eval('require.resolve("@effect-x/deps/compiled/sockjs-client")')`
        }

        if (path.indexOf("SockJSServer") > -1 || path.indexOf("WebsocketServer") > -1) {
          const filename = basename(path)

          const outputPath = "./servers/" + filename

          return `"${outputPath}"`
        }
      },
      postCode(_log, _file, code) {
        return code
          .replace(
            /\/\*require\.resolve\*\/\(8138\)/,
            'require.resolve("@effect-x/deps/compiled/webpack/hot/only-dev-server")'
          )
          .replace(
            /\/\*require\.resolve\*\/\(1039\)/,
            'require.resolve("@effect-x/deps/compiled/webpack/hot/dev-server")'
          )
          .replace("../client/index.js", "./client/index.js")
          .replace("../client/clients/SockJSClient", "./client/clients/SockJSClient")
          .replace("../client/clients/WebSocketClient", "./client/clients/WebSocketClient")
          .replace(
            "return '@effect-x/deps/compiled/webpack-dev-server/client/clients/WebSocketClient'",
            "return ClientImplementation"
          )
      },
    })
    .target("compiled/webpack-dev-server")
}

// compile client-src
export async function ncc_webpack_dev_server_client_bundle(task, opts) {
  await task
    .source(opts.src || "bundles/webpack-dev-server/client/*")
    .ncc({
      bundleName: "webpack-dev-server",
      externals: {
        ...externals,
        "./clients/WebSocketClient.js": "@effect-x/deps/compiled/webpack-dev-server/client/clients/WebSocketClient",
        "tapable/lib/SyncBailHook": "@effect-x/deps/compiled/webpack/path-fixtures/tapableLibPathFix",
      },
      minify: false,
    })
    .target("compiled/webpack-dev-server/client")
}

// compile client-src/clients/*
export async function ncc_webpack_dev_server_clients_packages(task, opts) {
  await task
    .source(opts.src || "bundles/webpack-dev-server/clients/*")
    .ncc({
      bundleName: "webpack-dev-server",
      externals: {
        ...externals,
        "tapable/lib/SyncBailHook": "@effect-x/deps/compiled/webpack/path-fixtures/tapableLibPathFix",
      },
    })
    .target("compiled/webpack-dev-server/client/clients")
}

// compile /lib/servers/*
export async function ncc_webpack_dev_server_servers_packages(task, opts) {
  await task
    .source(opts.src || "bundles/webpack-dev-server/servers/*")
    .ncc({
      bundleName: "webpack-dev-server",
      externals: {
        ...externals,
        "sockjs/lib/transport": "@effect-x/deps/compiled/webpack-dev-server/path-fixures/sockjsLibPathFix",
      },
    })
    .target("compiled/webpack-dev-server/servers")
}

export async function ncc_webpack_dev_server_path_fixtures(task, opts) {
  await task
    .source(opts.src || "bundles/webpack-dev-server/path-fixtures/*")
    .target("compiled/webpack-dev-server/path-fixtures/")
}

// ----------------------------------------------------

externals["html-webpack-plugin"] = "@effect-x/deps/compiled/html-webpack-plugin"
export async function ncc_html_webpack_plugin_bundle_package(task, opts) {
  await task
    .source(opts.src || "bundles/html-webpack-plugin/packages/*")
    .ncc({
      packageName: "html-webpack-plugin",
      bundleName: "html-webpack-plugin",
      externals: {
        "schema-utils": "@effect-x/deps/compiled/schema-utils3",
        "source-map": "@effect-x/deps/compiled/source-map",
      },
      minify: false,
      postCode(log, file, code) {
        if (file.dir === "bundles/html-webpack-plugin/packages" && file.base === "index.js") {
          return code.replace("/*require.resolve*/(5250)", 'require.resolve("./loader")')
        }

        return code
      },
    })
    .target("compiled/html-webpack-plugin/")
}

externals["copy-webpack-plugin"] = "@effect-x/deps/compiled/copy-webpack-plugin"
export async function ncc_copy_webpack_plugin(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("copy-webpack-plugin")))
    .ncc({
      packageName: "copy-webpack-plugin",
      externals: {
        ...externals,
        "schema-utils": "@effect-x/deps/compiled/schema-utils3",
      },
    })
    .target("compiled/copy-webpack-plugin")
}

// default 5.0
externals.terser = "@effect-x/deps/compiled/terser"
export async function ncc_terser(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("terser")))
    .ncc({
      packageName: "terser",
      externals: {
        ...externals,
      },
    })
    .target("compiled/terser")
}

externals["terser-webpack-plugin"] = "@effect-x/deps/compiled/terser-webpack-plugin"
export async function ncc_terser_webpack_plugin(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("terser-webpack-plugin")))
    .ncc({
      packageName: "terser-webpack-plugin",
      externals: {
        ...externals,
        "schema-utils": "@effect-x/deps/compiled/schema-utils3",
        "source-map": "@effect-x/deps/compiled/source-map",
      },
    })
    .target("compiled/terser-webpack-plugin")
}

externals["case-sensitive-paths-webpack-plugin"] = "@effect-x/deps/compiled/case-sensitive-paths-webpack-plugin"
export async function ncc_case_sensitive_paths_webpack_plugin(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("case-sensitive-paths-webpack-plugin")))
    .ncc({ packageName: "case-sensitive-paths-webpack-plugin", externals })
    .target("compiled/case-sensitive-paths-webpack-plugin")
}

externals["mini-css-extract-plugin"] = "@effect-x/deps/compiled/mini-css-extract-plugin"
export async function ncc_mini_css_extract_plugin(task, opts) {
  copyRecursiveSync(
    join(__dirname, "bundles/mini-css-extract-plugin"),
    join(__dirname, "compiled/mini-css-extract-plugin")
  )
}

externals["supports-color"] = "@effect-x/deps/compiled/supports-color"
export async function ncc_supports_color(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("./reexported/supports-color")))
    .ncc({ packageName: "supports-color", externals })
    .target("compiled/supports-color")
}

externals["merge-stream"] = "@effect-x/deps/compiled/merge-stream"
export async function ncc_merge_stream(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("merge-stream")))
    .ncc({ packageName: "merge-stream", externals })
    .target("compiled/merge-stream")
}

externals["jest-worker"] = "@effect-x/deps/compiled/jest-worker"
export async function ncc_jest_worker(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("jest-worker")))
    .ncc({
      packageName: "jest-worker",
      externals,
      customEmit(path) {
        if (/workers\/.*$/.test(path)) {
          return `"@effect-x/deps/compiled/jest-worker/workers/${basename(path)}"`
        }

        if (path === "../types") {
          return `"@effect-x/deps/compiled/jest-worker/types"`
        }
      },
    })
    .target("compiled/jest-worker")
}

export async function ncc_jest_worker_worker_files(task, opts) {
  await task
    .source(opts.src || relative(__dirname, resolve(dirname(require.resolve("jest-worker")) + "/workers/*.js")))
    .ncc({
      bundleName: "jest-worker",
      externals,
      customEmit(path) {
        if (/workers\/.*$/.test(path)) {
          return `"@effect-x/deps/compiled/jest-worker/workers/${basename(path)}"`
        }

        if (path === "../types") {
          return `"@effect-x/deps/compiled/jest-worker/types"`
        }
      },
      postCode(log, file, code) {
        return code.replace(/__nccwpck_require__\(\d+\)\(/g, "require(")
      },
    })
    .target("compiled/jest-worker/workers/")
}

export async function ncc_jest_worker_types(task, opts) {
  await task
    .source(opts.src || relative(__dirname, resolve(dirname(require.resolve("jest-worker")) + "/types.js")))
    .ncc({
      bundleName: "jest-worker",
      externals,
    })
    .target("compiled/jest-worker/")
}

externals["css-declaration-sorter"] = "@effect-x/deps/compiled/css-declaration-sorter"
export async function ncc_css_declaration_sorter(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("css-declaration-sorter")))
    .ncc({ packageName: "css-declaration-sorter", externals, esm: false })
    .target("compiled/css-declaration-sorter")
}

externals.cssnano = "@effect-x/deps/compiled/cssnano"
export async function ncc_cssnano(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("cssnano")))
    .ncc({ packageName: "cssnano", externals })
    .target("compiled/cssnano")
}

externals["css-minimizer-webpack-plugin"] = "@effect-x/deps/compiled/css-minimizer-webpack-plugin"
export async function ncc_css_minimizer_webpack_plugin(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("css-minimizer-webpack-plugin")))
    .ncc({
      packageName: "css-minimizer-webpack-plugin",
      externals: {
        ...externals,
        "source-map": "@effect-x/deps/compiled/source-map",
        "schema-utils": "@effect-x/deps/compiled/schema-utils3",
      },
      customEmit(path) {
        const externalsPack = ["postcss", "cssnano", "csso", "clean-css"]

        if (externalsPack.indexOf(path) > -1) {
          return `'@effect-x/deps/compiled/${path}'`
        }
      },
    })
    .target("compiled/css-minimizer-webpack-plugin")
}

externals["webpack-bundle-analyzer"] = "@effect-x/deps/compiled/webpack-bundle-analyzer"
export async function ncc_webpack_bundle_analyzer(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("webpack-bundle-analyzer")))
    .ncc({ packageName: "webpack-bundle-analyzer", externals })
    .target("compiled/webpack-bundle-analyzer")
}

externals["circular-dependency-plugin"] = "@effect-x/deps/compiled/circular-dependency-plugin"
export async function ncc_circular_dependency_plugin(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("circular-dependency-plugin")))
    .ncc({ packageName: "circular-dependency-plugin", externals })
    .target("compiled/circular-dependency-plugin")
}

externals["speed-measure-webpack-plugin"] = "@effect-x/deps/compiled/speed-measure-webpack-plugin"
export async function ncc_speed_measure_webpack_plugin(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("speed-measure-webpack-plugin")))
    .ncc({ packageName: "speed-measure-webpack-plugin", externals })
    .target("compiled/speed-measure-webpack-plugin")
}

externals["@svgr/webpack"] = "@effect-x/deps/compiled/@svgr/webpack"
export async function ncc_svgr_webpack(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("@svgr/webpack")))
    .ncc({
      packageName: "@svgr/webpack",
      externals: {
        ...externals,
        "source-map": "@effect-x/deps/compiled/source-map",
      },
    })
    .target("compiled/@svgr/webpack")
}

externals["file-loader"] = "@effect-x/deps/compiled/file-loader"
export async function ncc_file_loader(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("file-loader")))
    .ncc({ packageName: "file-loader", externals })
    .target("compiled/file-loader")
}

externals["url-loader"] = "@effect-x/deps/compiled/url-loader"
export async function ncc_url_loader(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("url-loader")))
    .ncc({
      packageName: "url-loader",
      externals: {
        ...externals,
        "schema-utils": "@effect-x/deps/compiled/schema-utils3",
      },
    })
    .target("compiled/url-loader")
}

externals["css-loader"] = "@effect-x/deps/compiled/css-loader"
export async function ncc_css_loader(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("css-loader")))
    .ncc({
      packageName: "css-loader",
      externals: {
        ...externals,
        "schema-utils": "@effect-x/deps/compiled/schema-utils3",
      },
    })
    .target("compiled/css-loader")
}

externals.postcss = "@effect-x/deps/compiled/postcss"
export async function ncc_postcss(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("postcss")))
    .ncc({ packageName: "postcss", externals })
    .target("compiled/postcss")
}

externals["postcss-loader"] = "@effect-x/deps/compiled/postcss-loader"
export async function ncc_postcss_loader(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("postcss-loader")))
    .ncc({ packageName: "postcss-loader", externals })
    .target("compiled/postcss-loader")
}

externals["postcss-safe-parser"] = "@effect-x/deps/compiled/postcss-safe-parser"
export async function ncc_postcss_safe_parser(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("postcss-safe-parser")))
    .ncc({ packageName: "postcss-safe-parser", externals })
    .target("compiled/postcss-safe-parser")
}

externals["postcss-flexbugs-fixes"] = "@effect-x/deps/compiled/postcss-flexbugs-fixes"
export async function ncc_postcss_flexbugs_fixes(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("postcss-flexbugs-fixes")))
    .ncc({ packageName: "postcss-flexbugs-fixes", externals })
    .target("compiled/postcss-flexbugs-fixes")
}

externals.autoprefixer = "@effect-x/deps/compiled/autoprefixer"
export async function ncc_autoprefixer(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("autoprefixer")))
    .ncc({ packageName: "autoprefixer", externals })
    .target("compiled/autoprefixer")
}

externals.less = "@effect-x/deps/compiled/less"
export async function ncc_less(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("less")))
    .ncc({
      packageName: "less",
      externals: {
        ...externals,
        "source-map": "@effect-x/deps/compiled/source-map",
      },
      customEmit(path) {
        if (path === "../../package.json") {
          return `"@effect-x/deps/compiled/less/package.json"`
        }
      },
    })
    .target("compiled/less")
}

externals["less-loader"] = "@effect-x/deps/compiled/less-loader"
export async function ncc_less_loader(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("less-loader")))
    .ncc({ packageName: "less-loader", externals })
    .target("compiled/less-loader")
}

externals["resolve-url-loader"] = "@effect-x/deps/compiled/resolve-url-loader"
export async function ncc_resolve_url_loader(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("resolve-url-loader")))
    .ncc({
      packageName: "resolve-url-loader",
      externals: {
        ...externals,
        "source-map": "@effect-x/deps/compiled/source-map",
      },
    })
    .target("compiled/resolve-url-loader")
}

externals.sass = "@effect-x/deps/compiled/sass"
export async function ncc_sass(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("sass")))
    .ncc({ packageName: "sass", externals })
    .target("compiled/sass")
}

externals["sass-loader"] = "@effect-x/deps/compiled/sass-loader"
export async function ncc_sass_loader(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("sass-loader")))
    .ncc({
      packageName: "sass-loader",
      externals: {
        ...externals,
        "schema-utils": "next/dist/compiled/schema-utils3",
      },
      customEmit(path) {
        if (path === "sass" || path.indexOf("sass/sass.dart.js") > -1) {
          return `eval("require('@effect-x/deps/compiled/sass')")`
        }
      },
      postCode(log, file, code) {
        return code
          .replace(/sassImplPkg="sass"/g, 'sassImplPkg="@effect-x/deps/compiled/sass"')
          .replace(
            /__nccwpck_require__\(\d+\)\(eval\("require\('@effect-x\/deps\/compiled\/sass'\)"\)\)/g,
            "require(sassImplPkg)"
          )
      },
    })
    .target("compiled/sass-loader")
}

externals["worker-loader"] = "@effect-x/deps/compiled/worker-loader"
export async function ncc_worker_loader(task, opts) {
  await task
    .source(opts.src || relative(__dirname, bundleRequire.resolve("worker-loader/src")))
    .ncc({
      packageName: "worker-loader",
      externals: {
        ...externals,
        "schema-utils": "@effect-x/deps/compiled/schema-utils3",
      },
      postCode(log, file, code) {
        if (file.base === "index.js") {
          return code.replace(/\/\*require\.resolve\*\/\(\d+\)/g, "require.resolve('./inline.js')")
        }

        return code
      },
      minify: false,
    })
    .target("compiled/worker-loader")
}

export async function ncc_worker_loader_runtime(task, opts) {
  await task
    .source(opts.src || relative(__dirname, bundleRequire.resolve("worker-loader/src/runtime/inline")))
    .ncc({
      packageName: "worker-loader",
    })
    .target("compiled/worker-loader")
}

const babelBundlePackages = {
  "@babel/code-frame": "@effect-x/deps/compiled/babel/code-frame",
  "@babel/core": "@effect-x/deps/compiled/babel/core",
  "@babel/parser": "@effect-x/deps/compiled/babel/parser",
  "@babel/traverse": "@effect-x/deps/compiled/babel/traverse",
  "@babel/types": "@effect-x/deps/compiled/babel/types",
  "@babel/preset-env": "@effect-x/deps/compiled/babel/preset-env",
  "@babel/preset-react": "@effect-x/deps/compiled/babel/preset-react",
  "@babel/preset-typescript": "@effect-x/deps/compiled/babel/preset-typescript",
}

Object.assign(externals, babelBundlePackages)

export async function ncc_babel_bundle(task, opts) {
  const bundleExternals = { ...externals }
  for (const pkg of Object.keys(babelBundlePackages)) {
    delete bundleExternals[pkg]
  }
  delete bundleExternals.chalk
  await task
    .source(opts.src || "bundles/babel/bundle.js")
    .ncc({
      packageName: "@babel/core",
      bundleName: "babel",
      externals: {
        ...bundleExternals,
        "source-map": "@effect-x/deps/compiled/source-map",
      },
      minify: false,
    })
    .target("compiled/babel")
}

export async function ncc_babel_bundle_packages(task, opts) {
  await task.source(opts.src || "bundles/babel/packages/*").target("compiled/babel/")
}

externals["babel-loader"] = "@effect-x/deps/compiled/babel-loader"
export async function ncc_babel_loader(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("babel-loader")))
    .ncc({
      packageName: "babel-loader",
      externals: {
        ...externals,
        "loader-utils": "@effect-x/deps/compiled/loader-utils1",
      },
    })
    .target("compiled/babel-loader")
}

export async function ncc_fork_ts_checker_webpack_plugin_bundle(task, opts) {
  await task
    .source(opts.src || "bundles/fork-ts-checker-webpack-plugin/bundle.js")
    .ncc({
      packageName: "fork-ts-checker-webpack-plugin",
      bundleName: "fork-ts-checker-webpack-plugin",
      externals: {
        ...externals,
        tapable: "@effect-x/deps/compiled/tapable1",
        typescript: "typescript",
        eslint: "eslint",
      },
    })
    .target("compiled/fork-ts-checker-webpack-plugin")
}

export async function ncc_fork_ts_checker_webpack_plugin_bundle_package(task, opts) {
  await task
    .source(opts.src || "bundles/fork-ts-checker-webpack-plugin/packages/*")
    .target("compiled/fork-ts-checker-webpack-plugin/")
}

// -----------------------------------------

externals["react-dev-utils"] = "@effect-x/deps/compiled/react-dev-utils"
export async function ncc_react_dev_utils(task, opts) {
  await task
    .source(opts.src || "bundles/react-dev-utils/*.js")
    .ncc({
      externals,
      customEmit(path) {
        const localFiles = ["./clearConsole", "./getProcessForPort", "./launchEditorEndpoint", "./launchEditor"]

        if (localFiles.indexOf(path) > -1) {
          return `"@effect-x/deps/compiled/react-dev-utils/${path.replace("./", "")}"`
        }

        if (path === "is-root") {
          return `"@effect-x/deps/compiled/react-dev-utils/is-root"`
        }
      },
    })
    .target("compiled/react-dev-utils")

  fs.copyFileSync(
    bundleRequire.resolve("react-dev-utils/openChrome.applescript"),
    join(__dirname, "./compiled/react-dev-utils/openChrome.applescript")
  )
}

Object.assign(externals, {
  "react-refresh": "@effect-x/deps/compiled/react-refresh",
  "react-refresh/runtime": "@effect-x/deps/compiled/react-refresh/runtime",
  "react-refresh/runtime.js": "@effect-x/deps/compiled/react-refresh/runtime",
})

export async function ncc_react_refresh_bundle_package(task, opts) {
  await task
    .source(opts.src || "bundles/react-refresh/packages/*")
    .ncc({ bundleName: "react-refresh", externals })
    .target("compiled/react-refresh/")
}

externals["@pmmmwh/react-refresh-webpack-plugin"] = "@effect-x/deps/compiled/@pmmmwh/react-refresh-webpack-plugin"
export async function ncc_react_refresh_webpack_lib_plugin(task, opts) {
  await task
    .source(opts.src || relative(__dirname, require.resolve("@pmmmwh/react-refresh-webpack-plugin")))
    .ncc({
      packageName: "@pmmmwh/react-refresh-webpack-plugin",
      bundleName: "react-refresh-webpack-plugin",
      externals: {
        ...externals,
        "schema-utils": "@effect-x/deps/compiled/schema-utils3",
        querystring: "@effect-x/deps/compiled/querystring",
      },
      customEmit(path) {
        if (path.indexOf("/react-refresh-webpack-plugin/sockets") > -1) {
          const outputPath = "@effect-x/deps/compiled/react-refresh-webpack-plugin/sockets/" + basename(path)
          return `eval('require.resolve("${outputPath}")')`
        }

        if (path.indexOf("/client") > -1) {
          const outputPath = "@effect-x/deps/compiled/react-refresh-webpack-plugin/client/" + basename(path)
          return `eval('require.resolve("${outputPath}")')`
        }

        if (path.indexOf("/loader") > -1) {
          const outputPath = "@effect-x/deps/compiled/react-refresh-webpack-plugin/loader/" + basename(path)
          return `eval('require.resolve("${outputPath}")')`
        }

        if (path.indexOf("/overlay") > -1) {
          const outputPath = "@effect-x/deps/compiled/react-refresh-webpack-plugin/overlay/" + basename(path)
          return `eval('require.resolve("${outputPath}")')`
        }

        if (path.indexOf("/runtime/RefreshUtils") > -1) {
          const outputPath = "@effect-x/deps/compiled/react-refresh-webpack-plugin/runtime/" + basename(path)
          return `eval('require.resolve("${outputPath}")')`
        }

        if (path.indexOf("node_modules/react-refresh") > -1) {
          return false
        }
      },
      postCode(log, file, code) {
        return code
          .replace(
            "path.dirname(/*require.resolve*/(609))",
            'path.dirname(require.resolve("@effect-x/deps/compiled/react-refresh/babel"))'
          )
          .replace("runtimeGlobals.require || '__nccwpck_require__'", "runtimeGlobals.require || '__webpack_require__'")
      },
      minify: false,
    })
    .target("compiled/react-refresh-webpack-plugin")
}

export async function ncc_react_refresh_webpack_loader_plugin(task, opts) {
  await task
    .source(opts.src || "bundles/react-refresh-webpack-plugin/loader/*")
    .ncc({
      bundleName: "react-refresh-webpack-plugin",
      postCode(log, file, code) {
        return code
          .replaceAll("__nccwpck_require__.$Refresh$.runtime", "__webpack_require__.$Refresh$.runtime")
          .replace("__nccwpck_require__(723)", 'require.resolve("@effect-x/deps/compiled/react-refresh/runtime")')
          .replace("__nccwpck_require__.$Refresh$.moduleId;", "__webpack_require__.$Refresh$.moduleId;")
      },
      externals: {
        ...externals,
        "schema-utils": "@effect-x/deps/compiled/schema-utils3",
      },
      minify: false,
    })
    .target("compiled/react-refresh-webpack-plugin/loader/")
}

export async function ncc_react_refresh_webpack_sockets_plugin(task, opts) {
  await task
    .source(opts.src || "bundles/react-refresh-webpack-plugin/sockets/*")
    .ncc({
      bundleName: "react-refresh-webpack-plugin",
      customEmit(path) {
        if (path.indexOf("node_modules/react-refresh") > -1) {
          return false
        }
      },
      externals: {
        ...externals,
        "webpack-plugin-serve/lib/client/ClientSocket.js": "webpack-plugin-serve/lib/client/ClientSocket.js",
      },
    })
    .target("compiled/react-refresh-webpack-plugin/sockets")
}

export async function ncc_react_refresh_webpack_core_js_plugin(task, opts) {
  await task
    .source(opts.src || "bundles/react-refresh-webpack-plugin/core-js/*")
    .ncc({
      bundleName: "react-refresh-webpack-plugin",
      externals: {
        ...externals,
        "schema-utils": "@effect-x/deps/compiled/schema-utils3",
      },
    })
    .target("compiled/react-refresh-webpack-plugin/core-js/")
}

export async function ncc_react_refresh_webpack_client_plugin(task, opts) {
  await task
    .source(opts.src || "bundles/react-refresh-webpack-plugin/client/*")
    .ncc({
      bundleName: "react-refresh-webpack-plugin",
      customEmit(path) {
        if (path.indexOf("node_modules/react-refresh") > -1) {
          return false
        }
      },
      externals: {
        ...externals,
        "core-js-pure/web/url": "@effect-x/deps/compiled/react-refresh-webpack-plugin/core-js/url",
        "core-js-pure/web/url-search-params":
          "@effect-x/deps/compiled/react-refresh-webpack-plugin/core-js/url-search-params",
        "core-js-pure/features/global-this.js":
          "@effect-x/deps/compiled/react-refresh-webpack-plugin/core-js/global-this",
      },
    })
    .target("compiled/react-refresh-webpack-plugin/client/")
}

export async function ncc_react_refresh_webpack_overlay_plugin(task, opts) {
  await task
    .source(opts.src || "bundles/react-refresh-webpack-plugin/overlay/*")
    .ncc({
      bundleName: "react-refresh-webpack-plugin",
      externals: {
        ...externals,
      },
    })
    .target("compiled/react-refresh-webpack-plugin/overlay/")
}

export async function ncc_react_refresh_webpack_runtime_plugin(task, opts) {
  await task
    .source(opts.src || "bundles/react-refresh-webpack-plugin/runtime/*")
    .ncc({
      bundleName: "react-refresh-webpack-plugin",
      externals: {
        ...externals,
        "schema-utils": "@effect-x/deps/compiled/schema-utils3",
      },
      postCode(log, file, code) {
        return code
          .replace("__nccwpck_require__.c[moduleId].exports", "__webpack_require__.c[moduleId].exports")
          .replace("__nccwpck_require__.c[moduleId].hot.accept", "__webpack_require__.c[moduleId].hot.accept")
      },
      minify: false,
    })
    .target("compiled/react-refresh-webpack-plugin/runtime/")
}

// ------------------------------------------

const baseTasks = [
  "ncc_strip_ansi",
  "ncc_semver",
  "ncc_address",
  "ncc_detect_port_alt",
  "ncc_prompts",
  "ncc_chokidar",
  "ncc_chalk",
  "ncc_lodash",
  "ncc_yargs",
  "ncc_ramda",
  "ncc_debug",
  "ncc_glob",
  "ncc_core_js",
  "ncc_events",
  "ncc_punycode",
  "ncc_node_libs_browser",
  "ncc_source_map",
  "ncc_dotenv",
  "ncc_dotenv_expand",
  "ncc_querystring",
]

const webpackTasks = [
  "ncc_loader_utils",
  "ncc_loader_utils1",
  "ncc_tapable",
  "ncc_tapable1",
  "ncc_schema_utils",
  "ncc_schema_utils3",
  "ncc_webpack_sources",
  "ncc_webpack",
  "ncc_webpack_bundle_packages",
  "ncc_webpack_bundle_client_bundle",
  "ncc_webpack_bundle_client_packages",
  "ncc_webpack_bundle_hot_bundle",
  "ncc_webpack_bundle_path_fixtures",
  "ncc_watchpack",
]

const devServerTasks = [
  "ncc_ansi_html",
  "ncc_anser",
  "ncc_data_uri_to_buffer",
  "ncc_html_entities",
  "ncc_express",
  "ncc_ws",
  "ncc_sockjs",
  "ncc_sockjs_client",
  "ncc_http_proxy_middleware",
  "ncc_webpack_dev_server",
  "ncc_webpack_dev_server_client_bundle",
  "ncc_webpack_dev_server_clients_packages",
  "ncc_webpack_dev_server_servers_packages",
  "ncc_webpack_dev_server_path_fixtures",
]

const pluginsTasks = [
  "ncc_html_webpack_plugin_bundle_package",
  "ncc_copy_webpack_plugin",
  "ncc_terser",
  "ncc_terser_webpack_plugin",
  "ncc_case_sensitive_paths_webpack_plugin",
  "ncc_mini_css_extract_plugin",
  "ncc_supports_color",
  "ncc_merge_stream",
  "ncc_jest_worker",
  "ncc_jest_worker_worker_files",
  "ncc_jest_worker_types",
  "ncc_css_declaration_sorter",
  "ncc_cssnano",
  "ncc_css_minimizer_webpack_plugin",
  "ncc_webpack_bundle_analyzer",
  "ncc_circular_dependency_plugin",
  "ncc_speed_measure_webpack_plugin",
  "ncc_svgr_webpack",
  "ncc_file_loader",
  "ncc_url_loader",
  "ncc_css_loader",
  "ncc_postcss",
  "ncc_postcss_loader",
  "ncc_postcss_safe_parser",
  "ncc_postcss_flexbugs_fixes",
  "ncc_autoprefixer",
  "ncc_less",
  "ncc_less_loader",
  "ncc_resolve_url_loader",
  "ncc_sass",
  "ncc_sass_loader",
  "ncc_worker_loader",
  "ncc_worker_loader_runtime",
  "ncc_babel_bundle",
  "ncc_babel_bundle_packages",
  "ncc_babel_loader",
  "ncc_fork_ts_checker_webpack_plugin_bundle",
  "ncc_fork_ts_checker_webpack_plugin_bundle_package",
]

const reactDevTask = [
  "ncc_react_dev_utils",
  "ncc_react_refresh_bundle_package",
  "ncc_react_refresh_webpack_lib_plugin",
  "ncc_react_refresh_webpack_loader_plugin",
  "ncc_react_refresh_webpack_sockets_plugin",
  "ncc_react_refresh_webpack_core_js_plugin",
  "ncc_react_refresh_webpack_client_plugin",
  "ncc_react_refresh_webpack_overlay_plugin",
  "ncc_react_refresh_webpack_runtime_plugin",
]

export async function ncc(task) {
  // prettier-ignore
  await task
     .clear("compiled")
     .parallel([
       ...baseTasks,
       ...webpackTasks,
       ...devServerTasks,
       ...pluginsTasks,
       ...reactDevTask
     ])
}
