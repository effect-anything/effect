import fs from "fs"
import path from "path"
import slash from "slash"
import * as R from "@effect-x/deps/compiled/ramda"
import type { TransformOptions } from "@effect-x/deps/compiled/babel"
import { ReportErrorItem, ProcessMessageType, ReportEventTypeEnum } from "../task"
import * as util from "../../util"

export interface ProcessEventTypeEnum {
  build: {
    id: string
    cwd: string
    path: string
    output: {
      outputPath: string
      deleteDirOnStart?: boolean
    }
    options?: TransformOptions
  }
  singleBuild: {
    id: string
    cwd: string
    path: string
    changePath: string
    output: {
      outputPath: string
      deleteDirOnStart?: boolean
    }
    options?: TransformOptions
  }
}

const filenameRegex = /.*\.(js|ts)x?/
const filenameWithSplitRegex = /.*\.(js|ts)x?:\s/
const filenameLocRegex = /\(\d+:\d+\)/

const formatError = (error: Error | any): ReportErrorItem => {
  return {
    message: error.message.replace(filenameWithSplitRegex, "").replace(filenameLocRegex, "").replace("\n", ""),
    stack: error.stack,
    filename: error.message.match(filenameRegex)?.[0] || "",
    loc: error.loc && {
      line: error.loc.line,
      column: error.loc.column,
    },
  }
}

type BabelHandleResult = ReportErrorItem | undefined | void

const makeBabelOptions = (cwd: string, options?: TransformOptions) => {
  const babelOptions: TransformOptions = {
    ...options,
    cwd: cwd,
    root: cwd,
    babelrc: false,
    caller: {
      ...options?.caller,
      name: "bundler-pack",
      supportsDynamicImport: true,
      supportsStaticESM: true,
      supportsTopLevelAwait: true,
      env: process.env.NODE_ENV || "production",
    },
  }

  // If the @babel/cli version is newer than the @babel/core version, and we have added
  // new options for @babel/core, we'll potentially get option validation errors from
  // @babel/core. To avoid that, we delete undefined options, so @babel/core will only
  // give the error if users actually pass an unsupported CLI option.
  for (const key of Object.keys(babelOptions)) {
    if (babelOptions[key] === undefined) {
      delete babelOptions[key]
    }
  }

  return babelOptions
}

const handleDirectory = (
  outputPath: string,
  babelOptions: TransformOptions,
  dirname: string
): Promise<BabelHandleResult[]> => {
  const files = util.readdirRecursive(dirname)

  return Promise.all(
    files.map((filename) => handleFile(path.join(dirname, filename), dirname, outputPath, babelOptions))
  )
}

const handleFile = (
  src: string,
  dirname: string,
  output: string,
  options: TransformOptions
): Promise<BabelHandleResult> => {
  let relative = path.relative(dirname, src)

  relative = util.withExtension(relative, ".js")

  const dest = path.join(output, relative)

  return util
    .compile(src, {
      ...options,
      sourceFileName: slash(path.relative(dest + "/..", src)),
    })
    .then((res) => {
      if (!res) {
        return
      }

      // we've requested explicit sourcemaps to be written to disk
      if (res.map && options.sourceMaps && options.sourceMaps !== "inline") {
        const mapLoc = dest + ".map"
        res.code = util.addSourceMappingUrl(res.code || "", mapLoc)
        res.map.file = path.basename(relative)
        util.outputFileSync(mapLoc, JSON.stringify(res.map))
      }

      util.outputFileSync(dest, res.code || "")
      util.chmod(src, dest)
    })
    .catch((error) => {
      const makeError = formatError(error)

      return makeError
    })
}

export const build = (
  params: ProcessEventTypeEnum["build"],
  report: (_: ProcessMessageType<ReportEventTypeEnum>) => void
) => {
  report({
    type: "compiling",
    args: {
      id: params.id,
    },
  })

  const outputPath = path.isAbsolute(params.output.outputPath)
    ? params.output.outputPath
    : path.join(params.cwd, params.output.outputPath)

  if (params.output.deleteDirOnStart) {
    util.deleteDir(outputPath)
  }

  const babelOptions = makeBabelOptions(params.cwd, params.options)

  // get directory files
  let tasks

  if (!fs.existsSync(params.path)) {
    const notFoundError = new Error(`${params.path} not exists`)

    const error: ReportErrorItem = {
      message: notFoundError.message,
      stack: notFoundError.stack,
      filename: undefined,
      loc: undefined,
    }

    tasks = Promise.resolve([error])
  }

  const stat = fs.statSync(params.path)

  if (stat.isDirectory()) {
    tasks = handleDirectory(outputPath, babelOptions, params.path)
  } else {
    tasks = handleFile(params.path, path.dirname(params.path), outputPath, babelOptions).then((x) => [x])
  }

  return tasks
    .then((x) => R.flatten(x))
    .then((result: BabelHandleResult[]) => {
      const rej = R.reject(R.isNil, result)

      if (rej.length > 0) {
        report({
          type: "failed",
          args: {
            id: params.id,
            errors: rej as ReportErrorItem[],
          },
        })

        return
      }

      report({
        type: "successfully",
        args: {
          id: params.id,
        },
      })
    })
    .finally(() => {
      report({
        type: "completed",
        args: {
          id: params.id,
        },
      })
    })
}

export const singleBuild = (
  params: ProcessEventTypeEnum["singleBuild"],
  report: (_: ProcessMessageType<ReportEventTypeEnum>) => void
) => {
  report({
    type: "compiling",
    args: {
      id: params.id,
    },
  })

  const babelOptions = makeBabelOptions(params.cwd, params.options)

  return handleFile(params.changePath, path.basename(params.path), params.output.outputPath, babelOptions)
    .then((result: BabelHandleResult) => {
      if (result) {
        report({
          type: "failed",
          args: {
            id: params.id,
            errors: [result],
          },
        })

        return
      }

      report({
        type: "successfully",
        args: {
          id: params.id,
        },
      })
    })
    .finally(() => {
      report({
        type: "completed",
        args: {
          id: params.id,
        },
      })
    })
}
