/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 887:
/***/ ((module) => {

"use strict";


module.exports = ansiHTML

// Reference to https://github.com/sindresorhus/ansi-regex
var _regANSI = /(?:(?:\u001b\[)|\u009b)(?:(?:[0-9]{1,3})?(?:(?:;[0-9]{0,3})*)?[A-M|f-m])|\u001b[A-M]/

var _defColors = {
  reset: ['fff', '000'], // [FOREGROUD_COLOR, BACKGROUND_COLOR]
  black: '000',
  red: 'ff0000',
  green: '209805',
  yellow: 'e8bf03',
  blue: '0000ff',
  magenta: 'ff00ff',
  cyan: '00ffee',
  lightgrey: 'f0f0f0',
  darkgrey: '888'
}
var _styles = {
  30: 'black',
  31: 'red',
  32: 'green',
  33: 'yellow',
  34: 'blue',
  35: 'magenta',
  36: 'cyan',
  37: 'lightgrey'
}
var _openTags = {
  '1': 'font-weight:bold', // bold
  '2': 'opacity:0.5', // dim
  '3': '<i>', // italic
  '4': '<u>', // underscore
  '8': 'display:none', // hidden
  '9': '<del>' // delete
}
var _closeTags = {
  '23': '</i>', // reset italic
  '24': '</u>', // reset underscore
  '29': '</del>' // reset delete
}

;[0, 21, 22, 27, 28, 39, 49].forEach(function (n) {
  _closeTags[n] = '</span>'
})

/**
 * Converts text with ANSI color codes to HTML markup.
 * @param {String} text
 * @returns {*}
 */
function ansiHTML (text) {
  // Returns the text if the string has no ANSI escape code.
  if (!_regANSI.test(text)) {
    return text
  }

  // Cache opened sequence.
  var ansiCodes = []
  // Replace with markup.
  var ret = text.replace(/\033\[(\d+)m/g, function (match, seq) {
    var ot = _openTags[seq]
    if (ot) {
      // If current sequence has been opened, close it.
      if (!!~ansiCodes.indexOf(seq)) { // eslint-disable-line no-extra-boolean-cast
        ansiCodes.pop()
        return '</span>'
      }
      // Open tag.
      ansiCodes.push(seq)
      return ot[0] === '<' ? ot : '<span style="' + ot + ';">'
    }

    var ct = _closeTags[seq]
    if (ct) {
      // Pop sequence
      ansiCodes.pop()
      return ct
    }
    return ''
  })

  // Make sure tags are closed.
  var l = ansiCodes.length
  ;(l > 0) && (ret += Array(l + 1).join('</span>'))

  return ret
}

/**
 * Customize colors.
 * @param {Object} colors reference to _defColors
 */
ansiHTML.setColors = function (colors) {
  if (typeof colors !== 'object') {
    throw new Error('`colors` parameter must be an Object.')
  }

  var _finalColors = {}
  for (var key in _defColors) {
    var hex = colors.hasOwnProperty(key) ? colors[key] : null
    if (!hex) {
      _finalColors[key] = _defColors[key]
      continue
    }
    if ('reset' === key) {
      if (typeof hex === 'string') {
        hex = [hex]
      }
      if (!Array.isArray(hex) || hex.length === 0 || hex.some(function (h) {
        return typeof h !== 'string'
      })) {
        throw new Error('The value of `' + key + '` property must be an Array and each item could only be a hex string, e.g.: FF0000')
      }
      var defHexColor = _defColors[key]
      if (!hex[0]) {
        hex[0] = defHexColor[0]
      }
      if (hex.length === 1 || !hex[1]) {
        hex = [hex[0]]
        hex.push(defHexColor[1])
      }

      hex = hex.slice(0, 2)
    } else if (typeof hex !== 'string') {
      throw new Error('The value of `' + key + '` property must be a hex string, e.g.: FF0000')
    }
    _finalColors[key] = hex
  }
  _setTags(_finalColors)
}

/**
 * Reset colors.
 */
ansiHTML.reset = function () {
  _setTags(_defColors)
}

/**
 * Expose tags, including open and close.
 * @type {Object}
 */
ansiHTML.tags = {}

if (Object.defineProperty) {
  Object.defineProperty(ansiHTML.tags, 'open', {
    get: function () { return _openTags }
  })
  Object.defineProperty(ansiHTML.tags, 'close', {
    get: function () { return _closeTags }
  })
} else {
  ansiHTML.tags.open = _openTags
  ansiHTML.tags.close = _closeTags
}

function _setTags (colors) {
  // reset all
  _openTags['0'] = 'font-weight:normal;opacity:1;color:#' + colors.reset[0] + ';background:#' + colors.reset[1]
  // inverse
  _openTags['7'] = 'color:#' + colors.reset[1] + ';background:#' + colors.reset[0]
  // dark grey
  _openTags['90'] = 'color:#' + colors.darkgrey

  for (var code in _styles) {
    var color = _styles[code]
    var oriColor = colors[color] || '000'
    _openTags[code] = 'color:#' + oriColor
    code = parseInt(code)
    _openTags[(code + 10).toString()] = 'background:#' + oriColor
  }
}

ansiHTML.reset()


/***/ }),

/***/ 437:
/***/ ((__unused_webpack_module, __webpack_exports__, __nccwpck_require__) => {

"use strict";
// ESM COMPAT FLAG
__nccwpck_require__.r(__webpack_exports__);

// EXTERNAL MODULE: ../../node_modules/webpack/hot/log.js
var log = __nccwpck_require__(436);
var log_default = /*#__PURE__*/__nccwpck_require__.n(log);
;// CONCATENATED MODULE: external "@effect-x/deps/compiled/strip-ansi"
const strip_ansi_namespaceObject = require("@effect-x/deps/compiled/strip-ansi");
var strip_ansi_default = /*#__PURE__*/__nccwpck_require__.n(strip_ansi_namespaceObject);
;// CONCATENATED MODULE: ./bundles/node_modules/webpack-dev-server4/client-src/modules/strip-ansi/index.js


/* harmony default export */ const strip_ansi = ((strip_ansi_default()));

;// CONCATENATED MODULE: external "url"
const external_url_namespaceObject = require("url");
var external_url_default = /*#__PURE__*/__nccwpck_require__.n(external_url_namespaceObject);
;// CONCATENATED MODULE: ./bundles/node_modules/webpack-dev-server4/client-src/utils/getCurrentScriptSource.js
function getCurrentScriptSource() {
  // `document.currentScript` is the most accurate way to find the current script,
  // but is not supported in all browsers.
  if (document.currentScript) {
    return document.currentScript.getAttribute("src");
  }

  // Fallback to getting all scripts running in the document.
  const scriptElements = document.scripts || [];
  const scriptElementsWithSrc = Array.prototype.filter.call(
    scriptElements,
    (element) => element.getAttribute("src")
  );

  if (scriptElementsWithSrc.length > 0) {
    const currentScript =
      scriptElementsWithSrc[scriptElementsWithSrc.length - 1];

    return currentScript.getAttribute("src");
  }

  // Fail as there was no script to use.
  throw new Error("[webpack-dev-server] Failed to get current script source.");
}

/* harmony default export */ const utils_getCurrentScriptSource = (getCurrentScriptSource);

;// CONCATENATED MODULE: ./bundles/node_modules/webpack-dev-server4/client-src/utils/parseURL.js



function parseURL(resourceQuery) {
  let options = {};

  if (typeof resourceQuery === "string" && resourceQuery !== "") {
    const searchParams = resourceQuery.substr(1).split("&");

    for (let i = 0; i < searchParams.length; i++) {
      const pair = searchParams[i].split("=");

      options[pair[0]] = decodeURIComponent(pair[1]);
    }
  } else {
    // Else, get the url from the <script> this file was called with.
    const scriptSource = utils_getCurrentScriptSource();

    if (scriptSource) {
      let scriptSourceURL;

      try {
        // The placeholder `baseURL` with `window.location.href`,
        // is to allow parsing of path-relative or protocol-relative URLs,
        // and will have no effect if `scriptSource` is a fully valid URL.
        scriptSourceURL = new URL(scriptSource, self.location.href);
      } catch (error) {
        // URL parsing failed, do nothing.
        // We will still proceed to see if we can recover using `resourceQuery`
      }

      if (scriptSourceURL) {
        options = scriptSourceURL;
        options.fromCurrentScript = true;
      }
    } else {
      options = external_url_default().parse(self.location.href, true, true);
      options.fromCurrentScript = true;
    }
  }

  return options;
}

/* harmony default export */ const utils_parseURL = (parseURL);

;// CONCATENATED MODULE: external "@effect-x/deps/compiled/webpack-dev-server/client/clients/WebSocketClient"
const WebSocketClient_namespaceObject = require("@effect-x/deps/compiled/webpack-dev-server/client/clients/WebSocketClient");
var WebSocketClient_default = /*#__PURE__*/__nccwpck_require__.n(WebSocketClient_namespaceObject);
;// CONCATENATED MODULE: ./bundles/node_modules/webpack-dev-server4/client-src/socket.js
/* global __webpack_dev_server_client__ */



// this WebsocketClient is here as a default fallback, in case the client is not injected
/* eslint-disable camelcase */
const Client =
  // eslint-disable-next-line camelcase, no-nested-ternary
  typeof __webpack_dev_server_client__ !== "undefined"
    ? // eslint-disable-next-line camelcase
      typeof __webpack_dev_server_client__.default !== "undefined"
      ? __webpack_dev_server_client__.default
      : __webpack_dev_server_client__
    : (WebSocketClient_default());
/* eslint-enable camelcase */

let retries = 0;
let client = null;

const socket = function initSocket(url, handlers) {
  client = new Client(url);

  client.onOpen(() => {
    retries = 0;
  });

  client.onClose(() => {
    if (retries === 0) {
      handlers.close();
    }

    // Try to reconnect.
    client = null;

    // After 10 retries stop trying, to prevent logspam.
    if (retries <= 10) {
      // Exponentially increase timeout to reconnect.
      // Respectfully copied from the package `got`.
      // eslint-disable-next-line no-mixed-operators, no-restricted-properties
      const retryInMs = 1000 * Math.pow(2, retries) + Math.random() * 100;

      retries += 1;

      setTimeout(() => {
        socket(url, handlers);
      }, retryInMs);
    }
  });

  client.onMessage((data) => {
    const message = JSON.parse(data);

    if (handlers[message.type]) {
      handlers[message.type](message.data);
    }
  });
};

/* harmony default export */ const client_src_socket = (socket);

// EXTERNAL MODULE: ./bundles/node_modules/ansi-html-community/index.js
var ansi_html_community = __nccwpck_require__(887);
var ansi_html_community_default = /*#__PURE__*/__nccwpck_require__.n(ansi_html_community);
;// CONCATENATED MODULE: external "@effect-x/deps/compiled/html-entities"
const html_entities_namespaceObject = require("@effect-x/deps/compiled/html-entities");
;// CONCATENATED MODULE: ./bundles/node_modules/webpack-dev-server4/client-src/overlay.js
// The error overlay is inspired (and mostly copied) from Create React App (https://github.com/facebookincubator/create-react-app)
// They, in turn, got inspired by webpack-hot-middleware (https://github.com/glenjamin/webpack-hot-middleware).




const colors = {
  reset: ["transparent", "transparent"],
  black: "181818",
  red: "E36049",
  green: "B3CB74",
  yellow: "FFD080",
  blue: "7CAFC2",
  magenta: "7FACCA",
  cyan: "C3C2EF",
  lightgrey: "EBE7E3",
  darkgrey: "6D7891",
};

let iframeContainerElement;
let containerElement;
let onLoadQueue = [];

ansi_html_community_default().setColors(colors);

function createContainer() {
  iframeContainerElement = document.createElement("iframe");
  iframeContainerElement.id = "webpack-dev-server-client-overlay";
  iframeContainerElement.src = "about:blank";
  iframeContainerElement.style.position = "fixed";
  iframeContainerElement.style.left = 0;
  iframeContainerElement.style.top = 0;
  iframeContainerElement.style.right = 0;
  iframeContainerElement.style.bottom = 0;
  iframeContainerElement.style.width = "100vw";
  iframeContainerElement.style.height = "100vh";
  iframeContainerElement.style.border = "none";
  iframeContainerElement.style.zIndex = 9999999999;
  iframeContainerElement.onload = () => {
    containerElement =
      iframeContainerElement.contentDocument.createElement("div");
    containerElement.id = "webpack-dev-server-client-overlay-div";
    containerElement.style.position = "fixed";
    containerElement.style.boxSizing = "border-box";
    containerElement.style.left = 0;
    containerElement.style.top = 0;
    containerElement.style.right = 0;
    containerElement.style.bottom = 0;
    containerElement.style.width = "100vw";
    containerElement.style.height = "100vh";
    containerElement.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
    containerElement.style.color = "#E8E8E8";
    containerElement.style.fontFamily = "Menlo, Consolas, monospace";
    containerElement.style.fontSize = "large";
    containerElement.style.padding = "2rem";
    containerElement.style.lineHeight = "1.2";
    containerElement.style.whiteSpace = "pre-wrap";
    containerElement.style.overflow = "auto";

    const headerElement = document.createElement("span");

    headerElement.innerText = "Compiled with problems:";

    const closeButtonElement = document.createElement("button");

    closeButtonElement.innerText = "X";
    closeButtonElement.style.background = "transparent";
    closeButtonElement.style.border = "none";
    closeButtonElement.style.fontSize = "20px";
    closeButtonElement.style.fontWeight = "bold";
    closeButtonElement.style.color = "white";
    closeButtonElement.style.cursor = "pointer";
    closeButtonElement.style.cssFloat = "right";
    closeButtonElement.style.styleFloat = "right";
    closeButtonElement.addEventListener("click", () => {
      hide();
    });

    containerElement.appendChild(headerElement);
    containerElement.appendChild(closeButtonElement);
    containerElement.appendChild(document.createElement("br"));
    containerElement.appendChild(document.createElement("br"));

    iframeContainerElement.contentDocument.body.appendChild(containerElement);

    onLoadQueue.forEach((onLoad) => {
      onLoad(containerElement);
    });
    onLoadQueue = [];

    iframeContainerElement.onload = null;
  };

  document.body.appendChild(iframeContainerElement);
}

function ensureOverlayExists(callback) {
  if (containerElement) {
    // Everything is ready, call the callback right away.
    callback(containerElement);

    return;
  }

  onLoadQueue.push(callback);

  if (iframeContainerElement) {
    return;
  }

  createContainer();
}

// Successful compilation.
function hide() {
  if (!iframeContainerElement) {
    return;
  }

  // Clean up and reset internal state.
  document.body.removeChild(iframeContainerElement);

  iframeContainerElement = null;
  containerElement = null;
}

function formatProblem(type, item) {
  let header = type === "warning" ? "WARNING" : "ERROR";
  let body = "";

  if (typeof item === "string") {
    body += item;
  } else {
    const file = item.file || "";
    // eslint-disable-next-line no-nested-ternary
    const moduleName = item.moduleName
      ? item.moduleName.indexOf("!") !== -1
        ? `${item.moduleName.replace(/^(\s|\S)*!/, "")} (${item.moduleName})`
        : `${item.moduleName}`
      : "";
    const loc = item.loc;

    header += `${
      moduleName || file
        ? ` in ${
            moduleName ? `${moduleName}${file ? ` (${file})` : ""}` : file
          }${loc ? ` ${loc}` : ""}`
        : ""
    }`;
    body += item.message || "";
  }

  return { header, body };
}

// Compilation with errors (e.g. syntax error or missing modules).
function show(type, messages) {
  ensureOverlayExists(() => {
    messages.forEach((message) => {
      const entryElement = document.createElement("div");
      const typeElement = document.createElement("span");
      const { header, body } = formatProblem(type, message);

      typeElement.innerText = header;
      typeElement.style.color = `#${colors.red}`;

      // Make it look similar to our terminal.
      const text = ansi_html_community_default()((0,html_entities_namespaceObject.encode)(body));
      const messageTextNode = document.createElement("div");

      messageTextNode.innerHTML = text;

      entryElement.appendChild(typeElement);
      entryElement.appendChild(document.createElement("br"));
      entryElement.appendChild(document.createElement("br"));
      entryElement.appendChild(messageTextNode);
      entryElement.appendChild(document.createElement("br"));
      entryElement.appendChild(document.createElement("br"));

      containerElement.appendChild(entryElement);
    });
  });
}



// EXTERNAL MODULE: ../../node_modules/webpack/lib/logging/runtime.js
var runtime = __nccwpck_require__(629);
;// CONCATENATED MODULE: ./bundles/node_modules/webpack-dev-server4/client-src/modules/logger/index.js


;// CONCATENATED MODULE: ./bundles/node_modules/webpack-dev-server4/client-src/utils/log.js


const log_name = "webpack-dev-server";
// default level is set on the client side, so it does not need
// to be set by the CLI or API
const defaultLevel = "info";

function setLogLevel(level) {
  runtime.configureDefaultLogger({ level });
}

setLogLevel(defaultLevel);

const log_log = runtime.getLogger(log_name);



;// CONCATENATED MODULE: ./bundles/node_modules/webpack-dev-server4/client-src/utils/sendMessage.js
/* global __resourceQuery WorkerGlobalScope */

// Send messages to the outside, so plugins can consume it.
function sendMsg(type, data) {
  if (
    typeof self !== "undefined" &&
    (typeof WorkerGlobalScope === "undefined" ||
      !(self instanceof WorkerGlobalScope))
  ) {
    self.postMessage({ type: `webpack${type}`, data }, "*");
  }
}

/* harmony default export */ const sendMessage = (sendMsg);

// EXTERNAL MODULE: ../../node_modules/webpack/hot/emitter.js
var emitter = __nccwpck_require__(659);
var emitter_default = /*#__PURE__*/__nccwpck_require__.n(emitter);
;// CONCATENATED MODULE: ./bundles/node_modules/webpack-dev-server4/client-src/utils/reloadApp.js
/* global __webpack_hash__ */




function reloadApp({ hot, liveReload }, status) {
  if (status.isUnloading) {
    return;
  }

  const { currentHash, previousHash } = status;
  const isInitial = currentHash.indexOf(previousHash) >= 0;

  if (isInitial) {
    return;
  }

  function applyReload(rootWindow, intervalId) {
    clearInterval(intervalId);

    log_log.info("App updated. Reloading...");

    rootWindow.location.reload();
  }

  const search = self.location.search.toLowerCase();
  const allowToHot = search.indexOf("webpack-dev-server-hot=false") === -1;
  const allowToLiveReload =
    search.indexOf("webpack-dev-server-live-reload=false") === -1;

  if (hot && allowToHot) {
    log_log.info("App hot update...");

    emitter_default().emit("webpackHotUpdate", status.currentHash);

    if (typeof self !== "undefined" && self.window) {
      // broadcast update to window
      self.postMessage(`webpackHotUpdate${status.currentHash}`, "*");
    }
  }
  // allow refreshing the page only if liveReload isn't disabled
  else if (liveReload && allowToLiveReload) {
    let rootWindow = self;

    // use parent window for reload (in case we're in an iframe with no valid src)
    const intervalId = self.setInterval(() => {
      if (rootWindow.location.protocol !== "about:") {
        // reload immediately if protocol is valid
        applyReload(rootWindow, intervalId);
      } else {
        rootWindow = rootWindow.parent;

        if (rootWindow.parent === rootWindow) {
          // if parent equals current window we've reached the root which would continue forever, so trigger a reload anyways
          applyReload(rootWindow, intervalId);
        }
      }
    });
  }
}

/* harmony default export */ const utils_reloadApp = (reloadApp);

;// CONCATENATED MODULE: ./bundles/node_modules/webpack-dev-server4/client-src/utils/createSocketURL.js


// We handle legacy API that is Node.js specific, and a newer API that implements the same WHATWG URL Standard used by web browsers
// Please look at https://nodejs.org/api/url.html#url_url_strings_and_url_objects
function createSocketURL(parsedURL) {
  let { hostname } = parsedURL;

  // Node.js module parses it as `::`
  // `new URL(urlString, [baseURLstring])` parses it as '[::]'
  const isInAddrAny =
    hostname === "0.0.0.0" || hostname === "::" || hostname === "[::]";

  // why do we need this check?
  // hostname n/a for file protocol (example, when using electron, ionic)
  // see: https://github.com/webpack/webpack-dev-server/pull/384
  if (
    isInAddrAny &&
    self.location.hostname &&
    self.location.protocol.indexOf("http") === 0
  ) {
    hostname = self.location.hostname;
  }

  let socketURLProtocol = parsedURL.protocol || self.location.protocol;

  // When https is used in the app, secure web sockets are always necessary because the browser doesn't accept non-secure web sockets.
  if (
    socketURLProtocol === "auto:" ||
    (hostname && isInAddrAny && self.location.protocol === "https:")
  ) {
    socketURLProtocol = self.location.protocol;
  }

  socketURLProtocol = socketURLProtocol.replace(
    /^(?:http|.+-extension|file)/i,
    "ws"
  );

  let socketURLAuth = "";

  // `new URL(urlString, [baseURLstring])` doesn't have `auth` property
  // Parse authentication credentials in case we need them
  if (parsedURL.username) {
    socketURLAuth = parsedURL.username;

    // Since HTTP basic authentication does not allow empty username,
    // we only include password if the username is not empty.
    if (parsedURL.password) {
      // Result: <username>:<password>
      socketURLAuth = socketURLAuth.concat(":", parsedURL.password);
    }
  }

  // In case the host is a raw IPv6 address, it can be enclosed in
  // the brackets as the brackets are needed in the final URL string.
  // Need to remove those as url.format blindly adds its own set of brackets
  // if the host string contains colons. That would lead to non-working
  // double brackets (e.g. [[::]]) host
  //
  // All of these web socket url params are optionally passed in through resourceQuery,
  // so we need to fall back to the default if they are not provided
  const socketURLHostname = (
    hostname ||
    self.location.hostname ||
    "localhost"
  ).replace(/^\[(.*)\]$/, "$1");

  let socketURLPort = parsedURL.port;

  if (!socketURLPort || socketURLPort === "0") {
    socketURLPort = self.location.port;
  }

  // If path is provided it'll be passed in via the resourceQuery as a
  // query param so it has to be parsed out of the querystring in order for the
  // client to open the socket to the correct location.
  let socketURLPathname = "/ws";

  if (parsedURL.pathname && !parsedURL.fromCurrentScript) {
    socketURLPathname = parsedURL.pathname;
  }

  return external_url_default().format({
    protocol: socketURLProtocol,
    auth: socketURLAuth,
    hostname: socketURLHostname,
    port: socketURLPort,
    pathname: socketURLPathname,
    slashes: true,
  });
}

/* harmony default export */ const utils_createSocketURL = (createSocketURL);

;// CONCATENATED MODULE: ./bundles/node_modules/webpack-dev-server4/client-src/index.js
var __resourceQuery = "";
/* global __resourceQuery, __webpack_hash__ */











const client_src_status = {
  isUnloading: false,
  // TODO Workaround for webpack v4, `__webpack_hash__` is not replaced without HotModuleReplacement
  // eslint-disable-next-line camelcase
  currentHash:  true ? __nccwpck_require__.h() : 0,
};
// console.log(__webpack_hash__);
const options = {
  hot: false,
  liveReload: false,
  progress: false,
  overlay: false,
};
const parsedResourceQuery = utils_parseURL(__resourceQuery);

if (parsedResourceQuery.hot === "true") {
  options.hot = true;

  log_log.info("Hot Module Replacement enabled.");
}

if (parsedResourceQuery["live-reload"] === "true") {
  options.liveReload = true;

  log_log.info("Live Reloading enabled.");
}

if (parsedResourceQuery.logging) {
  options.logging = parsedResourceQuery.logging;
}

function setAllLogLevel(level) {
  // This is needed because the HMR logger operate separately from dev server logger
  log_default().setLogLevel(
    level === "verbose" || level === "log" ? "info" : level
  );
  setLogLevel(level);
}

if (options.logging) {
  setAllLogLevel(options.logging);
}

self.addEventListener("beforeunload", () => {
  client_src_status.isUnloading = true;
});

const onSocketMessage = {
  hot() {
    if (parsedResourceQuery.hot === "false") {
      return;
    }

    options.hot = true;

    log_log.info("Hot Module Replacement enabled.");
  },
  liveReload() {
    if (parsedResourceQuery["live-reload"] === "false") {
      return;
    }

    options.liveReload = true;

    log_log.info("Live Reloading enabled.");
  },
  invalid() {
    log_log.info("App updated. Recompiling...");

    // Fixes #1042. overlay doesn't clear if errors are fixed but warnings remain.
    if (options.overlay) {
      hide();
    }

    sendMessage("Invalid");
  },
  hash(hash) {
    client_src_status.previousHash = client_src_status.currentHash;
    client_src_status.currentHash = hash;
  },
  logging: setAllLogLevel,
  overlay(value) {
    if (typeof document === "undefined") {
      return;
    }

    options.overlay = value;
  },
  progress(progress) {
    options.progress = progress;
  },
  "progress-update": function progressUpdate(data) {
    if (options.progress) {
      log_log.info(
        `${data.pluginName ? `[${data.pluginName}] ` : ""}${data.percent}% - ${
          data.msg
        }.`
      );
    }

    sendMessage("Progress", data);
  },
  "still-ok": function stillOk() {
    log_log.info("Nothing changed.");

    if (options.overlay) {
      hide();
    }

    sendMessage("StillOk");
  },
  ok() {
    sendMessage("Ok");

    if (options.overlay) {
      hide();
    }

    utils_reloadApp(options, client_src_status);
  },
  // TODO: remove in v5 in favor of 'static-changed'
  "content-changed": function contentChanged(file) {
    log_log.info(
      `${
        file ? `"${file}"` : "Content"
      } from static directory was changed. Reloading...`
    );

    self.location.reload();
  },
  "static-changed": function staticChanged(file) {
    log_log.info(
      `${
        file ? `"${file}"` : "Content"
      } from static directory was changed. Reloading...`
    );

    self.location.reload();
  },
  warnings(warnings) {
    log_log.warn("Warnings while compiling.");

    const printableWarnings = warnings.map((error) => {
      const { header, body } = formatProblem("warning", error);

      return `${header}\n${strip_ansi(body)}`;
    });

    sendMessage("Warnings", printableWarnings);

    for (let i = 0; i < printableWarnings.length; i++) {
      log_log.warn(printableWarnings[i]);
    }

    const needShowOverlayForWarnings =
      typeof options.overlay === "boolean"
        ? options.overlay
        : options.overlay && options.overlay.warnings;

    if (needShowOverlayForWarnings) {
      show("warning", warnings);
    }

    utils_reloadApp(options, client_src_status);
  },
  errors(errors) {
    log_log.error("Errors while compiling. Reload prevented.");

    const printableErrors = errors.map((error) => {
      const { header, body } = formatProblem("error", error);

      return `${header}\n${strip_ansi(body)}`;
    });

    sendMessage("Errors", printableErrors);

    for (let i = 0; i < printableErrors.length; i++) {
      log_log.error(printableErrors[i]);
    }

    const needShowOverlayForErrors =
      typeof options.overlay === "boolean"
        ? options.overlay
        : options.overlay && options.overlay.errors;

    if (needShowOverlayForErrors) {
      show("error", errors);
    }
  },
  error(error) {
    log_log.error(error);
  },
  close() {
    log_log.info("Disconnected!");

    if (options.overlay) {
      hide();
    }

    sendMessage("Close");
  },
};

const socketURL = utils_createSocketURL(parsedResourceQuery);

client_src_socket(socketURL, onSocketMessage);


/***/ }),

/***/ 380:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = __nccwpck_require__(437)


/***/ }),

