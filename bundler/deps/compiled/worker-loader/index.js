/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 457:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

"use strict";
// ESM COMPAT FLAG
__nccwpck_require__.r(__webpack_exports__);

// EXPORTS
__nccwpck_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ loader),
  "pitch": () => (/* binding */ pitch)
});

;// CONCATENATED MODULE: external "path"
const external_path_namespaceObject = require("path");
var external_path_default = /*#__PURE__*/__nccwpck_require__.n(external_path_namespaceObject);
;// CONCATENATED MODULE: external "@effect-x/deps/compiled/loader-utils"
const loader_utils_namespaceObject = require("@effect-x/deps/compiled/loader-utils");
;// CONCATENATED MODULE: external "@effect-x/deps/compiled/schema-utils3"
const schema_utils3_namespaceObject = require("@effect-x/deps/compiled/schema-utils3");
;// CONCATENATED MODULE: external "@effect-x/deps/compiled/webpack/NodeTargetPlugin"
const NodeTargetPlugin_namespaceObject = require("@effect-x/deps/compiled/webpack/NodeTargetPlugin");
var NodeTargetPlugin_default = /*#__PURE__*/__nccwpck_require__.n(NodeTargetPlugin_namespaceObject);
;// CONCATENATED MODULE: external "@effect-x/deps/compiled/webpack/SingleEntryPlugin"
const SingleEntryPlugin_namespaceObject = require("@effect-x/deps/compiled/webpack/SingleEntryPlugin");
var SingleEntryPlugin_default = /*#__PURE__*/__nccwpck_require__.n(SingleEntryPlugin_namespaceObject);
;// CONCATENATED MODULE: external "@effect-x/deps/compiled/webpack/WebWorkerTemplatePlugin"
const WebWorkerTemplatePlugin_namespaceObject = require("@effect-x/deps/compiled/webpack/WebWorkerTemplatePlugin");
var WebWorkerTemplatePlugin_default = /*#__PURE__*/__nccwpck_require__.n(WebWorkerTemplatePlugin_namespaceObject);
;// CONCATENATED MODULE: external "@effect-x/deps/compiled/webpack/ExternalsPlugin"
const ExternalsPlugin_namespaceObject = require("@effect-x/deps/compiled/webpack/ExternalsPlugin");
var ExternalsPlugin_default = /*#__PURE__*/__nccwpck_require__.n(ExternalsPlugin_namespaceObject);
;// CONCATENATED MODULE: ./bundles/node_modules/worker-loader/src/options.json
const options_namespaceObject = JSON.parse('{"type":"object","properties":{"worker":{"anyOf":[{"type":"string","minLength":1},{"type":"object","additionalProperties":false,"properties":{"type":{"type":"string","minLength":1},"options":{"additionalProperties":true,"type":"object"}},"required":["type"]}]},"publicPath":{"anyOf":[{"type":"string"},{"instanceof":"Function"}]},"filename":{"anyOf":[{"type":"string","minLength":1},{"instanceof":"Function"}]},"chunkFilename":{"type":"string","minLength":1},"inline":{"enum":["no-fallback","fallback"]},"esModule":{"type":"boolean"}},"additionalProperties":false}');
;// CONCATENATED MODULE: ./bundles/node_modules/worker-loader/src/utils.js


function getDefaultFilename(filename) {
  if (typeof filename === "function") {
    return filename;
  }

  return filename.replace(/\.([a-z]+)(\?.+)?$/i, ".worker.$1$2");
}

function getDefaultChunkFilename(chunkFilename) {
  return chunkFilename.replace(/\.([a-z]+)(\?.+)?$/i, ".worker.$1$2");
}

function getExternalsType(compilerOptions) {
  // For webpack@4
  if (compilerOptions.output.libraryTarget) {
    return compilerOptions.output.libraryTarget;
  }

  // For webpack@5
  if (compilerOptions.externalsType) {
    return compilerOptions.externalsType;
  }

  if (compilerOptions.output.library) {
    return compilerOptions.output.library.type;
  }

  if (compilerOptions.output.module) {
    return "module";
  }

  return "var";
}

