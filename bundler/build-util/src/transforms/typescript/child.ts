import { spawn } from "child_process"
import path from "path"
import readline from "readline"
import stripAnsi from "@effect-x/deps/compiled/strip-ansi"
import type { CompilerOptions } from "typescript"
import yargs, { Arguments } from "@effect-x/deps/compiled/yargs"
import { ProcessMessageType, ProcessBuildTask, ReportErrorItem } from "../task"

export interface ProcessEventTypeEnum {
  build: {
    tsconfigPath: string
    watch: boolean
    output: {
      outputPath: string
      deleteDirOnStart?: boolean
    }
    options?: CompilerOptions
  }
}

const args = yargs.parse() as Arguments<{
  id: string
  cwd: string
}>

const getTscCompiler = (cwd: string): string => {
  try {
    const compiler = require.resolve("typescript/bin/tsc", {
      paths: [cwd],
    })
    return compiler
  } catch (e) {
    ProcessBuildTask.report({
      type: "failed",
      args: {
        id: args.id,
        errors: [new Error("tsc not found")],
      },
    })

    process.exit(1)
  }
}

function deleteClear(line: string) {
  const buffer = Buffer.from(line)

  if (buffer.length >= 2 && buffer[0] === 0x1b && buffer[1] === 0x63) {
    return line.substr(2)
  }

  return line
}

const typescriptPrettyErrorRegex = /:\d+:\d+ - error TS\d+: /
const typescriptErrorRegex = /\(\d+,\d+\): error TS\d+: /

const compilationCompleteWithErrorRegex = / Found [^0][0-9]* error[s]?\. Watching for file changes\./
const compilationCompleteRegex =
  /( Compilation complete\. Watching for file changes\.| Found \d+ error[s]?\. Watching for file changes\.)/
const newCompilationRegex =
  /( Starting compilation in watch mode\.\.\.| File change detected\. Starting incremental compilation\.\.\.)/

function detectState(line: string) {
  const clearLine = stripAnsi(line)
  const newCompilation = newCompilationRegex.test(clearLine)
  const compilationError =
    compilationCompleteWithErrorRegex.test(clearLine) ||
    typescriptErrorRegex.test(clearLine) ||
    typescriptPrettyErrorRegex.test(clearLine)
  const compilationComplete = compilationCompleteRegex.test(clearLine)

  return {
    newCompilation: newCompilation,
    compilationError: compilationError,
    compilationComplete: compilationComplete,
  }
}

const fileRegex = /.*\):/
const filenameRegex = /.*\.(js|ts)x?/
const editorSelectionRegex = /\(\d+,\d+\)/
const errorReasonRegex = /: error TS\d+: .*/

const formatTscMessage = (cwd: string, line: string): ReportErrorItem | undefined => {
  const file = line.match(fileRegex)
  const filename = file ? file[0].match(filenameRegex)?.[0] : undefined
  const editorSelection = file ? file[0].match(editorSelectionRegex)?.[0] : undefined
  const errorReason = line.match(errorReasonRegex)?.[0].replace(": error ", "")

  if (!file || !filename || !errorReason) {
    return undefined
  }

  let loc
  const locMatch = editorSelection && editorSelection.match(/\d+/g)

  if (locMatch) {
    loc = {
      line: locMatch[0] !== undefined ? parseInt(locMatch[0]) : 0,
      column: locMatch[1] !== undefined ? parseInt(locMatch[1]) : undefined,
    }
  }

  return {
    message: errorReason,
    filename: path.isAbsolute(filename) ? filename : path.join(cwd, filename),
    loc: loc,
    stack: undefined,
  }
}

const build = (params: ProcessEventTypeEnum["build"]) => {
  const compiler = getTscCompiler(args.cwd)

  const tscArgs: any[] = []

  if (params.tsconfigPath) {
    tscArgs.push("--project", params.tsconfigPath)
  }

  tscArgs.push("--watch", "true")

  const tsconfigPath = path.resolve(args.cwd, params.tsconfigPath)

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config = require(tsconfigPath)

  // only
  if (config?.compilerOptions?.declaration && config?.compilerOptions?.emitDeclarationOnly) {
    const outputPath =
      config.compilerOptions.declarationDir || params.options?.declarationDir || params.output.outputPath

    tscArgs.push("--declarationDir", outputPath)
  }

  if (config?.compilerOptions?.noEmit !== undefined) {
    const outputPath = config.compilerOptions.outDir || params.options?.outDir || params.output.outputPath

    tscArgs.push("--outDir", outputPath)
  }

  const tscProcess = spawn("node", [compiler, ...tscArgs])

  const rl = readline.createInterface({
    input: tscProcess.stdout,
  })

  let compilationErrorSinceStart = false

  let errors: ReportErrorItem[] = []

  rl.on("line", (input) => {
    input = deleteClear(input)

    const state = detectState(input)
    const newCompilation = state.newCompilation
    const compilationError = state.compilationError
    const compilationComplete = state.compilationComplete

    compilationErrorSinceStart = (!newCompilation && compilationErrorSinceStart) || compilationError

    if (newCompilation) {
      ProcessBuildTask.report({
        type: "compiling",
        args: {
          id: args.id,
        },
      })

      errors = []
    }

    if (compilationError) {
      const errorMessage = formatTscMessage(args.cwd, input)

      if (errorMessage) {
        errors.push(errorMessage)
      }
    }

    if (compilationComplete) {
      if (compilationErrorSinceStart) {
        ProcessBuildTask.report({
          type: "failed",
          args: {
            id: args.id,
            errors: errors,
          },
        })
      } else {
        ProcessBuildTask.report({
          type: "successfully",
          args: {
            id: args.id,
          },
        })
      }

      ProcessBuildTask.report({
        type: "completed",
        args: {
          id: args.id,
        },
      })
    }
  })
}

if (typeof process.on === "function") {
  process.on("message", (msg) => {
    if (typeof msg !== "string") {
      return
    }

    const payload = JSON.parse(msg) as ProcessMessageType<ProcessEventTypeEnum>

    switch (payload.type) {
      case "build":
        build(payload.args as ProcessMessageType<ProcessEventTypeEnum, "build">["args"])
        break
    }
  })
}