/***/ 659:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

var EventEmitter = __nccwpck_require__(80);
module.exports = new EventEmitter();


/***/ }),

/***/ 436:
/***/ ((module) => {

var logLevel = "info";

function dummy() {}

function shouldLog(level) {
	var shouldLog =
		(logLevel === "info" && level === "info") ||
		(["info", "warning"].indexOf(logLevel) >= 0 && level === "warning") ||
		(["info", "warning", "error"].indexOf(logLevel) >= 0 && level === "error");
	return shouldLog;
}

function logGroup(logFn) {
	return function (level, msg) {
		if (shouldLog(level)) {
			logFn(msg);
		}
	};
}

module.exports = function (level, msg) {
	if (shouldLog(level)) {
		if (level === "info") {
			console.log(msg);
		} else if (level === "warning") {
			console.warn(msg);
		} else if (level === "error") {
			console.error(msg);
		}
	}
};

/* eslint-disable node/no-unsupported-features/node-builtins */
var group = console.group || dummy;
var groupCollapsed = console.groupCollapsed || dummy;
var groupEnd = console.groupEnd || dummy;
/* eslint-enable node/no-unsupported-features/node-builtins */

module.exports.group = logGroup(group);

module.exports.groupCollapsed = logGroup(groupCollapsed);

module.exports.groupEnd = logGroup(groupEnd);

module.exports.setLogLevel = function (level) {
	logLevel = level;
};

module.exports.formatError = function (err) {
	var message = err.message;
	var stack = err.stack;
	if (!stack) {
		return message;
	} else if (stack.indexOf(message) < 0) {
		return message + "\n" + stack;
	} else {
		return stack;
	}
};


/***/ }),

