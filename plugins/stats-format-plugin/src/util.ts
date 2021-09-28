import * as R from "@effect-x/deps/compiled/ramda"

type EvolveFunction<T, E> = (current: T, object: E, context: any) => any

type P<C> = Partial<
  {
    [k in keyof Partial<C>]: EvolveFunction<C[k], C> | EvolveFunction<C[k], C>[]
  }
>

export const makeEvolve =
  <C extends Record<string, any>, T extends P<C> = P<C>>(t: T) =>
  (error: C, ctx: any): C => {
    const transform = (ef: EvolveFunction<any, C> | EvolveFunction<any, C>[] | undefined, value: any, err: C) =>
      R.reduce(
        (acc, elem) => {
          return elem(acc, err, ctx)
        },
        value,
        ef ? (Array.isArray(ef) ? ef : [ef]) : []
      )

    type K = keyof T
    type V = T[K]
    type Tuple = [K, V]

    const res = R.compose<Tuple[], Tuple[], Tuple[]>(
      R.map(([k, v]) => [k, transform(t[k], v, error)]),
      R.toPairs
    )(error as any)

    return R.fromPairs(res as any) as unknown as C
  }

type Predicate<T> = (error: T) => boolean

export const run =
  <T>(predicate: Predicate<T>, evolve: (error: T, ctx: any) => T) =>
  (error: T, ctx: any) => {
    if (!predicate(error)) {
      return error
    }

    return evolve(error, Object.assign({}, ctx))
  }
