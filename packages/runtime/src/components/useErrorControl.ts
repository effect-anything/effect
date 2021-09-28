import React, { useState } from "react"

export const useErrorControl = <T>(errors: T[]) => {
  const [activeIndex, setActiveIndex] = useState(0)

  const previous = React.useCallback((e?: MouseEvent | TouchEvent) => {
    e?.preventDefault()

    setActiveIndex((v) => Math.max(0, v - 1))
  }, [])

  const next = React.useCallback(
    (e?: MouseEvent | TouchEvent) => {
      e?.preventDefault()

      setActiveIndex((v) => Math.max(0, Math.min(errors.length - 1, v + 1)))
    },
    [errors.length]
  )

  const activeError: T | undefined = errors[activeIndex]

  return {
    activeIndex: activeIndex + 1,
    activeError,
    previous,
    next,
  }
}