function workerGenerator(loaderContext, workerFilename, workerSource, options) {
  let workerConstructor;
  let workerOptions;

  if (typeof options.worker === "undefined") {
    workerConstructor = "Worker";
  } else if (typeof options.worker === "string") {
    workerConstructor = options.worker;
  } else {
    ({ type: workerConstructor, options: workerOptions } = options.worker);
  }

  const esModule =
    typeof options.esModule !== "undefined" ? options.esModule : true;
  const fnName = `${workerConstructor}_fn`;

  if (options.inline) {
    const InlineWorkerPath = (0,loader_utils_namespaceObject.stringifyRequest)(
      loaderContext,
      `!!${require.resolve('./inline.js')}`
    );

    let fallbackWorkerPath;

    if (options.inline === "fallback") {
      fallbackWorkerPath = `__webpack_public_path__ + ${JSON.stringify(
        workerFilename
      )}`;
    }

    return `
${
  esModule
    ? `import worker from ${InlineWorkerPath};`
    : `var worker = require(${InlineWorkerPath});`
}

${
  esModule ? "export default" : "module.exports ="
} function ${fnName}() {\n  return worker(${JSON.stringify(
      workerSource
    )}, ${JSON.stringify(workerConstructor)}, ${JSON.stringify(
      workerOptions
    )}, ${fallbackWorkerPath});\n}\n`;
  }

  return `${
    esModule ? "export default" : "module.exports ="
  } function ${fnName}() {\n  return new ${workerConstructor}(__webpack_public_path__ + ${JSON.stringify(
    workerFilename
  )}${workerOptions ? `, ${JSON.stringify(workerOptions)}` : ""});\n}\n`;
}

