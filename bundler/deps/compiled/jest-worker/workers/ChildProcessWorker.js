(()=>{"use strict";var e={367:e=>{e.exports=require("@effect-x/deps/compiled/merge-stream")},310:e=>{e.exports=require("@effect-x/deps/compiled/supports-color")},129:e=>{e.exports=require("child_process")},413:e=>{e.exports=require("stream")}};var t={};function __nccwpck_require__(r){var s=t[r];if(s!==undefined){return s.exports}var i=t[r]={exports:{}};var o=true;try{e[r](i,i.exports,__nccwpck_require__);o=false}finally{if(o)delete t[r]}return i.exports}if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";var r={};(()=>{var e=r;Object.defineProperty(e,"__esModule",{value:true});e.default=void 0;function _child_process(){const e=__nccwpck_require__(129);_child_process=function(){return e};return e}function _stream(){const e=__nccwpck_require__(413);_stream=function(){return e};return e}function _mergeStream(){const e=_interopRequireDefault(__nccwpck_require__(367));_mergeStream=function(){return e};return e}function _supportsColor(){const e=__nccwpck_require__(310);_supportsColor=function(){return e};return e}function _types(){const e=require("@effect-x/deps/compiled/jest-worker/types");_types=function(){return e};return e}function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _defineProperty(e,t,r){if(t in e){Object.defineProperty(e,t,{value:r,enumerable:true,configurable:true,writable:true})}else{e[t]=r}return e}const t=128;const s=t+9;const i=t+15;const o=500;class ChildProcessWorker{constructor(e){_defineProperty(this,"_child",void 0);_defineProperty(this,"_options",void 0);_defineProperty(this,"_request",void 0);_defineProperty(this,"_retries",void 0);_defineProperty(this,"_onProcessEnd",void 0);_defineProperty(this,"_onCustomMessage",void 0);_defineProperty(this,"_fakeStream",void 0);_defineProperty(this,"_stdout",void 0);_defineProperty(this,"_stderr",void 0);_defineProperty(this,"_exitPromise",void 0);_defineProperty(this,"_resolveExitPromise",void 0);this._options=e;this._request=null;this._fakeStream=null;this._stdout=null;this._stderr=null;this._exitPromise=new Promise((e=>{this._resolveExitPromise=e}));this.initialize()}initialize(){const e=_supportsColor().stdout?{FORCE_COLOR:"1"}:{};const t=(0,_child_process().fork)("@effect-x/deps/compiled/jest-worker/workers/processChild.js",[],{cwd:process.cwd(),env:{...process.env,JEST_WORKER_ID:String(this._options.workerId+1),...e},execArgv:process.execArgv.filter((e=>!/^--(debug|inspect)/.test(e))),silent:true,...this._options.forkOptions});if(t.stdout){if(!this._stdout){this._stdout=(0,_mergeStream().default)(this._getFakeStream())}this._stdout.add(t.stdout)}if(t.stderr){if(!this._stderr){this._stderr=(0,_mergeStream().default)(this._getFakeStream())}this._stderr.add(t.stderr)}t.on("message",this._onMessage.bind(this));t.on("exit",this._onExit.bind(this));t.send([_types().CHILD_MESSAGE_INITIALIZE,false,this._options.workerPath,this._options.setupArgs]);this._child=t;this._retries++;if(this._retries>this._options.maxRetries){const e=new Error(`Jest worker encountered ${this._retries} child process exceptions, exceeding retry limit`);this._onMessage([_types().PARENT_MESSAGE_CLIENT_ERROR,e.name,e.message,e.stack,{type:"WorkerError"}])}}_shutdown(){if(this._fakeStream){this._fakeStream.end();this._fakeStream=null}this._resolveExitPromise()}_onMessage(e){let t;switch(e[0]){case _types().PARENT_MESSAGE_OK:this._onProcessEnd(null,e[1]);break;case _types().PARENT_MESSAGE_CLIENT_ERROR:t=e[4];if(t!=null&&typeof t==="object"){const r=t;const s=global[e[1]];const i=typeof s==="function"?s:Error;t=new i(e[2]);t.type=e[1];t.stack=e[3];for(const e in r){t[e]=r[e]}}this._onProcessEnd(t,null);break;case _types().PARENT_MESSAGE_SETUP_ERROR:t=new Error("Error when calling setup: "+e[2]);t.type=e[1];t.stack=e[3];this._onProcessEnd(t,null);break;case _types().PARENT_MESSAGE_CUSTOM:this._onCustomMessage(e[1]);break;default:throw new TypeError("Unexpected response from worker: "+e[0])}}_onExit(e){if(e!==0&&e!==null&&e!==i&&e!==s){this.initialize();if(this._request){this._child.send(this._request)}}else{this._shutdown()}}send(e,t,r,s){t(this);this._onProcessEnd=(...e)=>{this._request=null;return r(...e)};this._onCustomMessage=(...e)=>s(...e);this._request=e;this._retries=0;this._child.send(e,(()=>{}))}waitForExit(){return this._exitPromise}forceExit(){this._child.kill("SIGTERM");const e=setTimeout((()=>this._child.kill("SIGKILL")),o);this._exitPromise.then((()=>clearTimeout(e)))}getWorkerId(){return this._options.workerId}getStdout(){return this._stdout}getStderr(){return this._stderr}_getFakeStream(){if(!this._fakeStream){this._fakeStream=new(_stream().PassThrough)}return this._fakeStream}}e.default=ChildProcessWorker})();module.exports=r})();