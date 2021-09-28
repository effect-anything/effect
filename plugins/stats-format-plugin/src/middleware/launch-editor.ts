import { NextFunction, Request, Response } from "@effect-x/deps/compiled/express"

export const getLaunchEditorMiddleware = (options: any) => {
  function launchEditor(req: Request, res: Response, next: NextFunction) {
    next()
  }

  return launchEditor
}
