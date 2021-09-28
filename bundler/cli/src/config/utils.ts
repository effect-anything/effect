import path from "path"
import fs from "fs"

export function normalize(name: string) {
  name = "" + name
  name = name
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_/, "")
    .replace(/_$/, "")

  if (/^\d/.test(name)) {
    name = "_" + name
  }
  return name
}

export const normalizeProjectName = (name: string) => {
  return name.replace(/^@(\w+|\w+-\w+)\//, "")
}

export const assetOutputJoin = (...paths: string[]) => {
  return path.win32.join(...paths).replace(/\\/g, "/")
}

type EnvType = {
  string: string
  number: number
  boolean: boolean
  array: string[]
}

export const parseEnv = <K extends keyof EnvType, T extends EnvType[K]>(val: string, toType: K): T => {
  switch (toType) {
    case "string":
      return val as T
    case "number":
      return parseInt(val, 10) as unknown as T
    case "boolean":
      // '0' or '1'
      // 'false' or 'true'
      if (val === "0" || val === "false") {
        return false as T
      }

      if (val === "1" || val === "true") {
        return true as T
      }

      return false as T
    case "array":
      return val.split(",") as unknown as T
    default:
      return val as T
  }
}

export const loadPkg = (path: string) => require(path)

export const fileExist = (pkgPath: string): boolean => {
  try {
    if (fs.existsSync(pkgPath)) {
      return true
    }

    return false
  } catch (_) {
    return false
  }
}
