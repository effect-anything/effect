import React, { FunctionComponent, useEffect, useState } from "react"
import styled, { createGlobalStyle } from "styled-components/macro"
import { Event } from "../event"

const GlobalStyle = createGlobalStyle`
  :host {
    color: blue;
  }
`

const IndicatorStatusButton = styled.div`
  position: fixed;
  right: 10px;
  top: 10px;
  width: 50px;
  height: 50px;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2 ease-in;
`

type IndicatorStatusEnum = "IDLE" | "RUNNING" | "SUCCESS" | "ERROR"

interface IndicatorStatusProps {
  visible: boolean
  status: IndicatorStatusEnum
}

const IndicatorStatus: FunctionComponent<IndicatorStatusProps> = ({ visible, status }) => {
  return (
    <IndicatorStatusButton
      style={
        visible
          ? {
              opacity: 1,
              backgroundColor: "#acabab",
            }
          : {
              opacity: 0,
              backgroundColor: "#ffffff",
            }
      }
    />
  )
}

interface IndicatorOverlayProps {
  event: Event
}

const IndicatorOverlay: FunctionComponent<IndicatorOverlayProps> = ({ event }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleCompiling = () => {
      setVisible(true)
    }

    const handleCompilerDone = () => {
      setVisible(false)
    }

    // custom events
    event.on("INDICATOR.RUNNING", handleCompiling)
    event.on("INDICATOR.DONE", handleCompilerDone)

    return () => {
      event.removeListener("INDICATOR.RUNNING", handleCompiling)
      event.removeListener("INDICATOR.DONE", handleCompilerDone)

      // clear event listeners
      console.log("error overlay unmounted")
    }
  }, [])

  return (
    <>
      <GlobalStyle />
      <IndicatorStatus visible={visible} status="IDLE" />
    </>
  )
}

export default IndicatorOverlay
