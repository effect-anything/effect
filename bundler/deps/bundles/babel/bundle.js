function codeFrame() {
  return require("@babel/code-frame")
}

function core() {
  return require("@babel/core")
}

function parser() {
  return require("@babel/parser")
}

function types() {
  return require("@babel/types")
}

function traverse() {
  return require("@babel/traverse")
}

function pluginProposalClassProperties() {
  return require("@babel/plugin-proposal-class-properties")
}

function pluginProposalDecorators() {
  return require("@babel/plugin-proposal-decorators")
}

function pluginProposalDoExpressions() {
  return require("@babel/plugin-proposal-do-expressions")
}

function pluginProposalExportDefaultFrom() {
  return require("@babel/plugin-proposal-export-default-from")
}

function pluginProposalLogicalAssignmentOperators() {
  return require("@babel/plugin-proposal-logical-assignment-operators")
}

function pluginProposalNullishCoalescingOperator() {
  return require("@babel/plugin-proposal-nullish-coalescing-operator")
}

function pluginProposalOptionalChaining() {
  return require("@babel/plugin-proposal-optional-chaining")
}

function pluginProposalPipelineOperator() {
  return require("@babel/plugin-proposal-pipeline-operator")
}

function pluginTransformReactRemovePropTypes() {
  return require("babel-plugin-transform-react-remove-prop-types")
}

function pluginTransformRuntime() {
  return require("@babel/plugin-transform-runtime")
}

function pluginTransformTypescriptMetadata() {
  return require("babel-plugin-transform-typescript-metadata")
}

function presetEnv() {
  return require("@babel/preset-env")
}

function presetReact() {
  return require("@babel/preset-react")
}

function presetTypescript() {
  return require("@babel/preset-typescript")
}

function pluginProposalRecordAndTuple() {
  return require("@babel/plugin-proposal-record-and-tuple")
}

function pluginMacros() {
  return require("babel-plugin-macros")
}

module.exports = {
  codeFrame,
  core,
  parser,
  traverse,
  types,
  pluginProposalClassProperties,
  pluginProposalDecorators,
  pluginProposalDoExpressions,
  pluginProposalExportDefaultFrom,
  pluginProposalLogicalAssignmentOperators,
  pluginProposalNullishCoalescingOperator,
  pluginProposalOptionalChaining,
  pluginProposalPipelineOperator,
  pluginTransformReactRemovePropTypes,
  pluginTransformRuntime,
  presetEnv,
  presetReact,
  presetTypescript,
  pluginTransformTypescriptMetadata,
  pluginProposalRecordAndTuple,
  pluginMacros,
}
