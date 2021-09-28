import { History } from "history"
import React, { Component, ComponentClass, FunctionComponent } from "react"
import { EventEmitter } from "events"
import { CoreCtx, CoreSetupFn } from "./type"

type Provider = FunctionComponent<any> | ComponentClass<any> | typeof Component

export function flatten(providers: [Provider, Record<string, unknown>][], init: any) {
  return providers.reduceRight((children, [Component, props]) => <Component {...props}>{children}</Component>, init)
}

export async function makeProviders<T extends CoreCtx<unknown>>(ctx: T, tasks: CoreSetupFn<T>[]) {
  for (const task of tasks) {
    await task(ctx)
  }

  return flatten(ctx.providers, null)
}

export type BootstrapRunArgs = {
  history: History
}

export function run<T>(
  { history, ...rest }: BootstrapRunArgs & T,
  tasks: CoreSetupFn<CoreCtx<BootstrapRunArgs & T>>[]
) {
  const ctx = {
    history: history,
    providers: [],
    event: new EventEmitter(),
    ...rest,
  } as unknown as CoreCtx<BootstrapRunArgs & T>

  return makeProviders(ctx, tasks)
}
