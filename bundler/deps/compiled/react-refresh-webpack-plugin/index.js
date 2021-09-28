/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 427:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"additionalProperties":false,"type":"object","definitions":{"Path":{"type":"string"},"MatchCondition":{"anyOf":[{"instanceof":"RegExp"},{"$ref":"#/definitions/Path"}]},"MatchConditions":{"type":"array","items":{"$ref":"#/definitions/MatchCondition"},"minItems":1},"ESModuleOptions":{"additionalProperties":false,"type":"object","properties":{"exclude":{"anyOf":[{"$ref":"#/definitions/MatchCondition"},{"$ref":"#/definitions/MatchConditions"}]},"include":{"anyOf":[{"$ref":"#/definitions/MatchCondition"},{"$ref":"#/definitions/MatchConditions"}]}}},"OverlayOptions":{"additionalProperties":false,"type":"object","properties":{"entry":{"anyOf":[{"const":false},{"$ref":"#/definitions/Path"}]},"module":{"anyOf":[{"const":false},{"$ref":"#/definitions/Path"}]},"sockIntegration":{"anyOf":[{"const":false},{"enum":["wds","whm","wps"]},{"$ref":"#/definitions/Path"}]},"sockHost":{"type":"string"},"sockPath":{"type":"string"},"sockPort":{"type":"number","minimum":0},"sockProtocol":{"enum":["http","https","ws","wss"]},"useURLPolyfill":{"type":"boolean"}}}},"properties":{"esModule":{"anyOf":[{"type":"boolean"},{"$ref":"#/definitions/ESModuleOptions"}]},"exclude":{"anyOf":[{"$ref":"#/definitions/MatchCondition"},{"$ref":"#/definitions/MatchConditions"}]},"forceEnable":{"type":"boolean"},"include":{"anyOf":[{"$ref":"#/definitions/MatchCondition"},{"$ref":"#/definitions/MatchConditions"}]},"library":{"type":"string"},"overlay":{"anyOf":[{"type":"boolean"},{"$ref":"#/definitions/OverlayOptions"}]}}}');

/***/ }),

/***/ 132:
/***/ ((module) => {

/**
 * Gets current bundle's global scope identifier for React Refresh.
 * @param {Record<string, string>} runtimeGlobals The Webpack runtime globals.
 * @returns {string} The React Refresh global scope within the Webpack bundle.
 */
module.exports.getRefreshGlobalScope = (runtimeGlobals) => {
  return `${runtimeGlobals.require || '__webpack_require__'}.$Refresh$`;
};

/**
 * Gets current Webpack version according to features on the compiler instance.
 * @param {import('webpack').Compiler} compiler The current Webpack compiler instance.
 * @returns {number} The current Webpack version.
 */
module.exports.getWebpackVersion = (compiler) => {
  if (!compiler.hooks) {
    throw new Error(`[ReactRefreshPlugin] Webpack version is not supported!`);
  }

  // Webpack v5+ implements compiler caching
  return 'cache' in compiler ? 5 : 4;
};


/***/ }),

/***/ 354:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { validate: validateOptions } = __nccwpck_require__(545);
const { getRefreshGlobalScope, getWebpackVersion } = __nccwpck_require__(132);
const {
  getAdditionalEntries,
  getIntegrationEntry,
  getRefreshGlobal,
  getSocketIntegration,
  injectRefreshEntry,
  injectRefreshLoader,
  makeRefreshRuntimeModule,
  normalizeOptions,
} = __nccwpck_require__(22);
const schema = __nccwpck_require__(427);

class ReactRefreshPlugin {
  /**
   * @param {import('./types').ReactRefreshPluginOptions} [options] Options for react-refresh-plugin.
   */
  constructor(options = {}) {
    validateOptions(schema, options, {
      name: 'React Refresh Plugin',
      baseDataPath: 'options',
    });

    /**
     * @readonly
     * @type {import('./types').NormalizedPluginOptions}
     */
    this.options = normalizeOptions(options);
  }

