import { RuleSetRule } from "@effect-x/deps/compiled/webpack"

export const makeWasmRule = (): RuleSetRule => {
  return {
    test: /\.wasm$/,
    type: "webassembly/async",
  }
}
