export type BootstrapRunArgs = {}

// export function run<T>(
//   { history, ...rest }: BootstrapRunArgs & T,
//   tasks: CoreSetupFn<CoreCtx<BootstrapRunArgs & T>>[]
// ) {
//   const ctx = {
//     history: history,
//     providers: [],
//     providerState: new Map(),
//     event: new EventEmitter(),
//     ...rest,
//   } as unknown as CoreCtx<BootstrapRunArgs & T>

//   return makeProviders(ctx, tasks)
// }
