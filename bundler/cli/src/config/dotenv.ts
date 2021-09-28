import dotenv from "@effect-x/deps/compiled/dotenv"
import dotenvExpand from "@effect-x/deps/compiled/dotenv-expand"
import fs from "fs"
import { join } from "path"

export const initEnv = (cwd: string) => {
  const NODE_ENV = process.env.NODE_ENV

  const dotenvFiles = [
    `.env.${NODE_ENV}.local`,
    // Don't include `.env.local` for `test` environment
    // since normally you expect tests to produce the same
    // results for everyone
    NODE_ENV !== "test" && `.env.local`,
    `.env.${NODE_ENV}`,
    ".env",
  ].filter(Boolean) as string[]

  // https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
  dotenvFiles.forEach((envFilename) => {
    if (fs.existsSync(envFilename)) {
      const fullPath = join(cwd, envFilename)

      const myEnv = dotenv.config({
        path: fullPath,
      })

      dotenvExpand(myEnv)
    }
  })
}
