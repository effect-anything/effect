import chokidar from "chokidar"
import { EventEmitter } from "events"
import { PackEnv } from "./bin"

export interface SourceInput {
  watchList: string
  event: EventEmitter
  stop(): void
}

class Sources {
  constructor(public env: PackEnv) {}

  public dir(pattern: string): SourceInput {
    let watcher: any

    let close = () => {}

    if (this.env.watch) {
      watcher = chokidar.watch(pattern, {
        persistent: true,
        ignoreInitial: true,
        cwd: this.env.cwd,
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 150,
        },
      })
      close = () => watcher.close()
    } else {
      watcher = new EventEmitter()
    }

    return {
      watchList: pattern,
      event: watcher,
      stop() {
        watcher.removeAllListeners()

        close()
      },
    }
  }
}

export const create = (env: PackEnv) => new Sources(env)
