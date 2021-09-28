exports.__esModule = true
exports.default = undefined

function assignWithGetter(source, webpack) {
  Object.keys(webpack).forEach((key) => {
    Object.defineProperty(source, key, {
      get() {
        return webpack[key]
      },
    })
  })
}

const ex = require("./5/webpack")()
Object.assign(exports, ex)
assignWithGetter(exports, ex.webpack)
exports.default = ex.webpack
