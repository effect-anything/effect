import React from "react"
import { defaultTheme, ThemeProvider, Preflight } from "@xstyled/styled-components"

const theme = {
  ...defaultTheme,
  // Customize your theme here
}

export default function Provider({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <Preflight />
      {/* ... */}
      {children}
    </ThemeProvider>
  )
}
