#!/usr/bin/env node
import "v8-compile-cache"
import path from "path"
import yargs from "@effect-x/deps/compiled/yargs"
import { RettDevArgs, RettBuildArgs } from "../config/types"

// eslint-disable-next-line no-unused-expressions
yargs
  .scriptName("rett-cli")
  .command<RettDevArgs>(
    "dev",
    "dev mode",
    (argv) => {
      argv
        .option("cwd", {
          type: "string",
          description: "project dir",
          default: process.cwd(),
        })
        .option("env", {
          type: "string",
          description: "project env",
          default: "dev",
        })
        .option("exclude", {
          type: "array",
          description: "exclude project name",
          default: [],
        })
        .option("include", {
          type: "array",
          description: "include project name",
          default: [],
        })
        .option("open", {
          type: "boolean",
          description: "auto open browser",
          default: true,
        })
        .option("host", {
          type: "string",
          description: "host",
          default: "0.0.0.0",
        })
        .option("port", {
          type: "number",
          default: 3000,
          description: "devServer port",
        })
        .option("output", {
          type: "string",
          description: "output path",
          default: "/dist",
        })
        .option("hot", {
          type: "boolean",
          description: "enable hot reload",
          default: true,
        })
        .option("reactFastRefresh", {
          type: "boolean",
          description: "enable react fast refresh",
          default: true,
        })
        .option("proxyFile", {
          type: "string",
          description: "devServer proxy config file",
          default: "setupProxy.js",
        })
        .option("profile", {
          type: "boolean",
          description: "enable better profiling with react devtools",
          default: false,
        })
        .option("cache", {
          type: "boolean",
          description: "enable webpack compiler cache",
          default: true,
        })
        .option("publicPath", {
          type: "string",
          description: "public path",
          default: "/",
        })
        .option("check", {
          type: "boolean",
          description: "check eslint, typescript",
          default: false,
        })
        .option("webpackLogLevel", {
          type: "string",
          description: "webpack infrastructureLogging level",
          choices: ["none", "verbose", "error", "warn", "info", "log"],
          default: "none",
        })
        .option("sourceMap", {
          type: "boolean",
          default: true,
        })
        .option("analyze", {
          type: "boolean",
          description: "analyze",
          default: false,
        })
        .option("measure", {
          type: "boolean",
          description: "measure",
          default: false,
        })
        .option("debug", {
          type: "boolean",
          default: false,
        })
    },
    (args) => {
      args.cwd = path.isAbsolute(args.cwd) ? args.cwd : path.join(process.cwd(), args.cwd)

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("../command/dev").initDevCommand(args)
    }
  )
  .command<RettBuildArgs>(
    "build",
    "build mode",
    (argv) => {
      argv
        .option("cwd", {
          type: "string",
          description: "project dir",
          default: process.cwd(),
        })
        .option("env", {
          type: "string",
          description: "project env",
          default: "dev",
        })
        .option("exclude", {
          type: "array",
          description: "exclude project name",
          default: [],
        })
        .option("include", {
          type: "array",
          description: "exclude project name",
          default: [],
        })
        .option("output", {
          type: "string",
          description: "output path",
          default: "/dist",
        })
        .option("profile", {
          type: "boolean",
          description: "enable better profiling with react devtools",
          default: false,
        })
        .option("cache", {
          type: "boolean",
          description: "enable webpack compiler cache",
          default: true,
        })
        .option("publicPath", {
          type: "string",
          description: "public path",
          default: "/",
        })
        .option("check", {
          type: "boolean",
          description: "check eslint, typescript",
          default: false,
        })
        .option("webpackLogLevel", {
          type: "string",
          description: "webpack infrastructureLogging level",
          choices: ["none", "verbose", "error", "warn", "info", "log"],
          default: "none",
        })
        .option("sourceMap", {
          type: "boolean",
          default: false,
        })
        .option("analyze", {
          type: "boolean",
          description: "analyze",
          default: false,
        })
        .option("measure", {
          type: "boolean",
          description: "measure",
          default: false,
        })
        .option("debug", {
          type: "boolean",
          default: false,
        })
    },
    (args) => {
      args.cwd = path.isAbsolute(args.cwd) ? args.cwd : path.join(process.cwd(), args.cwd)

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require("../command/build").initBuildCommand(args)
    }
  )
  .help().argv