  /**
   * Applies the plugin.
   * @param {import('webpack').Compiler} compiler A webpack compiler object.
   * @returns {void}
   */
  apply(compiler) {
    // Skip processing in non-development mode, but allow manual force-enabling
    if (
      // Webpack do not set process.env.NODE_ENV, so we need to check for mode.
      // Ref: https://github.com/webpack/webpack/issues/7074
      (compiler.options.mode !== 'development' ||
        // We also check for production process.env.NODE_ENV,
        // in case it was set and mode is non-development (e.g. 'none')
        (process.env.NODE_ENV && process.env.NODE_ENV === 'production')) &&
      !this.options.forceEnable
    ) {
      return;
    }

    const webpackVersion = getWebpackVersion(compiler);
    const logger = compiler.getInfrastructureLogger(this.constructor.name);

    // Get Webpack imports from compiler instance (if available) -
    // this allow mono-repos to use different versions of Webpack without conflicts.
    const webpack = compiler.webpack || __nccwpck_require__(771);
    const {
      DefinePlugin,
      EntryDependency,
      EntryPlugin,
      ModuleFilenameHelpers,
      NormalModule,
      ProvidePlugin,
      RuntimeGlobals,
      Template,
    } = webpack;

    // Inject react-refresh context to all Webpack entry points.
    // This should create `EntryDependency` objects when available,
    // and fallback to patching the `entry` object for legacy workflows.
    const addEntries = getAdditionalEntries({
      devServer: compiler.options.devServer,
      options: this.options,
    });
    if (EntryPlugin) {
      // Prepended entries does not care about injection order,
      // so we can utilise EntryPlugin for simpler logic.
      addEntries.prependEntries.forEach((entry) => {
        new EntryPlugin(compiler.context, entry, { name: undefined }).apply(compiler);
      });

      const integrationEntry = getIntegrationEntry(this.options.overlay.sockIntegration);
      const socketEntryData = [];
      compiler.hooks.make.tap(
        { name: this.constructor.name, stage: Number.POSITIVE_INFINITY },
        (compilation) => {
          // Exhaustively search all entries for `integrationEntry`.
          // If found, mark those entries and the index of `integrationEntry`.
          for (const [name, entryData] of compilation.entries.entries()) {
            const index = entryData.dependencies.findIndex(
              (dep) => dep.request && dep.request.includes(integrationEntry)
            );
            if (index !== -1) {
              socketEntryData.push({ name, index });
            }
          }
        }
      );

      // Overlay entries need to be injected AFTER integration's entry,
      // so we will loop through everything in `finishMake` instead of `make`.
      // This ensures we can traverse all entry points and inject stuff with the correct order.
      addEntries.overlayEntries.forEach((entry, idx, arr) => {
        compiler.hooks.finishMake.tapPromise(
          { name: this.constructor.name, stage: Number.MIN_SAFE_INTEGER + (arr.length - idx - 1) },
          (compilation) => {
            // Only hook into the current compiler
            if (compilation.compiler !== compiler) {
              return Promise.resolve();
            }

            const injectData = socketEntryData.length ? socketEntryData : [{ name: undefined }];
            return Promise.all(
              injectData.map(({ name, index }) => {
                return new Promise((resolve, reject) => {
                  const options = { name };
                  const dep = EntryPlugin.createDependency(entry, options);
                  compilation.addEntry(compiler.context, dep, options, (err) => {
                    if (err) return reject(err);

                    // If the entry is not a global one,
                    // and we have registered the index for integration entry,
                    // we will reorder all entry dependencies to our desired order.
                    // That is, to have additional entries DIRECTLY behind integration entry.
                    if (name && typeof index !== 'undefined') {
                      const entryData = compilation.entries.get(name);
                      entryData.dependencies.splice(
                        index + 1,
                        0,
                        entryData.dependencies.splice(entryData.dependencies.length - 1, 1)[0]
                      );
                    }

                    resolve();
                  });
                });
              })
            ).then(() => {});
          }
        );
      });
    } else {
      compiler.options.entry = injectRefreshEntry(compiler.options.entry, addEntries);
    }

    // Inject necessary modules and variables to bundle's global scope
    const refreshGlobal = getRefreshGlobalScope(RuntimeGlobals || {});
    /** @type {Record<string, string | boolean>}*/
    const definedModules = {
      // Mapping of react-refresh globals to Webpack runtime globals
      $RefreshReg$: `${refreshGlobal}.register`,
      $RefreshSig$: `${refreshGlobal}.signature`,
      'typeof $RefreshReg$': 'function',
      'typeof $RefreshSig$': 'function',

      // Library mode
      __react_refresh_library__: JSON.stringify(
        Template.toIdentifier(
          this.options.library ||
            compiler.options.output.uniqueName ||
            compiler.options.output.library
        )
      ),
    };
    /** @type {Record<string, string>} */
    const providedModules = {
      __react_refresh_utils__: eval('require.resolve("@effect-x/deps/compiled/react-refresh-webpack-plugin/runtime/RefreshUtils.js")'),
    };

    if (this.options.overlay === false) {
      // Stub errorOverlay module so their calls can be erased
      definedModules.__react_refresh_error_overlay__ = false;
      definedModules.__react_refresh_polyfill_url__ = false;
      definedModules.__react_refresh_socket__ = false;
    } else {
      definedModules.__react_refresh_polyfill_url__ = this.options.overlay.useURLPolyfill || false;

      if (this.options.overlay.module) {
        providedModules.__react_refresh_error_overlay__ = require.resolve(
          this.options.overlay.module
        );
      }
      if (this.options.overlay.sockIntegration) {
        providedModules.__react_refresh_socket__ = getSocketIntegration(
          this.options.overlay.sockIntegration
        );
      }
    }

    new DefinePlugin(definedModules).apply(compiler);
    new ProvidePlugin(providedModules).apply(compiler);

    const match = ModuleFilenameHelpers.matchObject.bind(undefined, this.options);
    let loggedHotWarning = false;
    compiler.hooks.compilation.tap(
      this.constructor.name,
      (compilation, { normalModuleFactory }) => {
        // Only hook into the current compiler
        if (compilation.compiler !== compiler) {
          return;
        }

        // Tap into version-specific compilation hooks
        switch (webpackVersion) {
          case 4: {
            const outputOptions = compilation.mainTemplate.outputOptions;
            compilation.mainTemplate.hooks.require.tap(
              this.constructor.name,
              // Constructs the module template for react-refresh
              (source, chunk, hash) => {
                // Check for the output filename
                // This is to ensure we are processing a JS-related chunk
                let filename = outputOptions.filename;
                if (typeof filename === 'function') {
                  // Only usage of the `chunk` property is documented by Webpack.
                  // However, some internal Webpack plugins uses other properties,
                  // so we also pass them through to be on the safe side.
                  filename = filename({
                    contentHashType: 'javascript',
                    chunk,
                    hash,
                  });
                }

                // Check whether the current compilation is outputting to JS,
                // since other plugins can trigger compilations for other file types too.
                // If we apply the transform to them, their compilation will break fatally.
                // One prominent example of this is the HTMLWebpackPlugin.
                // If filename is falsy, something is terribly wrong and there's nothing we can do.
                if (!filename || !filename.includes('.js')) {
                  return source;
                }

                // Split template source code into lines for easier processing
                const lines = source.split('\n');
                // Webpack generates this line when the MainTemplate is called
                const moduleInitializationLineNumber = lines.findIndex((line) =>
                  line.includes('modules[moduleId].call(')
                );
                // Unable to find call to module execution -
                // this happens if the current module does not call MainTemplate.
                // In this case, we will return the original source and won't mess with it.
                if (moduleInitializationLineNumber === -1) {
                  return source;
                }

                const moduleInterceptor = Template.asString([
                  `${refreshGlobal}.setup(moduleId);`,
                  'try {',
                  Template.indent(lines[moduleInitializationLineNumber]),
                  '} finally {',
                  Template.indent(`${refreshGlobal}.cleanup(moduleId);`),
                  '}',
                ]);

                return Template.asString([
                  ...lines.slice(0, moduleInitializationLineNumber),
                  '',
                  outputOptions.strictModuleExceptionHandling
                    ? Template.indent(moduleInterceptor)
                    : moduleInterceptor,
                  '',
                  ...lines.slice(moduleInitializationLineNumber + 1, lines.length),
                ]);
              }
            );

            compilation.mainTemplate.hooks.requireExtensions.tap(
              this.constructor.name,
              // Setup react-refresh globals as extensions to Webpack's require function
              (source) => {
                return Template.asString([source, '', getRefreshGlobal(Template)]);
              }
            );

            normalModuleFactory.hooks.afterResolve.tap(
              this.constructor.name,
              // Add react-refresh loader to process files that matches specified criteria
              (data) => {
                return injectRefreshLoader(data, {
                  match,
                  options: { const: false, esModule: false },
                });
              }
            );

            compilation.hooks.normalModuleLoader.tap(
              // `Number.POSITIVE_INFINITY` ensures this check will run only after all other taps
              { name: this.constructor.name, stage: Number.POSITIVE_INFINITY },
              // Check for existence of the HMR runtime -
              // it is the foundation to this plugin working correctly
              (context) => {
                if (!context.hot && !loggedHotWarning) {
                  logger.warn(
                    [
                      'Hot Module Replacement (HMR) is not enabled!',
                      'React Refresh requires HMR to function properly.',
                    ].join(' ')
                  );
                  loggedHotWarning = true;
                }
              }
            );

            break;
          }
          case 5: {
            // Set factory for EntryDependency which is used to initialise the module
            compilation.dependencyFactories.set(EntryDependency, normalModuleFactory);

            const ReactRefreshRuntimeModule = makeRefreshRuntimeModule(webpack);
            compilation.hooks.additionalTreeRuntimeRequirements.tap(
              this.constructor.name,
              // Setup react-refresh globals with a Webpack runtime module
              (chunk, runtimeRequirements) => {
                runtimeRequirements.add(RuntimeGlobals.interceptModuleExecution);
                runtimeRequirements.add(RuntimeGlobals.moduleCache);
                runtimeRequirements.add(refreshGlobal);
                compilation.addRuntimeModule(chunk, new ReactRefreshRuntimeModule());
              }
            );

            normalModuleFactory.hooks.afterResolve.tap(
              this.constructor.name,
              // Add react-refresh loader to process files that matches specified criteria
              (resolveData) => {
                injectRefreshLoader(resolveData.createData, {
                  match,
                  options: {
                    const: compilation.runtimeTemplate.supportsConst(),
                    esModule: this.options.esModule,
                  },
                });
              }
            );

            NormalModule.getCompilationHooks(compilation).loader.tap(
              // `Infinity` ensures this check will run only after all other taps
              { name: this.constructor.name, stage: Infinity },
              // Check for existence of the HMR runtime -
              // it is the foundation to this plugin working correctly
              (context) => {
                if (!context.hot && !loggedHotWarning) {
                  logger.warn(
                    [
                      'Hot Module Replacement (HMR) is not enabled!',
                      'React Refresh requires HMR to function properly.',
                    ].join(' ')
                  );
                  loggedHotWarning = true;
                }
              }
            );

            break;
          }
          default: {
            // Do nothing - this should be an impossible case
          }
        }
      }
    );
  }
}

