module.exports = function () {
  return {
    // inner imports
    RuntimeGlobals: require("webpack5/lib/RuntimeGlobals"),
    RuntimeModule: require("webpack5/lib/RuntimeModule"),
    Template: require("webpack5/lib/Template"),
    JavascriptParserHelpers: require("webpack5/lib/javascript/JavascriptParserHelpers"),
    ConstDependency: require("webpack5/lib/dependencies/ConstDependency"),
    EntryDependency: require("webpack5/lib/dependencies/EntryDependency"),
    ModuleFilenameHelpers: require("webpack5/lib/ModuleFilenameHelpers"),
    NormalModule: require("webpack5/lib/NormalModule"),
    RequestShortener: require("webpack5/lib/RequestShortener"),
    NodeTargetPlugin: require("webpack5/lib/node/NodeTargetPlugin"),
    EntryPlugin: require("webpack5/lib/EntryPlugin"),
    SingleEntryPlugin: require("webpack5/lib/SingleEntryPlugin"),
    WebWorkerTemplatePlugin: require("webpack5/lib/webworker/WebWorkerTemplatePlugin"),
    ExternalsPlugin: require("webpack5/lib/ExternalsPlugin"),
    FetchCompileWasmPlugin: require("webpack5/lib/web/FetchCompileWasmPlugin"),
    FetchCompileAsyncWasmPlugin: require("webpack5/lib/web/FetchCompileAsyncWasmPlugin"),
    utilIdentifier: require("webpack5/lib/util/identifier"),
    package: require("webpack5/package.json"),
    webpack: require("webpack5"),
  }
}
