import fs from "fs/promises"
import { accessSync } from "fs"
import path from "path"

const exists = (p: string) => {
  try {
    accessSync(p)

    return true
  } catch (error) {
    return false
  }
}

const loadPackageJson = (cwd: string) =>
  fs.readFile(path.resolve(cwd, "./package.json"), "utf8").then((content) => JSON.parse(content))

const getModules = (content: any) => content?.config?.modules || []

const getSide = (content: any) => content?.config?.side || []

function carry(s: string, root: any, target: any) {
  if (s in root) {
    target[s] = root[s]
  }
}

const getProjectExports = (outputPath: string, modules: string[], exports: any) => {
  const f = (hasDirectory: boolean, m: string) => {
    exports[`./${m}`] = {}

    if (hasDirectory) {
      if (exists(`./${outputPath}/${m}/index.js`)) {
        exports[`./${m}`].require = `./${m}/index.js`
      }

      if (exists(`./${outputPath}/_esm/${m}/index.js`)) {
        exports[`./${m}`].module = `./_esm/${m}/index.js`
      }
    } else {
      if (exists(`./${outputPath}/${m}.js`)) {
        exports[`./${m}`].require = `./${m}.js`
      }

      if (exists(`./${outputPath}/_esm/${m}.js`)) {
        exports[`./${m}`].module = `./_esm/${m}.js`
      }
    }

    if (exports[`./${m}`].require) {
      exports[`./${m}`].default = exports[`./${m}`].require
      delete exports[`./${m}`].require
    } else if (exports[`./${m}`].module) {
      exports[`./${m}`].default = exports[`./${m}`].module
      delete exports[`./${m}`].module
    }
    if (Object.keys(exports[`./${m}`]).length === 0) {
      delete exports[`./${m}`]
    }
  }

  return modules.map((m: string) => {
    return fs
      .stat(`./${outputPath}/${m}`)
      .then((stat) => {
        const hasDirectory = stat.isDirectory()
        f(hasDirectory, m)
      })
      .catch(() => {
        f(false, m)
      })
  })
}

const writePackageJsonContent = async (cwd: string, output: string, outputPath: string) => {
  const content = await loadPackageJson(cwd)
  const modules = getModules(content)
  const side = getSide(content)

  const packageJson: any = {}

  carry("name", content, packageJson)
  carry("version", content, packageJson)
  carry("private", content, packageJson)
  carry("license", content, packageJson)
  carry("repository", content, packageJson)
  carry("dependencies", content, packageJson)
  carry("peerDependencies", content, packageJson)
  carry("gitHead", content, packageJson)
  carry("bin", content, packageJson)

  const exports: any = {}
  const mainExports: any = {}

  if (exists(`./${outputPath}/_esm/index.js`)) {
    mainExports.module = `./_esm/index.js`
  }
  if (exists(`./${outputPath}/index.js`)) {
    mainExports.require = `./index.js`
  }

  if (mainExports.require) {
    packageJson.main = mainExports.require
  } else if (mainExports.module) {
    packageJson.main = mainExports.module
  }

  if (Object.keys(mainExports).length > 0) {
    exports["."] = mainExports

    if (exports["."].require) {
      exports["."].default = exports["."].require
      delete exports["."].require
    } else if (exports["."].module) {
      exports["."].default = exports["."].module
      delete exports["."].module
    }
  }

  await Promise.all(getProjectExports(outputPath, modules, exports))

  const str = JSON.stringify(
    {
      ...packageJson,
      publishConfig: {
        access: "public",
      },
      sideEffects: side.flatMap((m: string) => {
        const map = []
        if (exists(`./${outputPath}/${m}/index.js`)) {
          map.push(`./${m}/index.js`)
        }
        if (exists(`./${outputPath}/_esm/${m}/index.js`)) {
          map.push(`./_esm/${m}/index.js`)
        }
        return map
      }),
      exports,
    },
    null,
    2
  )

  await fs.writeFile(path.join(output, "package.json"), str)
}

export const pack = async (cwd: string, outputPath: string) => {
  const output = path.resolve(cwd, outputPath)

  const copyReadme = () => fs.copyFile(path.resolve(cwd, "./README.md"), path.join(output, "README.md"))

  // if (!exists(path.join(output, "_esm"))) {
  //   throw new Error("esm not found")
  // }

  await writePackageJsonContent(cwd, output, outputPath)

  await copyReadme()
}
