import { clone, reduce } from "ramda"

export type Fn<T> = ((state: T, args: any) => T) | ((state: T, args: any) => Promise<T>)

export class SerialTask<T> {
  private fns: Fn<T>[] = []

  constructor() {}

  public add(fn: Fn<T>) {
    this.fns.push(fn)

    return this
  }

  public async run(state: T, args?: any) {
    const taskResult = reduce<Fn<T>, Promise<T>>(
      (prev, next) => {
        const result = prev.then((result) => {
          return next(result, args)
        })

        return result
      },
      Promise.resolve(clone(state)),
      this.fns
    )

    return taskResult
  }
}
