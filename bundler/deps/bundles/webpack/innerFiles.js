const { writeFileSync } = require("fs")
const { join } = require("path")

const files = [
  "webpack/lib/RuntimeGlobals",
  "webpack/lib/RuntimeModule",
  "webpack/lib/Template",
  "webpack/lib/javascript/JavascriptParserHelpers",
  "webpack/lib/dependencies/ConstDependency",
  "webpack/lib/dependencies/EntryDependency",
  "webpack/lib/ModuleFilenameHelpers",
  "webpack/lib/NormalModule",
  "webpack/lib/RequestShortener",
  "webpack/lib/node/NodeTargetPlugin",
  "webpack/lib/EntryPlugin",
  "webpack/lib/SingleEntryPlugin",
  "webpack/lib/webworker/WebWorkerTemplatePlugin",
  "webpack/lib/ExternalsPlugin",
  "webpack/lib/web/FetchCompileWasmPlugin",
  "webpack/lib/web/FetchCompileAsyncWasmPlugin",
  // "webpack/lib/util/identifier",
  "utilIdentifier",
  "webpack/package",
]

const clientFiles = [
  "webpack/lib/logging/runtime",
  "webpack/hot/log",
  "webpack/hot/emitter",
  "webpack/hot/only-dev-server",
  "webpack/hot/dev-server",
]

exports.clientFiles = clientFiles

const pathAlias = {
  "webpack/lib/logging/runtime": "client/LoggingRuntime",
  "webpack/hot/log": "hot/log",
  "webpack/hot/emitter": "hot/emitter",
  "webpack/hot/only-dev-server": "hot/only-dev-server",
  "webpack/hot/dev-server": "hot/dev-server",
}

function getFileName(filePath) {
  return filePath.split("/").slice(-1)[0]
}

exports.getBundleMap = function () {
  return files.reduce((memo, file) => {
    const fileName = getFileName(file)
    memo[fileName] = `require('${file.replace(/^webpack/, "webpack5")}')`
    return memo
  }, {})
}

exports.getExternalsMap = function () {
  const memo = files.concat(clientFiles).reduce((memo, file) => {
    const fileName = pathAlias[file] || getFileName(file)

    memo[file] = `@effect-x/deps/compiled/webpack/${fileName}`
    return memo
  }, {})

  memo["webpack/package.json"] = "@effect-x/deps/compiled/webpack/package"

  return memo
}

exports.generatePackageFiles = function () {
  const baseDir = join(__dirname, "packages")

  files.forEach((file) => {
    const fileName = getFileName(file)
    writeFileSync(join(baseDir, `${fileName}.js`), `module.exports = require('./webpack.js').${fileName};\n`, "utf-8")
  })
  console.log("packages generated")
}
