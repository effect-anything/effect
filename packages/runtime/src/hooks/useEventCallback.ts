import { useCallback, useEffect, useRef } from "react"

export const useEventCallback = <T extends (...args: any[]) => unknown>(fn: T, deps: ReadonlyArray<unknown>) => {
  const ref = useRef<T>(fn)

  useEffect(() => {
    ref.current = fn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, ...deps])

  return useCallback(
    (...args: any[]) => {
      const callback = ref.current
      // eslint-disable-next-line node/no-callback-literal
      callback(...args)
    },
    [ref]
  )
}
