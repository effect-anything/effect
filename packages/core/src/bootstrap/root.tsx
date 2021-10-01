import { EventEmitter } from "events"
import { History } from "history"
import React, { Component, ComponentClass, FunctionComponent, lazy, ReactNode, Suspense } from "react"
import { CoreCtx, CoreSetupFn } from "./type"

export type Provider = FunctionComponent<any> | ComponentClass<any> | typeof Component

export function flatten(providers: [Provider, Record<string, unknown>][], init: any) {
  return providers.reduceRight((children, [Component, props]) => <Component {...props}>{children}</Component>, init)
}

export async function makeProviders<T extends CoreCtx<unknown>>(ctx: T, tasks: CoreSetupFn<T>[]) {
  for (const task of tasks) {
    await task(ctx)
  }

  return flatten(ctx.setupProviders, null)
}

interface RootProps {
  fallback: NonNullable<ReactNode> | null

  history: History

  setups: CoreSetupFn<CoreCtx & any>[]

  authProviders: ((s: CoreCtx & any) => any)[]

  dataProviders: any
}

export const Root: FunctionComponent<RootProps> = ({ fallback, history, setups, authProviders, dataProviders }) => {
  const ctx: CoreCtx<unknown> = {
    history: history,
    setupProviders: [],
    providers: new Map(),
    event: new EventEmitter(),
  }

  const makeApp = (x: any) => {
    const Cp = () => {
      return x
    }

    Cp.displayName = "RootApp"

    return Cp
  }

  const App = lazy(() => {
    const ps = authProviders

    ps.forEach((x) => {
      x(ctx)
    })

    return makeProviders<typeof ctx>(ctx, setups).then((x) => ({ default: makeApp(x) }))
  })

  return (
    <Suspense fallback={fallback}>
      <App />
    </Suspense>
  )
}
