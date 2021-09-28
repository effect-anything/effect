import { RuleSetRule, RuleSetUseItem } from "@effect-x/deps/compiled/webpack"

interface ITSRuleOptions {
  include: RuleSetRule["include"]
  exclude: RuleSetRule["exclude"]
  loaders: RuleSetUseItem[]
}

export const makeTSRules = (options: ITSRuleOptions): RuleSetRule => {
  const uses: RuleSetUseItem[] = []

  uses.push(...options.loaders)

  return {
    test: /\.(ts|tsx)$/,
    include: options.include,
    exclude: options.exclude,
    use: options.loaders,
  }
}