/***/ 225:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/



const LogType = Object.freeze({
	error: /** @type {"error"} */ ("error"), // message, c style arguments
	warn: /** @type {"warn"} */ ("warn"), // message, c style arguments
	info: /** @type {"info"} */ ("info"), // message, c style arguments
	log: /** @type {"log"} */ ("log"), // message, c style arguments
	debug: /** @type {"debug"} */ ("debug"), // message, c style arguments

	trace: /** @type {"trace"} */ ("trace"), // no arguments

	group: /** @type {"group"} */ ("group"), // [label]
	groupCollapsed: /** @type {"groupCollapsed"} */ ("groupCollapsed"), // [label]
	groupEnd: /** @type {"groupEnd"} */ ("groupEnd"), // [label]

	profile: /** @type {"profile"} */ ("profile"), // [profileName]
	profileEnd: /** @type {"profileEnd"} */ ("profileEnd"), // [profileName]

	time: /** @type {"time"} */ ("time"), // name, time as [seconds, nanoseconds]

	clear: /** @type {"clear"} */ ("clear"), // no arguments
	status: /** @type {"status"} */ ("status") // message, arguments
});

exports.LogType = LogType;

/** @typedef {typeof LogType[keyof typeof LogType]} LogTypeEnum */

const LOG_SYMBOL = Symbol("webpack logger raw log method");
const TIMERS_SYMBOL = Symbol("webpack logger times");
const TIMERS_AGGREGATES_SYMBOL = Symbol("webpack logger aggregated times");

