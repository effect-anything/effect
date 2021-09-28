#!/usr/bin/env node
import yargs from "@effect-x/deps/compiled/yargs"
import path from "path"
import { Config } from "../config"

export interface PackEnv {
  cwd: string
  watch: boolean
}

// eslint-disable-next-line no-unused-expressions
yargs
  .command(
    "build",
    "babel transform",
    {
      watch: {
        type: "boolean",
        description: "watch mode",
        alias: "w",
        default: false,
      },
      cwd: {
        type: "string",
        description: "cwd",
        default: process.cwd(),
      },
      configPath: {
        type: "string",
        description: "config path",
        alias: "c",
        default: "pack.js",
      },
    },
    async (args) => {
      const configPath: string = path.isAbsolute(args.configPath)
        ? args.configPath
        : path.join(args.cwd, args.configPath)

      const ctxEnv = { cwd: args.cwd, watch: args.watch }

      const config = new Config(configPath, ctxEnv)

      config.run()
    }
  )
  .help().argv