module.exports.ReactRefreshPlugin = ReactRefreshPlugin;
module.exports = ReactRefreshPlugin;


/***/ }),

/***/ 286:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const querystring = __nccwpck_require__(838);

/**
 * @typedef {Object} AdditionalEntries
 * @property {string[]} prependEntries
 * @property {string[]} overlayEntries
 */

/**
 * Creates an object that contains two entry arrays: the prependEntries and overlayEntries
 * @param {Object} optionsContainer This is the container for the options to this function
 * @param {import('../types').NormalizedPluginOptions} optionsContainer.options Configuration options for this plugin.
 * @param {import('webpack').Compiler["options"]["devServer"]} [optionsContainer.devServer] The webpack devServer config
 * @returns {AdditionalEntries} An object that contains the Webpack entries for prepending and the overlay feature
 */
function getAdditionalEntries({ devServer, options }) {
  /** @type {Record<string, string | number>} */
  let resourceQuery = {};

  if (devServer) {
    const { sockHost, sockPath, sockPort, host, path, port, https, http2 } = devServer;

    (sockHost || host) && (resourceQuery.sockHost = sockHost ? sockHost : host);
    (sockPath || path) && (resourceQuery.sockPath = sockPath ? sockPath : path);
    (sockPort || port) && (resourceQuery.sockPort = sockPort ? sockPort : port);
    resourceQuery.sockProtocol = https || http2 ? 'https' : 'http';
  }

  if (options.overlay) {
    options.overlay.sockHost && (resourceQuery.sockHost = options.overlay.sockHost);
    options.overlay.sockPath && (resourceQuery.sockPath = options.overlay.sockPath);
    options.overlay.sockPort && (resourceQuery.sockPort = options.overlay.sockPort);
    options.overlay.sockProtocol && (resourceQuery.sockProtocol = options.overlay.sockProtocol);
  }

  // We don't need to URI encode the resourceQuery as it will be parsed by Webpack
  const queryString = querystring.stringify(resourceQuery, undefined, undefined, {
    /**
     * @param {string} string
     * @returns {string}
     */
    encodeURIComponent(string) {
      return string;
    },
  });

  const prependEntries = [
    // React-refresh runtime
    eval('require.resolve("@effect-x/deps/compiled/react-refresh-webpack-plugin/client/ReactRefreshEntry.js")'),
  ];

  const overlayEntries = [
    // Error overlay runtime
    options.overlay &&
      options.overlay.entry &&
      `${require.resolve(options.overlay.entry)}${queryString ? `?${queryString}` : ''}`,
  ].filter(Boolean);

  return { prependEntries, overlayEntries };
}