class WebpackLogger {
	/**
	 * @param {function(LogTypeEnum, any[]=): void} log log function
	 * @param {function(string | function(): string): WebpackLogger} getChildLogger function to create child logger
	 */
	constructor(log, getChildLogger) {
		this[LOG_SYMBOL] = log;
		this.getChildLogger = getChildLogger;
	}

	error(...args) {
		this[LOG_SYMBOL](LogType.error, args);
	}

	warn(...args) {
		this[LOG_SYMBOL](LogType.warn, args);
	}

	info(...args) {
		this[LOG_SYMBOL](LogType.info, args);
	}

	log(...args) {
		this[LOG_SYMBOL](LogType.log, args);
	}

	debug(...args) {
		this[LOG_SYMBOL](LogType.debug, args);
	}

	assert(assertion, ...args) {
		if (!assertion) {
			this[LOG_SYMBOL](LogType.error, args);
		}
	}

	trace() {
		this[LOG_SYMBOL](LogType.trace, ["Trace"]);
	}

	clear() {
		this[LOG_SYMBOL](LogType.clear);
	}

	status(...args) {
		this[LOG_SYMBOL](LogType.status, args);
	}

	group(...args) {
		this[LOG_SYMBOL](LogType.group, args);
	}

	groupCollapsed(...args) {
		this[LOG_SYMBOL](LogType.groupCollapsed, args);
	}

