(()=>{var e={17:(e,i,n)=>{"use strict";const r=n(869);e.exports=r.default},869:(e,i,n)=>{"use strict";Object.defineProperty(i,"__esModule",{value:true});i.default=void 0;var r=_interopRequireWildcard(n(87));var t=n(816);var s=n(545);var o=_interopRequireDefault(n(393));var a=_interopRequireDefault(n(235));var u=n(597);var c=n(974);var f=_interopRequireWildcard(n(673));var l=n(11);function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _getRequireWildcardCache(e){if(typeof WeakMap!=="function")return null;var i=new WeakMap;var n=new WeakMap;return(_getRequireWildcardCache=function(e){return e?n:i})(e)}function _interopRequireWildcard(e,i){if(!i&&e&&e.__esModule){return e}if(e===null||typeof e!=="object"&&typeof e!=="function"){return{default:e}}var n=_getRequireWildcardCache(i);if(n&&n.has(e)){return n.get(e)}var r={};var t=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var s in e){if(s!=="default"&&Object.prototype.hasOwnProperty.call(e,s)){var o=t?Object.getOwnPropertyDescriptor(e,s):null;if(o&&(o.get||o.set)){Object.defineProperty(r,s,o)}else{r[s]=e[s]}}}r.default=e;if(n){n.set(e,r)}return r}const p=/\s.+:+([0-9]+):+([0-9]+)/;class CssMinimizerPlugin{constructor(e={}){(0,s.validate)(f,e,{name:"Css Minimizer Plugin",baseDataPath:"options"});const{minify:i=c.cssnanoMinify,minimizerOptions:n,test:r=/\.css(\?.*)?$/i,warningsFilter:t=(()=>true),parallel:o=true,include:a,exclude:u}=e;this.options={test:r,warningsFilter:t,parallel:o,include:a,exclude:u,minify:i,minimizerOptions:n}}static isSourceMap(e){return Boolean(e&&e.version&&e.sources&&Array.isArray(e.sources)&&typeof e.mappings==="string")}static buildError(e,i,n,r){let t;if(e.line){const s=r&&r.originalPositionFor({line:e.line,column:e.column});if(s&&s.source&&n){t=new Error(`${i} from Css Minimizer Webpack Plugin\n${e.message} [${n.shorten(s.source)}:${s.line},${s.column}][${i}:${e.line},${e.column}]${e.stack?`\n${e.stack.split("\n").slice(1).join("\n")}`:""}`);t.file=i;return t}t=new Error(`${i} from Css Minimizer \n${e.message} [${i}:${e.line},${e.column}]${e.stack?`\n${e.stack.split("\n").slice(1).join("\n")}`:""}`);t.file=i;return t}if(e.stack){t=new Error(`${i} from Css Minimizer\n${e.stack}`);t.file=i;return t}t=new Error(`${i} from Css Minimizer\n${e.message}`);t.file=i;return t}static buildWarning(e,i,n,r,t){let s=e;let o="";let a;if(n){const t=p.exec(e);if(t){const e=+t[1];const u=+t[2];const c=n.originalPositionFor({line:e,column:u});if(c&&c.source&&c.source!==i&&r){({source:a}=c);s=`${s.replace(p,"")}`;o=`${r.shorten(c.source)}:${c.line}:${c.column}`}}}if(t&&!t(e,i,a)){return null}return`Css Minimizer Plugin: ${s} ${o}`}static getAvailableNumberOfCores(e){const i=r.cpus()||{length:1};return e===true?i.length-1:Math.min(Number(e)||0,i.length-1)}async optimize(e,i,r,s){const c=i.getCache("CssMinimizerWebpackPlugin");let f=0;const p=await Promise.all(Object.keys(typeof r==="undefined"?i.assets:r).filter((n=>{const{info:r}=i.getAsset(n);if(r.minimized){return false}if(!e.webpack.ModuleFilenameHelpers.matchObject.bind(undefined,this.options)(n)){return false}return true})).map((async e=>{const{info:n,source:r}=i.getAsset(e);const t=c.getLazyHashedEtag(r);const s=c.getItemCache(e,t);const o=await s.getPromise();if(!o){f+=1}return{name:e,info:n,inputSource:r,output:o,cacheItem:s}})));let d;let m;let g;if(s.availableNumberOfCores>0){g=Math.min(f,s.availableNumberOfCores);d=()=>{if(m){return m}m=new u.Worker(n.ab+"minify.js",{numWorkers:g,enableWorkerThreads:true});const e=m.getStdout();if(e){e.on("data",(e=>process.stdout.write(e)))}const i=m.getStderr();if(i){i.on("data",(e=>process.stderr.write(e)))}return m}}const y=(0,a.default)(d&&f>0?g:Infinity);const{SourceMapSource:h,RawSource:_}=e.webpack.sources;const w=[];for(const e of p){w.push(y((async()=>{const{name:n,inputSource:r,cacheItem:s}=e;let{output:a}=e;if(!a){let e;let u;const{source:c,map:f}=r.sourceAndMap();e=c;if(f){if(CssMinimizerPlugin.isSourceMap(f)){u=f}else{u=f;i.warnings.push(new Error(`${n} contains invalid source map`))}}if(Buffer.isBuffer(e)){e=e.toString()}const p={name:n,input:e,inputSourceMap:u,minify:this.options.minify,minifyOptions:this.options.minimizerOptions};try{a=await(d?d().transform((0,o.default)(p)):(0,l.minify)(p))}catch(e){i.errors.push(CssMinimizerPlugin.buildError(e,n,i.requestShortener,u&&CssMinimizerPlugin.isSourceMap(u)?new t.SourceMapConsumer(u):null));return}if(a.map){a.source=new h(a.code,n,a.map,e,u,true)}else{a.source=new _(a.code)}if(a.warnings&&a.warnings.length>0){a.warnings=a.warnings.map((e=>CssMinimizerPlugin.buildWarning(e,n,u&&CssMinimizerPlugin.isSourceMap(u)?new t.SourceMapConsumer(u):null,i.requestShortener,this.options.warningsFilter))).filter(Boolean)}await s.storePromise({source:a.source,warnings:a.warnings})}if(a.warnings&&a.warnings.length>0){a.warnings.forEach((e=>{const r=class Warning extends Error{constructor(e){super(e);this.name="Warning";this.hideStack=true;this.file=n}};i.warnings.push(new r(e))}))}const u={minimized:true};const{source:c}=a;i.updateAsset(n,c,u)})))}const v=await Promise.all(w);if(m){await m.end()}return v}apply(e){const i=this.constructor.name;const n=CssMinimizerPlugin.getAvailableNumberOfCores(this.options.parallel);e.hooks.compilation.tap(i,(r=>{r.hooks.processAssets.tapPromise({name:i,stage:e.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_SIZE,additionalAssets:true},(i=>this.optimize(e,r,i,{availableNumberOfCores:n})));r.hooks.statsPrinter.tap(i,(e=>{e.hooks.print.for("asset.info.minimized").tap("css-minimizer-webpack-plugin",((e,{green:i,formatFlag:n})=>e?i(n("minimized")):""))}))}))}}CssMinimizerPlugin.cssnanoMinify=c.cssnanoMinify;CssMinimizerPlugin.cssoMinify=c.cssoMinify;CssMinimizerPlugin.cleanCssMinify=c.cleanCssMinify;var d=CssMinimizerPlugin;i.default=d},11:(e,i,n)=>{"use strict";e=n.nmd(e);const minify=async e=>{const i=typeof e.minify==="function"?[e.minify]:e.minify;const n={code:e.input,map:e.inputSourceMap,warnings:[]};for(let r=0;r<=i.length-1;r++){const t=i[r];const s=Array.isArray(e.minifyOptions)?e.minifyOptions[r]:e.minifyOptions;const o=await t({[e.name]:n.code},n.map,s);n.code=o.code;n.map=o.map;n.warnings=n.warnings.concat(o.warnings||[])}if(n.warnings.length>0){n.warnings=n.warnings.map((e=>e.toString()))}return n};async function transform(n){const r=new Function("exports","require","module","__filename","__dirname",`'use strict'\nreturn ${n}`)(i,require,e,__filename,__dirname);const t=await minify(r);if(t.error){throw t.error}else{return t}}e.exports.minify=minify;e.exports.transform=transform},974:(e,i,n)=>{"use strict";Object.defineProperty(i,"__esModule",{value:true});i.cssnanoMinify=cssnanoMinify;i.cssoMinify=cssoMinify;i.cleanCssMinify=cleanCssMinify;async function cssnanoMinify(e,i,n={preset:"default"}){const[[r,t]]=Object.entries(e);const s={to:r,from:r,...n.processorOptions};if(typeof s.parser==="string"){try{s.parser=await load(s.parser)}catch(e){throw new Error(`Loading PostCSS "${s.parser}" parser failed: ${e.message}\n\n(@${r})`)}}if(typeof s.stringifier==="string"){try{s.stringifier=await load(s.stringifier)}catch(e){throw new Error(`Loading PostCSS "${s.stringifier}" stringifier failed: ${e.message}\n\n(@${r})`)}}if(typeof s.syntax==="string"){try{s.syntax=await load(s.syntax)}catch(e){throw new Error(`Loading PostCSS "${s.syntax}" syntax failed: ${e.message}\n\n(@${r})`)}}if(i){s.map={annotation:false,prev:i}}const o=require("@effect-x/deps/compiled/postcss");const a=require("@effect-x/deps/compiled/cssnano");const u=await o([a(n)]).process(t,s);return{code:u.css,map:u.map&&u.map.toString(),warnings:u.warnings().map(String)};async function load(e){let i;try{i=require(e);return i}catch(n){let r;try{r=new Function("id","return import(id);")}catch(e){r=null}if(n.code==="ERR_REQUIRE_ESM"&&r){i=await r(e);return i.default}throw n}}}async function cssoMinify(e,i,r){const t=require("@effect-x/deps/compiled/csso");const s=n(816);const[[o,a]]=Object.entries(e);const u=t.minify(a,{filename:o,sourceMap:i,...r});if(i){u.map.applySourceMap(new s.SourceMapConsumer(i),o)}return{code:u.css,map:u.map&&u.map.toJSON()}}async function cleanCssMinify(e,i,n){const r=require("@effect-x/deps/compiled/clean-css");const[[t,s]]=Object.entries(e);const o=await new r({sourceMap:i,...n}).minify({[t]:{styles:s}});return{code:o.styles,map:o.sourceMap&&o.sourceMap.toJSON(),warnings:o.warnings}}},235:(e,i,n)=>{"use strict";const r=n(631);const pLimit=e=>{if(!((Number.isInteger(e)||e===Infinity)&&e>0)){throw new TypeError("Expected `concurrency` to be a number from 1 and up")}const i=new r;let n=0;const next=()=>{n--;if(i.size>0){i.dequeue()()}};const run=async(e,i,...r)=>{n++;const t=(async()=>e(...r))();i(t);try{await t}catch{}next()};const enqueue=(r,t,...s)=>{i.enqueue(run.bind(null,r,t,...s));(async()=>{await Promise.resolve();if(n<e&&i.size>0){i.dequeue()()}})()};const generator=(e,...i)=>new Promise((n=>{enqueue(e,n,...i)}));Object.defineProperties(generator,{activeCount:{get:()=>n},pendingCount:{get:()=>i.size},clearQueue:{value:()=>{i.clear()}}});return generator};e.exports=pLimit},139:(e,i,n)=>{e.exports=n(417).randomBytes},393:(e,i,n)=>{"use strict";var r=n(139);var t=16;var s=generateUID();var o=new RegExp('(\\\\)?"@__(F|R|D|M|S|A|U|I|B|L)-'+s+'-(\\d+)__@"',"g");var a=/\{\s*\[native code\]\s*\}/g;var u=/function.*?\(/;var c=/.*?=>.*?/;var f=/[<>\/\u2028\u2029]/g;var l=["*","async"];var p={"<":"\\u003C",">":"\\u003E","/":"\\u002F","\u2028":"\\u2028","\u2029":"\\u2029"};function escapeUnsafeChars(e){return p[e]}function generateUID(){var e=r(t);var i="";for(var n=0;n<t;++n){i+=e[n].toString(16)}return i}function deleteFunctions(e){var i=[];for(var n in e){if(typeof e[n]==="function"){i.push(n)}}for(var r=0;r<i.length;r++){delete e[i[r]]}}e.exports=function serialize(e,i){i||(i={});if(typeof i==="number"||typeof i==="string"){i={space:i}}var n=[];var r=[];var t=[];var p=[];var d=[];var m=[];var g=[];var y=[];var h=[];var _=[];function replacer(e,o){if(i.ignoreFunction){deleteFunctions(o)}if(!o&&o!==undefined){return o}var a=this[e];var u=typeof a;if(u==="object"){if(a instanceof RegExp){return"@__R-"+s+"-"+(r.push(a)-1)+"__@"}if(a instanceof Date){return"@__D-"+s+"-"+(t.push(a)-1)+"__@"}if(a instanceof Map){return"@__M-"+s+"-"+(p.push(a)-1)+"__@"}if(a instanceof Set){return"@__S-"+s+"-"+(d.push(a)-1)+"__@"}if(a instanceof Array){var c=a.filter((function(){return true})).length!==a.length;if(c){return"@__A-"+s+"-"+(m.push(a)-1)+"__@"}}if(a instanceof URL){return"@__L-"+s+"-"+(_.push(a)-1)+"__@"}}if(u==="function"){return"@__F-"+s+"-"+(n.push(a)-1)+"__@"}if(u==="undefined"){return"@__U-"+s+"-"+(g.push(a)-1)+"__@"}if(u==="number"&&!isNaN(a)&&!isFinite(a)){return"@__I-"+s+"-"+(y.push(a)-1)+"__@"}if(u==="bigint"){return"@__B-"+s+"-"+(h.push(a)-1)+"__@"}return o}function serializeFunc(e){var i=e.toString();if(a.test(i)){throw new TypeError("Serializing native function: "+e.name)}if(u.test(i)){return i}if(c.test(i)){return i}var n=i.indexOf("(");var r=i.substr(0,n).trim().split(" ").filter((function(e){return e.length>0}));var t=r.filter((function(e){return l.indexOf(e)===-1}));if(t.length>0){return(r.indexOf("async")>-1?"async ":"")+"function"+(r.join("").indexOf("*")>-1?"*":"")+i.substr(n)}return i}if(i.ignoreFunction&&typeof e==="function"){e=undefined}if(e===undefined){return String(e)}var w;if(i.isJSON&&!i.space){w=JSON.stringify(e)}else{w=JSON.stringify(e,i.isJSON?null:replacer,i.space)}if(typeof w!=="string"){return String(w)}if(i.unsafe!==true){w=w.replace(f,escapeUnsafeChars)}if(n.length===0&&r.length===0&&t.length===0&&p.length===0&&d.length===0&&m.length===0&&g.length===0&&y.length===0&&h.length===0&&_.length===0){return w}return w.replace(o,(function(e,s,o,a){if(s){return e}if(o==="D"){return'new Date("'+t[a].toISOString()+'")'}if(o==="R"){return"new RegExp("+serialize(r[a].source)+', "'+r[a].flags+'")'}if(o==="M"){return"new Map("+serialize(Array.from(p[a].entries()),i)+")"}if(o==="S"){return"new Set("+serialize(Array.from(d[a].values()),i)+")"}if(o==="A"){return"Array.prototype.slice.call("+serialize(Object.assign({length:m[a].length},m[a]),i)+")"}if(o==="U"){return"undefined"}if(o==="I"){return y[a]}if(o==="B"){return'BigInt("'+h[a]+'")'}if(o==="L"){return'new URL("'+_[a].toString()+'")'}var u=n[a];return serializeFunc(u)}))}},631:e=>{class Node{constructor(e){this.value=e;this.next=undefined}}class Queue{constructor(){this.clear()}enqueue(e){const i=new Node(e);if(this._head){this._tail.next=i;this._tail=i}else{this._head=i;this._tail=i}this._size++}dequeue(){const e=this._head;if(!e){return}this._head=this._head.next;this._size--;return e.value}clear(){this._head=undefined;this._tail=undefined;this._size=0}get size(){return this._size}*[Symbol.iterator](){let e=this._head;while(e){yield e.value;e=e.next}}}e.exports=Queue},673:e=>{"use strict";e.exports=JSON.parse('{"definitions":{"Rule":{"description":"Filtering rule as regex or string.","anyOf":[{"instanceof":"RegExp","tsType":"RegExp"},{"type":"string","minLength":1}]},"Rules":{"description":"Filtering rules.","anyOf":[{"type":"array","items":{"description":"A rule condition.","oneOf":[{"$ref":"#/definitions/Rule"}]}},{"$ref":"#/definitions/Rule"}]},"MinimizerOptions":{"additionalProperties":true,"type":"object"}},"title":"CssMinimizerWebpackPluginOptions","type":"object","properties":{"test":{"description":"Include all modules that pass test assertion.","oneOf":[{"$ref":"#/definitions/Rules"}]},"include":{"description":"Include all modules matching any of these conditions.","oneOf":[{"$ref":"#/definitions/Rules"}]},"exclude":{"description":"Exclude all modules matching any of these conditions.","oneOf":[{"$ref":"#/definitions/Rules"}]},"minimizerOptions":{"description":"Options for `cssMinimizerOptions`.","anyOf":[{"$ref":"#/definitions/MinimizerOptions"},{"type":"array","minItems":1,"items":{"$ref":"#/definitions/MinimizerOptions"}}]},"parallel":{"description":"Use multi-process parallel running to improve the build speed.","anyOf":[{"type":"boolean"},{"type":"integer"}]},"warningsFilter":{"description":"Allow to filter `css minimizer` warnings.","instanceof":"Function"},"minify":{"description":"Allows you to override default minify function.","anyOf":[{"instanceof":"Function"},{"type":"array","minItems":1,"items":{"instanceof":"Function"}}]}},"additionalProperties":false}')},597:e=>{"use strict";e.exports=require("@effect-x/deps/compiled/jest-worker")},545:e=>{"use strict";e.exports=require("@effect-x/deps/compiled/schema-utils3")},816:e=>{"use strict";e.exports=require("@effect-x/deps/compiled/source-map")},417:e=>{"use strict";e.exports=require("crypto")},87:e=>{"use strict";e.exports=require("os")}};var i={};function __nccwpck_require__(n){var r=i[n];if(r!==undefined){return r.exports}var t=i[n]={id:n,loaded:false,exports:{}};var s=true;try{e[n](t,t.exports,__nccwpck_require__);s=false}finally{if(s)delete i[n]}t.loaded=true;return t.exports}(()=>{__nccwpck_require__.nmd=e=>{e.paths=[];if(!e.children)e.children=[];return e}})();if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";var n=__nccwpck_require__(17);module.exports=n})();