module.exports = getAdditionalEntries;


/***/ }),

/***/ 81:
/***/ ((module) => {

/**
 * Gets entry point of a supported socket integration.
 * @param {'wds' | 'whm' | 'wps' | string} integrationType A valid socket integration type or a path to a module.
 * @returns {string | undefined} Path to the resolved integration entry point.
 */
function getIntegrationEntry(integrationType) {
  let resolvedEntry;
  switch (integrationType) {
    case 'whm': {
      resolvedEntry = 'webpack-hot-middleware/client';
      break;
    }
    case 'wps': {
      resolvedEntry = 'webpack-plugin-serve/client';
      break;
    }
  }

  return resolvedEntry;
}

module.exports = getIntegrationEntry;


/***/ }),

/***/ 357:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { getRefreshGlobalScope } = __nccwpck_require__(132);

/**
 * @typedef {Object} RuntimeTemplate
 * @property {function(string, string[]): string} basicFunction
 * @property {function(): boolean} supportsConst
 * @property {function(string, string=): string} returningFunction
 */

/**
 * Generates the refresh global runtime template.
 * @param {import('webpack').Template} Template The template helpers.
 * @param {Record<string, string>} [RuntimeGlobals] The runtime globals.
 * @param {RuntimeTemplate} [RuntimeTemplate] The runtime template helpers.
 * @returns {string} The refresh global runtime template.
 */
