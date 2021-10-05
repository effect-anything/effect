import { EventEmitter } from "events"
import { fork, ChildProcess } from "child_process"
import { nanoid } from "nanoid"
import { PackEnv } from "../bin"

export interface ReportErrorItem {
  message: string
  filename?: string
  stack?: string
  loc?: {
    line: number
    column?: number
  }
}

export interface ReportError {
  id: string
  errors: ReportErrorItem[]
}

export type ProcessMessageType<F, K extends keyof F = keyof F, V = F[K]> = V extends undefined
  ? {
      type: K
      args?: V
    }
  : {
      type: K
      args: V
    }

export interface ReportEventTypeEnum {
  compiling: {
    id: string
  }
  /**
   * compilation failed
   */
  failed: ReportError
  /**
   * compilation success
   */
  successfully: {
    id: string
  }
  /**
   * compilation completed
   */
  completed: {
    id: string
  }
}

export class BuildTask extends EventEmitter {
  public readonly id: string

  private initialized = false

  private state: keyof ReportEventTypeEnum = "compiling"

  private _hasSuccess = false

  public get hasSuccessful(): boolean {
    return this.hasCompleted && this._hasSuccess
  }

  public get hasFailed(): boolean {
    return this.state === "failed"
  }

  public get hasCompiling(): boolean {
    return this.state === "compiling"
  }

  public get hasCompleted(): boolean {
    return this.state === "completed"
  }

  constructor(public readonly taskName: string, public readonly env: PackEnv) {
    super()

    this.id = nanoid()
  }

  public start(): void {
    if (this.initialized) {
      return
    }

    this.initialized = true

    this.onStart()
  }

  public onStart(): void {}

  public onMessage(message: string | ProcessMessageType<ReportEventTypeEnum>) {
    const payload = typeof message === "string" ? JSON.parse(message) : message

    this.state = payload.type.toString() as keyof ReportEventTypeEnum

    switch (this.state) {
      case "compiling":
        this.onCompiling(payload.args)
        break
      case "failed":
        this._hasSuccess = false
        this.onFailed(payload.args)
        break
      case "successfully":
        this._hasSuccess = true
        this.onSuccessfully(payload.args)
        break
      case "completed":
        this.onCompleted(payload.args)
        break
    }
  }

  public onCompiling(args: ProcessMessageType<ReportEventTypeEnum, "compiling">["args"]): void {
    this.emit("compiling", args)
  }

  public onFailed(error: ProcessMessageType<ReportEventTypeEnum, "failed">["args"]) {
    this.emit("failed", error)
  }

  public onSuccessfully(args: ProcessMessageType<ReportEventTypeEnum, "successfully">["args"]) {
    this.emit("successfully", args)
  }

  public onCompleted(args: ProcessMessageType<ReportEventTypeEnum, "completed">["args"]): void {
    const exit = () => {
      if (!this.env.watch) {
        this.stop()
      }
    }

    this.emit("completed", args)

    process.nextTick(() => {
      exit()
    })
  }

  public stop() {
    this.initialized = false

    this.onStop()
  }

  public onStop(): void {}
}

export class ProcessBuildTask extends BuildTask {
  private readonly process: ChildProcess

  static report<T extends ReportEventTypeEnum>(msg: ProcessMessageType<T>) {
    return process.send?.(JSON.stringify(msg))
  }

  constructor(public readonly taskName: string, child: string, public readonly env: PackEnv) {
    super(taskName, env)

    this.process = fork(child, ["--id", this.id, "--cwd", env.cwd], {
      stdio: "inherit",
    })

    this.process.on("message", (message) => {
      if (typeof message !== "string") {
        return
      }

      this.onMessage(message)
    })
  }

  public send<P extends ProcessMessageType<ReportEventTypeEnum, any>>(payload: P): void {
    this.process.send(JSON.stringify(payload))
  }

  public stop() {
    this.process.kill()

    super.stop()
  }
}
