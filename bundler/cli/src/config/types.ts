type WebpackLogLevel = "none" | "verbose" | "error" | "warn" | "info" | "log" | undefined

export interface RettDevArgs {
  cwd: string
  env: string
  exclude: string[]
  include: string[]
  webpackLogLevel: WebpackLogLevel
  open: boolean
  host: string
  port: number
  output: string
  hot: boolean
  reactFastRefresh: boolean
  proxyFile: string
  profile: boolean
  cache: boolean
  publicPath: string
  check: boolean
  sourceMap: boolean
  analyze: boolean
  measure: boolean
  debug: boolean
}

export interface RettBuildArgs {
  cwd: string
  env: string
  exclude: string[]
  include: string[]
  output: string
  profile: boolean
  cache: boolean
  publicPath: string
  check: boolean
  webpackLogLevel: WebpackLogLevel
  sourceMap: boolean
  analyze: boolean
  measure: boolean
  debug: boolean
}
