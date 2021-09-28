import yargs from "@effect-x/deps/compiled/yargs"
import debugF from "@effect-x/deps/compiled/debug"
import * as Log from "../../log"
import { parseEnv } from "../../config/utils"
import { initEnv } from "../../config/dotenv"
import { RettBuildArgs } from "../../config/types"
import { initWorkspaces } from "../../config/workspace"
import { mergeArgsFormEnv } from "../../config/env"
import { getProjectsFormWorkspace } from "../../config/projects"
import { ConfigHelper } from "../../config/helper"
import { getWebpackCompiler } from "../../webpack/generate"

const debug = debugF("rett-cli:command:build")

export const initBuildCommand = async (args: yargs.Arguments<RettBuildArgs>) => {
  // Do this as the first thing so that any code reading it knows the right env.
  process.env.BABEL_ENV = process.env.BABEL_ENV || "production"
  process.env.NODE_ENV = process.env.NODE_ENV || "production"

  // Makes the script crash on unhandled rejections instead of silently
  // ignoring them. In the future, promise rejections that are not handled will
  // terminate the Node.js process with a non-zero exit code.
  process.on("unhandledRejection", (err) => {
    throw err
  })

  const workspaces = initWorkspaces(args.cwd)

  initEnv(workspaces.workspacePath)

  mergeArgsFormEnv(args)

  const projects = getProjectsFormWorkspace(
    {
      cwd: args.cwd,
      include: args.include,
      exclude: args.exclude,
    },
    workspaces
  )

  // args, workspaces, projects,
  if (projects.include.length === 0) {
    process.exit(0)
  }

  const isCI = parseEnv(process.env.CI as string, "boolean") || false

  const configHelper = new ConfigHelper(args as any, workspaces, projects)

  const webpackConfigs = configHelper.generateWebpackConfig()

  let compiler: any

  try {
    compiler = getWebpackCompiler(webpackConfigs)
  } catch (error: any) {
    Log.error("failed to compile.\n")
    console.log(error.message || error)

    process.exit(1)
  }

  if (args.debug) {
    process.exit(0)
  }

  const compilerTask = () =>
    new Promise((resolve, reject) => {
      compiler.run((err: any, stats: any) => {
        let messages

        if (err) {
          if (!err.message) {
            return reject(err)
          }
        }

        const options = {
          // hidden default fields
          hash: false,
          version: false,
          errors: false,
          warnings: false,
        }

        if (stats.hasErrors()) {
          options.errors = true
        }

        if (stats.hasErrors()) {
          options.warnings = true
        }

        // We have switched off the default webpack output in WebpackDevServer
        // options so we are going to "massage" the warnings and errors and present
        // them in a readable focused way.
        // We only construct the warnings and errors for speed:
        // https://github.com/facebook/create-react-app/issues/4492#issuecomment-421959548
        const statsData = stats.toJson(options)

        // Show warnings if no errors were found.
        if (statsData.warnings && statsData.warnings.length > 0) {
          Log.warn("compiled with warnings.\n")
        }

        // If errors exist, only show errors.
        if (statsData.errors && statsData.errors.length > 0) {
          Log.error("failed to compile.\n")

          const msg = statsData.errors[0]

          console.log(`
        category
        - ${msg.category}
        severity
        - ${msg.severity}
        type
        - ${msg.type}
        reason type
        - ${msg.reasonType}
        reason 
        - ${msg.reason}
        file
        - ${msg.file}${msg.loc ? ":" + msg.loc : undefined}
        message\n${msg.message}
      `)

          // console.log(messages.errors.map(formatMessage).join("\n\n"))
        }

        // if (isCI && messages.warnings.length > 0) {
        //   Log.error(
        //     "\nTreating warnings as errors because process.env.CI = true.\n" + "Most CI servers set it automatically.\n"
        //   )

        //   return reject(new Error(messages.warnings.join("\n\n")))
        // }

        return resolve(undefined)
      })
    })

  Log.wait("compiling")

  compilerTask().then(() => {
    compiler.close(() => {
      Log.event("compiled successfully")
    })
  })
}
