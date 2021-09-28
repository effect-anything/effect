import React, { FunctionComponent } from "react"
import { Dialog } from "../components/Dialog/Dialog"
import { DialogBody } from "../components/Dialog/DialogBody"
import { DialogContent } from "../components/Dialog/DialogContent"
import { DialogHeader } from "../components/Dialog/DialogHeader"
import { Overlay } from "../components/Overlay/Overlay"
import { useErrorControl } from "../components/useErrorControl"
import { ErrorRecord } from "../type"
import { ErrorHeader } from "./ErrorHeader"
import { ErrorItems } from "./ErrorItem"

interface CompilerErrorsProps {
  errors: ErrorRecord[]
  warnings: ErrorRecord[]
}

const CompilerErrors: FunctionComponent<CompilerErrorsProps> = ({ errors, warnings }) => {
  const { activeError, activeIndex, next, previous } = useErrorControl(errors)

  return (
    <Overlay fixed>
      <Dialog>
        <DialogContent>
          <DialogHeader>
            <ErrorHeader
              count={errors.length}
              error={activeError}
              activeIndex={activeIndex}
              onNext={next}
              onPrevious={previous}
            />
          </DialogHeader>
          <DialogBody>{activeError && <ErrorItems status="ok" error={activeError} />}</DialogBody>
        </DialogContent>
      </Dialog>
    </Overlay>
  )
}

export default CompilerErrors
