import React from "react"
import type { FunctionComponent } from "react"
import { useLocation } from "react-router-dom"

export const DefaultNotFoundComponent: FunctionComponent = () => {
  const location = useLocation()

  return <div>404 NotFound: {location.pathname}</div>
}