	groupEnd(...args) {
		this[LOG_SYMBOL](LogType.groupEnd, args);
	}

	profile(label) {
		this[LOG_SYMBOL](LogType.profile, [label]);
	}

	profileEnd(label) {
		this[LOG_SYMBOL](LogType.profileEnd, [label]);
	}

	time(label) {
		this[TIMERS_SYMBOL] = this[TIMERS_SYMBOL] || new Map();
		this[TIMERS_SYMBOL].set(label, process.hrtime());
	}

	timeLog(label) {
		const prev = this[TIMERS_SYMBOL] && this[TIMERS_SYMBOL].get(label);
		if (!prev) {
			throw new Error(`No such label '${label}' for WebpackLogger.timeLog()`);
		}
		const time = process.hrtime(prev);
		this[LOG_SYMBOL](LogType.time, [label, ...time]);
	}

	timeEnd(label) {
		const prev = this[TIMERS_SYMBOL] && this[TIMERS_SYMBOL].get(label);
		if (!prev) {
			throw new Error(`No such label '${label}' for WebpackLogger.timeEnd()`);
		}
		const time = process.hrtime(prev);
		this[TIMERS_SYMBOL].delete(label);
		this[LOG_SYMBOL](LogType.time, [label, ...time]);
	}

	timeAggregate(label) {
		const prev = this[TIMERS_SYMBOL] && this[TIMERS_SYMBOL].get(label);
		if (!prev) {
			throw new Error(
				`No such label '${label}' for WebpackLogger.timeAggregate()`
			);
		}
		const time = process.hrtime(prev);
		this[TIMERS_SYMBOL].delete(label);
		this[TIMERS_AGGREGATES_SYMBOL] =
			this[TIMERS_AGGREGATES_SYMBOL] || new Map();
		const current = this[TIMERS_AGGREGATES_SYMBOL].get(label);
		if (current !== undefined) {
			if (time[1] + current[1] > 1e9) {
				time[0] += current[0] + 1;
				time[1] = time[1] - 1e9 + current[1];
			} else {
				time[0] += current[0];
				time[1] += current[1];
			}
		}
		this[TIMERS_AGGREGATES_SYMBOL].set(label, time);
	}

