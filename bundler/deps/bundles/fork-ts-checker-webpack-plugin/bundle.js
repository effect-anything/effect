module.exports = {
  entry() {
    return require("fork-ts-checker-webpack-plugin6")
  },
  TypeScriptReporterRpcService() {
    return require("fork-ts-checker-webpack-plugin6/lib/typescript-reporter/reporter/TypeScriptReporterRpcService")
  },
  EsLintReporterRpcService() {
    return require("fork-ts-checker-webpack-plugin6/lib/eslint-reporter/reporter/EsLintReporterRpcService")
  },
}
