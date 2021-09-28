import React, { FunctionComponent, useReducer } from "react"
import { render } from "react-dom"

const reducer = (state: any, event: any) => {
  switch (event.action) {
    case "addElement":
      return {
        ...state,
        elements: state.elements.concat(event.payload),
      }
    default:
      return state
  }
}

interface HotContainerProps {
  elements: any[]
}

const HotContainer: FunctionComponent<HotContainerProps> = ({ elements }) => {
  const [state, _dispatch] = useReducer(reducer, {
    elements: elements,
  })

  return state.elements
}

export const init = (target: HTMLElement, ctx: any) => {
  window.addEventListener("load", () => {
    window.requestAnimationFrame(() => {
      render(<HotContainer elements={ctx.elements} />, target)
    })
  })
}