	timeAggregateEnd(label) {
		if (this[TIMERS_AGGREGATES_SYMBOL] === undefined) return;
		const time = this[TIMERS_AGGREGATES_SYMBOL].get(label);
		if (time === undefined) return;
		this[LOG_SYMBOL](LogType.time, [label, ...time]);
	}
}

exports.Logger = WebpackLogger;


/***/ }),

/***/ 636:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/



const { LogType } = __nccwpck_require__(225);

/** @typedef {import("../../declarations/WebpackOptions").FilterItemTypes} FilterItemTypes */
/** @typedef {import("../../declarations/WebpackOptions").FilterTypes} FilterTypes */
/** @typedef {import("./Logger").LogTypeEnum} LogTypeEnum */

/** @typedef {function(string): boolean} FilterFunction */

/**
 * @typedef {Object} LoggerConsole
 * @property {function(): void} clear
 * @property {function(): void} trace
 * @property {(...args: any[]) => void} info
 * @property {(...args: any[]) => void} log
 * @property {(...args: any[]) => void} warn
 * @property {(...args: any[]) => void} error
 * @property {(...args: any[]) => void=} debug
 * @property {(...args: any[]) => void=} group
 * @property {(...args: any[]) => void=} groupCollapsed
 * @property {(...args: any[]) => void=} groupEnd
 * @property {(...args: any[]) => void=} status
 * @property {(...args: any[]) => void=} profile
 * @property {(...args: any[]) => void=} profileEnd
 * @property {(...args: any[]) => void=} logTime
 */