function getRefreshGlobal(
  Template,
  RuntimeGlobals = {},
  RuntimeTemplate = {
    basicFunction(args, body) {
      return `function(${args}) {\n${Template.indent(body)}\n}`;
    },
    supportsConst() {
      return false;
    },
    returningFunction(returnValue, args = '') {
      return `function(${args}) { return ${returnValue}; }`;
    },
  }
) {
  const declaration = RuntimeTemplate.supportsConst() ? 'const' : 'var';
  const refreshGlobal = getRefreshGlobalScope(RuntimeGlobals);
  return Template.asString([
    `${refreshGlobal} = {`,
    Template.indent([
      // Lifecycle methods - They should be specific per module and restored after module execution.
      // These stubs ensure unwanted calls (e.g. unsupported patterns, broken transform) would not error out.
      // If the current module is processed by our loader,
      // they will be swapped in place during module initialisation by the `setup` method below.
      `register: ${RuntimeTemplate.returningFunction('undefined')},`,
      `signature: ${RuntimeTemplate.returningFunction(
        RuntimeTemplate.returningFunction('type', 'type')
      )},`,
      // Runtime - This should be a singleton and persist throughout the lifetime of the app.
      // This stub ensures calls to `runtime` would not error out.
      // If any module within the bundle is processed by our loader,
      // it will be swapped in place via an injected import.
      'runtime: {',
      Template.indent([
        `createSignatureFunctionForTransform: ${RuntimeTemplate.returningFunction(
          RuntimeTemplate.returningFunction('type', 'type')
        )},`,
        `register: ${RuntimeTemplate.returningFunction('undefined')}`,
      ]),
      '},',
      // Setup - This handles initialisation of the global runtime.
      // It should never be touched throughout the lifetime of the app.
      `setup: ${RuntimeTemplate.basicFunction('currentModuleId', [
        // Store all previous values for fields on `refreshGlobal` -
        // this allows proper restoration in the `cleanup` phase.
        `${declaration} prevModuleId = ${refreshGlobal}.moduleId;`,
        `${declaration} prevRegister = ${refreshGlobal}.register;`,
        `${declaration} prevSignature = ${refreshGlobal}.signature;`,
        `${declaration} prevCleanup = ${refreshGlobal}.cleanup;`,
        '',
        `${refreshGlobal}.moduleId = currentModuleId;`,
        '',
        `${refreshGlobal}.register = ${RuntimeTemplate.basicFunction('type, id', [
          `${declaration} typeId = currentModuleId + " " + id;`,
          `${refreshGlobal}.runtime.register(type, typeId);`,
        ])}`,
        '',
        `${refreshGlobal}.signature = ${RuntimeTemplate.returningFunction(
          `${refreshGlobal}.runtime.createSignatureFunctionForTransform()`
        )};`,
        '',
        `${refreshGlobal}.cleanup = ${RuntimeTemplate.basicFunction('cleanupModuleId', [
          // Only cleanup if the module IDs match.
          // In rare cases, it might get called in another module's `cleanup` phase.
          'if (currentModuleId === cleanupModuleId) {',
          Template.indent([
            `${refreshGlobal}.moduleId = prevModuleId;`,
            `${refreshGlobal}.register = prevRegister;`,
            `${refreshGlobal}.signature = prevSignature;`,
            `${refreshGlobal}.cleanup = prevCleanup;`,
          ]),
          '}',
        ])}`,
      ])}`,
    ]),
    '};',
  ]);
}

module.exports = getRefreshGlobal;


/***/ }),

