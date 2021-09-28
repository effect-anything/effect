import * as R from "@effect-x/deps/compiled/ramda"
import { ExtractError, CatchError } from "./extractError"

export interface Transformer<T = any, E extends ExtractError<T> = ExtractError<T>> {
  transform(error: E): E
}

export const transforms =
  <E extends CatchError, RE extends ExtractError<E>, T extends Transformer<RE>>(transformers: T[] = []) =>
  (errors: RE[] = []) => {
    const transform = (error: RE, transformer: T) => transformer.transform(error)

    const apply = (error: RE) => R.reduce(transform, error, transformers)

    return R.map(apply, errors)
  }