// Matches only the last occurrence of sourceMappingURL
const innerRegex = /\s*[#@]\s*sourceMappingURL\s*=\s*(.*?(?=[\s'"]|\\n|\*\/|$)(?:\\n)?)\s*/;

/* eslint-disable prefer-template */
const sourceMappingURLRegex = RegExp(
  "(?:" +
    "/\\*" +
    "(?:\\s*\r?\n(?://)?)?" +
    "(?:" +
    innerRegex.source +
    ")" +
    "\\s*" +
    "\\*/" +
    "|" +
    "//(?:" +
    innerRegex.source +
    ")" +
    ")" +
    "\\s*"
);

const sourceURLWebpackRegex = RegExp(
  "\\/\\/#\\ssourceURL=webpack-internal:\\/\\/\\/(.*?)\\\\n"
);
/* eslint-enable prefer-template */



;// CONCATENATED MODULE: ./bundles/node_modules/worker-loader/src/supportWebpack5.js


function runAsChild(
  loaderContext,
  workerContext,
  options,
  callback
) {
  workerContext.compiler.runAsChild((error, entries, compilation) => {
    if (error) {
      return callback(error);
    }

    if (entries[0]) {
      const [workerFilename] = [...entries[0].files];
      const cache = workerContext.compiler.getCache("worker-loader");
      const cacheIdent = workerFilename;
      const cacheETag = cache.getLazyHashedEtag(
        compilation.assets[workerFilename]
      );

      return cache.get(cacheIdent, cacheETag, (getCacheError, content) => {
        if (getCacheError) {
          return callback(getCacheError);
        }

        if (options.inline === "no-fallback") {
          // eslint-disable-next-line no-underscore-dangle, no-param-reassign
          delete loaderContext._compilation.assets[workerFilename];

          // TODO improve this, we should store generated source maps files for file in `assetInfo`
          // eslint-disable-next-line no-underscore-dangle
          if (loaderContext._compilation.assets[`${workerFilename}.map`]) {
            // eslint-disable-next-line no-underscore-dangle, no-param-reassign
            delete loaderContext._compilation.assets[`${workerFilename}.map`];
          }
        }

        if (content) {
          return callback(null, content);
        }

        let workerSource = compilation.assets[workerFilename].source();

        if (options.inline === "no-fallback") {
          // Remove `/* sourceMappingURL=url */` comment
          workerSource = workerSource.replace(sourceMappingURLRegex, "");

          // Remove `//# sourceURL=webpack-internal` comment
          workerSource = workerSource.replace(sourceURLWebpackRegex, "");
        }

        const workerCode = workerGenerator(
          loaderContext,
          workerFilename,
          workerSource,
          options
        );
        const workerCodeBuffer = Buffer.from(workerCode);

        return cache.store(
          cacheIdent,
          cacheETag,
          workerCodeBuffer,
          (storeCacheError) => {
            if (storeCacheError) {
              return callback(storeCacheError);
            }

            return callback(null, workerCodeBuffer);
          }
        );
      });
    }

    return callback(
      new Error(
        `Failed to compile web worker "${workerContext.request}" request`
      )
    );
  });
}

;// CONCATENATED MODULE: ./bundles/node_modules/worker-loader/src/supportWebpack4.js


function supportWebpack4_runAsChild(
  loaderContext,
  workerContext,
  options,
  callback
) {
  workerContext.compiler.runAsChild((error, entries, compilation) => {
    if (error) {
      return callback(error);
    }

    if (entries[0]) {
      // eslint-disable-next-line no-param-reassign, prefer-destructuring
      const workerFilename = entries[0].files[0];

      let workerSource = compilation.assets[workerFilename].source();

      if (options.inline === "no-fallback") {
        // eslint-disable-next-line no-underscore-dangle, no-param-reassign
        delete loaderContext._compilation.assets[workerFilename];

        // TODO improve it, we should store generated source maps files for file in `assetInfo`
        // eslint-disable-next-line no-underscore-dangle
        if (loaderContext._compilation.assets[`${workerFilename}.map`]) {
          // eslint-disable-next-line no-underscore-dangle, no-param-reassign
          delete loaderContext._compilation.assets[`${workerFilename}.map`];
        }

        // Remove `/* sourceMappingURL=url */` comment
        workerSource = workerSource.replace(sourceMappingURLRegex, "");

        // Remove `//# sourceURL=webpack-internal` comment
        workerSource = workerSource.replace(sourceURLWebpackRegex, "");
      }

      const workerCode = workerGenerator(
        loaderContext,
        workerFilename,
        workerSource,
        options
      );

      return callback(null, workerCode);
    }

    return callback(
      new Error(
        `Failed to compile web worker "${workerContext.request}" request`
      )
    );
  });
}

;// CONCATENATED MODULE: ./bundles/node_modules/worker-loader/src/index.js















let FetchCompileWasmPlugin;
let FetchCompileAsyncWasmPlugin;

// determine the version of webpack peer dependency
// eslint-disable-next-line global-require, import/no-unresolved
const useWebpack5 = __nccwpck_require__(401).version.startsWith("5.");

if (useWebpack5) {
  // eslint-disable-next-line global-require, import/no-unresolved
  FetchCompileWasmPlugin = __nccwpck_require__(896);
  // eslint-disable-next-line global-require, import/no-unresolved
  FetchCompileAsyncWasmPlugin = __nccwpck_require__(977);
} else {
  // eslint-disable-next-line global-require, import/no-unresolved
  FetchCompileWasmPlugin = __nccwpck_require__(699);
}

function loader() {}

function pitch(request) {
  this.cacheable(false);

  const options = (0,loader_utils_namespaceObject.getOptions)(this);

  (0,schema_utils3_namespaceObject.validate)(options_namespaceObject, options, {
    name: "Worker Loader",
    baseDataPath: "options",
  });

  const workerContext = {};
  const compilerOptions = this._compiler.options || {};
  const filename = options.filename
    ? options.filename
    : getDefaultFilename(compilerOptions.output.filename);
  const chunkFilename = options.chunkFilename
    ? options.chunkFilename
    : getDefaultChunkFilename(compilerOptions.output.chunkFilename);
  const publicPath = options.publicPath
    ? options.publicPath
    : compilerOptions.output.publicPath;

  workerContext.options = {
    filename,
    chunkFilename,
    publicPath,
    globalObject: "self",
  };

  workerContext.compiler = this._compilation.createChildCompiler(
    `worker-loader ${request}`,
    workerContext.options
  );

  new (WebWorkerTemplatePlugin_default())().apply(workerContext.compiler);

  if (this.target !== "webworker" && this.target !== "web") {
    new (NodeTargetPlugin_default())().apply(workerContext.compiler);
  }

  if (FetchCompileWasmPlugin) {
    new FetchCompileWasmPlugin({
      mangleImports: compilerOptions.optimization.mangleWasmImports,
    }).apply(workerContext.compiler);
  }

  if (FetchCompileAsyncWasmPlugin) {
    new FetchCompileAsyncWasmPlugin().apply(workerContext.compiler);
  }

  if (compilerOptions.externals) {
    new (ExternalsPlugin_default())(
      getExternalsType(compilerOptions),
      compilerOptions.externals
    ).apply(workerContext.compiler);
  }

  new (SingleEntryPlugin_default())(
    this.context,
    `!!${request}`,
    external_path_default().parse(this.resourcePath).name
  ).apply(workerContext.compiler);

  workerContext.request = request;

  const cb = this.async();

  if (
    workerContext.compiler.cache &&
    typeof workerContext.compiler.cache.get === "function"
  ) {
    runAsChild(this, workerContext, options, cb);
  } else {
    supportWebpack4_runAsChild(this, workerContext, options, cb);
  }
}


/***/ }),

