import { Event } from "./event"
import * as CompilerSource from "./source/compiler"
import * as RuntimeSource from "./source/runtime"
import * as MiscSource from "./source/misc"
import { State } from "./state"
import { init } from "./container"

export type RuntimeComponent = {
  init(event: Event, ctx: any): () => void
}

type EmitCallback = (event: string, data?: unknown) => void

export type Source = {
  handler: (state: State, emit: EmitCallback) => () => void
}

const makeSource = (
  prefix: string,
  state: State,
  handler: Source["handler"],
  emit: (prefix: string, event: string, data?: unknown) => void
) => {
  return handler(state, (event: string, data?: unknown) => emit(prefix, event, data))
}

export class Hot {
  private ctx: any = {
    elements: [],
    addElement: (element: any) => {
      this.ctx.elements.push(element)
    },
    removeElement: (element: any) => {
      const idx = this.ctx.elements.findIndex((x: any) => x === element)

      this.ctx.elements.splice(idx, 1)
    },
  }

  private rootCreated: any = null

  private clearFns: (() => void)[] = []

  constructor(public readonly event: Event, public readonly components: RuntimeComponent[]) {}

  public init() {
    if (this.rootCreated) {
      return
    }

    const root = document.createElement("div")

    root.id = "__hot__"

    this.rootCreated = root

    document.body.appendChild(root)
  }

  private make(prefix: string, source: Source) {
    const fn = makeSource(prefix, this.event.state, source.handler, (prefix, event, data) => {
      const channel = prefix + "." + event

      this.event.emit(channel, data)
    })

    if (fn) {
      this.clearFns.push(fn)
    }
  }

  public open() {
    this.components.forEach((component) => {
      try {
        const fn = component.init(this.event, this.ctx)

        this.clearFns.push(fn)
      } catch (_error) {}
    })

    this.make("compiler", CompilerSource)
    this.make("runtime", RuntimeSource)
    this.make("misc", MiscSource)

    init(this.rootCreated!, this.ctx)
  }

  public clear() {
    try {
      this.clearFns.forEach((fn) => {
        fn && fn()
      })
    } catch (_error) {}

    this.ctx.elements = []

    this.clearFns = []
  }
}
