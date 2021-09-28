import fs from "fs"
import path from "path"
import type { EventEmitter } from "events"
import type { BabelFileResult, TransformOptions } from "@effect-x/deps/compiled/babel"
import { transformFileAsync } from "@effect-x/deps/compiled/babel/core"

export function chmod(src: string, dest: string): void {
  try {
    fs.chmodSync(dest, fs.statSync(src).mode)
  } catch (err) {
    console.warn(`Cannot change permissions of ${dest}`)
  }
}

export function withExtension(filename: string, ext = ".js") {
  const newBasename = path.basename(filename, path.extname(filename)) + ext
  return path.join(path.dirname(filename), newBasename)
}

/**
 * source: https://github.com/fs-utils/fs-readdir-recursive
 */
export function readdirRecursive(
  root: string,
  filter: (name: string, index: number, dir: string) => boolean = noDotFiles,
  files: string[] = [],
  prefix = ""
) {
  const dir = path.join(root, prefix)
  if (!fs.existsSync(dir)) return files
  if (fs.statSync(dir).isDirectory())
    fs.readdirSync(dir)
      .filter(function (name, index) {
        return filter(name, index, dir)
      })
      .forEach(function (name) {
        readdirRecursive(root, filter, files, path.join(prefix, name))
      })
  else files.push(prefix)

  return files
}

function noDotFiles(x: string) {
  return x[0] !== "."
}

export function deleteDir(path: string): void {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      const curPath = path + "/" + file
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteDir(curPath)
      } else {
        // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

export function outputFileSync(filePath: string, data: string | Buffer): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, data)
}

export function compile(filename: string, opts: TransformOptions): Promise<BabelFileResult | null> {
  return transformFileAsync(filename, {
    ...opts,
  })
}

export function addSourceMappingUrl(code: string, loc: string): string {
  return code + "\n//# sourceMappingURL=" + path.basename(loc)
}

export function debounce(fn: () => void, time: number) {
  // eslint-disable-next-line no-undef
  let timer: NodeJS.Timeout

  function debounced() {
    clearTimeout(timer)
    timer = setTimeout(fn, time)
  }
  debounced.flush = () => {
    clearTimeout(timer)
    fn()
  }
  return debounced
}

export function whenEvent<T extends unknown>(name: string, fn: (args: T[]) => void, events: EventEmitter[]) {
  let len = events.length
  let args: T[] = []

  const listener = (data: T) => {
    len -= 1
    args.push(data)

    if (len === 0) {
      fn(args)
      len = events.length
      args = []
    }
  }

  events.forEach((event) => {
    event.on(name, listener)
  })

  return () => {
    events.forEach((event) => {
      event.removeListener(name, listener)
    })
  }
}

export function untilEvent<T extends unknown>(event: EventEmitter, name: string): Promise<T> {
  let res: ((value: T) => void) | undefined
  let rej: ((error: Error) => void) | undefined

  const promise = new Promise<T>((resolve, reject) => {
    res = resolve
    rej = reject
  }).finally(() => {
    event.removeListener(name, res!)
  })

  try {
    event.on(name, res!)
  } catch (error) {
    rej!(error as Error)
  }

  return promise
}

export function untilEvents<T>(events: EventEmitter[], name: string): Promise<T[]> {
  const promises = events.map((event) => untilEvent<T>(event, name))

  return Promise.all(promises)
}

export function booleanify(val: any): boolean | any {
  if (val === "true" || val === 1) {
    return true
  }

  if (val === "false" || val === 0 || !val) {
    return false
  }

  return val
}

export function collect(value: string | any, previousValue: Array<string> = []): Array<string> {
  // If the user passed the option with no value, like "babel file.js --presets", do nothing.
  if (typeof value !== "string") return previousValue

  const values = value.split(",")

  return previousValue ? previousValue.concat(values) : values
}

export function id(value: any): any {
  return value
}

export function notUndefined(fn: (v: any) => any, val: any) {
  return val === undefined ? undefined : fn(val)
}
