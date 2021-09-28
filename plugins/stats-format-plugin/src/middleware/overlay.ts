import { promises as fs } from "fs"
import path from "path"
import * as R from "@effect-x/deps/compiled/ramda"
import { Compilation, Stats, Module } from "@effect-x/deps/compiled/webpack"
// @ts-expect-error
import { codeFrameColumns } from "@effect-x/deps/compiled/babel/code-frame"
import { NextFunction, Request, Response } from "@effect-x/deps/compiled/express"
import { RawSourceMap, SourceMapConsumer } from "@effect-x/deps/compiled/source-map"
import dataUriToBuffer, { MimeBuffer } from "@effect-x/deps/compiled/data-uri-to-buffer"
import type { WebpackDevMiddleware } from "webpack-dev-middleware"

interface StackFrame {
  file: string | null

  methodName: "<unknown>" | string

  arguments: string[]

  lineNumber: number | null

  column: number | null
}

type RequestBody = {
  frames: StackFrame[]
} | null

type OriginalStackFrameResponse = {
  originalStackFrame: StackFrame
  originalCodeFrame: string | null
}

type Source = null | {
  map(options?: any): RawSourceMap
}

type FileProtocol = "webpack-internal" | "url" | "url-hot" | "external-url" | "file" | undefined

// webpack-internal: throw error in some scope
// https://xx.xx/js/bundle.js  throw error in global scope
// file://  /xxx/xxx  throw error in node ssr
const getFileProtocol = (file: string | null): FileProtocol => {
  if (!file) {
    return
  }

  if (file.startsWith("webpack-internal:///")) {
    return "webpack-internal"
  }

  if (file.startsWith("file:")) {
    return "file"
  }

  if (file.endsWith(".hot-update.js")) {
    return "url-hot"
  }

  if (/^https?:\/\/\w+(\.\w+)*(:[0-9]+)?\/?(\/[.\w]*)*$/.test(file)) {
    return "url"
  }

  if (
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(file)
  ) {
    return "external-url"
  }
}

const getModuleSource = (compilation: Compilation, module: Module | undefined): Source => {
  if (!module) {
    return null
  }

  return (
    (compilation.codeGenerationResults.get(module, undefined).sources.get("javascript") as unknown as Source) ?? null
  )
}

const findOriginalSourcePositionAndContent = (
  consumer: SourceMapConsumer,
  position: { line: number; column: number | null }
) => {
  try {
    const sourcePosition = consumer.originalPositionFor({
      line: position.line,
      column: position.column ?? 0,
    })

    if (!sourcePosition.source) {
      return null
    }

    const sourceContent: string | null =
      consumer.sourceContentFor(sourcePosition.source, /* returnNullOnMissing */ true) ?? null

    return {
      sourcePosition,
      sourceContent,
    }
  } catch (error) {
    return null
  }
}

const getSourcePath = (source: string) => {
  // Webpack prefixes certain source paths with this path
  if (source.startsWith("webpack:///")) {
    return source.substring(11)
  }

  if (source.startsWith("webpack://")) {
    return source.substring(10)
  }

  return source
}

interface CreateOriginalStackFrameOptions {
  line: number
  column: number | null
  moduleId?: string
  rootDirectory: string
  frame: StackFrame | null
  consumer: SourceMapConsumer
}

export const createOriginalStackFrame = ({
  line,
  column,
  rootDirectory,
  frame,
  consumer,
}: CreateOriginalStackFrameOptions): OriginalStackFrameResponse | null => {
  const result = findOriginalSourcePositionAndContent(consumer, {
    line,
    column,
  })

  if (result === null) {
    return null
  }

  const { sourcePosition, sourceContent } = result

  if (!sourcePosition.source) {
    return null
  }

  const filePath = path.resolve(rootDirectory, getSourcePath(sourcePosition.source))

  const originalFrame: StackFrame = {
    file: sourceContent ? filePath : sourcePosition.source,
    lineNumber: sourcePosition.line,
    column: sourcePosition.column,
    methodName: frame?.methodName || "", // TODO: resolve original method name (?)
    arguments: [],
  }

  const originalCodeFrame: string | null =
    !(originalFrame.file?.includes("node_modules") ?? true) && sourceContent && sourcePosition.line
      ? (codeFrameColumns(
          sourceContent,
          {
            start: {
              line: sourcePosition.line,
              column: sourcePosition.column ?? 0,
            },
          },
          { forceColor: true }
        ) as string)
      : null

  return {
    originalStackFrame: originalFrame,
    originalCodeFrame,
  }
}

const findModuleId = (compilation: Compilation, module: Module) => {
  return compilation.chunkGraph.getModuleId(module)
}

