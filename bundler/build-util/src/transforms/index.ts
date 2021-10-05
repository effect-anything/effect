import chalk from "@effect-x/deps/compiled/chalk"
import * as R from "@effect-x/deps/compiled/ramda"
import * as Babel from "./babel"
import * as Typescript from "./typescript"
import { PackEnv } from "../bin"
import { BuildTask, ReportError, ReportErrorItem } from "./task"
import * as Utils from "../util"
import * as Log from "../log"

const ORDER_MAP = {
  babel: 1,
  typescript: 2,
}

const formatErrors = (errors: ReportError[]): string => {
  return R.compose<ReportError[], ReportErrorItem[], ReportErrorItem[], string[], string>(
    R.join("\n"),
    R.map((error) => {
      let str = ""

      if (error.filename) {
        str += chalk.cyan(error.filename)
        if (error.loc) {
          let loc = `:${error.loc.line}`

          if (error.loc.column) {
            loc += `:${error.loc.column}`
          }

          str += chalk.gray(loc)
        }
        str += "\n"
      }

      str += error.message

      return str
    }),
    R.uniqBy((x) => {
      return [x.filename, JSON.stringify(x.loc), x.message].join("")
    }),
    R.chain(R.prop("errors"))
  )(errors)
}

class Transforms {
  private providers: Map<string, (_: any) => BuildTask> = new Map()

  private tasks: Set<BuildTask> = new Set()

  private errors: ReportError[] = []

  constructor(private readonly env: PackEnv) {
    this.provide("babel", Babel)
    this.provide("typescript", Typescript)
  }

  public provide(name: string, s: any): this {
    this.providers.set(name, s.create(this.env))

    return this
  }

  public add(providerName: string, config: any) {
    const exist = this.providers.has(providerName)

    if (!exist) {
      throw new Error("provider not found: " + providerName)
    }

    const provider = this.providers.get(providerName)

    if (!provider) {
      throw new Error("provider not found: " + providerName)
    }

    const task = provider(config)

    this.tasks.add(task)

    return this
  }

  private displayErrors() {
    Log.error("Failed")

    const findTask = (id: string): BuildTask | undefined => {
      for (const task of this.tasks) {
        if (task.id === id) {
          return task
        }
      }
    }

    const getFormatErrors = R.compose(
      formatErrors,
      R.sortBy((error) => {
        const task = findTask(error.id)

        if (!task) {
          return 0
        }

        return ORDER_MAP[task.taskName] || 0
      })
    )

    console.error(getFormatErrors(this.errors))
  }

  private listenErrors() {
    const tasks: BuildTask[] = []

    this.tasks.forEach((task) => tasks.push(task))

    let flag = false

    const onComplete = Utils.debounce(() => {
      const allCompleted = tasks.every((x) => x.hasCompleted)

      if (!allCompleted) {
        return
      }

      flag = false

      // sure task completed
      if (this.errors.length > 0) {
        this.displayErrors()

        return
      }

      Log.info(chalk.green`Successfully`)
    }, 200)

    tasks.forEach((task) => {
      task.on("compiling", () => {
        const anyCompiling = tasks.some((x) => x.hasCompiling)

        if (anyCompiling) {
          if (!flag) {
            Log.wait(chalk.yellow`Compiling`)
          }

          flag = true
        }
      })

      task.on("failed", (error) => {
        const exist = this.errors.find((x) => x.id === error.id)

        if (exist) {
          exist.errors = error.errors
        }

        this.errors.push(error)
      })

      task.on("successfully", ({ id }) => {
        const idx = this.errors.findIndex((x) => x.id === id)

        this.errors.splice(idx, 1)
      })

      task.on("completed", onComplete)
    })
  }

  public start() {
    // listen errors
    this.listenErrors()

    for (const task of this.tasks) {
      task.start()
    }
  }

  public stop() {
    for (const task of this.tasks) {
      task.stop()
    }
  }
}

export const create = (env: PackEnv) => new Transforms(env)
