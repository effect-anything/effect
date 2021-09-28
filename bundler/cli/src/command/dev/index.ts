import yargs from "@effect-x/deps/compiled/yargs"
import openBrowser from "@effect-x/deps/compiled/react-dev-utils/openBrowser"
import clearConsole from "@effect-x/deps/compiled/react-dev-utils/clearConsole"
import { choosePort, prepareUrls } from "@effect-x/deps/compiled/react-dev-utils/WebpackDevServerUtils"
import type { MultiCompiler } from "@effect-x/deps/compiled/webpack"
import debugF from "@effect-x/deps/compiled/debug"
import { RettDevArgs } from "../../config/types"
import { initWorkspaces } from "../../config/workspace"
import { getProjectsFormWorkspace } from "../../config/projects"
import { createDevServer } from "./dev-server"
import { initEnv } from "../../config/dotenv"
import { mergeArgsFormEnv } from "../../config/env"
import { parseEnv } from "../../config/utils"
import { getWebpackCompiler } from "../../webpack/generate"
import * as Log from "../../log"
import { ConfigHelper } from "../../config/helper"

const debug = debugF("rett-cli:command:dev")

function printInstructions(urls: any) {
  if (urls.lanUrlForTerminal) {
    Log.ready(`started server on Local: ${urls.localUrlForTerminal}, NetWork: ${urls.lanUrlForTerminal}`)
  } else {
    Log.ready(`started server on Local: ${urls.localUrlForTerminal}`)
  }
}

export const initDevCommand = async (args: yargs.Arguments<RettDevArgs>) => {
  // Do this as the first thing so that any code reading it knows the right env.
  process.env.BABEL_ENV = process.env.BABEL_ENV || "development"
  process.env.NODE_ENV = process.env.NODE_ENV || "development"

  // Makes the script crash on unhandled rejections instead of silently
  // ignoring them. In the future, promise rejections that are not handled will
  // terminate the Node.js process with a non-zero exit code.
  process.on("unhandledRejection", (err) => {
    throw err
  })

  Log.wait("compiling")

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

  const isInteractive = process.stdout.isTTY

  const isCI = parseEnv(process.env.CI as string, "boolean") || false

  const DEFAULT_HOST = "0.0.0.0"
  const DEFAULT_PORT = 3000

  const HOST = args.host || DEFAULT_HOST

  const PORT = await choosePort(HOST, args.port || DEFAULT_PORT)

  if (!PORT) {
    process.exit(0)
  }

  // assign new port
  args.port = PORT

  const configHelper = new ConfigHelper(args, workspaces, projects)

  process.env.REACT_FAST_REFRESH = configHelper.hotConfig.reactFastRefresh.toString()

  let compiler: MultiCompiler

  try {
    const webpackConfigs = configHelper.generateWebpackConfig()

    compiler = getWebpackCompiler(webpackConfigs)
  } catch (error: any) {
    Log.error("failed to compile.\n")
    console.log(error.message || error)

    process.exit(1)
  }

  // TOD: https
  const urls = prepareUrls("http", HOST, PORT, args.publicPath)

  let isFirsCompile = true

  // "invalid" event fires when you have changed a file, and webpack is
  // recompiling a bundle. WebpackDevServer takes care to pause serving the
  // bundle, so if you refresh, it'll wait instead of serving the old one.
  // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
  compiler.hooks.invalid.tap("invalid", () => {
    if (isFirsCompile) {
      return
    }

    Log.wait("compiling")
  })

  // "done" event fires when webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.hooks.done.tap("done", async (stats) => {
    isFirsCompile = false

    if (!isCI && !args.measure && (!args.webpackLogLevel || args.webpackLogLevel === "none")) {
      clearConsole()
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

    if (stats.hasWarnings()) {
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

    const isSuccessful = !stats.hasErrors()

    if (isSuccessful && isInteractive) {
      printInstructions(urls)

      Log.event("compiled successfully")
    }
  })

  try {
    const devServer = createDevServer(configHelper, compiler)

    if (args.debug) {
      process.exit(0)
    }

    await devServer.start()

    if (args.open) {
      /**
       * 可以通过设置环境变量来修改启动的浏览器
       * process.env.BROWSER
       * process.env.BROWSER_ARGS
       * Github Ref: https://github.com/facebook/create-react-app/blob/master/packages/react-dev-utils/openBrowser.js#L24
       */
      process.nextTick(() => {
        try {
          openBrowser(urls.localUrlForBrowser)
        } catch {}
      })
    }

    // listen exit signal
    ;["SIGINT", "SIGTERM"].forEach(function (sig) {
      process.on(sig, function () {
        try {
          devServer.stop()
          process.exit()
        } catch {}
      })
    })

    if (!isCI) {
      // Gracefully exit when stdin ends
      process.stdin.on("end", function () {
        devServer.stop()
        process.exit()
      })
    }
  } catch (error: any) {
    Log.error("start error")
    console.error(error)
    process.exit(0)
  }
}