/***/ 920:
/***/ ((module) => {

/* eslint-env browser */
/* eslint-disable no-undef, no-use-before-define, new-cap */

module.exports = (content, workerConstructor, workerOptions, url) => {
  const globalScope = self || window;
  try {
    try {
      let blob;

      try {
        // New API
        blob = new globalScope.Blob([content]);
      } catch (e) {
        // BlobBuilder = Deprecated, but widely implemented
        const BlobBuilder =
          globalScope.BlobBuilder ||
          globalScope.WebKitBlobBuilder ||
          globalScope.MozBlobBuilder ||
          globalScope.MSBlobBuilder;

        blob = new BlobBuilder();

        blob.append(content);

        blob = blob.getBlob();
      }

      const URL = globalScope.URL || globalScope.webkitURL;
      const objectURL = URL.createObjectURL(blob);
      const worker = new globalScope[workerConstructor](
        objectURL,
        workerOptions
      );

      URL.revokeObjectURL(objectURL);

      return worker;
    } catch (e) {
      return new globalScope[workerConstructor](
        `data:application/javascript,${encodeURIComponent(content)}`,
        workerOptions
      );
    }
  } catch (e) {
    if (!url) {
      throw Error("Inline worker is not supported");
    }

    return new globalScope[workerConstructor](url, workerOptions);
  }
};


/***/ }),

/***/ 699:
/***/ ((module) => {

module.exports = eval("require")("webpack/lib/web/FetchCompileWasmTemplatePlugin");


/***/ }),

/***/ 977:
/***/ ((module) => {

"use strict";
module.exports = require("@effect-x/deps/compiled/webpack/FetchCompileAsyncWasmPlugin");

/***/ }),

/***/ 896:
/***/ ((module) => {

"use strict";
module.exports = require("@effect-x/deps/compiled/webpack/FetchCompileWasmPlugin");

/***/ }),

/***/ 401:
/***/ ((module) => {

"use strict";
module.exports = require("@effect-x/deps/compiled/webpack/package");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__nccwpck_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__nccwpck_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nccwpck_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module doesn't tell about it's top-level declarations so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(457);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;