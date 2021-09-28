const innerFiles = require("../bundles/webpack/innerFiles")

console.log("getBundleMap")
const bundle5Map = innerFiles.getBundleMap()
Object.keys(bundle5Map).forEach((key) => {
  console.log(`${key}: ${bundle5Map[key]},`)
})

console.log("\ngetExternalsMap")
const bundle5External = innerFiles.getExternalsMap()
Object.keys(bundle5External).forEach((key) => {
  console.log(`${key}: ${bundle5External[key]},`)
})

innerFiles.generatePackageFiles()
