import glob from "@effect-x/deps/compiled/glob"
import path from "path"
import os from "os"

const pathPosixDirname = path.posix.dirname
const isWin32 = os.platform() === "win32"

const slash = "/"
const backslash = /\\/g
const enclosure = /[{[].*[}\]]$/
const globby = /(^|[^\\])([{[]|\([^)]+$)/
const escaped = /\\([!*?|[\](){}])/g

/**
 * @param {string} str
 * @param {Object} opts
 * @param {boolean} [opts.flipBackslashes=true]
 */
export default function globParent(str: string, opts?: any) {
  const options = Object.assign({ flipBackslashes: true }, opts)

  // flip windows path separators
  if (options.flipBackslashes && isWin32 && str.indexOf(slash) < 0) {
    str = str.replace(backslash, slash)
  }

  // special case for strings ending in enclosure containing path separator
  if (enclosure.test(str)) {
    str += slash
  }

  // preserves full path in case of trailing path separator
  str += "a"

  // remove path parts that are globby
  do {
    str = pathPosixDirname(str)
  } while (glob.hasMagic(str) || globby.test(str))

  // remove escape chars and return result
  return str.replace(escaped, "$1")
}