/**
 * @typedef {Object} LoggerOptions
 * @property {false|true|"none"|"error"|"warn"|"info"|"log"|"verbose"} level loglevel
 * @property {FilterTypes|boolean} debug filter for debug logging
 * @property {LoggerConsole} console the console to log to
 */

/**
 * @param {FilterItemTypes} item an input item
 * @returns {FilterFunction} filter function
 */
const filterToFunction = item => {
	if (typeof item === "string") {
		const regExp = new RegExp(
			`[\\\\/]${item.replace(
				// eslint-disable-next-line no-useless-escape
				/[-[\]{}()*+?.\\^$|]/g,
				"\\$&"
			)}([\\\\/]|$|!|\\?)`
		);
		return ident => regExp.test(ident);
	}
	if (item && typeof item === "object" && typeof item.test === "function") {
		return ident => item.test(ident);
	}
	if (typeof item === "function") {
		return item;
	}
	if (typeof item === "boolean") {
		return () => item;
	}
};

/**
 * @enum {number}
 */
const LogLevel = {
	none: 6,
	false: 6,
	error: 5,
	warn: 4,
	info: 3,
	log: 2,
	true: 2,
	verbose: 1
};

/**
 * @param {LoggerOptions} options options object
 * @returns {function(string, LogTypeEnum, any[]): void} logging function
 */
