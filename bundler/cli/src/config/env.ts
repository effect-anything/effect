import type { RettDevArgs, RettBuildArgs } from "./types"
import { parseEnv } from "./utils"

export const mergeArgsFormEnv = (args: Partial<RettDevArgs & RettBuildArgs>) => {
  if (process.env.RETT_CWD) {
    args.cwd = process.env.RETT_CWD
  }

  if (process.env.RETT_ENV) {
    args.env = process.env.RETT_ENV
  }

  if (process.env.RETT_EXCLUDE) {
    args.exclude = parseEnv(process.env.RETT_EXCLUDE, "array")
  }

  if (process.env.RETT_INCLUDE) {
    args.include = parseEnv(process.env.RETT_INCLUDE, "array")
  }

  if (process.env.RETT_OPEN) {
    args.open = parseEnv(process.env.RETT_OPEN, "boolean")
  }

  if (process.env.RETT_HOST) {
    args.host = process.env.RETT_HOST
  }

  if (process.env.RETT_PORT) {
    args.port = parseEnv(process.env.RETT_PORT, "number")
  }

  if (process.env.RETT_HOT) {
    args.hot = parseEnv(process.env.RETT_HOT, "boolean")
  }

  if (process.env.RETT_REACT_FAST_REFRESH) {
    args.reactFastRefresh = parseEnv(process.env.RETT_REACT_FAST_REFRESH, "boolean")
  }

  if (process.env.RETT_OUTPUT) {
    args.output = process.env.RETT_OUTPUT
  }

  if (process.env.RETT_PROXY_FILE) {
    args.proxyFile = process.env.RETT_PROXY_FILE
  }

  if (process.env.RETT_PROFILE) {
    args.profile = parseEnv(process.env.RETT_PROFILE, "boolean")
  }

  if (process.env.RETT_CACHE) {
    args.cache = parseEnv(process.env.RETT_CACHE, "boolean")
  }

  if (process.env.RETT_PUBLIC_PATH) {
    args.publicPath = process.env.RETT_PUBLIC_PATH
  }

  if (process.env.RETT_CHECK) {
    args.check = parseEnv(process.env.RETT_CHECK, "boolean")
  }

  if (process.env.RETT_WEBPACK_LOG_LEVEL) {
    args.webpackLogLevel = process.env.RETT_WEBPACK_LOG_LEVEL as typeof args.webpackLogLevel
  }

  if (process.env.RETT_SOURCE_MAP) {
    args.sourceMap = parseEnv(process.env.RETT_SOURCE_MAP, "boolean")
  }

  if (process.env.RETT_ANALYZE) {
    args.analyze = parseEnv(process.env.RETT_ANALYZE, "boolean")
  }

  if (process.env.RETT_MEASURE) {
    args.measure = parseEnv(process.env.RETT_MEASURE, "boolean")
  }

  if (process.env.RETT_DEBUG) {
    args.debug = parseEnv(process.env.RETT_DEBUG, "boolean")
  }

  return args
}
