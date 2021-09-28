declare function __webpack_init_sharing__(arg0: string): any
declare const __webpack_share_scopes__: any

export const getComponentExport = async (scope: string, module: string) => {
  // Initializes the share scope. This fills it with known provided modules from this build and all remotes
  await __webpack_init_sharing__("default")
  const container = window[scope] // or get the container somewhere else
  // Initialize the container, it may provide shared modules
  await container.init(__webpack_share_scopes__.default)
  const factory = await window[scope].get(module)

  return factory()
}

export const useDynamicScript = (args: any) => {
  const element = document.createElement("script")

  const promise = new Promise((resolve, reject) => {
    element.src = args.url
    element.type = "text/javascript"
    element.async = true

    element.onload = () => {
      resolve(args)
    }

    element.onerror = () => {
      reject(new Error(`Dynamic Script Error: ${args.url}`))
    }

    document.head.appendChild(element)
  })

  return {
    promise,
    remove: () => {
      console.log(`Dynamic Script Removed: ${args.url}`)
      document.head.removeChild(element)
    },
  }
}

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