/***/ 538:
/***/ ((module) => {

/**
 * Gets the socket integration to use for Webpack messages.
 * @param {'wds' | 'whm' | 'wps' | string} integrationType A valid socket integration type or a path to a module.
 * @returns {string} Path to the resolved socket integration module.
 */
function getSocketIntegration(integrationType) {
  let resolvedSocketIntegration;
  switch (integrationType) {
    case 'wds': {
      resolvedSocketIntegration = eval('require.resolve("@effect-x/deps/compiled/react-refresh-webpack-plugin/sockets/WDSSocket.js")');
      break;
    }
    case 'whm': {
      resolvedSocketIntegration = eval('require.resolve("@effect-x/deps/compiled/react-refresh-webpack-plugin/sockets/WHMEventSource.js")');
      break;
    }
    case 'wps': {
      resolvedSocketIntegration = eval('require.resolve("@effect-x/deps/compiled/react-refresh-webpack-plugin/sockets/WPSSocket.js")');
      break;
    }
    default: {
      resolvedSocketIntegration = require.resolve(integrationType);
      break;
    }
  }

  return eval('require.resolve("@effect-x/deps/compiled/react-refresh-webpack-plugin/sockets/WPSSocket.js")');
}

module.exports = getSocketIntegration;


/***/ }),

/***/ 22:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const getAdditionalEntries = __nccwpck_require__(286);
const getIntegrationEntry = __nccwpck_require__(81);
const getRefreshGlobal = __nccwpck_require__(357);
const getSocketIntegration = __nccwpck_require__(538);
const injectRefreshEntry = __nccwpck_require__(279);
const injectRefreshLoader = __nccwpck_require__(824);
const makeRefreshRuntimeModule = __nccwpck_require__(513);
const normalizeOptions = __nccwpck_require__(926);

module.exports = {
  getAdditionalEntries,
  getIntegrationEntry,
  getRefreshGlobal,
  getSocketIntegration,
  injectRefreshEntry,
  injectRefreshLoader,
  makeRefreshRuntimeModule,
  normalizeOptions,
};


/***/ }),

/***/ 279:
/***/ ((module) => {

/** @typedef {string | string[] | import('webpack').Entry} StaticEntry */
/** @typedef {StaticEntry | import('webpack').EntryFunc} WebpackEntry */

const EntryParseError = new Error(
  [
    '[ReactRefreshPlugin]',
    'Failed to parse the Webpack `entry` object!',
    'Please ensure the `entry` option in your Webpack config is specified.',
  ].join(' ')
);

/**
 * Webpack entries related to socket integrations.
 * They have to run before any code that sets up the error overlay.
 * @type {string[]}
 */
const socketEntries = [
  'webpack-dev-server/client',
  'webpack-hot-middleware/client',
  'webpack-plugin-serve/client',
  'react-dev-utils/webpackHotDevClient',
];

/**
 * Checks if a Webpack entry string is related to socket integrations.
 * @param {string} entry A Webpack entry string.
 * @returns {boolean} Whether the entry is related to socket integrations.
 */
function isSocketEntry(entry) {
  return socketEntries.some((socketEntry) => entry.includes(socketEntry));
}

/**
 * Injects an entry to the bundle for react-refresh.
 * @param {WebpackEntry} [originalEntry] A Webpack entry object.
 * @param {import('./getAdditionalEntries').AdditionalEntries} additionalEntries An object that contains the Webpack entries for prepending and the overlay feature
 * @returns {WebpackEntry} An injected entry object.
 */
function injectRefreshEntry(originalEntry, additionalEntries) {
  const { prependEntries, overlayEntries } = additionalEntries;

  // Single string entry point
  if (typeof originalEntry === 'string') {
    if (isSocketEntry(originalEntry)) {
      return [...prependEntries, originalEntry, ...overlayEntries];
    }

    return [...prependEntries, ...overlayEntries, originalEntry];
  }
  // Single array entry point
  if (Array.isArray(originalEntry)) {
    if (originalEntry.length === 0) {
      throw EntryParseError;
    }

    const socketEntryIndex = originalEntry.findIndex(isSocketEntry);

    let socketAndPrecedingEntries = [];
    if (socketEntryIndex !== -1) {
      socketAndPrecedingEntries = originalEntry.splice(0, socketEntryIndex + 1);
    }

    return [...prependEntries, ...socketAndPrecedingEntries, ...overlayEntries, ...originalEntry];
  }
  // Multiple entry points
  if (typeof originalEntry === 'object') {
    const entries = Object.entries(originalEntry);
    if (entries.length === 0) {
      throw EntryParseError;
    }

    return entries.reduce(
      (acc, [curKey, curEntry]) => ({
        ...acc,
        [curKey]:
          typeof curEntry === 'object' && curEntry.import
            ? {
                ...curEntry,
                import: injectRefreshEntry(curEntry.import, additionalEntries),
              }
            : injectRefreshEntry(curEntry, additionalEntries),
      }),
      {}
    );
  }
  // Dynamic entry points
  if (typeof originalEntry === 'function') {
    return (...args) =>
      Promise.resolve(originalEntry(...args)).then((resolvedEntry) =>
        injectRefreshEntry(resolvedEntry, additionalEntries)
      );
  }

  throw EntryParseError;
}

module.exports = injectRefreshEntry;
module.exports.socketEntries = socketEntries;


/***/ }),