module.exports = ({ level = "info", debug = false, console }) => {
	const debugFilters =
		typeof debug === "boolean"
			? [() => debug]
			: /** @type {FilterItemTypes[]} */ ([])
					.concat(debug)
					.map(filterToFunction);
	/** @type {number} */
	const loglevel = LogLevel[`${level}`] || 0;

	/**
	 * @param {string} name name of the logger
	 * @param {LogTypeEnum} type type of the log entry
	 * @param {any[]} args arguments of the log entry
	 * @returns {void}
	 */
	const logger = (name, type, args) => {
		const labeledArgs = () => {
			if (Array.isArray(args)) {
				if (args.length > 0 && typeof args[0] === "string") {
					return [`[${name}] ${args[0]}`, ...args.slice(1)];
				} else {
					return [`[${name}]`, ...args];
				}
			} else {
				return [];
			}
		};
		const debug = debugFilters.some(f => f(name));
		switch (type) {
			case LogType.debug:
				if (!debug) return;
				// eslint-disable-next-line node/no-unsupported-features/node-builtins
				if (typeof console.debug === "function") {
					// eslint-disable-next-line node/no-unsupported-features/node-builtins
					console.debug(...labeledArgs());
				} else {
					console.log(...labeledArgs());
				}
				break;
			case LogType.log:
				if (!debug && loglevel > LogLevel.log) return;
				console.log(...labeledArgs());
				break;
			case LogType.info:
				if (!debug && loglevel > LogLevel.info) return;
				console.info(...labeledArgs());
				break;
			case LogType.warn:
				if (!debug && loglevel > LogLevel.warn) return;
				console.warn(...labeledArgs());
				break;
			case LogType.error:
				if (!debug && loglevel > LogLevel.error) return;
				console.error(...labeledArgs());
				break;
			case LogType.trace:
				if (!debug) return;
				console.trace();
				break;
			case LogType.groupCollapsed:
				if (!debug && loglevel > LogLevel.log) return;
				if (!debug && loglevel > LogLevel.verbose) {
					// eslint-disable-next-line node/no-unsupported-features/node-builtins
					if (typeof console.groupCollapsed === "function") {
						// eslint-disable-next-line node/no-unsupported-features/node-builtins
						console.groupCollapsed(...labeledArgs());
					} else {
						console.log(...labeledArgs());
					}
					break;
				}
			// falls through
			case LogType.group:
				if (!debug && loglevel > LogLevel.log) return;
				// eslint-disable-next-line node/no-unsupported-features/node-builtins
				if (typeof console.group === "function") {
					// eslint-disable-next-line node/no-unsupported-features/node-builtins
					console.group(...labeledArgs());
				} else {
					console.log(...labeledArgs());
				}
				break;
			case LogType.groupEnd:
				if (!debug && loglevel > LogLevel.log) return;
				// eslint-disable-next-line node/no-unsupported-features/node-builtins
				if (typeof console.groupEnd === "function") {
					// eslint-disable-next-line node/no-unsupported-features/node-builtins
					console.groupEnd();
				}
				break;
			case LogType.time: {
				if (!debug && loglevel > LogLevel.log) return;
				const ms = args[1] * 1000 + args[2] / 1000000;
				const msg = `[${name}] ${args[0]}: ${ms} ms`;
				if (typeof console.logTime === "function") {
					console.logTime(msg);
				} else {
					console.log(msg);
				}
				break;
			}
			case LogType.profile:
				// eslint-disable-next-line node/no-unsupported-features/node-builtins
				if (typeof console.profile === "function") {
					// eslint-disable-next-line node/no-unsupported-features/node-builtins
					console.profile(...labeledArgs());
				}
				break;
			case LogType.profileEnd:
				// eslint-disable-next-line node/no-unsupported-features/node-builtins
				if (typeof console.profileEnd === "function") {
					// eslint-disable-next-line node/no-unsupported-features/node-builtins
					console.profileEnd(...labeledArgs());
				}
				break;
			case LogType.clear:
				if (!debug && loglevel > LogLevel.log) return;
				// eslint-disable-next-line node/no-unsupported-features/node-builtins
				if (typeof console.clear === "function") {
					// eslint-disable-next-line node/no-unsupported-features/node-builtins
					console.clear();
				}
				break;
			case LogType.status:
				if (!debug && loglevel > LogLevel.info) return;
				if (typeof console.status === "function") {
					if (args.length === 0) {
						console.status();
					} else {
						console.status(...labeledArgs());
					}
				} else {
					if (args.length !== 0) {
						console.info(...labeledArgs());
					}
				}
				break;
			default:
				throw new Error(`Unexpected LogType ${type}`);
		}
	};
	return logger;
};


/***/ }),

/***/ 629:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

"use strict";
/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/



const SyncBailHook = __nccwpck_require__(576);
const { Logger } = __nccwpck_require__(225);
const createConsoleLogger = __nccwpck_require__(636);

/** @type {createConsoleLogger.LoggerOptions} */
let currentDefaultLoggerOptions = {
	level: "info",
	debug: false,
	console
};
let currentDefaultLogger = createConsoleLogger(currentDefaultLoggerOptions);

/**
 * @param {string} name name of the logger
 * @returns {Logger} a logger
 */
exports.getLogger = name => {
	return new Logger(
		(type, args) => {
			if (exports.hooks.log.call(name, type, args) === undefined) {
				currentDefaultLogger(name, type, args);
			}
		},
		childName => exports.getLogger(`${name}/${childName}`)
	);
};

/**
 * @param {createConsoleLogger.LoggerOptions} options new options, merge with old options
 * @returns {void}
 */
exports.configureDefaultLogger = options => {
	Object.assign(currentDefaultLoggerOptions, options);
	currentDefaultLogger = createConsoleLogger(currentDefaultLoggerOptions);
};

exports.hooks = {
	log: new SyncBailHook(["origin", "type", "args"])
};


/***/ }),

/***/ 80:
/***/ ((module) => {

"use strict";
module.exports = require("@effect-x/deps/compiled/events");

/***/ }),

/***/ 576:
/***/ ((module) => {

"use strict";
module.exports = require("@effect-x/deps/compiled/webpack/path-fixtures/tapableLibPathFix");

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
/******/ 	/* webpack/runtime/getFullHash */
/******/ 	(() => {
/******/ 		__nccwpck_require__.h = () => ("d63cbaf1a7a25b4e0707")
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
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(380);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;