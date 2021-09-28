import React, { FunctionComponent } from "react"
import styled, { x } from "@xstyled/styled-components"
import { Link, NavLink, LinkProps } from "react-router-dom"
// import { system } from "@xstyled/system"

export const CustomLink = styled(Link)`
  border: 1px solid red;
  ${(props) => {
    return {
      color: props.theme.colors["red-500"],
      fontSize: props.theme.fontSizes.lg,
    }
  }}
`

export const ButtonLink: FunctionComponent<LinkProps> = ({ to, children }) => {
  console.log(to)

  return (
    <x.button color="blue-500" onClick={() => history.push(to)}>
      Icon {children}
    </x.button>
  )
}