/***/ 824:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const path = __nccwpck_require__(622);

/**
 * @callback MatchObject
 * @param {string} [str]
 * @returns {boolean}
 */

/**
 * @typedef {Object} InjectLoaderOptions
 * @property {MatchObject} match A function to include/exclude files to be processed.
 * @property {import('../../loader/types').ReactRefreshLoaderOptions} [options] Options passed to the loader.
 */

const resolvedLoader = eval('require.resolve("@effect-x/deps/compiled/react-refresh-webpack-plugin/loader/index.js")');

/**
 * Injects refresh loader to all JavaScript-like and user-specified files.
 * @param {*} moduleData Module factory creation data.
 * @param {InjectLoaderOptions} injectOptions Options to alter how the loader is injected.
 * @returns {*} The injected module factory creation data.
 */
function injectRefreshLoader(moduleData, injectOptions) {
  const { match, options } = injectOptions;

  if (
    // Include and exclude user-specified files
    match(moduleData.resource) &&
    // Skip react-refresh and the plugin's runtime utils to prevent self-referencing -
    // this is useful when using the plugin as a direct dependency,
    // or when node_modules are specified to be processed.
    !moduleData.resource.includes(path.dirname(require.resolve("@effect-x/deps/compiled/react-refresh/babel"))) &&
    !moduleData.resource.includes(eval('require.resolve("@effect-x/deps/compiled/react-refresh-webpack-plugin/runtime/RefreshUtils")')) &&
    // Check to prevent double injection
    !moduleData.loaders.find(({ loader }) => loader === eval('require.resolve("@effect-x/deps/compiled/react-refresh-webpack-plugin/loader/index.js")'))
  ) {
    // As we inject runtime code for each module,
    // it is important to run the injected loader after everything.
    // This way we can ensure that all code-processing have been done,
    // and we won't risk breaking tools like Flow or ESLint.
    moduleData.loaders.unshift({
      loader: eval('require.resolve("@effect-x/deps/compiled/react-refresh-webpack-plugin/loader/index.js")'),
      options,
    });
  }

  return moduleData;
}

module.exports = injectRefreshLoader;


/***/ }),

/***/ 513:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { getRefreshGlobalScope } = __nccwpck_require__(132);
const getRefreshGlobal = __nccwpck_require__(357);

/**
 * Makes a runtime module to intercept module execution for React Refresh.
 * @param {import('webpack')} webpack The Webpack exports.
 * @returns {ReactRefreshRuntimeModule} The runtime module class.
 */
function makeRefreshRuntimeModule(webpack) {
  return class ReactRefreshRuntimeModule extends webpack.RuntimeModule {
    constructor() {
      // Second argument is the `stage` for this runtime module -
      // we'll use the same stage as Webpack's HMR runtime module for safety.
      super('react refresh', webpack.RuntimeModule.STAGE_BASIC);
    }

    /**
     * @returns {string} runtime code
     */
    generate() {
      const { runtimeTemplate } = this.compilation;
      const refreshGlobal = getRefreshGlobalScope(webpack.RuntimeGlobals);
      return webpack.Template.asString([
        `${webpack.RuntimeGlobals.interceptModuleExecution}.push(${runtimeTemplate.basicFunction(
          'options',
          [
            `${
              runtimeTemplate.supportsConst() ? 'const' : 'var'
            } originalFactory = options.factory;`,
            `options.factory = ${runtimeTemplate.basicFunction(
              'moduleObject, moduleExports, webpackRequire',
              [
                `${refreshGlobal}.setup(options.id);`,
                'try {',
                webpack.Template.indent(
                  'originalFactory.call(this, moduleObject, moduleExports, webpackRequire);'
                ),
                '} finally {',
                webpack.Template.indent([
                  `if (typeof Promise !== 'undefined' && moduleObject.exports instanceof Promise) {`,
                  webpack.Template.indent([
                    // The exports of the module are re-assigned -
                    // this ensures anything coming after us would wait for `cleanup` to fire.
                    // This is particularly important because `cleanup` restores the refresh global,
                    // maintaining consistency for mutable variables like `moduleId`.
                    // This `.then` clause is a ponyfill of the `Promise.finally` API -
                    // it is only part of the spec after ES2018,
                    // but Webpack's top level await implementation support engines down to ES2015.
                    'options.module.exports = options.module.exports.then(',
                    webpack.Template.indent([
                      `${runtimeTemplate.basicFunction('result', [
                        `${refreshGlobal}.cleanup(options.id);`,
                        'return result;',
                      ])},`,
                      runtimeTemplate.basicFunction('reason', [
                        `${refreshGlobal}.cleanup(options.id);`,
                        'return Promise.reject(reason);',
                      ]),
                    ]),
                    `);`,
                  ]),
                  '} else {',
                  webpack.Template.indent(`${refreshGlobal}.cleanup(options.id)`),
                  '}',
                ]),
                '}',
              ]
            )}`,
          ]
        )})`,
        '',
        getRefreshGlobal(webpack.Template, webpack.RuntimeGlobals, runtimeTemplate),
      ]);
    }
  };
}