const getSourceMapUrl = (fileContents: string): string | null => {
  const regex = /\/\/[#@] ?sourceMappingURL=([^\s'"]+)\s*$/gm
  let match = null

  for (;;) {
    const next = regex.exec(fileContents)

    if (next == null) {
      break
    }

    match = next
  }

  if (!(match && match[1])) {
    return null
  }

  return match[1].toString()
}

const getRawSourceMap = (fileContents: string) => {
  const sourceUrl = getSourceMapUrl(fileContents)

  if (!sourceUrl?.startsWith("data:")) {
    return null
  }

  let buffer: MimeBuffer

  try {
    buffer = dataUriToBuffer(sourceUrl)
  } catch (err) {
    console.error("Failed to parse source map URL:", err)
    return null
  }

  if (buffer.type !== "application/json") {
    console.error(`Unknown source map type: ${buffer.typeFull}.`)
    return null
  }

  try {
    return JSON.parse(buffer.toString())
  } catch {
    console.error("Failed to parse source map.")
    return null
  }
}

const normalizeId = (fileProtocol: FileProtocol, id: string) => {
  switch (fileProtocol) {
    case "url":
    case "url-hot":
      return id.replace(/https?:\/\/\w+(\.\w+)*(:[0-9]+)?/, "")
    case "webpack-internal":
      return id.replace("webpack-internal:///", "")
    case "file":
      return id.replace("file://", "")
    default:
      return id
  }
}

const getSourceMapFromWebpack =
  (stats: () => Stats | null) =>
  (moduleId: string): Promise<Source> => {
    // get source from webpack compilation
    const compilation = stats()?.compilation

    if (!compilation) {
      return Promise.resolve(null)
    }

    const module = [...compilation.modules].find((searchModule) => {
      return findModuleId(compilation, searchModule) === moduleId
    })

    return Promise.resolve(getModuleSource(compilation, module))
  }

const getSourceMapFromUrl =
  (middleware?: WebpackDevMiddleware) =>
  (file: string): Promise<Source> => {
    if (!middleware) {
      return Promise.resolve(null)
    }

    const sourceMapPath = middleware.getFilenameFromUrl(file + ".map")

    if (!sourceMapPath) {
      return Promise.resolve(null)
    }

    // @ts-expect-error
    const content = middleware.context.outputFileSystem.readFileSync(sourceMapPath, "utf8")

    return Promise.resolve({
      map() {
        return content
      },
    })
  }

const getSourceMapFromPath = (moduleId: string): Promise<Source> => {
  return fs
    .readFile(moduleId, "utf8")
    .catch(() => null)
    .then((content) => {
      if (content === null) {
        return null
      }

      const map = getRawSourceMap(content)

      if (map == null) {
        return null
      }

      return {
        map() {
          return map
        },
      }
    })
}

const cacheIfy = <T, C>(task: (_: T) => Promise<C>, id: T, cache: Map<T, C>): Promise<C> => {
  return new Promise((resolve, reject) => {
    if (cache.has(id)) {
      return resolve(cache.get(id)!)
    }

    return task(id)
      .then((ret) => {
        cache.set(id, ret)

        resolve(ret)
      })
      .catch(reject)
  })
}

interface OverlayMiddlewareOptions {
  root: string
  middleware: WebpackDevMiddleware
  stats: () => Stats | null
}

export const getOverlayMiddleware = (options: OverlayMiddlewareOptions) => {
  function overlayHandler(req: Request<undefined, any, RequestBody, undefined>, res: Response, next: NextFunction) {
    if (req.method !== "POST" && req.path !== "/__original-stack-frame") {
      return next()
    }

    if (req.body == null || req.body === undefined) {
      return res.status(400).end()
    }

    const getSourceById = (fileProtocol: FileProtocol, id: string, cache: Map<string, any>): Promise<void> => {
      let getSource: (id: string) => Promise<Source> = () => Promise.resolve(null)

      switch (fileProtocol) {
        case "webpack-internal":
          getSource = getSourceMapFromWebpack(options.stats)
          break
        case "url":
        case "url-hot":
          getSource = getSourceMapFromUrl(options.middleware)
          break
        case "file":
          getSource = getSourceMapFromPath
          break
      }

      const sourceTask = cacheIfy<string, Source>(getSource, id, cache)

      return sourceTask.then((source) => {
        if (!source || !source.map) {
          return
        }

        const consumerTask = cacheIfy<string, SourceMapConsumer>(
          () => Promise.resolve(new SourceMapConsumer(source.map())),
          id + "_consumer",
          cache
        )

        return consumerTask.then(() => {})
      })
    }

    const { frames } = req.body

    if (!frames || frames.length === 0) {
      return res.json([])
    }

    const makeFrames = (cache: Map<string, Source | SourceMapConsumer>) => {
      return frames.map((frame: StackFrame) => {
        if (!frame.file) {
          return Promise.resolve(null)
        }

        const fileProtocol = getFileProtocol(frame.file)

        if (!fileProtocol) {
          return Promise.resolve(null)
        }

        const moduleId = normalizeId(fileProtocol, frame.file)

        const consumer = cache.get(moduleId + "_consumer") as SourceMapConsumer

        if (!consumer) {
          return Promise.resolve(null)
        }

        const frameLine = parseInt(frame.lineNumber?.toString() ?? "", 10)

        let frameColumn: number | null = parseInt(frame.column?.toString() ?? "", 10)

        if (!frameColumn) {
          frameColumn = null
        }

        return createOriginalStackFrame({
          line: frameLine,
          column: frameColumn,
          consumer,
          frame,
          moduleId,
          rootDirectory: options.root,
        })
      })
    }

    const getSources = () => {
      const cache = new Map<string, Source | SourceMapConsumer>()

      const uniqFrames = R.uniqBy(R.prop("file"), frames)

      return Promise.all(
        uniqFrames.map((frame) => {
          if (!frame.file) {
            return Promise.resolve(undefined)
          }

          const fileProtocol = getFileProtocol(frame.file)

          const moduleId = normalizeId(fileProtocol, frame.file)

          return getSourceById(fileProtocol, moduleId, cache)
        })
      ).then(() => cache)
    }

    return getSources().then((cache) => {
      const results = makeFrames(cache)

      res.json(results)

      cache.clear()
    })
  }

  return overlayHandler
}
