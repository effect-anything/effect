import { RuleSetRule, RuleSetUseItem } from "@effect-x/deps/compiled/webpack"

interface IJSRuleOptions {
  include: RuleSetRule["include"]
  exclude: RuleSetRule["exclude"]
  loaders: RuleSetUseItem[]
}

export const makeJSRules = (options: IJSRuleOptions): RuleSetRule => {
  const uses: RuleSetUseItem[] = []

  uses.push(...options.loaders)

  return {
    test: /\.(js|jsx)$/,
    include: options.include,
    exclude: options.exclude,
    use: uses,
  }
}