module.exports = makeRefreshRuntimeModule;


/***/ }),

/***/ 926:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const { d, n } = __nccwpck_require__(752);

/**
 * Normalizes the options for the plugin.
 * @param {import('../types').ReactRefreshPluginOptions} options Non-normalized plugin options.
 * @returns {import('../types').NormalizedPluginOptions} Normalized plugin options.
 */
const normalizeOptions = (options) => {
  d(options, 'exclude', /node_modules/i);
  d(options, 'include', /\.([cm]js|[jt]sx?|flow)$/i);
  d(options, 'forceEnable');
  d(options, 'library');

  n(options, 'overlay', (overlay) => {
    /** @type {import('../types').NormalizedErrorOverlayOptions} */
    const defaults = {
      entry: eval('require.resolve("@effect-x/deps/compiled/react-refresh-webpack-plugin/client/ErrorOverlayEntry.js")'),
      module: eval('require.resolve("@effect-x/deps/compiled/react-refresh-webpack-plugin/overlay/index.js")'),
      sockIntegration: 'wds',
    };

    if (overlay === false) {
      return false;
    }
    if (typeof overlay === 'undefined' || overlay === true) {
      return defaults;
    }

    d(overlay, 'entry', defaults.entry);
    d(overlay, 'module', defaults.module);
    d(overlay, 'sockIntegration', defaults.sockIntegration);
    d(overlay, 'sockHost');
    d(overlay, 'sockPath');
    d(overlay, 'sockPort');
    d(overlay, 'sockProtocol');
    d(options, 'useURLPolyfill');

    return overlay;
  });

  return options;
};

module.exports = normalizeOptions;


/***/ }),

/***/ 752:
/***/ ((module) => {

/**
 * Sets a constant default value for the property when it is undefined.
 * @template T
 * @template {keyof T} Property
 * @param {T} object An object.
 * @param {Property} property A property of the provided object.
 * @param {T[Property]} [defaultValue] The default value to set for the property.
 * @returns {T[Property]} The defaulted property value.
 */
const d = (object, property, defaultValue) => {
  if (typeof object[property] === 'undefined' && typeof defaultValue !== 'undefined') {
    object[property] = defaultValue;
  }
  return object[property];
};

/**
 * Resolves the value for a nested object option.
 * @template T
 * @template {keyof T} Property
 * @template Result
 * @param {T} object An object.
 * @param {Property} property A property of the provided object.
 * @param {function(T | undefined): Result} fn The handler to resolve the property's value.
 * @returns {Result} The resolved option value.
 */
const n = (object, property, fn) => {
  object[property] = fn(object[property]);
  return object[property];
};

module.exports = { d, n };


/***/ }),

/***/ 838:
/***/ ((module) => {

"use strict";
module.exports = require("@effect-x/deps/compiled/querystring");

/***/ }),

/***/ 609:
/***/ ((module) => {

"use strict";
module.exports = require("@effect-x/deps/compiled/react-refresh");

/***/ }),

/***/ 545:
/***/ ((module) => {

"use strict";
module.exports = require("@effect-x/deps/compiled/schema-utils3");

/***/ }),

/***/ 771:
/***/ ((module) => {

"use strict";
module.exports = require("@effect-x/deps/compiled/webpack");

/***/ }),

/***/ 622:
/***/ ((module) => {

"use strict";
module.exports = require("path");

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
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(354);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;