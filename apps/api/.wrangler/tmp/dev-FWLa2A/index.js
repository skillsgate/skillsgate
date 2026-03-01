var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __require = /* @__PURE__ */ ((x3) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x3, {
  get: (a2, b3) => (typeof require !== "undefined" ? require : a2)[b3]
}) : x3)(function(x3) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x3 + '" is not supported');
});
var __esm = (fn2, res) => function __init() {
  return fn2 && (res = (0, fn2[__getOwnPropNames(fn2)[0]])(fn2 = 0)), res;
};
var __commonJS = (cb, mod2) => function __require2() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
};
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to2, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to2, key) && key !== except)
        __defProp(to2, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to2;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));

// ../../node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name2) {
  return new Error(`[unenv] ${name2} is not implemented yet!`);
}
// @__NO_SIDE_EFFECTS__
function notImplemented(name2) {
  const fn2 = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name2);
  }, "fn");
  return Object.assign(fn2, { __unenv__: true });
}
var init_utils = __esm({
  "../../node_modules/unenv/dist/runtime/_internal/utils.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    __name(createNotImplementedError, "createNotImplementedError");
    __name(notImplemented, "notImplemented");
  }
});

// ../../node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin, _performanceNow, nodeTiming, PerformanceEntry, PerformanceMark, PerformanceMeasure, PerformanceResourceTiming, PerformanceObserverEntryList, Performance, PerformanceObserver, performance;
var init_performance = __esm({
  "../../node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    init_utils();
    _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
    _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
    nodeTiming = {
      name: "node",
      entryType: "node",
      startTime: 0,
      duration: 0,
      nodeStart: 0,
      v8Start: 0,
      bootstrapComplete: 0,
      environment: 0,
      loopStart: 0,
      loopExit: 0,
      idleTime: 0,
      uvMetricsInfo: {
        loopCount: 0,
        events: 0,
        eventsWaiting: 0
      },
      detail: void 0,
      toJSON() {
        return this;
      }
    };
    PerformanceEntry = class {
      static {
        __name(this, "PerformanceEntry");
      }
      __unenv__ = true;
      detail;
      entryType = "event";
      name;
      startTime;
      constructor(name2, options) {
        this.name = name2;
        this.startTime = options?.startTime || _performanceNow();
        this.detail = options?.detail;
      }
      get duration() {
        return _performanceNow() - this.startTime;
      }
      toJSON() {
        return {
          name: this.name,
          entryType: this.entryType,
          startTime: this.startTime,
          duration: this.duration,
          detail: this.detail
        };
      }
    };
    PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
      static {
        __name(this, "PerformanceMark");
      }
      entryType = "mark";
      constructor() {
        super(...arguments);
      }
      get duration() {
        return 0;
      }
    };
    PerformanceMeasure = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceMeasure");
      }
      entryType = "measure";
    };
    PerformanceResourceTiming = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceResourceTiming");
      }
      entryType = "resource";
      serverTiming = [];
      connectEnd = 0;
      connectStart = 0;
      decodedBodySize = 0;
      domainLookupEnd = 0;
      domainLookupStart = 0;
      encodedBodySize = 0;
      fetchStart = 0;
      initiatorType = "";
      name = "";
      nextHopProtocol = "";
      redirectEnd = 0;
      redirectStart = 0;
      requestStart = 0;
      responseEnd = 0;
      responseStart = 0;
      secureConnectionStart = 0;
      startTime = 0;
      transferSize = 0;
      workerStart = 0;
      responseStatus = 0;
    };
    PerformanceObserverEntryList = class {
      static {
        __name(this, "PerformanceObserverEntryList");
      }
      __unenv__ = true;
      getEntries() {
        return [];
      }
      getEntriesByName(_name, _type) {
        return [];
      }
      getEntriesByType(type) {
        return [];
      }
    };
    Performance = class {
      static {
        __name(this, "Performance");
      }
      __unenv__ = true;
      timeOrigin = _timeOrigin;
      eventCounts = /* @__PURE__ */ new Map();
      _entries = [];
      _resourceTimingBufferSize = 0;
      navigation = void 0;
      timing = void 0;
      timerify(_fn, _options) {
        throw createNotImplementedError("Performance.timerify");
      }
      get nodeTiming() {
        return nodeTiming;
      }
      eventLoopUtilization() {
        return {};
      }
      markResourceTiming() {
        return new PerformanceResourceTiming("");
      }
      onresourcetimingbufferfull = null;
      now() {
        if (this.timeOrigin === _timeOrigin) {
          return _performanceNow();
        }
        return Date.now() - this.timeOrigin;
      }
      clearMarks(markName) {
        this._entries = markName ? this._entries.filter((e6) => e6.name !== markName) : this._entries.filter((e6) => e6.entryType !== "mark");
      }
      clearMeasures(measureName) {
        this._entries = measureName ? this._entries.filter((e6) => e6.name !== measureName) : this._entries.filter((e6) => e6.entryType !== "measure");
      }
      clearResourceTimings() {
        this._entries = this._entries.filter((e6) => e6.entryType !== "resource" || e6.entryType !== "navigation");
      }
      getEntries() {
        return this._entries;
      }
      getEntriesByName(name2, type) {
        return this._entries.filter((e6) => e6.name === name2 && (!type || e6.entryType === type));
      }
      getEntriesByType(type) {
        return this._entries.filter((e6) => e6.entryType === type);
      }
      mark(name2, options) {
        const entry = new PerformanceMark(name2, options);
        this._entries.push(entry);
        return entry;
      }
      measure(measureName, startOrMeasureOptions, endMark) {
        let start;
        let end;
        if (typeof startOrMeasureOptions === "string") {
          start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
          end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
        } else {
          start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
          end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
        }
        const entry = new PerformanceMeasure(measureName, {
          startTime: start,
          detail: {
            start,
            end
          }
        });
        this._entries.push(entry);
        return entry;
      }
      setResourceTimingBufferSize(maxSize) {
        this._resourceTimingBufferSize = maxSize;
      }
      addEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.addEventListener");
      }
      removeEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.removeEventListener");
      }
      dispatchEvent(event) {
        throw createNotImplementedError("Performance.dispatchEvent");
      }
      toJSON() {
        return this;
      }
    };
    PerformanceObserver = class {
      static {
        __name(this, "PerformanceObserver");
      }
      __unenv__ = true;
      static supportedEntryTypes = [];
      _callback = null;
      constructor(callback) {
        this._callback = callback;
      }
      takeRecords() {
        return [];
      }
      disconnect() {
        throw createNotImplementedError("PerformanceObserver.disconnect");
      }
      observe(options) {
        throw createNotImplementedError("PerformanceObserver.observe");
      }
      bind(fn2) {
        return fn2;
      }
      runInAsyncScope(fn2, thisArg, ...args) {
        return fn2.call(thisArg, ...args);
      }
      asyncId() {
        return 0;
      }
      triggerAsyncId() {
        return 0;
      }
      emitDestroy() {
        return this;
      }
    };
    performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
  }
});

// ../../node_modules/unenv/dist/runtime/node/perf_hooks.mjs
var init_perf_hooks = __esm({
  "../../node_modules/unenv/dist/runtime/node/perf_hooks.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    init_performance();
  }
});

// ../../node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
var init_performance2 = __esm({
  "../../node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs"() {
    init_perf_hooks();
    globalThis.performance = performance;
    globalThis.Performance = Performance;
    globalThis.PerformanceEntry = PerformanceEntry;
    globalThis.PerformanceMark = PerformanceMark;
    globalThis.PerformanceMeasure = PerformanceMeasure;
    globalThis.PerformanceObserver = PerformanceObserver;
    globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
    globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
  }
});

// ../../node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime;
var init_hrtime = __esm({
  "../../node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
      const now = Date.now();
      const seconds = Math.trunc(now / 1e3);
      const nanos = now % 1e3 * 1e6;
      if (startTime) {
        let diffSeconds = seconds - startTime[0];
        let diffNanos = nanos - startTime[0];
        if (diffNanos < 0) {
          diffSeconds = diffSeconds - 1;
          diffNanos = 1e9 + diffNanos;
        }
        return [diffSeconds, diffNanos];
      }
      return [seconds, nanos];
    }, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
      return BigInt(Date.now() * 1e6);
    }, "bigint") });
  }
});

// ../../node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream;
var init_read_stream = __esm({
  "../../node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    ReadStream = class {
      static {
        __name(this, "ReadStream");
      }
      fd;
      isRaw = false;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      setRawMode(mode) {
        this.isRaw = mode;
        return this;
      }
    };
  }
});

// ../../node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream;
var init_write_stream = __esm({
  "../../node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    WriteStream = class {
      static {
        __name(this, "WriteStream");
      }
      fd;
      columns = 80;
      rows = 24;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      clearLine(dir, callback) {
        callback && callback();
        return false;
      }
      clearScreenDown(callback) {
        callback && callback();
        return false;
      }
      cursorTo(x3, y3, callback) {
        callback && typeof callback === "function" && callback();
        return false;
      }
      moveCursor(dx, dy, callback) {
        callback && callback();
        return false;
      }
      getColorDepth(env2) {
        return 1;
      }
      hasColors(count, env2) {
        return false;
      }
      getWindowSize() {
        return [this.columns, this.rows];
      }
      write(str2, encoding, cb) {
        if (str2 instanceof Uint8Array) {
          str2 = new TextDecoder().decode(str2);
        }
        try {
          console.log(str2);
        } catch {
        }
        cb && typeof cb === "function" && cb();
        return false;
      }
    };
  }
});

// ../../node_modules/unenv/dist/runtime/node/tty.mjs
var init_tty = __esm({
  "../../node_modules/unenv/dist/runtime/node/tty.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    init_read_stream();
    init_write_stream();
  }
});

// ../../node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION;
var init_node_version = __esm({
  "../../node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    NODE_VERSION = "22.14.0";
  }
});

// ../../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";
var Process;
var init_process = __esm({
  "../../node_modules/unenv/dist/runtime/node/internal/process/process.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    init_tty();
    init_utils();
    init_node_version();
    Process = class _Process extends EventEmitter {
      static {
        __name(this, "Process");
      }
      env;
      hrtime;
      nextTick;
      constructor(impl) {
        super();
        this.env = impl.env;
        this.hrtime = impl.hrtime;
        this.nextTick = impl.nextTick;
        for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
          const value = this[prop];
          if (typeof value === "function") {
            this[prop] = value.bind(this);
          }
        }
      }
      // --- event emitter ---
      emitWarning(warning, type, code) {
        console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
      }
      emit(...args) {
        return super.emit(...args);
      }
      listeners(eventName) {
        return super.listeners(eventName);
      }
      // --- stdio (lazy initializers) ---
      #stdin;
      #stdout;
      #stderr;
      get stdin() {
        return this.#stdin ??= new ReadStream(0);
      }
      get stdout() {
        return this.#stdout ??= new WriteStream(1);
      }
      get stderr() {
        return this.#stderr ??= new WriteStream(2);
      }
      // --- cwd ---
      #cwd = "/";
      chdir(cwd2) {
        this.#cwd = cwd2;
      }
      cwd() {
        return this.#cwd;
      }
      // --- dummy props and getters ---
      arch = "";
      platform = "";
      argv = [];
      argv0 = "";
      execArgv = [];
      execPath = "";
      title = "";
      pid = 200;
      ppid = 100;
      get version() {
        return `v${NODE_VERSION}`;
      }
      get versions() {
        return { node: NODE_VERSION };
      }
      get allowedNodeEnvironmentFlags() {
        return /* @__PURE__ */ new Set();
      }
      get sourceMapsEnabled() {
        return false;
      }
      get debugPort() {
        return 0;
      }
      get throwDeprecation() {
        return false;
      }
      get traceDeprecation() {
        return false;
      }
      get features() {
        return {};
      }
      get release() {
        return {};
      }
      get connected() {
        return false;
      }
      get config() {
        return {};
      }
      get moduleLoadList() {
        return [];
      }
      constrainedMemory() {
        return 0;
      }
      availableMemory() {
        return 0;
      }
      uptime() {
        return 0;
      }
      resourceUsage() {
        return {};
      }
      // --- noop methods ---
      ref() {
      }
      unref() {
      }
      // --- unimplemented methods ---
      umask() {
        throw createNotImplementedError("process.umask");
      }
      getBuiltinModule() {
        return void 0;
      }
      getActiveResourcesInfo() {
        throw createNotImplementedError("process.getActiveResourcesInfo");
      }
      exit() {
        throw createNotImplementedError("process.exit");
      }
      reallyExit() {
        throw createNotImplementedError("process.reallyExit");
      }
      kill() {
        throw createNotImplementedError("process.kill");
      }
      abort() {
        throw createNotImplementedError("process.abort");
      }
      dlopen() {
        throw createNotImplementedError("process.dlopen");
      }
      setSourceMapsEnabled() {
        throw createNotImplementedError("process.setSourceMapsEnabled");
      }
      loadEnvFile() {
        throw createNotImplementedError("process.loadEnvFile");
      }
      disconnect() {
        throw createNotImplementedError("process.disconnect");
      }
      cpuUsage() {
        throw createNotImplementedError("process.cpuUsage");
      }
      setUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
      }
      hasUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
      }
      initgroups() {
        throw createNotImplementedError("process.initgroups");
      }
      openStdin() {
        throw createNotImplementedError("process.openStdin");
      }
      assert() {
        throw createNotImplementedError("process.assert");
      }
      binding() {
        throw createNotImplementedError("process.binding");
      }
      // --- attached interfaces ---
      permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
      report = {
        directory: "",
        filename: "",
        signal: "SIGUSR2",
        compact: false,
        reportOnFatalError: false,
        reportOnSignal: false,
        reportOnUncaughtException: false,
        getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
        writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
      };
      finalization = {
        register: /* @__PURE__ */ notImplemented("process.finalization.register"),
        unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
        registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
      };
      memoryUsage = Object.assign(() => ({
        arrayBuffers: 0,
        rss: 0,
        external: 0,
        heapTotal: 0,
        heapUsed: 0
      }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
      // --- undefined props ---
      mainModule = void 0;
      domain = void 0;
      // optional
      send = void 0;
      exitCode = void 0;
      channel = void 0;
      getegid = void 0;
      geteuid = void 0;
      getgid = void 0;
      getgroups = void 0;
      getuid = void 0;
      setegid = void 0;
      seteuid = void 0;
      setgid = void 0;
      setgroups = void 0;
      setuid = void 0;
      // internals
      _events = void 0;
      _eventsCount = void 0;
      _exiting = void 0;
      _maxListeners = void 0;
      _debugEnd = void 0;
      _debugProcess = void 0;
      _fatalException = void 0;
      _getActiveHandles = void 0;
      _getActiveRequests = void 0;
      _kill = void 0;
      _preload_modules = void 0;
      _rawDebug = void 0;
      _startProfilerIdleNotifier = void 0;
      _stopProfilerIdleNotifier = void 0;
      _tickCallback = void 0;
      _disconnect = void 0;
      _handleQueue = void 0;
      _pendingMessage = void 0;
      _channel = void 0;
      _send = void 0;
      _linkedBinding = void 0;
    };
  }
});

// ../../node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess, getBuiltinModule, workerdProcess, isWorkerdProcessV2, unenvProcess, exit, features, platform, env, hrtime3, nextTick, _channel, _disconnect, _events, _eventsCount, _handleQueue, _maxListeners, _pendingMessage, _send, assert, disconnect, mainModule, _debugEnd, _debugProcess, _exiting, _fatalException, _getActiveHandles, _getActiveRequests, _kill, _linkedBinding, _preload_modules, _rawDebug, _startProfilerIdleNotifier, _stopProfilerIdleNotifier, _tickCallback, abort, addListener, allowedNodeEnvironmentFlags, arch, argv, argv0, availableMemory, binding, channel, chdir, config, connected, constrainedMemory, cpuUsage, cwd, debugPort, dlopen, domain, emit, emitWarning, eventNames, execArgv, execPath, exitCode, finalization, getActiveResourcesInfo, getegid, geteuid, getgid, getgroups, getMaxListeners, getuid, hasUncaughtExceptionCaptureCallback, initgroups, kill, listenerCount, listeners, loadEnvFile, memoryUsage, moduleLoadList, off, on, once, openStdin, permission, pid, ppid, prependListener, prependOnceListener, rawListeners, reallyExit, ref, release, removeAllListeners, removeListener, report, resourceUsage, send, setegid, seteuid, setgid, setgroups, setMaxListeners, setSourceMapsEnabled, setuid, setUncaughtExceptionCaptureCallback, sourceMapsEnabled, stderr, stdin, stdout, throwDeprecation, title, traceDeprecation, umask, unref, uptime, version, versions, _process, process_default;
var init_process2 = __esm({
  "../../node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    init_hrtime();
    init_process();
    globalProcess = globalThis["process"];
    getBuiltinModule = globalProcess.getBuiltinModule;
    workerdProcess = getBuiltinModule("node:process");
    isWorkerdProcessV2 = globalThis.Cloudflare.compatibilityFlags.enable_nodejs_process_v2;
    unenvProcess = new Process({
      env: globalProcess.env,
      // `hrtime` is only available from workerd process v2
      hrtime: isWorkerdProcessV2 ? workerdProcess.hrtime : hrtime,
      // `nextTick` is available from workerd process v1
      nextTick: workerdProcess.nextTick
    });
    ({ exit, features, platform } = workerdProcess);
    ({
      env: (
        // Always implemented by workerd
        env
      ),
      hrtime: (
        // Only implemented in workerd v2
        hrtime3
      ),
      nextTick: (
        // Always implemented by workerd
        nextTick
      )
    } = unenvProcess);
    ({
      _channel,
      _disconnect,
      _events,
      _eventsCount,
      _handleQueue,
      _maxListeners,
      _pendingMessage,
      _send,
      assert,
      disconnect,
      mainModule
    } = unenvProcess);
    ({
      _debugEnd: (
        // @ts-expect-error `_debugEnd` is missing typings
        _debugEnd
      ),
      _debugProcess: (
        // @ts-expect-error `_debugProcess` is missing typings
        _debugProcess
      ),
      _exiting: (
        // @ts-expect-error `_exiting` is missing typings
        _exiting
      ),
      _fatalException: (
        // @ts-expect-error `_fatalException` is missing typings
        _fatalException
      ),
      _getActiveHandles: (
        // @ts-expect-error `_getActiveHandles` is missing typings
        _getActiveHandles
      ),
      _getActiveRequests: (
        // @ts-expect-error `_getActiveRequests` is missing typings
        _getActiveRequests
      ),
      _kill: (
        // @ts-expect-error `_kill` is missing typings
        _kill
      ),
      _linkedBinding: (
        // @ts-expect-error `_linkedBinding` is missing typings
        _linkedBinding
      ),
      _preload_modules: (
        // @ts-expect-error `_preload_modules` is missing typings
        _preload_modules
      ),
      _rawDebug: (
        // @ts-expect-error `_rawDebug` is missing typings
        _rawDebug
      ),
      _startProfilerIdleNotifier: (
        // @ts-expect-error `_startProfilerIdleNotifier` is missing typings
        _startProfilerIdleNotifier
      ),
      _stopProfilerIdleNotifier: (
        // @ts-expect-error `_stopProfilerIdleNotifier` is missing typings
        _stopProfilerIdleNotifier
      ),
      _tickCallback: (
        // @ts-expect-error `_tickCallback` is missing typings
        _tickCallback
      ),
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      arch,
      argv,
      argv0,
      availableMemory,
      binding: (
        // @ts-expect-error `binding` is missing typings
        binding
      ),
      channel,
      chdir,
      config,
      connected,
      constrainedMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      domain: (
        // @ts-expect-error `domain` is missing typings
        domain
      ),
      emit,
      emitWarning,
      eventNames,
      execArgv,
      execPath,
      exitCode,
      finalization,
      getActiveResourcesInfo,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getMaxListeners,
      getuid,
      hasUncaughtExceptionCaptureCallback,
      initgroups: (
        // @ts-expect-error `initgroups` is missing typings
        initgroups
      ),
      kill,
      listenerCount,
      listeners,
      loadEnvFile,
      memoryUsage,
      moduleLoadList: (
        // @ts-expect-error `moduleLoadList` is missing typings
        moduleLoadList
      ),
      off,
      on,
      once,
      openStdin: (
        // @ts-expect-error `openStdin` is missing typings
        openStdin
      ),
      permission,
      pid,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      reallyExit: (
        // @ts-expect-error `reallyExit` is missing typings
        reallyExit
      ),
      ref,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      send,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setMaxListeners,
      setSourceMapsEnabled,
      setuid,
      setUncaughtExceptionCaptureCallback,
      sourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      throwDeprecation,
      title,
      traceDeprecation,
      umask,
      unref,
      uptime,
      version,
      versions
    } = isWorkerdProcessV2 ? workerdProcess : unenvProcess);
    _process = {
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      hasUncaughtExceptionCaptureCallback,
      setUncaughtExceptionCaptureCallback,
      loadEnvFile,
      sourceMapsEnabled,
      arch,
      argv,
      argv0,
      chdir,
      config,
      connected,
      constrainedMemory,
      availableMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      disconnect,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exit,
      finalization,
      features,
      getBuiltinModule,
      getActiveResourcesInfo,
      getMaxListeners,
      hrtime: hrtime3,
      kill,
      listeners,
      listenerCount,
      memoryUsage,
      nextTick,
      on,
      off,
      once,
      pid,
      platform,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      setMaxListeners,
      setSourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      title,
      throwDeprecation,
      traceDeprecation,
      umask,
      uptime,
      version,
      versions,
      // @ts-expect-error old API
      domain,
      initgroups,
      moduleLoadList,
      reallyExit,
      openStdin,
      assert,
      binding,
      send,
      exitCode,
      channel,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getuid,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setuid,
      permission,
      mainModule,
      _events,
      _eventsCount,
      _exiting,
      _maxListeners,
      _debugEnd,
      _debugProcess,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _kill,
      _preload_modules,
      _rawDebug,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      _disconnect,
      _handleQueue,
      _pendingMessage,
      _channel,
      _send,
      _linkedBinding
    };
    process_default = _process;
  }
});

// ../../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process = __esm({
  "../../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process"() {
    init_process2();
    globalThis.process = process_default;
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
  }
});

// ../../node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "../../node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// node-built-in-modules:events
import libDefault from "events";
var require_events = __commonJS({
  "node-built-in-modules:events"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    module.exports = libDefault;
  }
});

// ../../node_modules/pg-types/node_modules/postgres-array/index.js
var require_postgres_array = __commonJS({
  "../../node_modules/pg-types/node_modules/postgres-array/index.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    exports.parse = function(source, transform) {
      return new ArrayParser(source, transform).parse();
    };
    var ArrayParser = class _ArrayParser {
      static {
        __name(this, "ArrayParser");
      }
      constructor(source, transform) {
        this.source = source;
        this.transform = transform || identity;
        this.position = 0;
        this.entries = [];
        this.recorded = [];
        this.dimension = 0;
      }
      isEof() {
        return this.position >= this.source.length;
      }
      nextCharacter() {
        var character = this.source[this.position++];
        if (character === "\\") {
          return {
            value: this.source[this.position++],
            escaped: true
          };
        }
        return {
          value: character,
          escaped: false
        };
      }
      record(character) {
        this.recorded.push(character);
      }
      newEntry(includeEmpty) {
        var entry;
        if (this.recorded.length > 0 || includeEmpty) {
          entry = this.recorded.join("");
          if (entry === "NULL" && !includeEmpty) {
            entry = null;
          }
          if (entry !== null) entry = this.transform(entry);
          this.entries.push(entry);
          this.recorded = [];
        }
      }
      consumeDimensions() {
        if (this.source[0] === "[") {
          while (!this.isEof()) {
            var char = this.nextCharacter();
            if (char.value === "=") break;
          }
        }
      }
      parse(nested) {
        var character, parser, quote;
        this.consumeDimensions();
        while (!this.isEof()) {
          character = this.nextCharacter();
          if (character.value === "{" && !quote) {
            this.dimension++;
            if (this.dimension > 1) {
              parser = new _ArrayParser(this.source.substr(this.position - 1), this.transform);
              this.entries.push(parser.parse(true));
              this.position += parser.position - 2;
            }
          } else if (character.value === "}" && !quote) {
            this.dimension--;
            if (!this.dimension) {
              this.newEntry();
              if (nested) return this.entries;
            }
          } else if (character.value === '"' && !character.escaped) {
            if (quote) this.newEntry(true);
            quote = !quote;
          } else if (character.value === "," && !quote) {
            this.newEntry();
          } else {
            this.record(character.value);
          }
        }
        if (this.dimension !== 0) {
          throw new Error("array dimension not balanced");
        }
        return this.entries;
      }
    };
    function identity(value) {
      return value;
    }
    __name(identity, "identity");
  }
});

// ../../node_modules/pg-types/lib/arrayParser.js
var require_arrayParser = __commonJS({
  "../../node_modules/pg-types/lib/arrayParser.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var array = require_postgres_array();
    module.exports = {
      create: /* @__PURE__ */ __name(function(source, transform) {
        return {
          parse: /* @__PURE__ */ __name(function() {
            return array.parse(source, transform);
          }, "parse")
        };
      }, "create")
    };
  }
});

// ../../node_modules/postgres-date/index.js
var require_postgres_date = __commonJS({
  "../../node_modules/postgres-date/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var DATE_TIME = /(\d{1,})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(\.\d{1,})?.*?( BC)?$/;
    var DATE = /^(\d{1,})-(\d{2})-(\d{2})( BC)?$/;
    var TIME_ZONE = /([Z+-])(\d{2})?:?(\d{2})?:?(\d{2})?/;
    var INFINITY2 = /^-?infinity$/;
    module.exports = /* @__PURE__ */ __name(function parseDate(isoDate) {
      if (INFINITY2.test(isoDate)) {
        return Number(isoDate.replace("i", "I"));
      }
      var matches = DATE_TIME.exec(isoDate);
      if (!matches) {
        return getDate(isoDate) || null;
      }
      var isBC = !!matches[8];
      var year = parseInt(matches[1], 10);
      if (isBC) {
        year = bcYearToNegativeYear(year);
      }
      var month = parseInt(matches[2], 10) - 1;
      var day = matches[3];
      var hour = parseInt(matches[4], 10);
      var minute = parseInt(matches[5], 10);
      var second = parseInt(matches[6], 10);
      var ms2 = matches[7];
      ms2 = ms2 ? 1e3 * parseFloat(ms2) : 0;
      var date;
      var offset = timeZoneOffset(isoDate);
      if (offset != null) {
        date = new Date(Date.UTC(year, month, day, hour, minute, second, ms2));
        if (is0To99(year)) {
          date.setUTCFullYear(year);
        }
        if (offset !== 0) {
          date.setTime(date.getTime() - offset);
        }
      } else {
        date = new Date(year, month, day, hour, minute, second, ms2);
        if (is0To99(year)) {
          date.setFullYear(year);
        }
      }
      return date;
    }, "parseDate");
    function getDate(isoDate) {
      var matches = DATE.exec(isoDate);
      if (!matches) {
        return;
      }
      var year = parseInt(matches[1], 10);
      var isBC = !!matches[4];
      if (isBC) {
        year = bcYearToNegativeYear(year);
      }
      var month = parseInt(matches[2], 10) - 1;
      var day = matches[3];
      var date = new Date(year, month, day);
      if (is0To99(year)) {
        date.setFullYear(year);
      }
      return date;
    }
    __name(getDate, "getDate");
    function timeZoneOffset(isoDate) {
      if (isoDate.endsWith("+00")) {
        return 0;
      }
      var zone = TIME_ZONE.exec(isoDate.split(" ")[1]);
      if (!zone) return;
      var type = zone[1];
      if (type === "Z") {
        return 0;
      }
      var sign2 = type === "-" ? -1 : 1;
      var offset = parseInt(zone[2], 10) * 3600 + parseInt(zone[3] || 0, 10) * 60 + parseInt(zone[4] || 0, 10);
      return offset * sign2 * 1e3;
    }
    __name(timeZoneOffset, "timeZoneOffset");
    function bcYearToNegativeYear(year) {
      return -(year - 1);
    }
    __name(bcYearToNegativeYear, "bcYearToNegativeYear");
    function is0To99(num) {
      return num >= 0 && num < 100;
    }
    __name(is0To99, "is0To99");
  }
});

// ../../node_modules/xtend/mutable.js
var require_mutable = __commonJS({
  "../../node_modules/xtend/mutable.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    module.exports = extend;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    function extend(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    }
    __name(extend, "extend");
  }
});

// ../../node_modules/postgres-interval/index.js
var require_postgres_interval = __commonJS({
  "../../node_modules/postgres-interval/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var extend = require_mutable();
    module.exports = PostgresInterval;
    function PostgresInterval(raw3) {
      if (!(this instanceof PostgresInterval)) {
        return new PostgresInterval(raw3);
      }
      extend(this, parse(raw3));
    }
    __name(PostgresInterval, "PostgresInterval");
    var properties = ["seconds", "minutes", "hours", "days", "months", "years"];
    PostgresInterval.prototype.toPostgres = function() {
      var filtered = properties.filter(this.hasOwnProperty, this);
      if (this.milliseconds && filtered.indexOf("seconds") < 0) {
        filtered.push("seconds");
      }
      if (filtered.length === 0) return "0";
      return filtered.map(function(property) {
        var value = this[property] || 0;
        if (property === "seconds" && this.milliseconds) {
          value = (value + this.milliseconds / 1e3).toFixed(6).replace(/\.?0+$/, "");
        }
        return value + " " + property;
      }, this).join(" ");
    };
    var propertiesISOEquivalent = {
      years: "Y",
      months: "M",
      days: "D",
      hours: "H",
      minutes: "M",
      seconds: "S"
    };
    var dateProperties = ["years", "months", "days"];
    var timeProperties = ["hours", "minutes", "seconds"];
    PostgresInterval.prototype.toISOString = PostgresInterval.prototype.toISO = function() {
      var datePart = dateProperties.map(buildProperty, this).join("");
      var timePart = timeProperties.map(buildProperty, this).join("");
      return "P" + datePart + "T" + timePart;
      function buildProperty(property) {
        var value = this[property] || 0;
        if (property === "seconds" && this.milliseconds) {
          value = (value + this.milliseconds / 1e3).toFixed(6).replace(/0+$/, "");
        }
        return value + propertiesISOEquivalent[property];
      }
      __name(buildProperty, "buildProperty");
    };
    var NUMBER = "([+-]?\\d+)";
    var YEAR = NUMBER + "\\s+years?";
    var MONTH = NUMBER + "\\s+mons?";
    var DAY = NUMBER + "\\s+days?";
    var TIME = "([+-])?([\\d]*):(\\d\\d):(\\d\\d)\\.?(\\d{1,6})?";
    var INTERVAL = new RegExp([YEAR, MONTH, DAY, TIME].map(function(regexString) {
      return "(" + regexString + ")?";
    }).join("\\s*"));
    var positions = {
      years: 2,
      months: 4,
      days: 6,
      hours: 9,
      minutes: 10,
      seconds: 11,
      milliseconds: 12
    };
    var negatives = ["hours", "minutes", "seconds", "milliseconds"];
    function parseMilliseconds(fraction) {
      var microseconds = fraction + "000000".slice(fraction.length);
      return parseInt(microseconds, 10) / 1e3;
    }
    __name(parseMilliseconds, "parseMilliseconds");
    function parse(interval) {
      if (!interval) return {};
      var matches = INTERVAL.exec(interval);
      var isNegative = matches[8] === "-";
      return Object.keys(positions).reduce(function(parsed, property) {
        var position = positions[property];
        var value = matches[position];
        if (!value) return parsed;
        value = property === "milliseconds" ? parseMilliseconds(value) : parseInt(value, 10);
        if (!value) return parsed;
        if (isNegative && ~negatives.indexOf(property)) {
          value *= -1;
        }
        parsed[property] = value;
        return parsed;
      }, {});
    }
    __name(parse, "parse");
  }
});

// ../../node_modules/postgres-bytea/index.js
var require_postgres_bytea = __commonJS({
  "../../node_modules/postgres-bytea/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var bufferFrom = Buffer.from || Buffer;
    module.exports = /* @__PURE__ */ __name(function parseBytea(input) {
      if (/^\\x/.test(input)) {
        return bufferFrom(input.substr(2), "hex");
      }
      var output = "";
      var i = 0;
      while (i < input.length) {
        if (input[i] !== "\\") {
          output += input[i];
          ++i;
        } else {
          if (/[0-7]{3}/.test(input.substr(i + 1, 3))) {
            output += String.fromCharCode(parseInt(input.substr(i + 1, 3), 8));
            i += 4;
          } else {
            var backslashes = 1;
            while (i + backslashes < input.length && input[i + backslashes] === "\\") {
              backslashes++;
            }
            for (var k2 = 0; k2 < Math.floor(backslashes / 2); ++k2) {
              output += "\\";
            }
            i += Math.floor(backslashes / 2) * 2;
          }
        }
      }
      return bufferFrom(output, "binary");
    }, "parseBytea");
  }
});

// ../../node_modules/pg-types/lib/textParsers.js
var require_textParsers = __commonJS({
  "../../node_modules/pg-types/lib/textParsers.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var array = require_postgres_array();
    var arrayParser = require_arrayParser();
    var parseDate = require_postgres_date();
    var parseInterval = require_postgres_interval();
    var parseByteA = require_postgres_bytea();
    function allowNull(fn2) {
      return /* @__PURE__ */ __name(function nullAllowed(value) {
        if (value === null) return value;
        return fn2(value);
      }, "nullAllowed");
    }
    __name(allowNull, "allowNull");
    function parseBool(value) {
      if (value === null) return value;
      return value === "TRUE" || value === "t" || value === "true" || value === "y" || value === "yes" || value === "on" || value === "1";
    }
    __name(parseBool, "parseBool");
    function parseBoolArray(value) {
      if (!value) return null;
      return array.parse(value, parseBool);
    }
    __name(parseBoolArray, "parseBoolArray");
    function parseBaseTenInt(string) {
      return parseInt(string, 10);
    }
    __name(parseBaseTenInt, "parseBaseTenInt");
    function parseIntegerArray(value) {
      if (!value) return null;
      return array.parse(value, allowNull(parseBaseTenInt));
    }
    __name(parseIntegerArray, "parseIntegerArray");
    function parseBigIntegerArray(value) {
      if (!value) return null;
      return array.parse(value, allowNull(function(entry) {
        return parseBigInteger(entry).trim();
      }));
    }
    __name(parseBigIntegerArray, "parseBigIntegerArray");
    var parsePointArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p3 = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parsePoint(entry);
        }
        return entry;
      });
      return p3.parse();
    }, "parsePointArray");
    var parseFloatArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p3 = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parseFloat(entry);
        }
        return entry;
      });
      return p3.parse();
    }, "parseFloatArray");
    var parseStringArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p3 = arrayParser.create(value);
      return p3.parse();
    }, "parseStringArray");
    var parseDateArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p3 = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parseDate(entry);
        }
        return entry;
      });
      return p3.parse();
    }, "parseDateArray");
    var parseIntervalArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      var p3 = arrayParser.create(value, function(entry) {
        if (entry !== null) {
          entry = parseInterval(entry);
        }
        return entry;
      });
      return p3.parse();
    }, "parseIntervalArray");
    var parseByteAArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      return array.parse(value, allowNull(parseByteA));
    }, "parseByteAArray");
    var parseInteger = /* @__PURE__ */ __name(function(value) {
      return parseInt(value, 10);
    }, "parseInteger");
    var parseBigInteger = /* @__PURE__ */ __name(function(value) {
      var valStr = String(value);
      if (/^\d+$/.test(valStr)) {
        return valStr;
      }
      return value;
    }, "parseBigInteger");
    var parseJsonArray = /* @__PURE__ */ __name(function(value) {
      if (!value) {
        return null;
      }
      return array.parse(value, allowNull(JSON.parse));
    }, "parseJsonArray");
    var parsePoint = /* @__PURE__ */ __name(function(value) {
      if (value[0] !== "(") {
        return null;
      }
      value = value.substring(1, value.length - 1).split(",");
      return {
        x: parseFloat(value[0]),
        y: parseFloat(value[1])
      };
    }, "parsePoint");
    var parseCircle = /* @__PURE__ */ __name(function(value) {
      if (value[0] !== "<" && value[1] !== "(") {
        return null;
      }
      var point = "(";
      var radius = "";
      var pointParsed = false;
      for (var i = 2; i < value.length - 1; i++) {
        if (!pointParsed) {
          point += value[i];
        }
        if (value[i] === ")") {
          pointParsed = true;
          continue;
        } else if (!pointParsed) {
          continue;
        }
        if (value[i] === ",") {
          continue;
        }
        radius += value[i];
      }
      var result = parsePoint(point);
      result.radius = parseFloat(radius);
      return result;
    }, "parseCircle");
    var init3 = /* @__PURE__ */ __name(function(register) {
      register(20, parseBigInteger);
      register(21, parseInteger);
      register(23, parseInteger);
      register(26, parseInteger);
      register(700, parseFloat);
      register(701, parseFloat);
      register(16, parseBool);
      register(1082, parseDate);
      register(1114, parseDate);
      register(1184, parseDate);
      register(600, parsePoint);
      register(651, parseStringArray);
      register(718, parseCircle);
      register(1e3, parseBoolArray);
      register(1001, parseByteAArray);
      register(1005, parseIntegerArray);
      register(1007, parseIntegerArray);
      register(1028, parseIntegerArray);
      register(1016, parseBigIntegerArray);
      register(1017, parsePointArray);
      register(1021, parseFloatArray);
      register(1022, parseFloatArray);
      register(1231, parseFloatArray);
      register(1014, parseStringArray);
      register(1015, parseStringArray);
      register(1008, parseStringArray);
      register(1009, parseStringArray);
      register(1040, parseStringArray);
      register(1041, parseStringArray);
      register(1115, parseDateArray);
      register(1182, parseDateArray);
      register(1185, parseDateArray);
      register(1186, parseInterval);
      register(1187, parseIntervalArray);
      register(17, parseByteA);
      register(114, JSON.parse.bind(JSON));
      register(3802, JSON.parse.bind(JSON));
      register(199, parseJsonArray);
      register(3807, parseJsonArray);
      register(3907, parseStringArray);
      register(2951, parseStringArray);
      register(791, parseStringArray);
      register(1183, parseStringArray);
      register(1270, parseStringArray);
    }, "init");
    module.exports = {
      init: init3
    };
  }
});

// ../../node_modules/pg-int8/index.js
var require_pg_int8 = __commonJS({
  "../../node_modules/pg-int8/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var BASE2 = 1e6;
    function readInt8(buffer) {
      var high = buffer.readInt32BE(0);
      var low = buffer.readUInt32BE(4);
      var sign2 = "";
      if (high < 0) {
        high = ~high + (low === 0);
        low = ~low + 1 >>> 0;
        sign2 = "-";
      }
      var result = "";
      var carry;
      var t;
      var digits;
      var pad;
      var l3;
      var i;
      {
        carry = high % BASE2;
        high = high / BASE2 >>> 0;
        t = 4294967296 * carry + low;
        low = t / BASE2 >>> 0;
        digits = "" + (t - BASE2 * low);
        if (low === 0 && high === 0) {
          return sign2 + digits + result;
        }
        pad = "";
        l3 = 6 - digits.length;
        for (i = 0; i < l3; i++) {
          pad += "0";
        }
        result = pad + digits + result;
      }
      {
        carry = high % BASE2;
        high = high / BASE2 >>> 0;
        t = 4294967296 * carry + low;
        low = t / BASE2 >>> 0;
        digits = "" + (t - BASE2 * low);
        if (low === 0 && high === 0) {
          return sign2 + digits + result;
        }
        pad = "";
        l3 = 6 - digits.length;
        for (i = 0; i < l3; i++) {
          pad += "0";
        }
        result = pad + digits + result;
      }
      {
        carry = high % BASE2;
        high = high / BASE2 >>> 0;
        t = 4294967296 * carry + low;
        low = t / BASE2 >>> 0;
        digits = "" + (t - BASE2 * low);
        if (low === 0 && high === 0) {
          return sign2 + digits + result;
        }
        pad = "";
        l3 = 6 - digits.length;
        for (i = 0; i < l3; i++) {
          pad += "0";
        }
        result = pad + digits + result;
      }
      {
        carry = high % BASE2;
        t = 4294967296 * carry + low;
        digits = "" + t % BASE2;
        return sign2 + digits + result;
      }
    }
    __name(readInt8, "readInt8");
    module.exports = readInt8;
  }
});

// ../../node_modules/pg-types/lib/binaryParsers.js
var require_binaryParsers = __commonJS({
  "../../node_modules/pg-types/lib/binaryParsers.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var parseInt64 = require_pg_int8();
    var parseBits = /* @__PURE__ */ __name(function(data, bits, offset, invert, callback) {
      offset = offset || 0;
      invert = invert || false;
      callback = callback || function(lastValue, newValue, bits2) {
        return lastValue * Math.pow(2, bits2) + newValue;
      };
      var offsetBytes = offset >> 3;
      var inv = /* @__PURE__ */ __name(function(value) {
        if (invert) {
          return ~value & 255;
        }
        return value;
      }, "inv");
      var mask = 255;
      var firstBits = 8 - offset % 8;
      if (bits < firstBits) {
        mask = 255 << 8 - bits & 255;
        firstBits = bits;
      }
      if (offset) {
        mask = mask >> offset % 8;
      }
      var result = 0;
      if (offset % 8 + bits >= 8) {
        result = callback(0, inv(data[offsetBytes]) & mask, firstBits);
      }
      var bytes = bits + offset >> 3;
      for (var i = offsetBytes + 1; i < bytes; i++) {
        result = callback(result, inv(data[i]), 8);
      }
      var lastBits = (bits + offset) % 8;
      if (lastBits > 0) {
        result = callback(result, inv(data[bytes]) >> 8 - lastBits, lastBits);
      }
      return result;
    }, "parseBits");
    var parseFloatFromBits = /* @__PURE__ */ __name(function(data, precisionBits, exponentBits) {
      var bias = Math.pow(2, exponentBits - 1) - 1;
      var sign2 = parseBits(data, 1);
      var exponent = parseBits(data, exponentBits, 1);
      if (exponent === 0) {
        return 0;
      }
      var precisionBitsCounter = 1;
      var parsePrecisionBits = /* @__PURE__ */ __name(function(lastValue, newValue, bits) {
        if (lastValue === 0) {
          lastValue = 1;
        }
        for (var i = 1; i <= bits; i++) {
          precisionBitsCounter /= 2;
          if ((newValue & 1 << bits - i) > 0) {
            lastValue += precisionBitsCounter;
          }
        }
        return lastValue;
      }, "parsePrecisionBits");
      var mantissa = parseBits(data, precisionBits, exponentBits + 1, false, parsePrecisionBits);
      if (exponent == Math.pow(2, exponentBits + 1) - 1) {
        if (mantissa === 0) {
          return sign2 === 0 ? Infinity : -Infinity;
        }
        return NaN;
      }
      return (sign2 === 0 ? 1 : -1) * Math.pow(2, exponent - bias) * mantissa;
    }, "parseFloatFromBits");
    var parseInt16 = /* @__PURE__ */ __name(function(value) {
      if (parseBits(value, 1) == 1) {
        return -1 * (parseBits(value, 15, 1, true) + 1);
      }
      return parseBits(value, 15, 1);
    }, "parseInt16");
    var parseInt32 = /* @__PURE__ */ __name(function(value) {
      if (parseBits(value, 1) == 1) {
        return -1 * (parseBits(value, 31, 1, true) + 1);
      }
      return parseBits(value, 31, 1);
    }, "parseInt32");
    var parseFloat32 = /* @__PURE__ */ __name(function(value) {
      return parseFloatFromBits(value, 23, 8);
    }, "parseFloat32");
    var parseFloat64 = /* @__PURE__ */ __name(function(value) {
      return parseFloatFromBits(value, 52, 11);
    }, "parseFloat64");
    var parseNumeric = /* @__PURE__ */ __name(function(value) {
      var sign2 = parseBits(value, 16, 32);
      if (sign2 == 49152) {
        return NaN;
      }
      var weight = Math.pow(1e4, parseBits(value, 16, 16));
      var result = 0;
      var digits = [];
      var ndigits = parseBits(value, 16);
      for (var i = 0; i < ndigits; i++) {
        result += parseBits(value, 16, 64 + 16 * i) * weight;
        weight /= 1e4;
      }
      var scale = Math.pow(10, parseBits(value, 16, 48));
      return (sign2 === 0 ? 1 : -1) * Math.round(result * scale) / scale;
    }, "parseNumeric");
    var parseDate = /* @__PURE__ */ __name(function(isUTC, value) {
      var sign2 = parseBits(value, 1);
      var rawValue = parseBits(value, 63, 1);
      var result = new Date((sign2 === 0 ? 1 : -1) * rawValue / 1e3 + 9466848e5);
      if (!isUTC) {
        result.setTime(result.getTime() + result.getTimezoneOffset() * 6e4);
      }
      result.usec = rawValue % 1e3;
      result.getMicroSeconds = function() {
        return this.usec;
      };
      result.setMicroSeconds = function(value2) {
        this.usec = value2;
      };
      result.getUTCMicroSeconds = function() {
        return this.usec;
      };
      return result;
    }, "parseDate");
    var parseArray2 = /* @__PURE__ */ __name(function(value) {
      var dim2 = parseBits(value, 32);
      var flags = parseBits(value, 32, 32);
      var elementType = parseBits(value, 32, 64);
      var offset = 96;
      var dims = [];
      for (var i = 0; i < dim2; i++) {
        dims[i] = parseBits(value, 32, offset);
        offset += 32;
        offset += 32;
      }
      var parseElement = /* @__PURE__ */ __name(function(elementType2) {
        var length = parseBits(value, 32, offset);
        offset += 32;
        if (length == 4294967295) {
          return null;
        }
        var result;
        if (elementType2 == 23 || elementType2 == 20) {
          result = parseBits(value, length * 8, offset);
          offset += length * 8;
          return result;
        } else if (elementType2 == 25) {
          result = value.toString(this.encoding, offset >> 3, (offset += length << 3) >> 3);
          return result;
        } else {
          console.log("ERROR: ElementType not implemented: " + elementType2);
        }
      }, "parseElement");
      var parse = /* @__PURE__ */ __name(function(dimension, elementType2) {
        var array = [];
        var i2;
        if (dimension.length > 1) {
          var count = dimension.shift();
          for (i2 = 0; i2 < count; i2++) {
            array[i2] = parse(dimension, elementType2);
          }
          dimension.unshift(count);
        } else {
          for (i2 = 0; i2 < dimension[0]; i2++) {
            array[i2] = parseElement(elementType2);
          }
        }
        return array;
      }, "parse");
      return parse(dims, elementType);
    }, "parseArray");
    var parseText = /* @__PURE__ */ __name(function(value) {
      return value.toString("utf8");
    }, "parseText");
    var parseBool = /* @__PURE__ */ __name(function(value) {
      if (value === null) return null;
      return parseBits(value, 8) > 0;
    }, "parseBool");
    var init3 = /* @__PURE__ */ __name(function(register) {
      register(20, parseInt64);
      register(21, parseInt16);
      register(23, parseInt32);
      register(26, parseInt32);
      register(1700, parseNumeric);
      register(700, parseFloat32);
      register(701, parseFloat64);
      register(16, parseBool);
      register(1114, parseDate.bind(null, false));
      register(1184, parseDate.bind(null, true));
      register(1e3, parseArray2);
      register(1007, parseArray2);
      register(1016, parseArray2);
      register(1008, parseArray2);
      register(1009, parseArray2);
      register(25, parseText);
    }, "init");
    module.exports = {
      init: init3
    };
  }
});

// ../../node_modules/pg-types/lib/builtins.js
var require_builtins = __commonJS({
  "../../node_modules/pg-types/lib/builtins.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    module.exports = {
      BOOL: 16,
      BYTEA: 17,
      CHAR: 18,
      INT8: 20,
      INT2: 21,
      INT4: 23,
      REGPROC: 24,
      TEXT: 25,
      OID: 26,
      TID: 27,
      XID: 28,
      CID: 29,
      JSON: 114,
      XML: 142,
      PG_NODE_TREE: 194,
      SMGR: 210,
      PATH: 602,
      POLYGON: 604,
      CIDR: 650,
      FLOAT4: 700,
      FLOAT8: 701,
      ABSTIME: 702,
      RELTIME: 703,
      TINTERVAL: 704,
      CIRCLE: 718,
      MACADDR8: 774,
      MONEY: 790,
      MACADDR: 829,
      INET: 869,
      ACLITEM: 1033,
      BPCHAR: 1042,
      VARCHAR: 1043,
      DATE: 1082,
      TIME: 1083,
      TIMESTAMP: 1114,
      TIMESTAMPTZ: 1184,
      INTERVAL: 1186,
      TIMETZ: 1266,
      BIT: 1560,
      VARBIT: 1562,
      NUMERIC: 1700,
      REFCURSOR: 1790,
      REGPROCEDURE: 2202,
      REGOPER: 2203,
      REGOPERATOR: 2204,
      REGCLASS: 2205,
      REGTYPE: 2206,
      UUID: 2950,
      TXID_SNAPSHOT: 2970,
      PG_LSN: 3220,
      PG_NDISTINCT: 3361,
      PG_DEPENDENCIES: 3402,
      TSVECTOR: 3614,
      TSQUERY: 3615,
      GTSVECTOR: 3642,
      REGCONFIG: 3734,
      REGDICTIONARY: 3769,
      JSONB: 3802,
      REGNAMESPACE: 4089,
      REGROLE: 4096
    };
  }
});

// ../../node_modules/pg-types/index.js
var require_pg_types = __commonJS({
  "../../node_modules/pg-types/index.js"(exports) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var textParsers = require_textParsers();
    var binaryParsers = require_binaryParsers();
    var arrayParser = require_arrayParser();
    var builtinTypes = require_builtins();
    exports.getTypeParser = getTypeParser2;
    exports.setTypeParser = setTypeParser;
    exports.arrayParser = arrayParser;
    exports.builtins = builtinTypes;
    var typeParsers = {
      text: {},
      binary: {}
    };
    function noParse(val) {
      return String(val);
    }
    __name(noParse, "noParse");
    function getTypeParser2(oid, format) {
      format = format || "text";
      if (!typeParsers[format]) {
        return noParse;
      }
      return typeParsers[format][oid] || noParse;
    }
    __name(getTypeParser2, "getTypeParser");
    function setTypeParser(oid, format, parseFn) {
      if (typeof format == "function") {
        parseFn = format;
        format = "text";
      }
      typeParsers[format][oid] = parseFn;
    }
    __name(setTypeParser, "setTypeParser");
    textParsers.init(function(oid, converter) {
      typeParsers.text[oid] = converter;
    });
    binaryParsers.init(function(oid, converter) {
      typeParsers.binary[oid] = converter;
    });
  }
});

// ../../node_modules/pg/lib/defaults.js
var require_defaults = __commonJS({
  "../../node_modules/pg/lib/defaults.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var user;
    try {
      user = process.platform === "win32" ? process.env.USERNAME : process.env.USER;
    } catch {
    }
    module.exports = {
      // database host. defaults to localhost
      host: "localhost",
      // database user's name
      user,
      // name of database to connect
      database: void 0,
      // database user's password
      password: null,
      // a Postgres connection string to be used instead of setting individual connection items
      // NOTE:  Setting this value will cause it to override any other value (such as database or user) defined
      // in the defaults object.
      connectionString: void 0,
      // database port
      port: 5432,
      // number of rows to return at a time from a prepared statement's
      // portal. 0 will return all rows at once
      rows: 0,
      // binary result mode
      binary: false,
      // Connection pool options - see https://github.com/brianc/node-pg-pool
      // number of connections to use in connection pool
      // 0 will disable connection pooling
      max: 10,
      // max milliseconds a client can go unused before it is removed
      // from the pool and destroyed
      idleTimeoutMillis: 3e4,
      client_encoding: "",
      ssl: false,
      application_name: void 0,
      fallback_application_name: void 0,
      options: void 0,
      parseInputDatesAsUTC: false,
      // max milliseconds any query using this connection will execute for before timing out in error.
      // false=unlimited
      statement_timeout: false,
      // Abort any statement that waits longer than the specified duration in milliseconds while attempting to acquire a lock.
      // false=unlimited
      lock_timeout: false,
      // Terminate any session with an open transaction that has been idle for longer than the specified duration in milliseconds
      // false=unlimited
      idle_in_transaction_session_timeout: false,
      // max milliseconds to wait for query to complete (client side)
      query_timeout: false,
      connect_timeout: 0,
      keepalives: 1,
      keepalives_idle: 0
    };
    var pgTypes = require_pg_types();
    var parseBigInteger = pgTypes.getTypeParser(20, "text");
    var parseBigIntegerArray = pgTypes.getTypeParser(1016, "text");
    module.exports.__defineSetter__("parseInt8", function(val) {
      pgTypes.setTypeParser(20, "text", val ? pgTypes.getTypeParser(23, "text") : parseBigInteger);
      pgTypes.setTypeParser(1016, "text", val ? pgTypes.getTypeParser(1007, "text") : parseBigIntegerArray);
    });
  }
});

// node-built-in-modules:util
import libDefault2 from "util";
var require_util = __commonJS({
  "node-built-in-modules:util"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    module.exports = libDefault2;
  }
});

// ../../node_modules/pg/lib/utils.js
var require_utils = __commonJS({
  "../../node_modules/pg/lib/utils.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var defaults3 = require_defaults();
    var util = require_util();
    var { isDate } = util.types || util;
    function escapeElement(elementRepresentation) {
      const escaped = elementRepresentation.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      return '"' + escaped + '"';
    }
    __name(escapeElement, "escapeElement");
    function arrayString(val) {
      let result = "{";
      for (let i = 0; i < val.length; i++) {
        if (i > 0) {
          result = result + ",";
        }
        if (val[i] === null || typeof val[i] === "undefined") {
          result = result + "NULL";
        } else if (Array.isArray(val[i])) {
          result = result + arrayString(val[i]);
        } else if (ArrayBuffer.isView(val[i])) {
          let item = val[i];
          if (!(item instanceof Buffer)) {
            const buf = Buffer.from(item.buffer, item.byteOffset, item.byteLength);
            if (buf.length === item.byteLength) {
              item = buf;
            } else {
              item = buf.slice(item.byteOffset, item.byteOffset + item.byteLength);
            }
          }
          result += "\\\\x" + item.toString("hex");
        } else {
          result += escapeElement(prepareValue(val[i]));
        }
      }
      result = result + "}";
      return result;
    }
    __name(arrayString, "arrayString");
    var prepareValue = /* @__PURE__ */ __name(function(val, seen) {
      if (val == null) {
        return null;
      }
      if (typeof val === "object") {
        if (val instanceof Buffer) {
          return val;
        }
        if (ArrayBuffer.isView(val)) {
          const buf = Buffer.from(val.buffer, val.byteOffset, val.byteLength);
          if (buf.length === val.byteLength) {
            return buf;
          }
          return buf.slice(val.byteOffset, val.byteOffset + val.byteLength);
        }
        if (isDate(val)) {
          if (defaults3.parseInputDatesAsUTC) {
            return dateToStringUTC(val);
          } else {
            return dateToString(val);
          }
        }
        if (Array.isArray(val)) {
          return arrayString(val);
        }
        return prepareObject(val, seen);
      }
      return val.toString();
    }, "prepareValue");
    function prepareObject(val, seen) {
      if (val && typeof val.toPostgres === "function") {
        seen = seen || [];
        if (seen.indexOf(val) !== -1) {
          throw new Error('circular reference detected while preparing "' + val + '" for query');
        }
        seen.push(val);
        return prepareValue(val.toPostgres(prepareValue), seen);
      }
      return JSON.stringify(val);
    }
    __name(prepareObject, "prepareObject");
    function dateToString(date) {
      let offset = -date.getTimezoneOffset();
      let year = date.getFullYear();
      const isBCYear = year < 1;
      if (isBCYear) year = Math.abs(year) + 1;
      let ret = String(year).padStart(4, "0") + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0") + "T" + String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0") + "." + String(date.getMilliseconds()).padStart(3, "0");
      if (offset < 0) {
        ret += "-";
        offset *= -1;
      } else {
        ret += "+";
      }
      ret += String(Math.floor(offset / 60)).padStart(2, "0") + ":" + String(offset % 60).padStart(2, "0");
      if (isBCYear) ret += " BC";
      return ret;
    }
    __name(dateToString, "dateToString");
    function dateToStringUTC(date) {
      let year = date.getUTCFullYear();
      const isBCYear = year < 1;
      if (isBCYear) year = Math.abs(year) + 1;
      let ret = String(year).padStart(4, "0") + "-" + String(date.getUTCMonth() + 1).padStart(2, "0") + "-" + String(date.getUTCDate()).padStart(2, "0") + "T" + String(date.getUTCHours()).padStart(2, "0") + ":" + String(date.getUTCMinutes()).padStart(2, "0") + ":" + String(date.getUTCSeconds()).padStart(2, "0") + "." + String(date.getUTCMilliseconds()).padStart(3, "0");
      ret += "+00:00";
      if (isBCYear) ret += " BC";
      return ret;
    }
    __name(dateToStringUTC, "dateToStringUTC");
    function normalizeQueryConfig(config4, values, callback) {
      config4 = typeof config4 === "string" ? { text: config4 } : config4;
      if (values) {
        if (typeof values === "function") {
          config4.callback = values;
        } else {
          config4.values = values;
        }
      }
      if (callback) {
        config4.callback = callback;
      }
      return config4;
    }
    __name(normalizeQueryConfig, "normalizeQueryConfig");
    var escapeIdentifier2 = /* @__PURE__ */ __name(function(str2) {
      return '"' + str2.replace(/"/g, '""') + '"';
    }, "escapeIdentifier");
    var escapeLiteral2 = /* @__PURE__ */ __name(function(str2) {
      let hasBackslash = false;
      let escaped = "'";
      if (str2 == null) {
        return "''";
      }
      if (typeof str2 !== "string") {
        return "''";
      }
      for (let i = 0; i < str2.length; i++) {
        const c2 = str2[i];
        if (c2 === "'") {
          escaped += c2 + c2;
        } else if (c2 === "\\") {
          escaped += c2 + c2;
          hasBackslash = true;
        } else {
          escaped += c2;
        }
      }
      escaped += "'";
      if (hasBackslash === true) {
        escaped = " E" + escaped;
      }
      return escaped;
    }, "escapeLiteral");
    module.exports = {
      prepareValue: /* @__PURE__ */ __name(function prepareValueWrapper(value) {
        return prepareValue(value);
      }, "prepareValueWrapper"),
      normalizeQueryConfig,
      escapeIdentifier: escapeIdentifier2,
      escapeLiteral: escapeLiteral2
    };
  }
});

// node-built-in-modules:crypto
import libDefault3 from "crypto";
var require_crypto = __commonJS({
  "node-built-in-modules:crypto"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    module.exports = libDefault3;
  }
});

// ../../node_modules/pg/lib/crypto/utils-legacy.js
var require_utils_legacy = __commonJS({
  "../../node_modules/pg/lib/crypto/utils-legacy.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var nodeCrypto = require_crypto();
    function md5(string) {
      return nodeCrypto.createHash("md5").update(string, "utf-8").digest("hex");
    }
    __name(md5, "md5");
    function postgresMd5PasswordHash(user, password, salt) {
      const inner = md5(password + user);
      const outer = md5(Buffer.concat([Buffer.from(inner), salt]));
      return "md5" + outer;
    }
    __name(postgresMd5PasswordHash, "postgresMd5PasswordHash");
    function sha256(text) {
      return nodeCrypto.createHash("sha256").update(text).digest();
    }
    __name(sha256, "sha256");
    function hashByName(hashName, text) {
      hashName = hashName.replace(/(\D)-/, "$1");
      return nodeCrypto.createHash(hashName).update(text).digest();
    }
    __name(hashByName, "hashByName");
    function hmacSha256(key, msg) {
      return nodeCrypto.createHmac("sha256", key).update(msg).digest();
    }
    __name(hmacSha256, "hmacSha256");
    async function deriveKey(password, salt, iterations) {
      return nodeCrypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
    }
    __name(deriveKey, "deriveKey");
    module.exports = {
      postgresMd5PasswordHash,
      randomBytes: nodeCrypto.randomBytes,
      deriveKey,
      sha256,
      hashByName,
      hmacSha256,
      md5
    };
  }
});

// ../../node_modules/pg/lib/crypto/utils-webcrypto.js
var require_utils_webcrypto = __commonJS({
  "../../node_modules/pg/lib/crypto/utils-webcrypto.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var nodeCrypto = require_crypto();
    module.exports = {
      postgresMd5PasswordHash,
      randomBytes,
      deriveKey,
      sha256,
      hashByName,
      hmacSha256,
      md5
    };
    var webCrypto = nodeCrypto.webcrypto || globalThis.crypto;
    var subtleCrypto = webCrypto.subtle;
    var textEncoder = new TextEncoder();
    function randomBytes(length) {
      return webCrypto.getRandomValues(Buffer.alloc(length));
    }
    __name(randomBytes, "randomBytes");
    async function md5(string) {
      try {
        return nodeCrypto.createHash("md5").update(string, "utf-8").digest("hex");
      } catch (e6) {
        const data = typeof string === "string" ? textEncoder.encode(string) : string;
        const hash = await subtleCrypto.digest("MD5", data);
        return Array.from(new Uint8Array(hash)).map((b3) => b3.toString(16).padStart(2, "0")).join("");
      }
    }
    __name(md5, "md5");
    async function postgresMd5PasswordHash(user, password, salt) {
      const inner = await md5(password + user);
      const outer = await md5(Buffer.concat([Buffer.from(inner), salt]));
      return "md5" + outer;
    }
    __name(postgresMd5PasswordHash, "postgresMd5PasswordHash");
    async function sha256(text) {
      return await subtleCrypto.digest("SHA-256", text);
    }
    __name(sha256, "sha256");
    async function hashByName(hashName, text) {
      return await subtleCrypto.digest(hashName, text);
    }
    __name(hashByName, "hashByName");
    async function hmacSha256(keyBuffer, msg) {
      const key = await subtleCrypto.importKey("raw", keyBuffer, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      return await subtleCrypto.sign("HMAC", key, textEncoder.encode(msg));
    }
    __name(hmacSha256, "hmacSha256");
    async function deriveKey(password, salt, iterations) {
      const key = await subtleCrypto.importKey("raw", textEncoder.encode(password), "PBKDF2", false, ["deriveBits"]);
      const params = { name: "PBKDF2", hash: "SHA-256", salt, iterations };
      return await subtleCrypto.deriveBits(params, key, 32 * 8, ["deriveBits"]);
    }
    __name(deriveKey, "deriveKey");
  }
});

// ../../node_modules/pg/lib/crypto/utils.js
var require_utils2 = __commonJS({
  "../../node_modules/pg/lib/crypto/utils.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var useLegacyCrypto = parseInt(process.versions && process.versions.node && process.versions.node.split(".")[0]) < 15;
    if (useLegacyCrypto) {
      module.exports = require_utils_legacy();
    } else {
      module.exports = require_utils_webcrypto();
    }
  }
});

// ../../node_modules/pg/lib/crypto/cert-signatures.js
var require_cert_signatures = __commonJS({
  "../../node_modules/pg/lib/crypto/cert-signatures.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    function x509Error(msg, cert) {
      return new Error("SASL channel binding: " + msg + " when parsing public certificate " + cert.toString("base64"));
    }
    __name(x509Error, "x509Error");
    function readASN1Length(data, index) {
      let length = data[index++];
      if (length < 128) return { length, index };
      const lengthBytes = length & 127;
      if (lengthBytes > 4) throw x509Error("bad length", data);
      length = 0;
      for (let i = 0; i < lengthBytes; i++) {
        length = length << 8 | data[index++];
      }
      return { length, index };
    }
    __name(readASN1Length, "readASN1Length");
    function readASN1OID(data, index) {
      if (data[index++] !== 6) throw x509Error("non-OID data", data);
      const { length: OIDLength, index: indexAfterOIDLength } = readASN1Length(data, index);
      index = indexAfterOIDLength;
      const lastIndex = index + OIDLength;
      const byte1 = data[index++];
      let oid = (byte1 / 40 >> 0) + "." + byte1 % 40;
      while (index < lastIndex) {
        let value = 0;
        while (index < lastIndex) {
          const nextByte = data[index++];
          value = value << 7 | nextByte & 127;
          if (nextByte < 128) break;
        }
        oid += "." + value;
      }
      return { oid, index };
    }
    __name(readASN1OID, "readASN1OID");
    function expectASN1Seq(data, index) {
      if (data[index++] !== 48) throw x509Error("non-sequence data", data);
      return readASN1Length(data, index);
    }
    __name(expectASN1Seq, "expectASN1Seq");
    function signatureAlgorithmHashFromCertificate(data, index) {
      if (index === void 0) index = 0;
      index = expectASN1Seq(data, index).index;
      const { length: certInfoLength, index: indexAfterCertInfoLength } = expectASN1Seq(data, index);
      index = indexAfterCertInfoLength + certInfoLength;
      index = expectASN1Seq(data, index).index;
      const { oid, index: indexAfterOID } = readASN1OID(data, index);
      switch (oid) {
        // RSA
        case "1.2.840.113549.1.1.4":
          return "MD5";
        case "1.2.840.113549.1.1.5":
          return "SHA-1";
        case "1.2.840.113549.1.1.11":
          return "SHA-256";
        case "1.2.840.113549.1.1.12":
          return "SHA-384";
        case "1.2.840.113549.1.1.13":
          return "SHA-512";
        case "1.2.840.113549.1.1.14":
          return "SHA-224";
        case "1.2.840.113549.1.1.15":
          return "SHA512-224";
        case "1.2.840.113549.1.1.16":
          return "SHA512-256";
        // ECDSA
        case "1.2.840.10045.4.1":
          return "SHA-1";
        case "1.2.840.10045.4.3.1":
          return "SHA-224";
        case "1.2.840.10045.4.3.2":
          return "SHA-256";
        case "1.2.840.10045.4.3.3":
          return "SHA-384";
        case "1.2.840.10045.4.3.4":
          return "SHA-512";
        // RSASSA-PSS: hash is indicated separately
        case "1.2.840.113549.1.1.10": {
          index = indexAfterOID;
          index = expectASN1Seq(data, index).index;
          if (data[index++] !== 160) throw x509Error("non-tag data", data);
          index = readASN1Length(data, index).index;
          index = expectASN1Seq(data, index).index;
          const { oid: hashOID } = readASN1OID(data, index);
          switch (hashOID) {
            // standalone hash OIDs
            case "1.2.840.113549.2.5":
              return "MD5";
            case "1.3.14.3.2.26":
              return "SHA-1";
            case "2.16.840.1.101.3.4.2.1":
              return "SHA-256";
            case "2.16.840.1.101.3.4.2.2":
              return "SHA-384";
            case "2.16.840.1.101.3.4.2.3":
              return "SHA-512";
          }
          throw x509Error("unknown hash OID " + hashOID, data);
        }
        // Ed25519 -- see https: return//github.com/openssl/openssl/issues/15477
        case "1.3.101.110":
        case "1.3.101.112":
          return "SHA-512";
        // Ed448 -- still not in pg 17.2 (if supported, digest would be SHAKE256 x 64 bytes)
        case "1.3.101.111":
        case "1.3.101.113":
          throw x509Error("Ed448 certificate channel binding is not currently supported by Postgres");
      }
      throw x509Error("unknown OID " + oid, data);
    }
    __name(signatureAlgorithmHashFromCertificate, "signatureAlgorithmHashFromCertificate");
    module.exports = { signatureAlgorithmHashFromCertificate };
  }
});

// ../../node_modules/pg/lib/crypto/sasl.js
var require_sasl = __commonJS({
  "../../node_modules/pg/lib/crypto/sasl.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var crypto2 = require_utils2();
    var { signatureAlgorithmHashFromCertificate } = require_cert_signatures();
    function startSession(mechanisms, stream) {
      const candidates = ["SCRAM-SHA-256"];
      if (stream) candidates.unshift("SCRAM-SHA-256-PLUS");
      const mechanism = candidates.find((candidate) => mechanisms.includes(candidate));
      if (!mechanism) {
        throw new Error("SASL: Only mechanism(s) " + candidates.join(" and ") + " are supported");
      }
      if (mechanism === "SCRAM-SHA-256-PLUS" && typeof stream.getPeerCertificate !== "function") {
        throw new Error("SASL: Mechanism SCRAM-SHA-256-PLUS requires a certificate");
      }
      const clientNonce = crypto2.randomBytes(18).toString("base64");
      const gs2Header = mechanism === "SCRAM-SHA-256-PLUS" ? "p=tls-server-end-point" : stream ? "y" : "n";
      return {
        mechanism,
        clientNonce,
        response: gs2Header + ",,n=*,r=" + clientNonce,
        message: "SASLInitialResponse"
      };
    }
    __name(startSession, "startSession");
    async function continueSession(session, password, serverData, stream) {
      if (session.message !== "SASLInitialResponse") {
        throw new Error("SASL: Last message was not SASLInitialResponse");
      }
      if (typeof password !== "string") {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string");
      }
      if (password === "") {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a non-empty string");
      }
      if (typeof serverData !== "string") {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string");
      }
      const sv = parseServerFirstMessage(serverData);
      if (!sv.nonce.startsWith(session.clientNonce)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce");
      } else if (sv.nonce.length === session.clientNonce.length) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short");
      }
      const clientFirstMessageBare = "n=*,r=" + session.clientNonce;
      const serverFirstMessage = "r=" + sv.nonce + ",s=" + sv.salt + ",i=" + sv.iteration;
      let channelBinding = stream ? "eSws" : "biws";
      if (session.mechanism === "SCRAM-SHA-256-PLUS") {
        const peerCert = stream.getPeerCertificate().raw;
        let hashName = signatureAlgorithmHashFromCertificate(peerCert);
        if (hashName === "MD5" || hashName === "SHA-1") hashName = "SHA-256";
        const certHash = await crypto2.hashByName(hashName, peerCert);
        const bindingData = Buffer.concat([Buffer.from("p=tls-server-end-point,,"), Buffer.from(certHash)]);
        channelBinding = bindingData.toString("base64");
      }
      const clientFinalMessageWithoutProof = "c=" + channelBinding + ",r=" + sv.nonce;
      const authMessage = clientFirstMessageBare + "," + serverFirstMessage + "," + clientFinalMessageWithoutProof;
      const saltBytes = Buffer.from(sv.salt, "base64");
      const saltedPassword = await crypto2.deriveKey(password, saltBytes, sv.iteration);
      const clientKey = await crypto2.hmacSha256(saltedPassword, "Client Key");
      const storedKey = await crypto2.sha256(clientKey);
      const clientSignature = await crypto2.hmacSha256(storedKey, authMessage);
      const clientProof = xorBuffers(Buffer.from(clientKey), Buffer.from(clientSignature)).toString("base64");
      const serverKey = await crypto2.hmacSha256(saltedPassword, "Server Key");
      const serverSignatureBytes = await crypto2.hmacSha256(serverKey, authMessage);
      session.message = "SASLResponse";
      session.serverSignature = Buffer.from(serverSignatureBytes).toString("base64");
      session.response = clientFinalMessageWithoutProof + ",p=" + clientProof;
    }
    __name(continueSession, "continueSession");
    function finalizeSession(session, serverData) {
      if (session.message !== "SASLResponse") {
        throw new Error("SASL: Last message was not SASLResponse");
      }
      if (typeof serverData !== "string") {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string");
      }
      const { serverSignature } = parseServerFinalMessage(serverData);
      if (serverSignature !== session.serverSignature) {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match");
      }
    }
    __name(finalizeSession, "finalizeSession");
    function isPrintableChars(text) {
      if (typeof text !== "string") {
        throw new TypeError("SASL: text must be a string");
      }
      return text.split("").map((_, i) => text.charCodeAt(i)).every((c2) => c2 >= 33 && c2 <= 43 || c2 >= 45 && c2 <= 126);
    }
    __name(isPrintableChars, "isPrintableChars");
    function isBase64(text) {
      return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(text);
    }
    __name(isBase64, "isBase64");
    function parseAttributePairs(text) {
      if (typeof text !== "string") {
        throw new TypeError("SASL: attribute pairs text must be a string");
      }
      return new Map(
        text.split(",").map((attrValue) => {
          if (!/^.=/.test(attrValue)) {
            throw new Error("SASL: Invalid attribute pair entry");
          }
          const name2 = attrValue[0];
          const value = attrValue.substring(2);
          return [name2, value];
        })
      );
    }
    __name(parseAttributePairs, "parseAttributePairs");
    function parseServerFirstMessage(data) {
      const attrPairs = parseAttributePairs(data);
      const nonce = attrPairs.get("r");
      if (!nonce) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing");
      } else if (!isPrintableChars(nonce)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters");
      }
      const salt = attrPairs.get("s");
      if (!salt) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing");
      } else if (!isBase64(salt)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64");
      }
      const iterationText = attrPairs.get("i");
      if (!iterationText) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing");
      } else if (!/^[1-9][0-9]*$/.test(iterationText)) {
        throw new Error("SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count");
      }
      const iteration = parseInt(iterationText, 10);
      return {
        nonce,
        salt,
        iteration
      };
    }
    __name(parseServerFirstMessage, "parseServerFirstMessage");
    function parseServerFinalMessage(serverData) {
      const attrPairs = parseAttributePairs(serverData);
      const serverSignature = attrPairs.get("v");
      if (!serverSignature) {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing");
      } else if (!isBase64(serverSignature)) {
        throw new Error("SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64");
      }
      return {
        serverSignature
      };
    }
    __name(parseServerFinalMessage, "parseServerFinalMessage");
    function xorBuffers(a2, b3) {
      if (!Buffer.isBuffer(a2)) {
        throw new TypeError("first argument must be a Buffer");
      }
      if (!Buffer.isBuffer(b3)) {
        throw new TypeError("second argument must be a Buffer");
      }
      if (a2.length !== b3.length) {
        throw new Error("Buffer lengths must match");
      }
      if (a2.length === 0) {
        throw new Error("Buffers cannot be empty");
      }
      return Buffer.from(a2.map((_, i) => a2[i] ^ b3[i]));
    }
    __name(xorBuffers, "xorBuffers");
    module.exports = {
      startSession,
      continueSession,
      finalizeSession
    };
  }
});

// ../../node_modules/pg/lib/type-overrides.js
var require_type_overrides = __commonJS({
  "../../node_modules/pg/lib/type-overrides.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var types3 = require_pg_types();
    function TypeOverrides2(userTypes) {
      this._types = userTypes || types3;
      this.text = {};
      this.binary = {};
    }
    __name(TypeOverrides2, "TypeOverrides");
    TypeOverrides2.prototype.getOverrides = function(format) {
      switch (format) {
        case "text":
          return this.text;
        case "binary":
          return this.binary;
        default:
          return {};
      }
    };
    TypeOverrides2.prototype.setTypeParser = function(oid, format, parseFn) {
      if (typeof format === "function") {
        parseFn = format;
        format = "text";
      }
      this.getOverrides(format)[oid] = parseFn;
    };
    TypeOverrides2.prototype.getTypeParser = function(oid, format) {
      format = format || "text";
      return this.getOverrides(format)[oid] || this._types.getTypeParser(oid, format);
    };
    module.exports = TypeOverrides2;
  }
});

// node-built-in-modules:dns
import libDefault4 from "dns";
var require_dns = __commonJS({
  "node-built-in-modules:dns"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    module.exports = libDefault4;
  }
});

// node-built-in-modules:fs
import libDefault5 from "fs";
var require_fs = __commonJS({
  "node-built-in-modules:fs"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    module.exports = libDefault5;
  }
});

// ../../node_modules/pg-connection-string/index.js
var require_pg_connection_string = __commonJS({
  "../../node_modules/pg-connection-string/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    function parse(str2, options = {}) {
      if (str2.charAt(0) === "/") {
        const config5 = str2.split(" ");
        return { host: config5[0], database: config5[1] };
      }
      const config4 = {};
      let result;
      let dummyHost = false;
      if (/ |%[^a-f0-9]|%[a-f0-9][^a-f0-9]/i.test(str2)) {
        str2 = encodeURI(str2).replace(/%25(\d\d)/g, "%$1");
      }
      try {
        try {
          result = new URL(str2, "postgres://base");
        } catch (e6) {
          result = new URL(str2.replace("@/", "@___DUMMY___/"), "postgres://base");
          dummyHost = true;
        }
      } catch (err) {
        err.input && (err.input = "*****REDACTED*****");
        throw err;
      }
      for (const entry of result.searchParams.entries()) {
        config4[entry[0]] = entry[1];
      }
      config4.user = config4.user || decodeURIComponent(result.username);
      config4.password = config4.password || decodeURIComponent(result.password);
      if (result.protocol == "socket:") {
        config4.host = decodeURI(result.pathname);
        config4.database = result.searchParams.get("db");
        config4.client_encoding = result.searchParams.get("encoding");
        return config4;
      }
      const hostname = dummyHost ? "" : result.hostname;
      if (!config4.host) {
        config4.host = decodeURIComponent(hostname);
      } else if (hostname && /^%2f/i.test(hostname)) {
        result.pathname = hostname + result.pathname;
      }
      if (!config4.port) {
        config4.port = result.port;
      }
      const pathname = result.pathname.slice(1) || null;
      config4.database = pathname ? decodeURI(pathname) : null;
      if (config4.ssl === "true" || config4.ssl === "1") {
        config4.ssl = true;
      }
      if (config4.ssl === "0") {
        config4.ssl = false;
      }
      if (config4.sslcert || config4.sslkey || config4.sslrootcert || config4.sslmode) {
        config4.ssl = {};
      }
      const fs2 = config4.sslcert || config4.sslkey || config4.sslrootcert ? require_fs() : null;
      if (config4.sslcert) {
        config4.ssl.cert = fs2.readFileSync(config4.sslcert).toString();
      }
      if (config4.sslkey) {
        config4.ssl.key = fs2.readFileSync(config4.sslkey).toString();
      }
      if (config4.sslrootcert) {
        config4.ssl.ca = fs2.readFileSync(config4.sslrootcert).toString();
      }
      if (options.useLibpqCompat && config4.uselibpqcompat) {
        throw new Error("Both useLibpqCompat and uselibpqcompat are set. Please use only one of them.");
      }
      if (config4.uselibpqcompat === "true" || options.useLibpqCompat) {
        switch (config4.sslmode) {
          case "disable": {
            config4.ssl = false;
            break;
          }
          case "prefer": {
            config4.ssl.rejectUnauthorized = false;
            break;
          }
          case "require": {
            if (config4.sslrootcert) {
              config4.ssl.checkServerIdentity = function() {
              };
            } else {
              config4.ssl.rejectUnauthorized = false;
            }
            break;
          }
          case "verify-ca": {
            if (!config4.ssl.ca) {
              throw new Error(
                "SECURITY WARNING: Using sslmode=verify-ca requires specifying a CA with sslrootcert. If a public CA is used, verify-ca allows connections to a server that somebody else may have registered with the CA, making you vulnerable to Man-in-the-Middle attacks. Either specify a custom CA certificate with sslrootcert parameter or use sslmode=verify-full for proper security."
              );
            }
            config4.ssl.checkServerIdentity = function() {
            };
            break;
          }
          case "verify-full": {
            break;
          }
        }
      } else {
        switch (config4.sslmode) {
          case "disable": {
            config4.ssl = false;
            break;
          }
          case "prefer":
          case "require":
          case "verify-ca":
          case "verify-full": {
            if (config4.sslmode !== "verify-full") {
              deprecatedSslModeWarning(config4.sslmode);
            }
            break;
          }
          case "no-verify": {
            config4.ssl.rejectUnauthorized = false;
            break;
          }
        }
      }
      return config4;
    }
    __name(parse, "parse");
    function toConnectionOptions(sslConfig) {
      const connectionOptions = Object.entries(sslConfig).reduce((c2, [key, value]) => {
        if (value !== void 0 && value !== null) {
          c2[key] = value;
        }
        return c2;
      }, {});
      return connectionOptions;
    }
    __name(toConnectionOptions, "toConnectionOptions");
    function toClientConfig(config4) {
      const poolConfig = Object.entries(config4).reduce((c2, [key, value]) => {
        if (key === "ssl") {
          const sslConfig = value;
          if (typeof sslConfig === "boolean") {
            c2[key] = sslConfig;
          }
          if (typeof sslConfig === "object") {
            c2[key] = toConnectionOptions(sslConfig);
          }
        } else if (value !== void 0 && value !== null) {
          if (key === "port") {
            if (value !== "") {
              const v3 = parseInt(value, 10);
              if (isNaN(v3)) {
                throw new Error(`Invalid ${key}: ${value}`);
              }
              c2[key] = v3;
            }
          } else {
            c2[key] = value;
          }
        }
        return c2;
      }, {});
      return poolConfig;
    }
    __name(toClientConfig, "toClientConfig");
    function parseIntoClientConfig(str2) {
      return toClientConfig(parse(str2));
    }
    __name(parseIntoClientConfig, "parseIntoClientConfig");
    function deprecatedSslModeWarning(sslmode) {
      if (!deprecatedSslModeWarning.warned && typeof process !== "undefined" && process.emitWarning) {
        deprecatedSslModeWarning.warned = true;
        process.emitWarning(`SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'.
In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.

To prepare for this change:
- If you want the current behavior, explicitly use 'sslmode=verify-full'
- If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=${sslmode}'

See https://www.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions.`);
      }
    }
    __name(deprecatedSslModeWarning, "deprecatedSslModeWarning");
    module.exports = parse;
    parse.parse = parse;
    parse.toClientConfig = toClientConfig;
    parse.parseIntoClientConfig = parseIntoClientConfig;
  }
});

// ../../node_modules/pg/lib/connection-parameters.js
var require_connection_parameters = __commonJS({
  "../../node_modules/pg/lib/connection-parameters.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var dns = require_dns();
    var defaults3 = require_defaults();
    var parse = require_pg_connection_string().parse;
    var val = /* @__PURE__ */ __name(function(key, config4, envVar) {
      if (config4[key]) {
        return config4[key];
      }
      if (envVar === void 0) {
        envVar = process.env["PG" + key.toUpperCase()];
      } else if (envVar === false) {
      } else {
        envVar = process.env[envVar];
      }
      return envVar || defaults3[key];
    }, "val");
    var readSSLConfigFromEnvironment = /* @__PURE__ */ __name(function() {
      switch (process.env.PGSSLMODE) {
        case "disable":
          return false;
        case "prefer":
        case "require":
        case "verify-ca":
        case "verify-full":
          return true;
        case "no-verify":
          return { rejectUnauthorized: false };
      }
      return defaults3.ssl;
    }, "readSSLConfigFromEnvironment");
    var quoteParamValue = /* @__PURE__ */ __name(function(value) {
      return "'" + ("" + value).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
    }, "quoteParamValue");
    var add2 = /* @__PURE__ */ __name(function(params, config4, paramName) {
      const value = config4[paramName];
      if (value !== void 0 && value !== null) {
        params.push(paramName + "=" + quoteParamValue(value));
      }
    }, "add");
    var ConnectionParameters = class {
      static {
        __name(this, "ConnectionParameters");
      }
      constructor(config4) {
        config4 = typeof config4 === "string" ? parse(config4) : config4 || {};
        if (config4.connectionString) {
          config4 = Object.assign({}, config4, parse(config4.connectionString));
        }
        this.user = val("user", config4);
        this.database = val("database", config4);
        if (this.database === void 0) {
          this.database = this.user;
        }
        this.port = parseInt(val("port", config4), 10);
        this.host = val("host", config4);
        Object.defineProperty(this, "password", {
          configurable: true,
          enumerable: false,
          writable: true,
          value: val("password", config4)
        });
        this.binary = val("binary", config4);
        this.options = val("options", config4);
        this.ssl = typeof config4.ssl === "undefined" ? readSSLConfigFromEnvironment() : config4.ssl;
        if (typeof this.ssl === "string") {
          if (this.ssl === "true") {
            this.ssl = true;
          }
        }
        if (this.ssl === "no-verify") {
          this.ssl = { rejectUnauthorized: false };
        }
        if (this.ssl && this.ssl.key) {
          Object.defineProperty(this.ssl, "key", {
            enumerable: false
          });
        }
        this.client_encoding = val("client_encoding", config4);
        this.replication = val("replication", config4);
        this.isDomainSocket = !(this.host || "").indexOf("/");
        this.application_name = val("application_name", config4, "PGAPPNAME");
        this.fallback_application_name = val("fallback_application_name", config4, false);
        this.statement_timeout = val("statement_timeout", config4, false);
        this.lock_timeout = val("lock_timeout", config4, false);
        this.idle_in_transaction_session_timeout = val("idle_in_transaction_session_timeout", config4, false);
        this.query_timeout = val("query_timeout", config4, false);
        if (config4.connectionTimeoutMillis === void 0) {
          this.connect_timeout = process.env.PGCONNECT_TIMEOUT || 0;
        } else {
          this.connect_timeout = Math.floor(config4.connectionTimeoutMillis / 1e3);
        }
        if (config4.keepAlive === false) {
          this.keepalives = 0;
        } else if (config4.keepAlive === true) {
          this.keepalives = 1;
        }
        if (typeof config4.keepAliveInitialDelayMillis === "number") {
          this.keepalives_idle = Math.floor(config4.keepAliveInitialDelayMillis / 1e3);
        }
      }
      getLibpqConnectionString(cb) {
        const params = [];
        add2(params, this, "user");
        add2(params, this, "password");
        add2(params, this, "port");
        add2(params, this, "application_name");
        add2(params, this, "fallback_application_name");
        add2(params, this, "connect_timeout");
        add2(params, this, "options");
        const ssl = typeof this.ssl === "object" ? this.ssl : this.ssl ? { sslmode: this.ssl } : {};
        add2(params, ssl, "sslmode");
        add2(params, ssl, "sslca");
        add2(params, ssl, "sslkey");
        add2(params, ssl, "sslcert");
        add2(params, ssl, "sslrootcert");
        if (this.database) {
          params.push("dbname=" + quoteParamValue(this.database));
        }
        if (this.replication) {
          params.push("replication=" + quoteParamValue(this.replication));
        }
        if (this.host) {
          params.push("host=" + quoteParamValue(this.host));
        }
        if (this.isDomainSocket) {
          return cb(null, params.join(" "));
        }
        if (this.client_encoding) {
          params.push("client_encoding=" + quoteParamValue(this.client_encoding));
        }
        dns.lookup(this.host, function(err, address) {
          if (err) return cb(err, null);
          params.push("hostaddr=" + quoteParamValue(address));
          return cb(null, params.join(" "));
        });
      }
    };
    module.exports = ConnectionParameters;
  }
});

// ../../node_modules/pg/lib/result.js
var require_result = __commonJS({
  "../../node_modules/pg/lib/result.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var types3 = require_pg_types();
    var matchRegexp = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/;
    var Result2 = class {
      static {
        __name(this, "Result");
      }
      constructor(rowMode, types4) {
        this.command = null;
        this.rowCount = null;
        this.oid = null;
        this.rows = [];
        this.fields = [];
        this._parsers = void 0;
        this._types = types4;
        this.RowCtor = null;
        this.rowAsArray = rowMode === "array";
        if (this.rowAsArray) {
          this.parseRow = this._parseRowAsArray;
        }
        this._prebuiltEmptyResultObject = null;
      }
      // adds a command complete message
      addCommandComplete(msg) {
        let match2;
        if (msg.text) {
          match2 = matchRegexp.exec(msg.text);
        } else {
          match2 = matchRegexp.exec(msg.command);
        }
        if (match2) {
          this.command = match2[1];
          if (match2[3]) {
            this.oid = parseInt(match2[2], 10);
            this.rowCount = parseInt(match2[3], 10);
          } else if (match2[2]) {
            this.rowCount = parseInt(match2[2], 10);
          }
        }
      }
      _parseRowAsArray(rowData) {
        const row = new Array(rowData.length);
        for (let i = 0, len = rowData.length; i < len; i++) {
          const rawValue = rowData[i];
          if (rawValue !== null) {
            row[i] = this._parsers[i](rawValue);
          } else {
            row[i] = null;
          }
        }
        return row;
      }
      parseRow(rowData) {
        const row = { ...this._prebuiltEmptyResultObject };
        for (let i = 0, len = rowData.length; i < len; i++) {
          const rawValue = rowData[i];
          const field = this.fields[i].name;
          if (rawValue !== null) {
            const v3 = this.fields[i].format === "binary" ? Buffer.from(rawValue) : rawValue;
            row[field] = this._parsers[i](v3);
          } else {
            row[field] = null;
          }
        }
        return row;
      }
      addRow(row) {
        this.rows.push(row);
      }
      addFields(fieldDescriptions) {
        this.fields = fieldDescriptions;
        if (this.fields.length) {
          this._parsers = new Array(fieldDescriptions.length);
        }
        const row = {};
        for (let i = 0; i < fieldDescriptions.length; i++) {
          const desc = fieldDescriptions[i];
          row[desc.name] = null;
          if (this._types) {
            this._parsers[i] = this._types.getTypeParser(desc.dataTypeID, desc.format || "text");
          } else {
            this._parsers[i] = types3.getTypeParser(desc.dataTypeID, desc.format || "text");
          }
        }
        this._prebuiltEmptyResultObject = { ...row };
      }
    };
    module.exports = Result2;
  }
});

// ../../node_modules/pg/lib/query.js
var require_query = __commonJS({
  "../../node_modules/pg/lib/query.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var { EventEmitter: EventEmitter2 } = require_events();
    var Result2 = require_result();
    var utils = require_utils();
    var Query2 = class extends EventEmitter2 {
      static {
        __name(this, "Query");
      }
      constructor(config4, values, callback) {
        super();
        config4 = utils.normalizeQueryConfig(config4, values, callback);
        this.text = config4.text;
        this.values = config4.values;
        this.rows = config4.rows;
        this.types = config4.types;
        this.name = config4.name;
        this.queryMode = config4.queryMode;
        this.binary = config4.binary;
        this.portal = config4.portal || "";
        this.callback = config4.callback;
        this._rowMode = config4.rowMode;
        if (process.domain && config4.callback) {
          this.callback = process.domain.bind(config4.callback);
        }
        this._result = new Result2(this._rowMode, this.types);
        this._results = this._result;
        this._canceledDueToError = false;
      }
      requiresPreparation() {
        if (this.queryMode === "extended") {
          return true;
        }
        if (this.name) {
          return true;
        }
        if (this.rows) {
          return true;
        }
        if (!this.text) {
          return false;
        }
        if (!this.values) {
          return false;
        }
        return this.values.length > 0;
      }
      _checkForMultirow() {
        if (this._result.command) {
          if (!Array.isArray(this._results)) {
            this._results = [this._result];
          }
          this._result = new Result2(this._rowMode, this._result._types);
          this._results.push(this._result);
        }
      }
      // associates row metadata from the supplied
      // message with this query object
      // metadata used when parsing row results
      handleRowDescription(msg) {
        this._checkForMultirow();
        this._result.addFields(msg.fields);
        this._accumulateRows = this.callback || !this.listeners("row").length;
      }
      handleDataRow(msg) {
        let row;
        if (this._canceledDueToError) {
          return;
        }
        try {
          row = this._result.parseRow(msg.fields);
        } catch (err) {
          this._canceledDueToError = err;
          return;
        }
        this.emit("row", row, this._result);
        if (this._accumulateRows) {
          this._result.addRow(row);
        }
      }
      handleCommandComplete(msg, connection) {
        this._checkForMultirow();
        this._result.addCommandComplete(msg);
        if (this.rows) {
          connection.sync();
        }
      }
      // if a named prepared statement is created with empty query text
      // the backend will send an emptyQuery message but *not* a command complete message
      // since we pipeline sync immediately after execute we don't need to do anything here
      // unless we have rows specified, in which case we did not pipeline the initial sync call
      handleEmptyQuery(connection) {
        if (this.rows) {
          connection.sync();
        }
      }
      handleError(err, connection) {
        if (this._canceledDueToError) {
          err = this._canceledDueToError;
          this._canceledDueToError = false;
        }
        if (this.callback) {
          return this.callback(err);
        }
        this.emit("error", err);
      }
      handleReadyForQuery(con) {
        if (this._canceledDueToError) {
          return this.handleError(this._canceledDueToError, con);
        }
        if (this.callback) {
          try {
            this.callback(null, this._results);
          } catch (err) {
            process.nextTick(() => {
              throw err;
            });
          }
        }
        this.emit("end", this._results);
      }
      submit(connection) {
        if (typeof this.text !== "string" && typeof this.name !== "string") {
          return new Error("A query must have either text or a name. Supplying neither is unsupported.");
        }
        const previous = connection.parsedStatements[this.name];
        if (this.text && previous && this.text !== previous) {
          return new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
        }
        if (this.values && !Array.isArray(this.values)) {
          return new Error("Query values must be an array");
        }
        if (this.requiresPreparation()) {
          connection.stream.cork && connection.stream.cork();
          try {
            this.prepare(connection);
          } finally {
            connection.stream.uncork && connection.stream.uncork();
          }
        } else {
          connection.query(this.text);
        }
        return null;
      }
      hasBeenParsed(connection) {
        return this.name && connection.parsedStatements[this.name];
      }
      handlePortalSuspended(connection) {
        this._getRows(connection, this.rows);
      }
      _getRows(connection, rows) {
        connection.execute({
          portal: this.portal,
          rows
        });
        if (!rows) {
          connection.sync();
        } else {
          connection.flush();
        }
      }
      // http://developer.postgresql.org/pgdocs/postgres/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY
      prepare(connection) {
        if (!this.hasBeenParsed(connection)) {
          connection.parse({
            text: this.text,
            name: this.name,
            types: this.types
          });
        }
        try {
          connection.bind({
            portal: this.portal,
            statement: this.name,
            values: this.values,
            binary: this.binary,
            valueMapper: utils.prepareValue
          });
        } catch (err) {
          this.handleError(err, connection);
          return;
        }
        connection.describe({
          type: "P",
          name: this.portal || ""
        });
        this._getRows(connection, this.rows);
      }
      handleCopyInResponse(connection) {
        connection.sendCopyFail("No source stream defined");
      }
      handleCopyData(msg, connection) {
      }
    };
    module.exports = Query2;
  }
});

// ../../node_modules/pg-protocol/dist/messages.js
var require_messages = __commonJS({
  "../../node_modules/pg-protocol/dist/messages.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NoticeMessage = exports.DataRowMessage = exports.CommandCompleteMessage = exports.ReadyForQueryMessage = exports.NotificationResponseMessage = exports.BackendKeyDataMessage = exports.AuthenticationMD5Password = exports.ParameterStatusMessage = exports.ParameterDescriptionMessage = exports.RowDescriptionMessage = exports.Field = exports.CopyResponse = exports.CopyDataMessage = exports.DatabaseError = exports.copyDone = exports.emptyQuery = exports.replicationStart = exports.portalSuspended = exports.noData = exports.closeComplete = exports.bindComplete = exports.parseComplete = void 0;
    exports.parseComplete = {
      name: "parseComplete",
      length: 5
    };
    exports.bindComplete = {
      name: "bindComplete",
      length: 5
    };
    exports.closeComplete = {
      name: "closeComplete",
      length: 5
    };
    exports.noData = {
      name: "noData",
      length: 5
    };
    exports.portalSuspended = {
      name: "portalSuspended",
      length: 5
    };
    exports.replicationStart = {
      name: "replicationStart",
      length: 4
    };
    exports.emptyQuery = {
      name: "emptyQuery",
      length: 4
    };
    exports.copyDone = {
      name: "copyDone",
      length: 4
    };
    var DatabaseError2 = class extends Error {
      static {
        __name(this, "DatabaseError");
      }
      constructor(message, length, name2) {
        super(message);
        this.length = length;
        this.name = name2;
      }
    };
    exports.DatabaseError = DatabaseError2;
    var CopyDataMessage = class {
      static {
        __name(this, "CopyDataMessage");
      }
      constructor(length, chunk) {
        this.length = length;
        this.chunk = chunk;
        this.name = "copyData";
      }
    };
    exports.CopyDataMessage = CopyDataMessage;
    var CopyResponse = class {
      static {
        __name(this, "CopyResponse");
      }
      constructor(length, name2, binary, columnCount) {
        this.length = length;
        this.name = name2;
        this.binary = binary;
        this.columnTypes = new Array(columnCount);
      }
    };
    exports.CopyResponse = CopyResponse;
    var Field = class {
      static {
        __name(this, "Field");
      }
      constructor(name2, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, format) {
        this.name = name2;
        this.tableID = tableID;
        this.columnID = columnID;
        this.dataTypeID = dataTypeID;
        this.dataTypeSize = dataTypeSize;
        this.dataTypeModifier = dataTypeModifier;
        this.format = format;
      }
    };
    exports.Field = Field;
    var RowDescriptionMessage = class {
      static {
        __name(this, "RowDescriptionMessage");
      }
      constructor(length, fieldCount) {
        this.length = length;
        this.fieldCount = fieldCount;
        this.name = "rowDescription";
        this.fields = new Array(this.fieldCount);
      }
    };
    exports.RowDescriptionMessage = RowDescriptionMessage;
    var ParameterDescriptionMessage = class {
      static {
        __name(this, "ParameterDescriptionMessage");
      }
      constructor(length, parameterCount) {
        this.length = length;
        this.parameterCount = parameterCount;
        this.name = "parameterDescription";
        this.dataTypeIDs = new Array(this.parameterCount);
      }
    };
    exports.ParameterDescriptionMessage = ParameterDescriptionMessage;
    var ParameterStatusMessage = class {
      static {
        __name(this, "ParameterStatusMessage");
      }
      constructor(length, parameterName, parameterValue) {
        this.length = length;
        this.parameterName = parameterName;
        this.parameterValue = parameterValue;
        this.name = "parameterStatus";
      }
    };
    exports.ParameterStatusMessage = ParameterStatusMessage;
    var AuthenticationMD5Password = class {
      static {
        __name(this, "AuthenticationMD5Password");
      }
      constructor(length, salt) {
        this.length = length;
        this.salt = salt;
        this.name = "authenticationMD5Password";
      }
    };
    exports.AuthenticationMD5Password = AuthenticationMD5Password;
    var BackendKeyDataMessage = class {
      static {
        __name(this, "BackendKeyDataMessage");
      }
      constructor(length, processID, secretKey) {
        this.length = length;
        this.processID = processID;
        this.secretKey = secretKey;
        this.name = "backendKeyData";
      }
    };
    exports.BackendKeyDataMessage = BackendKeyDataMessage;
    var NotificationResponseMessage = class {
      static {
        __name(this, "NotificationResponseMessage");
      }
      constructor(length, processId, channel2, payload) {
        this.length = length;
        this.processId = processId;
        this.channel = channel2;
        this.payload = payload;
        this.name = "notification";
      }
    };
    exports.NotificationResponseMessage = NotificationResponseMessage;
    var ReadyForQueryMessage = class {
      static {
        __name(this, "ReadyForQueryMessage");
      }
      constructor(length, status) {
        this.length = length;
        this.status = status;
        this.name = "readyForQuery";
      }
    };
    exports.ReadyForQueryMessage = ReadyForQueryMessage;
    var CommandCompleteMessage = class {
      static {
        __name(this, "CommandCompleteMessage");
      }
      constructor(length, text) {
        this.length = length;
        this.text = text;
        this.name = "commandComplete";
      }
    };
    exports.CommandCompleteMessage = CommandCompleteMessage;
    var DataRowMessage = class {
      static {
        __name(this, "DataRowMessage");
      }
      constructor(length, fields) {
        this.length = length;
        this.fields = fields;
        this.name = "dataRow";
        this.fieldCount = fields.length;
      }
    };
    exports.DataRowMessage = DataRowMessage;
    var NoticeMessage = class {
      static {
        __name(this, "NoticeMessage");
      }
      constructor(length, message) {
        this.length = length;
        this.message = message;
        this.name = "notice";
      }
    };
    exports.NoticeMessage = NoticeMessage;
  }
});

// ../../node_modules/pg-protocol/dist/buffer-writer.js
var require_buffer_writer = __commonJS({
  "../../node_modules/pg-protocol/dist/buffer-writer.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Writer = void 0;
    var Writer = class {
      static {
        __name(this, "Writer");
      }
      constructor(size = 256) {
        this.size = size;
        this.offset = 5;
        this.headerPosition = 0;
        this.buffer = Buffer.allocUnsafe(size);
      }
      ensure(size) {
        const remaining = this.buffer.length - this.offset;
        if (remaining < size) {
          const oldBuffer = this.buffer;
          const newSize = oldBuffer.length + (oldBuffer.length >> 1) + size;
          this.buffer = Buffer.allocUnsafe(newSize);
          oldBuffer.copy(this.buffer);
        }
      }
      addInt32(num) {
        this.ensure(4);
        this.buffer[this.offset++] = num >>> 24 & 255;
        this.buffer[this.offset++] = num >>> 16 & 255;
        this.buffer[this.offset++] = num >>> 8 & 255;
        this.buffer[this.offset++] = num >>> 0 & 255;
        return this;
      }
      addInt16(num) {
        this.ensure(2);
        this.buffer[this.offset++] = num >>> 8 & 255;
        this.buffer[this.offset++] = num >>> 0 & 255;
        return this;
      }
      addCString(string) {
        if (!string) {
          this.ensure(1);
        } else {
          const len = Buffer.byteLength(string);
          this.ensure(len + 1);
          this.buffer.write(string, this.offset, "utf-8");
          this.offset += len;
        }
        this.buffer[this.offset++] = 0;
        return this;
      }
      addString(string = "") {
        const len = Buffer.byteLength(string);
        this.ensure(len);
        this.buffer.write(string, this.offset);
        this.offset += len;
        return this;
      }
      add(otherBuffer) {
        this.ensure(otherBuffer.length);
        otherBuffer.copy(this.buffer, this.offset);
        this.offset += otherBuffer.length;
        return this;
      }
      join(code) {
        if (code) {
          this.buffer[this.headerPosition] = code;
          const length = this.offset - (this.headerPosition + 1);
          this.buffer.writeInt32BE(length, this.headerPosition + 1);
        }
        return this.buffer.slice(code ? 0 : 5, this.offset);
      }
      flush(code) {
        const result = this.join(code);
        this.offset = 5;
        this.headerPosition = 0;
        this.buffer = Buffer.allocUnsafe(this.size);
        return result;
      }
    };
    exports.Writer = Writer;
  }
});

// ../../node_modules/pg-protocol/dist/serializer.js
var require_serializer = __commonJS({
  "../../node_modules/pg-protocol/dist/serializer.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.serialize = void 0;
    var buffer_writer_1 = require_buffer_writer();
    var writer = new buffer_writer_1.Writer();
    var startup = /* @__PURE__ */ __name((opts) => {
      writer.addInt16(3).addInt16(0);
      for (const key of Object.keys(opts)) {
        writer.addCString(key).addCString(opts[key]);
      }
      writer.addCString("client_encoding").addCString("UTF8");
      const bodyBuffer = writer.addCString("").flush();
      const length = bodyBuffer.length + 4;
      return new buffer_writer_1.Writer().addInt32(length).add(bodyBuffer).flush();
    }, "startup");
    var requestSsl = /* @__PURE__ */ __name(() => {
      const response = Buffer.allocUnsafe(8);
      response.writeInt32BE(8, 0);
      response.writeInt32BE(80877103, 4);
      return response;
    }, "requestSsl");
    var password = /* @__PURE__ */ __name((password2) => {
      return writer.addCString(password2).flush(
        112
        /* code.startup */
      );
    }, "password");
    var sendSASLInitialResponseMessage = /* @__PURE__ */ __name(function(mechanism, initialResponse) {
      writer.addCString(mechanism).addInt32(Buffer.byteLength(initialResponse)).addString(initialResponse);
      return writer.flush(
        112
        /* code.startup */
      );
    }, "sendSASLInitialResponseMessage");
    var sendSCRAMClientFinalMessage = /* @__PURE__ */ __name(function(additionalData) {
      return writer.addString(additionalData).flush(
        112
        /* code.startup */
      );
    }, "sendSCRAMClientFinalMessage");
    var query = /* @__PURE__ */ __name((text) => {
      return writer.addCString(text).flush(
        81
        /* code.query */
      );
    }, "query");
    var emptyArray = [];
    var parse = /* @__PURE__ */ __name((query2) => {
      const name2 = query2.name || "";
      if (name2.length > 63) {
        console.error("Warning! Postgres only supports 63 characters for query names.");
        console.error("You supplied %s (%s)", name2, name2.length);
        console.error("This can cause conflicts and silent errors executing queries");
      }
      const types3 = query2.types || emptyArray;
      const len = types3.length;
      const buffer = writer.addCString(name2).addCString(query2.text).addInt16(len);
      for (let i = 0; i < len; i++) {
        buffer.addInt32(types3[i]);
      }
      return writer.flush(
        80
        /* code.parse */
      );
    }, "parse");
    var paramWriter = new buffer_writer_1.Writer();
    var writeValues = /* @__PURE__ */ __name(function(values, valueMapper) {
      for (let i = 0; i < values.length; i++) {
        const mappedVal = valueMapper ? valueMapper(values[i], i) : values[i];
        if (mappedVal == null) {
          writer.addInt16(
            0
            /* ParamType.STRING */
          );
          paramWriter.addInt32(-1);
        } else if (mappedVal instanceof Buffer) {
          writer.addInt16(
            1
            /* ParamType.BINARY */
          );
          paramWriter.addInt32(mappedVal.length);
          paramWriter.add(mappedVal);
        } else {
          writer.addInt16(
            0
            /* ParamType.STRING */
          );
          paramWriter.addInt32(Buffer.byteLength(mappedVal));
          paramWriter.addString(mappedVal);
        }
      }
    }, "writeValues");
    var bind = /* @__PURE__ */ __name((config4 = {}) => {
      const portal = config4.portal || "";
      const statement = config4.statement || "";
      const binary = config4.binary || false;
      const values = config4.values || emptyArray;
      const len = values.length;
      writer.addCString(portal).addCString(statement);
      writer.addInt16(len);
      writeValues(values, config4.valueMapper);
      writer.addInt16(len);
      writer.add(paramWriter.flush());
      writer.addInt16(1);
      writer.addInt16(
        binary ? 1 : 0
        /* ParamType.STRING */
      );
      return writer.flush(
        66
        /* code.bind */
      );
    }, "bind");
    var emptyExecute = Buffer.from([69, 0, 0, 0, 9, 0, 0, 0, 0, 0]);
    var execute = /* @__PURE__ */ __name((config4) => {
      if (!config4 || !config4.portal && !config4.rows) {
        return emptyExecute;
      }
      const portal = config4.portal || "";
      const rows = config4.rows || 0;
      const portalLength = Buffer.byteLength(portal);
      const len = 4 + portalLength + 1 + 4;
      const buff = Buffer.allocUnsafe(1 + len);
      buff[0] = 69;
      buff.writeInt32BE(len, 1);
      buff.write(portal, 5, "utf-8");
      buff[portalLength + 5] = 0;
      buff.writeUInt32BE(rows, buff.length - 4);
      return buff;
    }, "execute");
    var cancel = /* @__PURE__ */ __name((processID, secretKey) => {
      const buffer = Buffer.allocUnsafe(16);
      buffer.writeInt32BE(16, 0);
      buffer.writeInt16BE(1234, 4);
      buffer.writeInt16BE(5678, 6);
      buffer.writeInt32BE(processID, 8);
      buffer.writeInt32BE(secretKey, 12);
      return buffer;
    }, "cancel");
    var cstringMessage = /* @__PURE__ */ __name((code, string) => {
      const stringLen = Buffer.byteLength(string);
      const len = 4 + stringLen + 1;
      const buffer = Buffer.allocUnsafe(1 + len);
      buffer[0] = code;
      buffer.writeInt32BE(len, 1);
      buffer.write(string, 5, "utf-8");
      buffer[len] = 0;
      return buffer;
    }, "cstringMessage");
    var emptyDescribePortal = writer.addCString("P").flush(
      68
      /* code.describe */
    );
    var emptyDescribeStatement = writer.addCString("S").flush(
      68
      /* code.describe */
    );
    var describe = /* @__PURE__ */ __name((msg) => {
      return msg.name ? cstringMessage(68, `${msg.type}${msg.name || ""}`) : msg.type === "P" ? emptyDescribePortal : emptyDescribeStatement;
    }, "describe");
    var close = /* @__PURE__ */ __name((msg) => {
      const text = `${msg.type}${msg.name || ""}`;
      return cstringMessage(67, text);
    }, "close");
    var copyData = /* @__PURE__ */ __name((chunk) => {
      return writer.add(chunk).flush(
        100
        /* code.copyFromChunk */
      );
    }, "copyData");
    var copyFail = /* @__PURE__ */ __name((message) => {
      return cstringMessage(102, message);
    }, "copyFail");
    var codeOnlyBuffer = /* @__PURE__ */ __name((code) => Buffer.from([code, 0, 0, 0, 4]), "codeOnlyBuffer");
    var flushBuffer = codeOnlyBuffer(
      72
      /* code.flush */
    );
    var syncBuffer = codeOnlyBuffer(
      83
      /* code.sync */
    );
    var endBuffer = codeOnlyBuffer(
      88
      /* code.end */
    );
    var copyDoneBuffer = codeOnlyBuffer(
      99
      /* code.copyDone */
    );
    var serialize = {
      startup,
      password,
      requestSsl,
      sendSASLInitialResponseMessage,
      sendSCRAMClientFinalMessage,
      query,
      parse,
      bind,
      execute,
      describe,
      close,
      flush: /* @__PURE__ */ __name(() => flushBuffer, "flush"),
      sync: /* @__PURE__ */ __name(() => syncBuffer, "sync"),
      end: /* @__PURE__ */ __name(() => endBuffer, "end"),
      copyData,
      copyDone: /* @__PURE__ */ __name(() => copyDoneBuffer, "copyDone"),
      copyFail,
      cancel
    };
    exports.serialize = serialize;
  }
});

// ../../node_modules/pg-protocol/dist/buffer-reader.js
var require_buffer_reader = __commonJS({
  "../../node_modules/pg-protocol/dist/buffer-reader.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BufferReader = void 0;
    var BufferReader = class {
      static {
        __name(this, "BufferReader");
      }
      constructor(offset = 0) {
        this.offset = offset;
        this.buffer = Buffer.allocUnsafe(0);
        this.encoding = "utf-8";
      }
      setBuffer(offset, buffer) {
        this.offset = offset;
        this.buffer = buffer;
      }
      int16() {
        const result = this.buffer.readInt16BE(this.offset);
        this.offset += 2;
        return result;
      }
      byte() {
        const result = this.buffer[this.offset];
        this.offset++;
        return result;
      }
      int32() {
        const result = this.buffer.readInt32BE(this.offset);
        this.offset += 4;
        return result;
      }
      uint32() {
        const result = this.buffer.readUInt32BE(this.offset);
        this.offset += 4;
        return result;
      }
      string(length) {
        const result = this.buffer.toString(this.encoding, this.offset, this.offset + length);
        this.offset += length;
        return result;
      }
      cstring() {
        const start = this.offset;
        let end = start;
        while (this.buffer[end++] !== 0) {
        }
        this.offset = end;
        return this.buffer.toString(this.encoding, start, end - 1);
      }
      bytes(length) {
        const result = this.buffer.slice(this.offset, this.offset + length);
        this.offset += length;
        return result;
      }
    };
    exports.BufferReader = BufferReader;
  }
});

// ../../node_modules/pg-protocol/dist/parser.js
var require_parser = __commonJS({
  "../../node_modules/pg-protocol/dist/parser.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Parser = void 0;
    var messages_1 = require_messages();
    var buffer_reader_1 = require_buffer_reader();
    var CODE_LENGTH = 1;
    var LEN_LENGTH = 4;
    var HEADER_LENGTH = CODE_LENGTH + LEN_LENGTH;
    var LATEINIT_LENGTH = -1;
    var emptyBuffer = Buffer.allocUnsafe(0);
    var Parser = class {
      static {
        __name(this, "Parser");
      }
      constructor(opts) {
        this.buffer = emptyBuffer;
        this.bufferLength = 0;
        this.bufferOffset = 0;
        this.reader = new buffer_reader_1.BufferReader();
        if ((opts === null || opts === void 0 ? void 0 : opts.mode) === "binary") {
          throw new Error("Binary mode not supported yet");
        }
        this.mode = (opts === null || opts === void 0 ? void 0 : opts.mode) || "text";
      }
      parse(buffer, callback) {
        this.mergeBuffer(buffer);
        const bufferFullLength = this.bufferOffset + this.bufferLength;
        let offset = this.bufferOffset;
        while (offset + HEADER_LENGTH <= bufferFullLength) {
          const code = this.buffer[offset];
          const length = this.buffer.readUInt32BE(offset + CODE_LENGTH);
          const fullMessageLength = CODE_LENGTH + length;
          if (fullMessageLength + offset <= bufferFullLength) {
            const message = this.handlePacket(offset + HEADER_LENGTH, code, length, this.buffer);
            callback(message);
            offset += fullMessageLength;
          } else {
            break;
          }
        }
        if (offset === bufferFullLength) {
          this.buffer = emptyBuffer;
          this.bufferLength = 0;
          this.bufferOffset = 0;
        } else {
          this.bufferLength = bufferFullLength - offset;
          this.bufferOffset = offset;
        }
      }
      mergeBuffer(buffer) {
        if (this.bufferLength > 0) {
          const newLength = this.bufferLength + buffer.byteLength;
          const newFullLength = newLength + this.bufferOffset;
          if (newFullLength > this.buffer.byteLength) {
            let newBuffer;
            if (newLength <= this.buffer.byteLength && this.bufferOffset >= this.bufferLength) {
              newBuffer = this.buffer;
            } else {
              let newBufferLength = this.buffer.byteLength * 2;
              while (newLength >= newBufferLength) {
                newBufferLength *= 2;
              }
              newBuffer = Buffer.allocUnsafe(newBufferLength);
            }
            this.buffer.copy(newBuffer, 0, this.bufferOffset, this.bufferOffset + this.bufferLength);
            this.buffer = newBuffer;
            this.bufferOffset = 0;
          }
          buffer.copy(this.buffer, this.bufferOffset + this.bufferLength);
          this.bufferLength = newLength;
        } else {
          this.buffer = buffer;
          this.bufferOffset = 0;
          this.bufferLength = buffer.byteLength;
        }
      }
      handlePacket(offset, code, length, bytes) {
        const { reader } = this;
        reader.setBuffer(offset, bytes);
        let message;
        switch (code) {
          case 50:
            message = messages_1.bindComplete;
            break;
          case 49:
            message = messages_1.parseComplete;
            break;
          case 51:
            message = messages_1.closeComplete;
            break;
          case 110:
            message = messages_1.noData;
            break;
          case 115:
            message = messages_1.portalSuspended;
            break;
          case 99:
            message = messages_1.copyDone;
            break;
          case 87:
            message = messages_1.replicationStart;
            break;
          case 73:
            message = messages_1.emptyQuery;
            break;
          case 68:
            message = parseDataRowMessage(reader);
            break;
          case 67:
            message = parseCommandCompleteMessage(reader);
            break;
          case 90:
            message = parseReadyForQueryMessage(reader);
            break;
          case 65:
            message = parseNotificationMessage(reader);
            break;
          case 82:
            message = parseAuthenticationResponse(reader, length);
            break;
          case 83:
            message = parseParameterStatusMessage(reader);
            break;
          case 75:
            message = parseBackendKeyData(reader);
            break;
          case 69:
            message = parseErrorMessage(reader, "error");
            break;
          case 78:
            message = parseErrorMessage(reader, "notice");
            break;
          case 84:
            message = parseRowDescriptionMessage(reader);
            break;
          case 116:
            message = parseParameterDescriptionMessage(reader);
            break;
          case 71:
            message = parseCopyInMessage(reader);
            break;
          case 72:
            message = parseCopyOutMessage(reader);
            break;
          case 100:
            message = parseCopyData(reader, length);
            break;
          default:
            return new messages_1.DatabaseError("received invalid response: " + code.toString(16), length, "error");
        }
        reader.setBuffer(0, emptyBuffer);
        message.length = length;
        return message;
      }
    };
    exports.Parser = Parser;
    var parseReadyForQueryMessage = /* @__PURE__ */ __name((reader) => {
      const status = reader.string(1);
      return new messages_1.ReadyForQueryMessage(LATEINIT_LENGTH, status);
    }, "parseReadyForQueryMessage");
    var parseCommandCompleteMessage = /* @__PURE__ */ __name((reader) => {
      const text = reader.cstring();
      return new messages_1.CommandCompleteMessage(LATEINIT_LENGTH, text);
    }, "parseCommandCompleteMessage");
    var parseCopyData = /* @__PURE__ */ __name((reader, length) => {
      const chunk = reader.bytes(length - 4);
      return new messages_1.CopyDataMessage(LATEINIT_LENGTH, chunk);
    }, "parseCopyData");
    var parseCopyInMessage = /* @__PURE__ */ __name((reader) => parseCopyMessage(reader, "copyInResponse"), "parseCopyInMessage");
    var parseCopyOutMessage = /* @__PURE__ */ __name((reader) => parseCopyMessage(reader, "copyOutResponse"), "parseCopyOutMessage");
    var parseCopyMessage = /* @__PURE__ */ __name((reader, messageName) => {
      const isBinary2 = reader.byte() !== 0;
      const columnCount = reader.int16();
      const message = new messages_1.CopyResponse(LATEINIT_LENGTH, messageName, isBinary2, columnCount);
      for (let i = 0; i < columnCount; i++) {
        message.columnTypes[i] = reader.int16();
      }
      return message;
    }, "parseCopyMessage");
    var parseNotificationMessage = /* @__PURE__ */ __name((reader) => {
      const processId = reader.int32();
      const channel2 = reader.cstring();
      const payload = reader.cstring();
      return new messages_1.NotificationResponseMessage(LATEINIT_LENGTH, processId, channel2, payload);
    }, "parseNotificationMessage");
    var parseRowDescriptionMessage = /* @__PURE__ */ __name((reader) => {
      const fieldCount = reader.int16();
      const message = new messages_1.RowDescriptionMessage(LATEINIT_LENGTH, fieldCount);
      for (let i = 0; i < fieldCount; i++) {
        message.fields[i] = parseField(reader);
      }
      return message;
    }, "parseRowDescriptionMessage");
    var parseField = /* @__PURE__ */ __name((reader) => {
      const name2 = reader.cstring();
      const tableID = reader.uint32();
      const columnID = reader.int16();
      const dataTypeID = reader.uint32();
      const dataTypeSize = reader.int16();
      const dataTypeModifier = reader.int32();
      const mode = reader.int16() === 0 ? "text" : "binary";
      return new messages_1.Field(name2, tableID, columnID, dataTypeID, dataTypeSize, dataTypeModifier, mode);
    }, "parseField");
    var parseParameterDescriptionMessage = /* @__PURE__ */ __name((reader) => {
      const parameterCount = reader.int16();
      const message = new messages_1.ParameterDescriptionMessage(LATEINIT_LENGTH, parameterCount);
      for (let i = 0; i < parameterCount; i++) {
        message.dataTypeIDs[i] = reader.int32();
      }
      return message;
    }, "parseParameterDescriptionMessage");
    var parseDataRowMessage = /* @__PURE__ */ __name((reader) => {
      const fieldCount = reader.int16();
      const fields = new Array(fieldCount);
      for (let i = 0; i < fieldCount; i++) {
        const len = reader.int32();
        fields[i] = len === -1 ? null : reader.string(len);
      }
      return new messages_1.DataRowMessage(LATEINIT_LENGTH, fields);
    }, "parseDataRowMessage");
    var parseParameterStatusMessage = /* @__PURE__ */ __name((reader) => {
      const name2 = reader.cstring();
      const value = reader.cstring();
      return new messages_1.ParameterStatusMessage(LATEINIT_LENGTH, name2, value);
    }, "parseParameterStatusMessage");
    var parseBackendKeyData = /* @__PURE__ */ __name((reader) => {
      const processID = reader.int32();
      const secretKey = reader.int32();
      return new messages_1.BackendKeyDataMessage(LATEINIT_LENGTH, processID, secretKey);
    }, "parseBackendKeyData");
    var parseAuthenticationResponse = /* @__PURE__ */ __name((reader, length) => {
      const code = reader.int32();
      const message = {
        name: "authenticationOk",
        length
      };
      switch (code) {
        case 0:
          break;
        case 3:
          if (message.length === 8) {
            message.name = "authenticationCleartextPassword";
          }
          break;
        case 5:
          if (message.length === 12) {
            message.name = "authenticationMD5Password";
            const salt = reader.bytes(4);
            return new messages_1.AuthenticationMD5Password(LATEINIT_LENGTH, salt);
          }
          break;
        case 10:
          {
            message.name = "authenticationSASL";
            message.mechanisms = [];
            let mechanism;
            do {
              mechanism = reader.cstring();
              if (mechanism) {
                message.mechanisms.push(mechanism);
              }
            } while (mechanism);
          }
          break;
        case 11:
          message.name = "authenticationSASLContinue";
          message.data = reader.string(length - 8);
          break;
        case 12:
          message.name = "authenticationSASLFinal";
          message.data = reader.string(length - 8);
          break;
        default:
          throw new Error("Unknown authenticationOk message type " + code);
      }
      return message;
    }, "parseAuthenticationResponse");
    var parseErrorMessage = /* @__PURE__ */ __name((reader, name2) => {
      const fields = {};
      let fieldType = reader.string(1);
      while (fieldType !== "\0") {
        fields[fieldType] = reader.cstring();
        fieldType = reader.string(1);
      }
      const messageValue = fields.M;
      const message = name2 === "notice" ? new messages_1.NoticeMessage(LATEINIT_LENGTH, messageValue) : new messages_1.DatabaseError(messageValue, LATEINIT_LENGTH, name2);
      message.severity = fields.S;
      message.code = fields.C;
      message.detail = fields.D;
      message.hint = fields.H;
      message.position = fields.P;
      message.internalPosition = fields.p;
      message.internalQuery = fields.q;
      message.where = fields.W;
      message.schema = fields.s;
      message.table = fields.t;
      message.column = fields.c;
      message.dataType = fields.d;
      message.constraint = fields.n;
      message.file = fields.F;
      message.line = fields.L;
      message.routine = fields.R;
      return message;
    }, "parseErrorMessage");
  }
});

// ../../node_modules/pg-protocol/dist/index.js
var require_dist = __commonJS({
  "../../node_modules/pg-protocol/dist/index.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DatabaseError = exports.serialize = exports.parse = void 0;
    var messages_1 = require_messages();
    Object.defineProperty(exports, "DatabaseError", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return messages_1.DatabaseError;
    }, "get") });
    var serializer_1 = require_serializer();
    Object.defineProperty(exports, "serialize", { enumerable: true, get: /* @__PURE__ */ __name(function() {
      return serializer_1.serialize;
    }, "get") });
    var parser_1 = require_parser();
    function parse(stream, callback) {
      const parser = new parser_1.Parser();
      stream.on("data", (buffer) => parser.parse(buffer, callback));
      return new Promise((resolve) => stream.on("end", () => resolve()));
    }
    __name(parse, "parse");
    exports.parse = parse;
  }
});

// node-built-in-modules:net
import libDefault6 from "net";
var require_net = __commonJS({
  "node-built-in-modules:net"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    module.exports = libDefault6;
  }
});

// node-built-in-modules:tls
import libDefault7 from "tls";
var require_tls = __commonJS({
  "node-built-in-modules:tls"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    module.exports = libDefault7;
  }
});

// ../../node_modules/pg-cloudflare/dist/index.js
var require_dist2 = __commonJS({
  "../../node_modules/pg-cloudflare/dist/index.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CloudflareSocket = void 0;
    var events_1 = require_events();
    var CloudflareSocket = class extends events_1.EventEmitter {
      static {
        __name(this, "CloudflareSocket");
      }
      constructor(ssl) {
        super();
        this.ssl = ssl;
        this.writable = false;
        this.destroyed = false;
        this._upgrading = false;
        this._upgraded = false;
        this._cfSocket = null;
        this._cfWriter = null;
        this._cfReader = null;
      }
      setNoDelay() {
        return this;
      }
      setKeepAlive() {
        return this;
      }
      ref() {
        return this;
      }
      unref() {
        return this;
      }
      async connect(port, host, connectListener) {
        try {
          log3("connecting");
          if (connectListener)
            this.once("connect", connectListener);
          const options = this.ssl ? { secureTransport: "starttls" } : {};
          const mod2 = await import("cloudflare:sockets");
          const connect = mod2.connect;
          this._cfSocket = connect(`${host}:${port}`, options);
          this._cfWriter = this._cfSocket.writable.getWriter();
          this._addClosedHandler();
          this._cfReader = this._cfSocket.readable.getReader();
          if (this.ssl) {
            this._listenOnce().catch((e6) => this.emit("error", e6));
          } else {
            this._listen().catch((e6) => this.emit("error", e6));
          }
          await this._cfWriter.ready;
          log3("socket ready");
          this.writable = true;
          this.emit("connect");
          return this;
        } catch (e6) {
          this.emit("error", e6);
        }
      }
      async _listen() {
        while (true) {
          log3("awaiting receive from CF socket");
          const { done, value } = await this._cfReader.read();
          log3("CF socket received:", done, value);
          if (done) {
            log3("done");
            break;
          }
          this.emit("data", Buffer.from(value));
        }
      }
      async _listenOnce() {
        log3("awaiting first receive from CF socket");
        const { done, value } = await this._cfReader.read();
        log3("First CF socket received:", done, value);
        this.emit("data", Buffer.from(value));
      }
      write(data, encoding = "utf8", callback = () => {
      }) {
        if (data.length === 0)
          return callback();
        if (typeof data === "string")
          data = Buffer.from(data, encoding);
        log3("sending data direct:", data);
        this._cfWriter.write(data).then(() => {
          log3("data sent");
          callback();
        }, (err) => {
          log3("send error", err);
          callback(err);
        });
        return true;
      }
      end(data = Buffer.alloc(0), encoding = "utf8", callback = () => {
      }) {
        log3("ending CF socket");
        this.write(data, encoding, (err) => {
          this._cfSocket.close();
          if (callback)
            callback(err);
        });
        return this;
      }
      destroy(reason) {
        log3("destroying CF socket", reason);
        this.destroyed = true;
        return this.end();
      }
      startTls(options) {
        if (this._upgraded) {
          this.emit("error", "Cannot call `startTls()` more than once on a socket");
          return;
        }
        this._cfWriter.releaseLock();
        this._cfReader.releaseLock();
        this._upgrading = true;
        this._cfSocket = this._cfSocket.startTls(options);
        this._cfWriter = this._cfSocket.writable.getWriter();
        this._cfReader = this._cfSocket.readable.getReader();
        this._addClosedHandler();
        this._listen().catch((e6) => this.emit("error", e6));
      }
      _addClosedHandler() {
        this._cfSocket.closed.then(() => {
          if (!this._upgrading) {
            log3("CF socket closed");
            this._cfSocket = null;
            this.emit("close");
          } else {
            this._upgrading = false;
            this._upgraded = true;
          }
        }).catch((e6) => this.emit("error", e6));
      }
    };
    exports.CloudflareSocket = CloudflareSocket;
    var debug4 = false;
    function dump(data) {
      if (data instanceof Uint8Array || data instanceof ArrayBuffer) {
        const hex = Buffer.from(data).toString("hex");
        const str2 = new TextDecoder().decode(data);
        return `
>>> STR: "${str2.replace(/\n/g, "\\n")}"
>>> HEX: ${hex}
`;
      } else {
        return data;
      }
    }
    __name(dump, "dump");
    function log3(...args) {
      debug4 && console.log(...args.map(dump));
    }
    __name(log3, "log");
  }
});

// ../../node_modules/pg/lib/stream.js
var require_stream = __commonJS({
  "../../node_modules/pg/lib/stream.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var { getStream, getSecureStream } = getStreamFuncs();
    module.exports = {
      /**
       * Get a socket stream compatible with the current runtime environment.
       * @returns {Duplex}
       */
      getStream,
      /**
       * Get a TLS secured socket, compatible with the current environment,
       * using the socket and other settings given in `options`.
       * @returns {Duplex}
       */
      getSecureStream
    };
    function getNodejsStreamFuncs() {
      function getStream2(ssl) {
        const net = require_net();
        return new net.Socket();
      }
      __name(getStream2, "getStream");
      function getSecureStream2(options) {
        const tls = require_tls();
        return tls.connect(options);
      }
      __name(getSecureStream2, "getSecureStream");
      return {
        getStream: getStream2,
        getSecureStream: getSecureStream2
      };
    }
    __name(getNodejsStreamFuncs, "getNodejsStreamFuncs");
    function getCloudflareStreamFuncs() {
      function getStream2(ssl) {
        const { CloudflareSocket } = require_dist2();
        return new CloudflareSocket(ssl);
      }
      __name(getStream2, "getStream");
      function getSecureStream2(options) {
        options.socket.startTls(options);
        return options.socket;
      }
      __name(getSecureStream2, "getSecureStream");
      return {
        getStream: getStream2,
        getSecureStream: getSecureStream2
      };
    }
    __name(getCloudflareStreamFuncs, "getCloudflareStreamFuncs");
    function isCloudflareRuntime() {
      if (typeof navigator === "object" && navigator !== null && true) {
        return true;
      }
      if (typeof Response === "function") {
        const resp = new Response(null, { cf: { thing: true } });
        if (typeof resp.cf === "object" && resp.cf !== null && resp.cf.thing) {
          return true;
        }
      }
      return false;
    }
    __name(isCloudflareRuntime, "isCloudflareRuntime");
    function getStreamFuncs() {
      if (isCloudflareRuntime()) {
        return getCloudflareStreamFuncs();
      }
      return getNodejsStreamFuncs();
    }
    __name(getStreamFuncs, "getStreamFuncs");
  }
});

// ../../node_modules/pg/lib/connection.js
var require_connection = __commonJS({
  "../../node_modules/pg/lib/connection.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var EventEmitter2 = require_events().EventEmitter;
    var { parse, serialize } = require_dist();
    var { getStream, getSecureStream } = require_stream();
    var flushBuffer = serialize.flush();
    var syncBuffer = serialize.sync();
    var endBuffer = serialize.end();
    var Connection2 = class extends EventEmitter2 {
      static {
        __name(this, "Connection");
      }
      constructor(config4) {
        super();
        config4 = config4 || {};
        this.stream = config4.stream || getStream(config4.ssl);
        if (typeof this.stream === "function") {
          this.stream = this.stream(config4);
        }
        this._keepAlive = config4.keepAlive;
        this._keepAliveInitialDelayMillis = config4.keepAliveInitialDelayMillis;
        this.parsedStatements = {};
        this.ssl = config4.ssl || false;
        this._ending = false;
        this._emitMessage = false;
        const self2 = this;
        this.on("newListener", function(eventName) {
          if (eventName === "message") {
            self2._emitMessage = true;
          }
        });
      }
      connect(port, host) {
        const self2 = this;
        this._connecting = true;
        this.stream.setNoDelay(true);
        this.stream.connect(port, host);
        this.stream.once("connect", function() {
          if (self2._keepAlive) {
            self2.stream.setKeepAlive(true, self2._keepAliveInitialDelayMillis);
          }
          self2.emit("connect");
        });
        const reportStreamError = /* @__PURE__ */ __name(function(error) {
          if (self2._ending && (error.code === "ECONNRESET" || error.code === "EPIPE")) {
            return;
          }
          self2.emit("error", error);
        }, "reportStreamError");
        this.stream.on("error", reportStreamError);
        this.stream.on("close", function() {
          self2.emit("end");
        });
        if (!this.ssl) {
          return this.attachListeners(this.stream);
        }
        this.stream.once("data", function(buffer) {
          const responseCode = buffer.toString("utf8");
          switch (responseCode) {
            case "S":
              break;
            case "N":
              self2.stream.end();
              return self2.emit("error", new Error("The server does not support SSL connections"));
            default:
              self2.stream.end();
              return self2.emit("error", new Error("There was an error establishing an SSL connection"));
          }
          const options = {
            socket: self2.stream
          };
          if (self2.ssl !== true) {
            Object.assign(options, self2.ssl);
            if ("key" in self2.ssl) {
              options.key = self2.ssl.key;
            }
          }
          const net = require_net();
          if (net.isIP && net.isIP(host) === 0) {
            options.servername = host;
          }
          try {
            self2.stream = getSecureStream(options);
          } catch (err) {
            return self2.emit("error", err);
          }
          self2.attachListeners(self2.stream);
          self2.stream.on("error", reportStreamError);
          self2.emit("sslconnect");
        });
      }
      attachListeners(stream) {
        parse(stream, (msg) => {
          const eventName = msg.name === "error" ? "errorMessage" : msg.name;
          if (this._emitMessage) {
            this.emit("message", msg);
          }
          this.emit(eventName, msg);
        });
      }
      requestSsl() {
        this.stream.write(serialize.requestSsl());
      }
      startup(config4) {
        this.stream.write(serialize.startup(config4));
      }
      cancel(processID, secretKey) {
        this._send(serialize.cancel(processID, secretKey));
      }
      password(password) {
        this._send(serialize.password(password));
      }
      sendSASLInitialResponseMessage(mechanism, initialResponse) {
        this._send(serialize.sendSASLInitialResponseMessage(mechanism, initialResponse));
      }
      sendSCRAMClientFinalMessage(additionalData) {
        this._send(serialize.sendSCRAMClientFinalMessage(additionalData));
      }
      _send(buffer) {
        if (!this.stream.writable) {
          return false;
        }
        return this.stream.write(buffer);
      }
      query(text) {
        this._send(serialize.query(text));
      }
      // send parse message
      parse(query) {
        this._send(serialize.parse(query));
      }
      // send bind message
      bind(config4) {
        this._send(serialize.bind(config4));
      }
      // send execute message
      execute(config4) {
        this._send(serialize.execute(config4));
      }
      flush() {
        if (this.stream.writable) {
          this.stream.write(flushBuffer);
        }
      }
      sync() {
        this._ending = true;
        this._send(syncBuffer);
      }
      ref() {
        this.stream.ref();
      }
      unref() {
        this.stream.unref();
      }
      end() {
        this._ending = true;
        if (!this._connecting || !this.stream.writable) {
          this.stream.end();
          return;
        }
        return this.stream.write(endBuffer, () => {
          this.stream.end();
        });
      }
      close(msg) {
        this._send(serialize.close(msg));
      }
      describe(msg) {
        this._send(serialize.describe(msg));
      }
      sendCopyFromChunk(chunk) {
        this._send(serialize.copyData(chunk));
      }
      endCopyFrom() {
        this._send(serialize.copyDone());
      }
      sendCopyFail(msg) {
        this._send(serialize.copyFail(msg));
      }
    };
    module.exports = Connection2;
  }
});

// node-built-in-modules:path
import libDefault8 from "path";
var require_path = __commonJS({
  "node-built-in-modules:path"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    module.exports = libDefault8;
  }
});

// node-built-in-modules:stream
import libDefault9 from "stream";
var require_stream2 = __commonJS({
  "node-built-in-modules:stream"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    module.exports = libDefault9;
  }
});

// node-built-in-modules:string_decoder
import libDefault10 from "string_decoder";
var require_string_decoder = __commonJS({
  "node-built-in-modules:string_decoder"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    module.exports = libDefault10;
  }
});

// ../../node_modules/split2/index.js
var require_split2 = __commonJS({
  "../../node_modules/split2/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var { Transform } = require_stream2();
    var { StringDecoder } = require_string_decoder();
    var kLast = Symbol("last");
    var kDecoder = Symbol("decoder");
    function transform(chunk, enc, cb) {
      let list;
      if (this.overflow) {
        const buf = this[kDecoder].write(chunk);
        list = buf.split(this.matcher);
        if (list.length === 1) return cb();
        list.shift();
        this.overflow = false;
      } else {
        this[kLast] += this[kDecoder].write(chunk);
        list = this[kLast].split(this.matcher);
      }
      this[kLast] = list.pop();
      for (let i = 0; i < list.length; i++) {
        try {
          push2(this, this.mapper(list[i]));
        } catch (error) {
          return cb(error);
        }
      }
      this.overflow = this[kLast].length > this.maxLength;
      if (this.overflow && !this.skipOverflow) {
        cb(new Error("maximum buffer reached"));
        return;
      }
      cb();
    }
    __name(transform, "transform");
    function flush(cb) {
      this[kLast] += this[kDecoder].end();
      if (this[kLast]) {
        try {
          push2(this, this.mapper(this[kLast]));
        } catch (error) {
          return cb(error);
        }
      }
      cb();
    }
    __name(flush, "flush");
    function push2(self2, val) {
      if (val !== void 0) {
        self2.push(val);
      }
    }
    __name(push2, "push");
    function noop(incoming) {
      return incoming;
    }
    __name(noop, "noop");
    function split(matcher, mapper, options) {
      matcher = matcher || /\r?\n/;
      mapper = mapper || noop;
      options = options || {};
      switch (arguments.length) {
        case 1:
          if (typeof matcher === "function") {
            mapper = matcher;
            matcher = /\r?\n/;
          } else if (typeof matcher === "object" && !(matcher instanceof RegExp) && !matcher[Symbol.split]) {
            options = matcher;
            matcher = /\r?\n/;
          }
          break;
        case 2:
          if (typeof matcher === "function") {
            options = mapper;
            mapper = matcher;
            matcher = /\r?\n/;
          } else if (typeof mapper === "object") {
            options = mapper;
            mapper = noop;
          }
      }
      options = Object.assign({}, options);
      options.autoDestroy = true;
      options.transform = transform;
      options.flush = flush;
      options.readableObjectMode = true;
      const stream = new Transform(options);
      stream[kLast] = "";
      stream[kDecoder] = new StringDecoder("utf8");
      stream.matcher = matcher;
      stream.mapper = mapper;
      stream.maxLength = options.maxLength;
      stream.skipOverflow = options.skipOverflow || false;
      stream.overflow = false;
      stream._destroy = function(err, cb) {
        this._writableState.errorEmitted = false;
        cb(err);
      };
      return stream;
    }
    __name(split, "split");
    module.exports = split;
  }
});

// ../../node_modules/pgpass/lib/helper.js
var require_helper = __commonJS({
  "../../node_modules/pgpass/lib/helper.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var path = require_path();
    var Stream2 = require_stream2().Stream;
    var split = require_split2();
    var util = require_util();
    var defaultPort = 5432;
    var isWin = process.platform === "win32";
    var warnStream = process.stderr;
    var S_IRWXG = 56;
    var S_IRWXO = 7;
    var S_IFMT = 61440;
    var S_IFREG = 32768;
    function isRegFile(mode) {
      return (mode & S_IFMT) == S_IFREG;
    }
    __name(isRegFile, "isRegFile");
    var fieldNames = ["host", "port", "database", "user", "password"];
    var nrOfFields = fieldNames.length;
    var passKey = fieldNames[nrOfFields - 1];
    function warn() {
      var isWritable = warnStream instanceof Stream2 && true === warnStream.writable;
      if (isWritable) {
        var args = Array.prototype.slice.call(arguments).concat("\n");
        warnStream.write(util.format.apply(util, args));
      }
    }
    __name(warn, "warn");
    Object.defineProperty(module.exports, "isWin", {
      get: /* @__PURE__ */ __name(function() {
        return isWin;
      }, "get"),
      set: /* @__PURE__ */ __name(function(val) {
        isWin = val;
      }, "set")
    });
    module.exports.warnTo = function(stream) {
      var old = warnStream;
      warnStream = stream;
      return old;
    };
    module.exports.getFileName = function(rawEnv) {
      var env2 = rawEnv || process.env;
      var file = env2.PGPASSFILE || (isWin ? path.join(env2.APPDATA || "./", "postgresql", "pgpass.conf") : path.join(env2.HOME || "./", ".pgpass"));
      return file;
    };
    module.exports.usePgPass = function(stats, fname) {
      if (Object.prototype.hasOwnProperty.call(process.env, "PGPASSWORD")) {
        return false;
      }
      if (isWin) {
        return true;
      }
      fname = fname || "<unkn>";
      if (!isRegFile(stats.mode)) {
        warn('WARNING: password file "%s" is not a plain file', fname);
        return false;
      }
      if (stats.mode & (S_IRWXG | S_IRWXO)) {
        warn('WARNING: password file "%s" has group or world access; permissions should be u=rw (0600) or less', fname);
        return false;
      }
      return true;
    };
    var matcher = module.exports.match = function(connInfo, entry) {
      return fieldNames.slice(0, -1).reduce(function(prev, field, idx) {
        if (idx == 1) {
          if (Number(connInfo[field] || defaultPort) === Number(entry[field])) {
            return prev && true;
          }
        }
        return prev && (entry[field] === "*" || entry[field] === connInfo[field]);
      }, true);
    };
    module.exports.getPassword = function(connInfo, stream, cb) {
      var pass;
      var lineStream = stream.pipe(split());
      function onLine(line) {
        var entry = parseLine(line);
        if (entry && isValidEntry(entry) && matcher(connInfo, entry)) {
          pass = entry[passKey];
          lineStream.end();
        }
      }
      __name(onLine, "onLine");
      var onEnd = /* @__PURE__ */ __name(function() {
        stream.destroy();
        cb(pass);
      }, "onEnd");
      var onErr = /* @__PURE__ */ __name(function(err) {
        stream.destroy();
        warn("WARNING: error on reading file: %s", err);
        cb(void 0);
      }, "onErr");
      stream.on("error", onErr);
      lineStream.on("data", onLine).on("end", onEnd).on("error", onErr);
    };
    var parseLine = module.exports.parseLine = function(line) {
      if (line.length < 11 || line.match(/^\s+#/)) {
        return null;
      }
      var curChar = "";
      var prevChar = "";
      var fieldIdx = 0;
      var startIdx = 0;
      var endIdx = 0;
      var obj = {};
      var isLastField = false;
      var addToObj = /* @__PURE__ */ __name(function(idx, i0, i1) {
        var field = line.substring(i0, i1);
        if (!Object.hasOwnProperty.call(process.env, "PGPASS_NO_DEESCAPE")) {
          field = field.replace(/\\([:\\])/g, "$1");
        }
        obj[fieldNames[idx]] = field;
      }, "addToObj");
      for (var i = 0; i < line.length - 1; i += 1) {
        curChar = line.charAt(i + 1);
        prevChar = line.charAt(i);
        isLastField = fieldIdx == nrOfFields - 1;
        if (isLastField) {
          addToObj(fieldIdx, startIdx);
          break;
        }
        if (i >= 0 && curChar == ":" && prevChar !== "\\") {
          addToObj(fieldIdx, startIdx, i + 1);
          startIdx = i + 2;
          fieldIdx += 1;
        }
      }
      obj = Object.keys(obj).length === nrOfFields ? obj : null;
      return obj;
    };
    var isValidEntry = module.exports.isValidEntry = function(entry) {
      var rules = {
        // host
        0: function(x3) {
          return x3.length > 0;
        },
        // port
        1: function(x3) {
          if (x3 === "*") {
            return true;
          }
          x3 = Number(x3);
          return isFinite(x3) && x3 > 0 && x3 < 9007199254740992 && Math.floor(x3) === x3;
        },
        // database
        2: function(x3) {
          return x3.length > 0;
        },
        // username
        3: function(x3) {
          return x3.length > 0;
        },
        // password
        4: function(x3) {
          return x3.length > 0;
        }
      };
      for (var idx = 0; idx < fieldNames.length; idx += 1) {
        var rule = rules[idx];
        var value = entry[fieldNames[idx]] || "";
        var res = rule(value);
        if (!res) {
          return false;
        }
      }
      return true;
    };
  }
});

// ../../node_modules/pgpass/lib/index.js
var require_lib = __commonJS({
  "../../node_modules/pgpass/lib/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var path = require_path();
    var fs2 = require_fs();
    var helper = require_helper();
    module.exports = function(connInfo, cb) {
      var file = helper.getFileName();
      fs2.stat(file, function(err, stat) {
        if (err || !helper.usePgPass(stat, file)) {
          return cb(void 0);
        }
        var st2 = fs2.createReadStream(file);
        helper.getPassword(connInfo, st2, cb);
      });
    };
    module.exports.warnTo = helper.warnTo;
  }
});

// ../../node_modules/pg/lib/client.js
var require_client = __commonJS({
  "../../node_modules/pg/lib/client.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var EventEmitter2 = require_events().EventEmitter;
    var utils = require_utils();
    var nodeUtils = require_util();
    var sasl = require_sasl();
    var TypeOverrides2 = require_type_overrides();
    var ConnectionParameters = require_connection_parameters();
    var Query2 = require_query();
    var defaults3 = require_defaults();
    var Connection2 = require_connection();
    var crypto2 = require_utils2();
    var activeQueryDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "Client.activeQuery is deprecated and will be removed in pg@9.0"
    );
    var queryQueueDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "Client.queryQueue is deprecated and will be removed in pg@9.0."
    );
    var pgPassDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "pgpass support is deprecated and will be removed in pg@9.0. You can provide an async function as the password property to the Client/Pool constructor that returns a password instead. Within this function you can call the pgpass module in your own code."
    );
    var byoPromiseDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "Passing a custom Promise implementation to the Client/Pool constructor is deprecated and will be removed in pg@9.0."
    );
    var queryQueueLengthDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0. Use asycn/await or an external async flow control mechanism instead."
    );
    var Client2 = class extends EventEmitter2 {
      static {
        __name(this, "Client");
      }
      constructor(config4) {
        super();
        this.connectionParameters = new ConnectionParameters(config4);
        this.user = this.connectionParameters.user;
        this.database = this.connectionParameters.database;
        this.port = this.connectionParameters.port;
        this.host = this.connectionParameters.host;
        Object.defineProperty(this, "password", {
          configurable: true,
          enumerable: false,
          writable: true,
          value: this.connectionParameters.password
        });
        this.replication = this.connectionParameters.replication;
        const c2 = config4 || {};
        if (c2.Promise) {
          byoPromiseDeprecationNotice();
        }
        this._Promise = c2.Promise || global.Promise;
        this._types = new TypeOverrides2(c2.types);
        this._ending = false;
        this._ended = false;
        this._connecting = false;
        this._connected = false;
        this._connectionError = false;
        this._queryable = true;
        this._activeQuery = null;
        this.enableChannelBinding = Boolean(c2.enableChannelBinding);
        this.connection = c2.connection || new Connection2({
          stream: c2.stream,
          ssl: this.connectionParameters.ssl,
          keepAlive: c2.keepAlive || false,
          keepAliveInitialDelayMillis: c2.keepAliveInitialDelayMillis || 0,
          encoding: this.connectionParameters.client_encoding || "utf8"
        });
        this._queryQueue = [];
        this.binary = c2.binary || defaults3.binary;
        this.processID = null;
        this.secretKey = null;
        this.ssl = this.connectionParameters.ssl || false;
        if (this.ssl && this.ssl.key) {
          Object.defineProperty(this.ssl, "key", {
            enumerable: false
          });
        }
        this._connectionTimeoutMillis = c2.connectionTimeoutMillis || 0;
      }
      get activeQuery() {
        activeQueryDeprecationNotice();
        return this._activeQuery;
      }
      set activeQuery(val) {
        activeQueryDeprecationNotice();
        this._activeQuery = val;
      }
      _getActiveQuery() {
        return this._activeQuery;
      }
      _errorAllQueries(err) {
        const enqueueError = /* @__PURE__ */ __name((query) => {
          process.nextTick(() => {
            query.handleError(err, this.connection);
          });
        }, "enqueueError");
        const activeQuery = this._getActiveQuery();
        if (activeQuery) {
          enqueueError(activeQuery);
          this._activeQuery = null;
        }
        this._queryQueue.forEach(enqueueError);
        this._queryQueue.length = 0;
      }
      _connect(callback) {
        const self2 = this;
        const con = this.connection;
        this._connectionCallback = callback;
        if (this._connecting || this._connected) {
          const err = new Error("Client has already been connected. You cannot reuse a client.");
          process.nextTick(() => {
            callback(err);
          });
          return;
        }
        this._connecting = true;
        if (this._connectionTimeoutMillis > 0) {
          this.connectionTimeoutHandle = setTimeout(() => {
            con._ending = true;
            con.stream.destroy(new Error("timeout expired"));
          }, this._connectionTimeoutMillis);
          if (this.connectionTimeoutHandle.unref) {
            this.connectionTimeoutHandle.unref();
          }
        }
        if (this.host && this.host.indexOf("/") === 0) {
          con.connect(this.host + "/.s.PGSQL." + this.port);
        } else {
          con.connect(this.port, this.host);
        }
        con.on("connect", function() {
          if (self2.ssl) {
            con.requestSsl();
          } else {
            con.startup(self2.getStartupConf());
          }
        });
        con.on("sslconnect", function() {
          con.startup(self2.getStartupConf());
        });
        this._attachListeners(con);
        con.once("end", () => {
          const error = this._ending ? new Error("Connection terminated") : new Error("Connection terminated unexpectedly");
          clearTimeout(this.connectionTimeoutHandle);
          this._errorAllQueries(error);
          this._ended = true;
          if (!this._ending) {
            if (this._connecting && !this._connectionError) {
              if (this._connectionCallback) {
                this._connectionCallback(error);
              } else {
                this._handleErrorEvent(error);
              }
            } else if (!this._connectionError) {
              this._handleErrorEvent(error);
            }
          }
          process.nextTick(() => {
            this.emit("end");
          });
        });
      }
      connect(callback) {
        if (callback) {
          this._connect(callback);
          return;
        }
        return new this._Promise((resolve, reject) => {
          this._connect((error) => {
            if (error) {
              reject(error);
            } else {
              resolve(this);
            }
          });
        });
      }
      _attachListeners(con) {
        con.on("authenticationCleartextPassword", this._handleAuthCleartextPassword.bind(this));
        con.on("authenticationMD5Password", this._handleAuthMD5Password.bind(this));
        con.on("authenticationSASL", this._handleAuthSASL.bind(this));
        con.on("authenticationSASLContinue", this._handleAuthSASLContinue.bind(this));
        con.on("authenticationSASLFinal", this._handleAuthSASLFinal.bind(this));
        con.on("backendKeyData", this._handleBackendKeyData.bind(this));
        con.on("error", this._handleErrorEvent.bind(this));
        con.on("errorMessage", this._handleErrorMessage.bind(this));
        con.on("readyForQuery", this._handleReadyForQuery.bind(this));
        con.on("notice", this._handleNotice.bind(this));
        con.on("rowDescription", this._handleRowDescription.bind(this));
        con.on("dataRow", this._handleDataRow.bind(this));
        con.on("portalSuspended", this._handlePortalSuspended.bind(this));
        con.on("emptyQuery", this._handleEmptyQuery.bind(this));
        con.on("commandComplete", this._handleCommandComplete.bind(this));
        con.on("parseComplete", this._handleParseComplete.bind(this));
        con.on("copyInResponse", this._handleCopyInResponse.bind(this));
        con.on("copyData", this._handleCopyData.bind(this));
        con.on("notification", this._handleNotification.bind(this));
      }
      _getPassword(cb) {
        const con = this.connection;
        if (typeof this.password === "function") {
          this._Promise.resolve().then(() => this.password(this.connectionParameters)).then((pass) => {
            if (pass !== void 0) {
              if (typeof pass !== "string") {
                con.emit("error", new TypeError("Password must be a string"));
                return;
              }
              this.connectionParameters.password = this.password = pass;
            } else {
              this.connectionParameters.password = this.password = null;
            }
            cb();
          }).catch((err) => {
            con.emit("error", err);
          });
        } else if (this.password !== null) {
          cb();
        } else {
          try {
            const pgPass = require_lib();
            pgPass(this.connectionParameters, (pass) => {
              if (void 0 !== pass) {
                pgPassDeprecationNotice();
                this.connectionParameters.password = this.password = pass;
              }
              cb();
            });
          } catch (e6) {
            this.emit("error", e6);
          }
        }
      }
      _handleAuthCleartextPassword(msg) {
        this._getPassword(() => {
          this.connection.password(this.password);
        });
      }
      _handleAuthMD5Password(msg) {
        this._getPassword(async () => {
          try {
            const hashedPassword = await crypto2.postgresMd5PasswordHash(this.user, this.password, msg.salt);
            this.connection.password(hashedPassword);
          } catch (e6) {
            this.emit("error", e6);
          }
        });
      }
      _handleAuthSASL(msg) {
        this._getPassword(() => {
          try {
            this.saslSession = sasl.startSession(msg.mechanisms, this.enableChannelBinding && this.connection.stream);
            this.connection.sendSASLInitialResponseMessage(this.saslSession.mechanism, this.saslSession.response);
          } catch (err) {
            this.connection.emit("error", err);
          }
        });
      }
      async _handleAuthSASLContinue(msg) {
        try {
          await sasl.continueSession(
            this.saslSession,
            this.password,
            msg.data,
            this.enableChannelBinding && this.connection.stream
          );
          this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
        } catch (err) {
          this.connection.emit("error", err);
        }
      }
      _handleAuthSASLFinal(msg) {
        try {
          sasl.finalizeSession(this.saslSession, msg.data);
          this.saslSession = null;
        } catch (err) {
          this.connection.emit("error", err);
        }
      }
      _handleBackendKeyData(msg) {
        this.processID = msg.processID;
        this.secretKey = msg.secretKey;
      }
      _handleReadyForQuery(msg) {
        if (this._connecting) {
          this._connecting = false;
          this._connected = true;
          clearTimeout(this.connectionTimeoutHandle);
          if (this._connectionCallback) {
            this._connectionCallback(null, this);
            this._connectionCallback = null;
          }
          this.emit("connect");
        }
        const activeQuery = this._getActiveQuery();
        this._activeQuery = null;
        this.readyForQuery = true;
        if (activeQuery) {
          activeQuery.handleReadyForQuery(this.connection);
        }
        this._pulseQueryQueue();
      }
      // if we receive an error event or error message
      // during the connection process we handle it here
      _handleErrorWhileConnecting(err) {
        if (this._connectionError) {
          return;
        }
        this._connectionError = true;
        clearTimeout(this.connectionTimeoutHandle);
        if (this._connectionCallback) {
          return this._connectionCallback(err);
        }
        this.emit("error", err);
      }
      // if we're connected and we receive an error event from the connection
      // this means the socket is dead - do a hard abort of all queries and emit
      // the socket error on the client as well
      _handleErrorEvent(err) {
        if (this._connecting) {
          return this._handleErrorWhileConnecting(err);
        }
        this._queryable = false;
        this._errorAllQueries(err);
        this.emit("error", err);
      }
      // handle error messages from the postgres backend
      _handleErrorMessage(msg) {
        if (this._connecting) {
          return this._handleErrorWhileConnecting(msg);
        }
        const activeQuery = this._getActiveQuery();
        if (!activeQuery) {
          this._handleErrorEvent(msg);
          return;
        }
        this._activeQuery = null;
        activeQuery.handleError(msg, this.connection);
      }
      _handleRowDescription(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected rowDescription message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleRowDescription(msg);
      }
      _handleDataRow(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected dataRow message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleDataRow(msg);
      }
      _handlePortalSuspended(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected portalSuspended message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handlePortalSuspended(this.connection);
      }
      _handleEmptyQuery(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected emptyQuery message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleEmptyQuery(this.connection);
      }
      _handleCommandComplete(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected commandComplete message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleCommandComplete(msg, this.connection);
      }
      _handleParseComplete() {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected parseComplete message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        if (activeQuery.name) {
          this.connection.parsedStatements[activeQuery.name] = activeQuery.text;
        }
      }
      _handleCopyInResponse(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected copyInResponse message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleCopyInResponse(this.connection);
      }
      _handleCopyData(msg) {
        const activeQuery = this._getActiveQuery();
        if (activeQuery == null) {
          const error = new Error("Received unexpected copyData message from backend.");
          this._handleErrorEvent(error);
          return;
        }
        activeQuery.handleCopyData(msg, this.connection);
      }
      _handleNotification(msg) {
        this.emit("notification", msg);
      }
      _handleNotice(msg) {
        this.emit("notice", msg);
      }
      getStartupConf() {
        const params = this.connectionParameters;
        const data = {
          user: params.user,
          database: params.database
        };
        const appName = params.application_name || params.fallback_application_name;
        if (appName) {
          data.application_name = appName;
        }
        if (params.replication) {
          data.replication = "" + params.replication;
        }
        if (params.statement_timeout) {
          data.statement_timeout = String(parseInt(params.statement_timeout, 10));
        }
        if (params.lock_timeout) {
          data.lock_timeout = String(parseInt(params.lock_timeout, 10));
        }
        if (params.idle_in_transaction_session_timeout) {
          data.idle_in_transaction_session_timeout = String(parseInt(params.idle_in_transaction_session_timeout, 10));
        }
        if (params.options) {
          data.options = params.options;
        }
        return data;
      }
      cancel(client, query) {
        if (client.activeQuery === query) {
          const con = this.connection;
          if (this.host && this.host.indexOf("/") === 0) {
            con.connect(this.host + "/.s.PGSQL." + this.port);
          } else {
            con.connect(this.port, this.host);
          }
          con.on("connect", function() {
            con.cancel(client.processID, client.secretKey);
          });
        } else if (client._queryQueue.indexOf(query) !== -1) {
          client._queryQueue.splice(client._queryQueue.indexOf(query), 1);
        }
      }
      setTypeParser(oid, format, parseFn) {
        return this._types.setTypeParser(oid, format, parseFn);
      }
      getTypeParser(oid, format) {
        return this._types.getTypeParser(oid, format);
      }
      // escapeIdentifier and escapeLiteral moved to utility functions & exported
      // on PG
      // re-exported here for backwards compatibility
      escapeIdentifier(str2) {
        return utils.escapeIdentifier(str2);
      }
      escapeLiteral(str2) {
        return utils.escapeLiteral(str2);
      }
      _pulseQueryQueue() {
        if (this.readyForQuery === true) {
          this._activeQuery = this._queryQueue.shift();
          const activeQuery = this._getActiveQuery();
          if (activeQuery) {
            this.readyForQuery = false;
            this.hasExecuted = true;
            const queryError = activeQuery.submit(this.connection);
            if (queryError) {
              process.nextTick(() => {
                activeQuery.handleError(queryError, this.connection);
                this.readyForQuery = true;
                this._pulseQueryQueue();
              });
            }
          } else if (this.hasExecuted) {
            this._activeQuery = null;
            this.emit("drain");
          }
        }
      }
      query(config4, values, callback) {
        let query;
        let result;
        let readTimeout;
        let readTimeoutTimer;
        let queryCallback;
        if (config4 === null || config4 === void 0) {
          throw new TypeError("Client was passed a null or undefined query");
        } else if (typeof config4.submit === "function") {
          readTimeout = config4.query_timeout || this.connectionParameters.query_timeout;
          result = query = config4;
          if (!query.callback) {
            if (typeof values === "function") {
              query.callback = values;
            } else if (callback) {
              query.callback = callback;
            }
          }
        } else {
          readTimeout = config4.query_timeout || this.connectionParameters.query_timeout;
          query = new Query2(config4, values, callback);
          if (!query.callback) {
            result = new this._Promise((resolve, reject) => {
              query.callback = (err, res) => err ? reject(err) : resolve(res);
            }).catch((err) => {
              Error.captureStackTrace(err);
              throw err;
            });
          }
        }
        if (readTimeout) {
          queryCallback = query.callback || (() => {
          });
          readTimeoutTimer = setTimeout(() => {
            const error = new Error("Query read timeout");
            process.nextTick(() => {
              query.handleError(error, this.connection);
            });
            queryCallback(error);
            query.callback = () => {
            };
            const index = this._queryQueue.indexOf(query);
            if (index > -1) {
              this._queryQueue.splice(index, 1);
            }
            this._pulseQueryQueue();
          }, readTimeout);
          query.callback = (err, res) => {
            clearTimeout(readTimeoutTimer);
            queryCallback(err, res);
          };
        }
        if (this.binary && !query.binary) {
          query.binary = true;
        }
        if (query._result && !query._result._types) {
          query._result._types = this._types;
        }
        if (!this._queryable) {
          process.nextTick(() => {
            query.handleError(new Error("Client has encountered a connection error and is not queryable"), this.connection);
          });
          return result;
        }
        if (this._ending) {
          process.nextTick(() => {
            query.handleError(new Error("Client was closed and is not queryable"), this.connection);
          });
          return result;
        }
        if (this._queryQueue.length > 0) {
          queryQueueLengthDeprecationNotice();
        }
        this._queryQueue.push(query);
        this._pulseQueryQueue();
        return result;
      }
      ref() {
        this.connection.ref();
      }
      unref() {
        this.connection.unref();
      }
      end(cb) {
        this._ending = true;
        if (!this.connection._connecting || this._ended) {
          if (cb) {
            cb();
          } else {
            return this._Promise.resolve();
          }
        }
        if (this._getActiveQuery() || !this._queryable) {
          this.connection.stream.destroy();
        } else {
          this.connection.end();
        }
        if (cb) {
          this.connection.once("end", cb);
        } else {
          return new this._Promise((resolve) => {
            this.connection.once("end", resolve);
          });
        }
      }
      get queryQueue() {
        queryQueueDeprecationNotice();
        return this._queryQueue;
      }
    };
    Client2.Query = Query2;
    module.exports = Client2;
  }
});

// ../../node_modules/pg-pool/index.js
var require_pg_pool = __commonJS({
  "../../node_modules/pg-pool/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var EventEmitter2 = require_events().EventEmitter;
    var NOOP = /* @__PURE__ */ __name(function() {
    }, "NOOP");
    var removeWhere = /* @__PURE__ */ __name((list, predicate) => {
      const i = list.findIndex(predicate);
      return i === -1 ? void 0 : list.splice(i, 1)[0];
    }, "removeWhere");
    var IdleItem = class {
      static {
        __name(this, "IdleItem");
      }
      constructor(client, idleListener, timeoutId) {
        this.client = client;
        this.idleListener = idleListener;
        this.timeoutId = timeoutId;
      }
    };
    var PendingItem = class {
      static {
        __name(this, "PendingItem");
      }
      constructor(callback) {
        this.callback = callback;
      }
    };
    function throwOnDoubleRelease() {
      throw new Error("Release called on client which has already been released to the pool.");
    }
    __name(throwOnDoubleRelease, "throwOnDoubleRelease");
    function promisify(Promise2, callback) {
      if (callback) {
        return { callback, result: void 0 };
      }
      let rej;
      let res;
      const cb = /* @__PURE__ */ __name(function(err, client) {
        err ? rej(err) : res(client);
      }, "cb");
      const result = new Promise2(function(resolve, reject) {
        res = resolve;
        rej = reject;
      }).catch((err) => {
        Error.captureStackTrace(err);
        throw err;
      });
      return { callback: cb, result };
    }
    __name(promisify, "promisify");
    function makeIdleListener(pool, client) {
      return /* @__PURE__ */ __name(function idleListener(err) {
        err.client = client;
        client.removeListener("error", idleListener);
        client.on("error", () => {
          pool.log("additional client error after disconnection due to error", err);
        });
        pool._remove(client);
        pool.emit("error", err, client);
      }, "idleListener");
    }
    __name(makeIdleListener, "makeIdleListener");
    var Pool2 = class extends EventEmitter2 {
      static {
        __name(this, "Pool");
      }
      constructor(options, Client2) {
        super();
        this.options = Object.assign({}, options);
        if (options != null && "password" in options) {
          Object.defineProperty(this.options, "password", {
            configurable: true,
            enumerable: false,
            writable: true,
            value: options.password
          });
        }
        if (options != null && options.ssl && options.ssl.key) {
          Object.defineProperty(this.options.ssl, "key", {
            enumerable: false
          });
        }
        this.options.max = this.options.max || this.options.poolSize || 10;
        this.options.min = this.options.min || 0;
        this.options.maxUses = this.options.maxUses || Infinity;
        this.options.allowExitOnIdle = this.options.allowExitOnIdle || false;
        this.options.maxLifetimeSeconds = this.options.maxLifetimeSeconds || 0;
        this.log = this.options.log || function() {
        };
        this.Client = this.options.Client || Client2 || require_lib2().Client;
        this.Promise = this.options.Promise || global.Promise;
        if (typeof this.options.idleTimeoutMillis === "undefined") {
          this.options.idleTimeoutMillis = 1e4;
        }
        this._clients = [];
        this._idle = [];
        this._expired = /* @__PURE__ */ new WeakSet();
        this._pendingQueue = [];
        this._endCallback = void 0;
        this.ending = false;
        this.ended = false;
      }
      _isFull() {
        return this._clients.length >= this.options.max;
      }
      _isAboveMin() {
        return this._clients.length > this.options.min;
      }
      _pulseQueue() {
        this.log("pulse queue");
        if (this.ended) {
          this.log("pulse queue ended");
          return;
        }
        if (this.ending) {
          this.log("pulse queue on ending");
          if (this._idle.length) {
            this._idle.slice().map((item) => {
              this._remove(item.client);
            });
          }
          if (!this._clients.length) {
            this.ended = true;
            this._endCallback();
          }
          return;
        }
        if (!this._pendingQueue.length) {
          this.log("no queued requests");
          return;
        }
        if (!this._idle.length && this._isFull()) {
          return;
        }
        const pendingItem = this._pendingQueue.shift();
        if (this._idle.length) {
          const idleItem = this._idle.pop();
          clearTimeout(idleItem.timeoutId);
          const client = idleItem.client;
          client.ref && client.ref();
          const idleListener = idleItem.idleListener;
          return this._acquireClient(client, pendingItem, idleListener, false);
        }
        if (!this._isFull()) {
          return this.newClient(pendingItem);
        }
        throw new Error("unexpected condition");
      }
      _remove(client, callback) {
        const removed = removeWhere(this._idle, (item) => item.client === client);
        if (removed !== void 0) {
          clearTimeout(removed.timeoutId);
        }
        this._clients = this._clients.filter((c2) => c2 !== client);
        const context = this;
        client.end(() => {
          context.emit("remove", client);
          if (typeof callback === "function") {
            callback();
          }
        });
      }
      connect(cb) {
        if (this.ending) {
          const err = new Error("Cannot use a pool after calling end on the pool");
          return cb ? cb(err) : this.Promise.reject(err);
        }
        const response = promisify(this.Promise, cb);
        const result = response.result;
        if (this._isFull() || this._idle.length) {
          if (this._idle.length) {
            process.nextTick(() => this._pulseQueue());
          }
          if (!this.options.connectionTimeoutMillis) {
            this._pendingQueue.push(new PendingItem(response.callback));
            return result;
          }
          const queueCallback = /* @__PURE__ */ __name((err, res, done) => {
            clearTimeout(tid);
            response.callback(err, res, done);
          }, "queueCallback");
          const pendingItem = new PendingItem(queueCallback);
          const tid = setTimeout(() => {
            removeWhere(this._pendingQueue, (i) => i.callback === queueCallback);
            pendingItem.timedOut = true;
            response.callback(new Error("timeout exceeded when trying to connect"));
          }, this.options.connectionTimeoutMillis);
          if (tid.unref) {
            tid.unref();
          }
          this._pendingQueue.push(pendingItem);
          return result;
        }
        this.newClient(new PendingItem(response.callback));
        return result;
      }
      newClient(pendingItem) {
        const client = new this.Client(this.options);
        this._clients.push(client);
        const idleListener = makeIdleListener(this, client);
        this.log("checking client timeout");
        let tid;
        let timeoutHit = false;
        if (this.options.connectionTimeoutMillis) {
          tid = setTimeout(() => {
            if (client.connection) {
              this.log("ending client due to timeout");
              timeoutHit = true;
              client.connection.stream.destroy();
            } else if (!client.isConnected()) {
              this.log("ending client due to timeout");
              timeoutHit = true;
              client.end();
            }
          }, this.options.connectionTimeoutMillis);
        }
        this.log("connecting new client");
        client.connect((err) => {
          if (tid) {
            clearTimeout(tid);
          }
          client.on("error", idleListener);
          if (err) {
            this.log("client failed to connect", err);
            this._clients = this._clients.filter((c2) => c2 !== client);
            if (timeoutHit) {
              err = new Error("Connection terminated due to connection timeout", { cause: err });
            }
            this._pulseQueue();
            if (!pendingItem.timedOut) {
              pendingItem.callback(err, void 0, NOOP);
            }
          } else {
            this.log("new client connected");
            if (this.options.maxLifetimeSeconds !== 0) {
              const maxLifetimeTimeout = setTimeout(() => {
                this.log("ending client due to expired lifetime");
                this._expired.add(client);
                const idleIndex = this._idle.findIndex((idleItem) => idleItem.client === client);
                if (idleIndex !== -1) {
                  this._acquireClient(
                    client,
                    new PendingItem((err2, client2, clientRelease) => clientRelease()),
                    idleListener,
                    false
                  );
                }
              }, this.options.maxLifetimeSeconds * 1e3);
              maxLifetimeTimeout.unref();
              client.once("end", () => clearTimeout(maxLifetimeTimeout));
            }
            return this._acquireClient(client, pendingItem, idleListener, true);
          }
        });
      }
      // acquire a client for a pending work item
      _acquireClient(client, pendingItem, idleListener, isNew) {
        if (isNew) {
          this.emit("connect", client);
        }
        this.emit("acquire", client);
        client.release = this._releaseOnce(client, idleListener);
        client.removeListener("error", idleListener);
        if (!pendingItem.timedOut) {
          if (isNew && this.options.verify) {
            this.options.verify(client, (err) => {
              if (err) {
                client.release(err);
                return pendingItem.callback(err, void 0, NOOP);
              }
              pendingItem.callback(void 0, client, client.release);
            });
          } else {
            pendingItem.callback(void 0, client, client.release);
          }
        } else {
          if (isNew && this.options.verify) {
            this.options.verify(client, client.release);
          } else {
            client.release();
          }
        }
      }
      // returns a function that wraps _release and throws if called more than once
      _releaseOnce(client, idleListener) {
        let released = false;
        return (err) => {
          if (released) {
            throwOnDoubleRelease();
          }
          released = true;
          this._release(client, idleListener, err);
        };
      }
      // release a client back to the poll, include an error
      // to remove it from the pool
      _release(client, idleListener, err) {
        client.on("error", idleListener);
        client._poolUseCount = (client._poolUseCount || 0) + 1;
        this.emit("release", err, client);
        if (err || this.ending || !client._queryable || client._ending || client._poolUseCount >= this.options.maxUses) {
          if (client._poolUseCount >= this.options.maxUses) {
            this.log("remove expended client");
          }
          return this._remove(client, this._pulseQueue.bind(this));
        }
        const isExpired = this._expired.has(client);
        if (isExpired) {
          this.log("remove expired client");
          this._expired.delete(client);
          return this._remove(client, this._pulseQueue.bind(this));
        }
        let tid;
        if (this.options.idleTimeoutMillis && this._isAboveMin()) {
          tid = setTimeout(() => {
            if (this._isAboveMin()) {
              this.log("remove idle client");
              this._remove(client, this._pulseQueue.bind(this));
            }
          }, this.options.idleTimeoutMillis);
          if (this.options.allowExitOnIdle) {
            tid.unref();
          }
        }
        if (this.options.allowExitOnIdle) {
          client.unref();
        }
        this._idle.push(new IdleItem(client, idleListener, tid));
        this._pulseQueue();
      }
      query(text, values, cb) {
        if (typeof text === "function") {
          const response2 = promisify(this.Promise, text);
          setImmediate(function() {
            return response2.callback(new Error("Passing a function as the first parameter to pool.query is not supported"));
          });
          return response2.result;
        }
        if (typeof values === "function") {
          cb = values;
          values = void 0;
        }
        const response = promisify(this.Promise, cb);
        cb = response.callback;
        this.connect((err, client) => {
          if (err) {
            return cb(err);
          }
          let clientReleased = false;
          const onError = /* @__PURE__ */ __name((err2) => {
            if (clientReleased) {
              return;
            }
            clientReleased = true;
            client.release(err2);
            cb(err2);
          }, "onError");
          client.once("error", onError);
          this.log("dispatching query");
          try {
            client.query(text, values, (err2, res) => {
              this.log("query dispatched");
              client.removeListener("error", onError);
              if (clientReleased) {
                return;
              }
              clientReleased = true;
              client.release(err2);
              if (err2) {
                return cb(err2);
              }
              return cb(void 0, res);
            });
          } catch (err2) {
            client.release(err2);
            return cb(err2);
          }
        });
        return response.result;
      }
      end(cb) {
        this.log("ending");
        if (this.ending) {
          const err = new Error("Called end on pool more than once");
          return cb ? cb(err) : this.Promise.reject(err);
        }
        this.ending = true;
        const promised = promisify(this.Promise, cb);
        this._endCallback = promised.callback;
        this._pulseQueue();
        return promised.result;
      }
      get waitingCount() {
        return this._pendingQueue.length;
      }
      get idleCount() {
        return this._idle.length;
      }
      get expiredCount() {
        return this._clients.reduce((acc, client) => acc + (this._expired.has(client) ? 1 : 0), 0);
      }
      get totalCount() {
        return this._clients.length;
      }
    };
    module.exports = Pool2;
  }
});

// ../../node_modules/pg/lib/native/query.js
var require_query2 = __commonJS({
  "../../node_modules/pg/lib/native/query.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var EventEmitter2 = require_events().EventEmitter;
    var util = require_util();
    var utils = require_utils();
    var NativeQuery = module.exports = function(config4, values, callback) {
      EventEmitter2.call(this);
      config4 = utils.normalizeQueryConfig(config4, values, callback);
      this.text = config4.text;
      this.values = config4.values;
      this.name = config4.name;
      this.queryMode = config4.queryMode;
      this.callback = config4.callback;
      this.state = "new";
      this._arrayMode = config4.rowMode === "array";
      this._emitRowEvents = false;
      this.on(
        "newListener",
        function(event) {
          if (event === "row") this._emitRowEvents = true;
        }.bind(this)
      );
    };
    util.inherits(NativeQuery, EventEmitter2);
    var errorFieldMap = {
      sqlState: "code",
      statementPosition: "position",
      messagePrimary: "message",
      context: "where",
      schemaName: "schema",
      tableName: "table",
      columnName: "column",
      dataTypeName: "dataType",
      constraintName: "constraint",
      sourceFile: "file",
      sourceLine: "line",
      sourceFunction: "routine"
    };
    NativeQuery.prototype.handleError = function(err) {
      const fields = this.native.pq.resultErrorFields();
      if (fields) {
        for (const key in fields) {
          const normalizedFieldName = errorFieldMap[key] || key;
          err[normalizedFieldName] = fields[key];
        }
      }
      if (this.callback) {
        this.callback(err);
      } else {
        this.emit("error", err);
      }
      this.state = "error";
    };
    NativeQuery.prototype.then = function(onSuccess, onFailure) {
      return this._getPromise().then(onSuccess, onFailure);
    };
    NativeQuery.prototype.catch = function(callback) {
      return this._getPromise().catch(callback);
    };
    NativeQuery.prototype._getPromise = function() {
      if (this._promise) return this._promise;
      this._promise = new Promise(
        function(resolve, reject) {
          this._once("end", resolve);
          this._once("error", reject);
        }.bind(this)
      );
      return this._promise;
    };
    NativeQuery.prototype.submit = function(client) {
      this.state = "running";
      const self2 = this;
      this.native = client.native;
      client.native.arrayMode = this._arrayMode;
      let after = /* @__PURE__ */ __name(function(err, rows, results) {
        client.native.arrayMode = false;
        setImmediate(function() {
          self2.emit("_done");
        });
        if (err) {
          return self2.handleError(err);
        }
        if (self2._emitRowEvents) {
          if (results.length > 1) {
            rows.forEach((rowOfRows, i) => {
              rowOfRows.forEach((row) => {
                self2.emit("row", row, results[i]);
              });
            });
          } else {
            rows.forEach(function(row) {
              self2.emit("row", row, results);
            });
          }
        }
        self2.state = "end";
        self2.emit("end", results);
        if (self2.callback) {
          self2.callback(null, results);
        }
      }, "after");
      if (process.domain) {
        after = process.domain.bind(after);
      }
      if (this.name) {
        if (this.name.length > 63) {
          console.error("Warning! Postgres only supports 63 characters for query names.");
          console.error("You supplied %s (%s)", this.name, this.name.length);
          console.error("This can cause conflicts and silent errors executing queries");
        }
        const values = (this.values || []).map(utils.prepareValue);
        if (client.namedQueries[this.name]) {
          if (this.text && client.namedQueries[this.name] !== this.text) {
            const err = new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
            return after(err);
          }
          return client.native.execute(this.name, values, after);
        }
        return client.native.prepare(this.name, this.text, values.length, function(err) {
          if (err) return after(err);
          client.namedQueries[self2.name] = self2.text;
          return self2.native.execute(self2.name, values, after);
        });
      } else if (this.values) {
        if (!Array.isArray(this.values)) {
          const err = new Error("Query values must be an array");
          return after(err);
        }
        const vals = this.values.map(utils.prepareValue);
        client.native.query(this.text, vals, after);
      } else if (this.queryMode === "extended") {
        client.native.query(this.text, [], after);
      } else {
        client.native.query(this.text, after);
      }
    };
  }
});

// ../../node_modules/pg/lib/native/client.js
var require_client2 = __commonJS({
  "../../node_modules/pg/lib/native/client.js"(exports, module) {
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var nodeUtils = require_util();
    var Native;
    try {
      Native = __require("pg-native");
    } catch (e6) {
      throw e6;
    }
    var TypeOverrides2 = require_type_overrides();
    var EventEmitter2 = require_events().EventEmitter;
    var util = require_util();
    var ConnectionParameters = require_connection_parameters();
    var NativeQuery = require_query2();
    var queryQueueLengthDeprecationNotice = nodeUtils.deprecate(
      () => {
      },
      "Calling client.query() when the client is already executing a query is deprecated and will be removed in pg@9.0. Use asycn/await or an external async flow control mechanism instead."
    );
    var Client2 = module.exports = function(config4) {
      EventEmitter2.call(this);
      config4 = config4 || {};
      this._Promise = config4.Promise || global.Promise;
      this._types = new TypeOverrides2(config4.types);
      this.native = new Native({
        types: this._types
      });
      this._queryQueue = [];
      this._ending = false;
      this._connecting = false;
      this._connected = false;
      this._queryable = true;
      const cp2 = this.connectionParameters = new ConnectionParameters(config4);
      if (config4.nativeConnectionString) cp2.nativeConnectionString = config4.nativeConnectionString;
      this.user = cp2.user;
      Object.defineProperty(this, "password", {
        configurable: true,
        enumerable: false,
        writable: true,
        value: cp2.password
      });
      this.database = cp2.database;
      this.host = cp2.host;
      this.port = cp2.port;
      this.namedQueries = {};
    };
    Client2.Query = NativeQuery;
    util.inherits(Client2, EventEmitter2);
    Client2.prototype._errorAllQueries = function(err) {
      const enqueueError = /* @__PURE__ */ __name((query) => {
        process.nextTick(() => {
          query.native = this.native;
          query.handleError(err);
        });
      }, "enqueueError");
      if (this._hasActiveQuery()) {
        enqueueError(this._activeQuery);
        this._activeQuery = null;
      }
      this._queryQueue.forEach(enqueueError);
      this._queryQueue.length = 0;
    };
    Client2.prototype._connect = function(cb) {
      const self2 = this;
      if (this._connecting) {
        process.nextTick(() => cb(new Error("Client has already been connected. You cannot reuse a client.")));
        return;
      }
      this._connecting = true;
      this.connectionParameters.getLibpqConnectionString(function(err, conString) {
        if (self2.connectionParameters.nativeConnectionString) conString = self2.connectionParameters.nativeConnectionString;
        if (err) return cb(err);
        self2.native.connect(conString, function(err2) {
          if (err2) {
            self2.native.end();
            return cb(err2);
          }
          self2._connected = true;
          self2.native.on("error", function(err3) {
            self2._queryable = false;
            self2._errorAllQueries(err3);
            self2.emit("error", err3);
          });
          self2.native.on("notification", function(msg) {
            self2.emit("notification", {
              channel: msg.relname,
              payload: msg.extra
            });
          });
          self2.emit("connect");
          self2._pulseQueryQueue(true);
          cb(null, this);
        });
      });
    };
    Client2.prototype.connect = function(callback) {
      if (callback) {
        this._connect(callback);
        return;
      }
      return new this._Promise((resolve, reject) => {
        this._connect((error) => {
          if (error) {
            reject(error);
          } else {
            resolve(this);
          }
        });
      });
    };
    Client2.prototype.query = function(config4, values, callback) {
      let query;
      let result;
      let readTimeout;
      let readTimeoutTimer;
      let queryCallback;
      if (config4 === null || config4 === void 0) {
        throw new TypeError("Client was passed a null or undefined query");
      } else if (typeof config4.submit === "function") {
        readTimeout = config4.query_timeout || this.connectionParameters.query_timeout;
        result = query = config4;
        if (typeof values === "function") {
          config4.callback = values;
        }
      } else {
        readTimeout = config4.query_timeout || this.connectionParameters.query_timeout;
        query = new NativeQuery(config4, values, callback);
        if (!query.callback) {
          let resolveOut, rejectOut;
          result = new this._Promise((resolve, reject) => {
            resolveOut = resolve;
            rejectOut = reject;
          }).catch((err) => {
            Error.captureStackTrace(err);
            throw err;
          });
          query.callback = (err, res) => err ? rejectOut(err) : resolveOut(res);
        }
      }
      if (readTimeout) {
        queryCallback = query.callback || (() => {
        });
        readTimeoutTimer = setTimeout(() => {
          const error = new Error("Query read timeout");
          process.nextTick(() => {
            query.handleError(error, this.connection);
          });
          queryCallback(error);
          query.callback = () => {
          };
          const index = this._queryQueue.indexOf(query);
          if (index > -1) {
            this._queryQueue.splice(index, 1);
          }
          this._pulseQueryQueue();
        }, readTimeout);
        query.callback = (err, res) => {
          clearTimeout(readTimeoutTimer);
          queryCallback(err, res);
        };
      }
      if (!this._queryable) {
        query.native = this.native;
        process.nextTick(() => {
          query.handleError(new Error("Client has encountered a connection error and is not queryable"));
        });
        return result;
      }
      if (this._ending) {
        query.native = this.native;
        process.nextTick(() => {
          query.handleError(new Error("Client was closed and is not queryable"));
        });
        return result;
      }
      if (this._queryQueue.length > 0) {
        queryQueueLengthDeprecationNotice();
      }
      this._queryQueue.push(query);
      this._pulseQueryQueue();
      return result;
    };
    Client2.prototype.end = function(cb) {
      const self2 = this;
      this._ending = true;
      if (!this._connected) {
        this.once("connect", this.end.bind(this, cb));
      }
      let result;
      if (!cb) {
        result = new this._Promise(function(resolve, reject) {
          cb = /* @__PURE__ */ __name((err) => err ? reject(err) : resolve(), "cb");
        });
      }
      this.native.end(function() {
        self2._connected = false;
        self2._errorAllQueries(new Error("Connection terminated"));
        process.nextTick(() => {
          self2.emit("end");
          if (cb) cb();
        });
      });
      return result;
    };
    Client2.prototype._hasActiveQuery = function() {
      return this._activeQuery && this._activeQuery.state !== "error" && this._activeQuery.state !== "end";
    };
    Client2.prototype._pulseQueryQueue = function(initialConnection) {
      if (!this._connected) {
        return;
      }
      if (this._hasActiveQuery()) {
        return;
      }
      const query = this._queryQueue.shift();
      if (!query) {
        if (!initialConnection) {
          this.emit("drain");
        }
        return;
      }
      this._activeQuery = query;
      query.submit(this);
      const self2 = this;
      query.once("_done", function() {
        self2._pulseQueryQueue();
      });
    };
    Client2.prototype.cancel = function(query) {
      if (this._activeQuery === query) {
        this.native.cancel(function() {
        });
      } else if (this._queryQueue.indexOf(query) !== -1) {
        this._queryQueue.splice(this._queryQueue.indexOf(query), 1);
      }
    };
    Client2.prototype.ref = function() {
    };
    Client2.prototype.unref = function() {
    };
    Client2.prototype.setTypeParser = function(oid, format, parseFn) {
      return this._types.setTypeParser(oid, format, parseFn);
    };
    Client2.prototype.getTypeParser = function(oid, format) {
      return this._types.getTypeParser(oid, format);
    };
    Client2.prototype.isConnected = function() {
      return this._connected;
    };
  }
});

// ../../node_modules/pg/lib/native/index.js
var require_native = __commonJS({
  "../../node_modules/pg/lib/native/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    module.exports = require_client2();
  }
});

// ../../node_modules/pg/lib/index.js
var require_lib2 = __commonJS({
  "../../node_modules/pg/lib/index.js"(exports, module) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var Client2 = require_client();
    var defaults3 = require_defaults();
    var Connection2 = require_connection();
    var Result2 = require_result();
    var utils = require_utils();
    var Pool2 = require_pg_pool();
    var TypeOverrides2 = require_type_overrides();
    var { DatabaseError: DatabaseError2 } = require_dist();
    var { escapeIdentifier: escapeIdentifier2, escapeLiteral: escapeLiteral2 } = require_utils();
    var poolFactory = /* @__PURE__ */ __name((Client3) => {
      return class BoundPool extends Pool2 {
        static {
          __name(this, "BoundPool");
        }
        constructor(options) {
          super(options, Client3);
        }
      };
    }, "poolFactory");
    var PG = /* @__PURE__ */ __name(function(clientConstructor2) {
      this.defaults = defaults3;
      this.Client = clientConstructor2;
      this.Query = this.Client.Query;
      this.Pool = poolFactory(this.Client);
      this._pools = [];
      this.Connection = Connection2;
      this.types = require_pg_types();
      this.DatabaseError = DatabaseError2;
      this.TypeOverrides = TypeOverrides2;
      this.escapeIdentifier = escapeIdentifier2;
      this.escapeLiteral = escapeLiteral2;
      this.Result = Result2;
      this.utils = utils;
    }, "PG");
    var clientConstructor = Client2;
    var forceNative = false;
    try {
      forceNative = !!process.env.NODE_PG_FORCE_NATIVE;
    } catch {
    }
    if (forceNative) {
      clientConstructor = require_native();
    }
    module.exports = new PG(clientConstructor);
    Object.defineProperty(module.exports, "native", {
      configurable: true,
      enumerable: false,
      get() {
        let native = null;
        try {
          native = new PG(require_native());
        } catch (err) {
          if (err.code !== "MODULE_NOT_FOUND") {
            throw err;
          }
        }
        Object.defineProperty(module.exports, "native", {
          value: native
        });
        return native;
      }
    });
  }
});

// ../../node_modules/postgres-array/index.js
var require_postgres_array2 = __commonJS({
  "../../node_modules/postgres-array/index.js"(exports) {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    var BACKSLASH = "\\";
    var DQUOT = '"';
    var LBRACE = "{";
    var RBRACE = "}";
    var LBRACKET = "[";
    var EQUALS = "=";
    var COMMA = ",";
    var NULL_STRING = "NULL";
    function makeParseArrayWithTransform(transform) {
      const haveTransform = transform != null;
      return /* @__PURE__ */ __name(function parseArray3(str2) {
        const rbraceIndex = str2.length - 1;
        if (rbraceIndex === 1) {
          return [];
        }
        if (str2[rbraceIndex] !== RBRACE) {
          throw new Error("Invalid array text - must end with }");
        }
        let position = 0;
        if (str2[position] === LBRACKET) {
          position = str2.indexOf(EQUALS) + 1;
        }
        if (str2[position++] !== LBRACE) {
          throw new Error("Invalid array text - must start with {");
        }
        const output = [];
        let current = output;
        const stack = [];
        let currentStringStart = position;
        let currentString = "";
        let expectValue = true;
        for (; position < rbraceIndex; ++position) {
          let char = str2[position];
          if (char === DQUOT) {
            currentStringStart = ++position;
            let dquot = str2.indexOf(DQUOT, currentStringStart);
            let backSlash = str2.indexOf(BACKSLASH, currentStringStart);
            while (backSlash !== -1 && backSlash < dquot) {
              position = backSlash;
              const part2 = str2.slice(currentStringStart, position);
              currentString += part2;
              currentStringStart = ++position;
              if (dquot === position++) {
                dquot = str2.indexOf(DQUOT, position);
              }
              backSlash = str2.indexOf(BACKSLASH, position);
            }
            position = dquot;
            const part = str2.slice(currentStringStart, position);
            currentString += part;
            current.push(haveTransform ? transform(currentString) : currentString);
            currentString = "";
            expectValue = false;
          } else if (char === LBRACE) {
            const newArray = [];
            current.push(newArray);
            stack.push(current);
            current = newArray;
            currentStringStart = position + 1;
            expectValue = true;
          } else if (char === COMMA) {
            expectValue = true;
          } else if (char === RBRACE) {
            expectValue = false;
            const arr = stack.pop();
            if (arr === void 0) {
              throw new Error("Invalid array text - too many '}'");
            }
            current = arr;
          } else if (expectValue) {
            currentStringStart = position;
            while ((char = str2[position]) !== COMMA && char !== RBRACE && position < rbraceIndex) {
              ++position;
            }
            const part = str2.slice(currentStringStart, position--);
            current.push(
              part === NULL_STRING ? null : haveTransform ? transform(part) : part
            );
            expectValue = false;
          } else {
            throw new Error("Was expecting delimeter");
          }
        }
        return output;
      }, "parseArray");
    }
    __name(makeParseArrayWithTransform, "makeParseArrayWithTransform");
    var parseArray2 = makeParseArrayWithTransform();
    exports.parse = (source, transform) => transform != null ? makeParseArrayWithTransform(transform)(source) : parseArray2(source);
  }
});

// ../../packages/database/src/generated/prisma/internal/query_compiler_fast_bg.js
var query_compiler_fast_bg_exports = {};
__export(query_compiler_fast_bg_exports, {
  QueryCompiler: () => F2,
  __wbg_Error_e83987f665cf5504: () => O,
  __wbg_Number_bb48ca12f395cd08: () => B2,
  __wbg_String_8f0eb39a4a4c2f66: () => N,
  __wbg___wbindgen_boolean_get_6d5a1ee65bab5f68: () => U2,
  __wbg___wbindgen_debug_string_df47ffb5e35e6763: () => R,
  __wbg___wbindgen_in_bb933bd9e1b3bc0f: () => $3,
  __wbg___wbindgen_is_object_c818261d21f283a4: () => q,
  __wbg___wbindgen_is_string_fbb76cb2940daafd: () => C,
  __wbg___wbindgen_is_undefined_2d472862bd29a478: () => k,
  __wbg___wbindgen_jsval_loose_eq_b664b38a2f582147: () => W2,
  __wbg___wbindgen_number_get_a20bf9b85341449d: () => V2,
  __wbg___wbindgen_string_get_e4f06c90489ad01b: () => z2,
  __wbg___wbindgen_throw_b855445ff6a94295: () => L2,
  __wbg_entries_e171b586f8f6bdbf: () => P2,
  __wbg_getTime_14776bfb48a1bff9: () => Q2,
  __wbg_get_7bed016f185add81: () => Y2,
  __wbg_get_with_ref_key_1dc361bd10053bfe: () => G2,
  __wbg_instanceof_ArrayBuffer_70beb1189ca63b38: () => J2,
  __wbg_instanceof_Uint8Array_20c8e73002f7af98: () => X,
  __wbg_isSafeInteger_d216eda7911dde36: () => H2,
  __wbg_length_69bca3cb64fc8748: () => K2,
  __wbg_length_cdd215e10d9dd507: () => Z2,
  __wbg_new_0_f9740686d739025c: () => v2,
  __wbg_new_1acc0b6eea89d040: () => ee,
  __wbg_new_5a79be3ab53b8aa5: () => te2,
  __wbg_new_68651c719dcda04e: () => ne2,
  __wbg_new_e17d9f43105b08be: () => re2,
  __wbg_prototypesetcall_2a6620b6922694b2: () => _e2,
  __wbg_set_3f1d0b984ed272ed: () => oe2,
  __wbg_set_907fb406c34a251d: () => ce,
  __wbg_set_c213c871859d6500: () => ie2,
  __wbg_set_message_82ae475bb413aa5c: () => se2,
  __wbg_set_wasm: () => D2,
  __wbindgen_cast_2241b6af4c4b2941: () => ue2,
  __wbindgen_cast_4625c577ab2ec9ee: () => fe2,
  __wbindgen_cast_9ae0607507abb057: () => be2,
  __wbindgen_cast_d6cd19b81560fd6e: () => de2,
  __wbindgen_init_externref_table: () => ae
});
function D2(e6) {
  o = e6;
}
function a() {
  return (p2 === null || p2.byteLength === 0) && (p2 = new Uint8Array(o.memory.buffer)), p2;
}
function T(e6, t) {
  return A += t, A >= E && (y2 = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true }), y2.decode(), A = t), y2.decode(a().subarray(e6, e6 + t));
}
function m2(e6, t) {
  return e6 = e6 >>> 0, T(e6, t);
}
function l2(e6, t, n) {
  if (n === void 0) {
    const i = g2.encode(e6), d = t(i.length, 1) >>> 0;
    return a().subarray(d, d + i.length).set(i), f = i.length, d;
  }
  let _ = e6.length, r = t(_, 1) >>> 0;
  const s = a();
  let c2 = 0;
  for (; c2 < _; c2++) {
    const i = e6.charCodeAt(c2);
    if (i > 127) break;
    s[r + c2] = i;
  }
  if (c2 !== _) {
    c2 !== 0 && (e6 = e6.slice(c2)), r = n(r, _, _ = c2 + e6.length * 3, 1) >>> 0;
    const i = a().subarray(r + c2, r + _), d = g2.encodeInto(e6, i);
    c2 += d.written, r = n(r, _, c2, 1) >>> 0;
  }
  return f = c2, r;
}
function u2() {
  return (b2 === null || b2.buffer.detached === true || b2.buffer.detached === void 0 && b2.buffer !== o.memory.buffer) && (b2 = new DataView(o.memory.buffer)), b2;
}
function x2(e6) {
  return e6 == null;
}
function S(e6) {
  const t = typeof e6;
  if (t == "number" || t == "boolean" || e6 == null) return `${e6}`;
  if (t == "string") return `"${e6}"`;
  if (t == "symbol") {
    const r = e6.description;
    return r == null ? "Symbol" : `Symbol(${r})`;
  }
  if (t == "function") {
    const r = e6.name;
    return typeof r == "string" && r.length > 0 ? `Function(${r})` : "Function";
  }
  if (Array.isArray(e6)) {
    const r = e6.length;
    let s = "[";
    r > 0 && (s += S(e6[0]));
    for (let c2 = 1; c2 < r; c2++) s += ", " + S(e6[c2]);
    return s += "]", s;
  }
  const n = /\[object ([^\]]+)\]/.exec(toString.call(e6));
  let _;
  if (n && n.length > 1) _ = n[1];
  else return toString.call(e6);
  if (_ == "Object") try {
    return "Object(" + JSON.stringify(e6) + ")";
  } catch {
    return "Object";
  }
  return e6 instanceof Error ? `${e6.name}: ${e6.message}
${e6.stack}` : _;
}
function M(e6, t) {
  return e6 = e6 >>> 0, a().subarray(e6 / 1, e6 / 1 + t);
}
function w2(e6) {
  const t = o.__wbindgen_externrefs.get(e6);
  return o.__externref_table_dealloc(e6), t;
}
function O(e6, t) {
  return Error(m2(e6, t));
}
function B2(e6) {
  return Number(e6);
}
function N(e6, t) {
  const n = String(t), _ = l2(n, o.__wbindgen_malloc, o.__wbindgen_realloc), r = f;
  u2().setInt32(e6 + 4 * 1, r, true), u2().setInt32(e6 + 4 * 0, _, true);
}
function U2(e6) {
  const t = e6, n = typeof t == "boolean" ? t : void 0;
  return x2(n) ? 16777215 : n ? 1 : 0;
}
function R(e6, t) {
  const n = S(t), _ = l2(n, o.__wbindgen_malloc, o.__wbindgen_realloc), r = f;
  u2().setInt32(e6 + 4 * 1, r, true), u2().setInt32(e6 + 4 * 0, _, true);
}
function $3(e6, t) {
  return e6 in t;
}
function q(e6) {
  const t = e6;
  return typeof t == "object" && t !== null;
}
function C(e6) {
  return typeof e6 == "string";
}
function k(e6) {
  return e6 === void 0;
}
function W2(e6, t) {
  return e6 == t;
}
function V2(e6, t) {
  const n = t, _ = typeof n == "number" ? n : void 0;
  u2().setFloat64(e6 + 8 * 1, x2(_) ? 0 : _, true), u2().setInt32(e6 + 4 * 0, !x2(_), true);
}
function z2(e6, t) {
  const n = t, _ = typeof n == "string" ? n : void 0;
  var r = x2(_) ? 0 : l2(_, o.__wbindgen_malloc, o.__wbindgen_realloc), s = f;
  u2().setInt32(e6 + 4 * 1, s, true), u2().setInt32(e6 + 4 * 0, r, true);
}
function L2(e6, t) {
  throw new Error(m2(e6, t));
}
function P2(e6) {
  return Object.entries(e6);
}
function Q2(e6) {
  return e6.getTime();
}
function Y2(e6, t) {
  return e6[t >>> 0];
}
function G2(e6, t) {
  return e6[t];
}
function J2(e6) {
  let t;
  try {
    t = e6 instanceof ArrayBuffer;
  } catch {
    t = false;
  }
  return t;
}
function X(e6) {
  let t;
  try {
    t = e6 instanceof Uint8Array;
  } catch {
    t = false;
  }
  return t;
}
function H2(e6) {
  return Number.isSafeInteger(e6);
}
function K2(e6) {
  return e6.length;
}
function Z2(e6) {
  return e6.length;
}
function v2() {
  return /* @__PURE__ */ new Date();
}
function ee() {
  return new Object();
}
function te2(e6) {
  return new Uint8Array(e6);
}
function ne2() {
  return /* @__PURE__ */ new Map();
}
function re2() {
  return new Array();
}
function _e2(e6, t, n) {
  Uint8Array.prototype.set.call(M(e6, t), n);
}
function oe2(e6, t, n) {
  e6[t] = n;
}
function ce(e6, t, n) {
  return e6.set(t, n);
}
function ie2(e6, t, n) {
  e6[t >>> 0] = n;
}
function se2(e6, t) {
  global.PRISMA_WASM_PANIC_REGISTRY.set_message(m2(e6, t));
}
function ue2(e6, t) {
  return m2(e6, t);
}
function fe2(e6) {
  return BigInt.asUintN(64, e6);
}
function be2(e6) {
  return e6;
}
function de2(e6) {
  return e6;
}
function ae() {
  const e6 = o.__wbindgen_externrefs, t = e6.grow(4);
  e6.set(0, void 0), e6.set(t + 0, void 0), e6.set(t + 1, null), e6.set(t + 2, true), e6.set(t + 3, false);
}
var h2, o, p2, y2, E, A, f, g2, b2, I2, F2;
var init_query_compiler_fast_bg = __esm({
  "../../packages/database/src/generated/prisma/internal/query_compiler_fast_bg.js"() {
    "use strict";
    init_modules_watch_stub();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_performance2();
    h2 = /* @__PURE__ */ __name(() => {
    }, "h");
    h2.prototype = h2;
    __name(D2, "D");
    p2 = null;
    __name(a, "a");
    y2 = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
    y2.decode();
    E = 2146435072;
    A = 0;
    __name(T, "T");
    __name(m2, "m");
    f = 0;
    g2 = new TextEncoder();
    "encodeInto" in g2 || (g2.encodeInto = function(e6, t) {
      const n = g2.encode(e6);
      return t.set(n), { read: e6.length, written: n.length };
    });
    __name(l2, "l");
    b2 = null;
    __name(u2, "u");
    __name(x2, "x");
    __name(S, "S");
    __name(M, "M");
    __name(w2, "w");
    I2 = typeof FinalizationRegistry > "u" ? { register: /* @__PURE__ */ __name(() => {
    }, "register"), unregister: /* @__PURE__ */ __name(() => {
    }, "unregister") } : new FinalizationRegistry((e6) => o.__wbg_querycompiler_free(e6 >>> 0, 1));
    F2 = class {
      static {
        __name(this, "F");
      }
      __destroy_into_raw() {
        const t = this.__wbg_ptr;
        return this.__wbg_ptr = 0, I2.unregister(this), t;
      }
      free() {
        const t = this.__destroy_into_raw();
        o.__wbg_querycompiler_free(t, 0);
      }
      compileBatch(t) {
        const n = l2(t, o.__wbindgen_malloc, o.__wbindgen_realloc), _ = f, r = o.querycompiler_compileBatch(this.__wbg_ptr, n, _);
        if (r[2]) throw w2(r[1]);
        return w2(r[0]);
      }
      constructor(t) {
        const n = o.querycompiler_new(t);
        if (n[2]) throw w2(n[1]);
        return this.__wbg_ptr = n[0] >>> 0, I2.register(this, this.__wbg_ptr, this), this;
      }
      compile(t) {
        const n = l2(t, o.__wbindgen_malloc, o.__wbindgen_realloc), _ = f, r = o.querycompiler_compile(this.__wbg_ptr, n, _);
        if (r[2]) throw w2(r[1]);
        return w2(r[0]);
      }
    };
    Symbol.dispose && (F2.prototype[Symbol.dispose] = F2.prototype.free);
    __name(O, "O");
    __name(B2, "B");
    __name(N, "N");
    __name(U2, "U");
    __name(R, "R");
    __name($3, "$");
    __name(q, "q");
    __name(C, "C");
    __name(k, "k");
    __name(W2, "W");
    __name(V2, "V");
    __name(z2, "z");
    __name(L2, "L");
    __name(P2, "P");
    __name(Q2, "Q");
    __name(Y2, "Y");
    __name(G2, "G");
    __name(J2, "J");
    __name(X, "X");
    __name(H2, "H");
    __name(K2, "K");
    __name(Z2, "Z");
    __name(v2, "v");
    __name(ee, "ee");
    __name(te2, "te");
    __name(ne2, "ne");
    __name(re2, "re");
    __name(_e2, "_e");
    __name(oe2, "oe");
    __name(ce, "ce");
    __name(ie2, "ie");
    __name(se2, "se");
    __name(ue2, "ue");
    __name(fe2, "fe");
    __name(be2, "be");
    __name(de2, "de");
    __name(ae, "ae");
  }
});

// .wrangler/tmp/bundle-PzOQHE/middleware-loader.entry.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// .wrangler/tmp/bundle-PzOQHE/middleware-insertion-facade.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// src/index.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/hono/dist/index.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/hono/dist/hono.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/hono/dist/hono-base.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/hono/dist/compose.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// ../../node_modules/hono/dist/context.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/hono/dist/request.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/hono/dist/http-exception.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/hono/dist/request/constants.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// ../../node_modules/hono/dist/utils/body.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// ../../node_modules/hono/dist/utils/url.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str2, decoder) => {
  try {
    return decoder(str2);
  } catch {
    return str2.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str2) => tryDecode(str2, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub2, ...rest) => {
  if (rest.length) {
    sub2 = mergePath(sub2, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub2 === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub2?.[0] === "/" ? sub2.slice(1) : sub2}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v3, i, a2) => a2.indexOf(v3) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name2 = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name2 = _decodeURI(name2);
    }
    keyIndex = nextKeyIndex;
    if (name2 === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name2] && Array.isArray(results[name2]))) {
        results[name2] = [];
      }
      ;
      results[name2].push(value);
    } else {
      results[name2] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// ../../node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str2) => tryDecode(str2, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = class {
  static {
    __name(this, "HonoRequest");
  }
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name2) {
    if (name2) {
      return this.raw.headers.get(name2) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = /* @__PURE__ */ __name((key) => {
    const { bodyCache, raw: raw3 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw3[key]();
  }, "#cachedBody");
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// ../../node_modules/hono/dist/utils/html.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str2, phase, preserveCallbacks, context, buffer) => {
  if (typeof str2 === "object" && !(str2 instanceof String)) {
    if (!(str2 instanceof Promise)) {
      str2 = str2.toString();
    }
    if (str2 instanceof Promise) {
      str2 = await str2;
    }
  }
  const callbacks = str2.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str2);
  }
  if (buffer) {
    buffer[0] += str2;
  } else {
    buffer = [str2];
  }
  const resStr = Promise.all(callbacks.map((c2) => c2({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str22) => resolveCallback(str22, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// ../../node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var Context = class {
  static {
    __name(this, "Context");
  }
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k2, v3] of this.#res.headers.entries()) {
        if (k2 === "content-type") {
          continue;
        }
        if (k2 === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k2, v3);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = /* @__PURE__ */ __name((...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  }, "render");
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = /* @__PURE__ */ __name((layout) => this.#layout = layout, "setLayout");
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = /* @__PURE__ */ __name(() => this.#layout, "getLayout");
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = /* @__PURE__ */ __name((renderer) => {
    this.#renderer = renderer;
  }, "setRenderer");
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = /* @__PURE__ */ __name((name2, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name2);
    } else if (options?.append) {
      headers.append(name2, value);
    } else {
      headers.set(name2, value);
    }
  }, "header");
  status = /* @__PURE__ */ __name((status) => {
    this.#status = status;
  }, "status");
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = /* @__PURE__ */ __name((key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  }, "set");
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = /* @__PURE__ */ __name((key) => {
    return this.#var ? this.#var.get(key) : void 0;
  }, "get");
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k2, v3] of Object.entries(headers)) {
        if (typeof v3 === "string") {
          responseHeaders.set(k2, v3);
        } else {
          responseHeaders.delete(k2);
          for (const v22 of v3) {
            responseHeaders.append(k2, v22);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = /* @__PURE__ */ __name((...args) => this.#newResponse(...args), "newResponse");
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = /* @__PURE__ */ __name((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = /* @__PURE__ */ __name((text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  }, "text");
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = /* @__PURE__ */ __name((object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  }, "json");
  html = /* @__PURE__ */ __name((html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  }, "html");
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = /* @__PURE__ */ __name((location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  }, "redirect");
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name(() => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  }, "notFound");
};

// ../../node_modules/hono/dist/router.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
  static {
    __name(this, "UnsupportedPathError");
  }
};

// ../../node_modules/hono/dist/utils/constants.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// ../../node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c2) => {
  return c2.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c2) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c2.newResponse(res.body, res);
  }
  console.error(err);
  return c2.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = class _Hono {
  static {
    __name(this, "_Hono");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p3 of [path].flat()) {
        this.#path = p3;
        for (const m3 of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m3.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone2 = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone2.errorHandler = this.errorHandler;
    clone2.#notFoundHandler = this.#notFoundHandler;
    clone2.routes = this.routes;
    return clone2;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c2, next) => (await compose([], app2.errorHandler)(c2, () => r.handler(c2, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = /* @__PURE__ */ __name((handler) => {
    this.errorHandler = handler;
    return this;
  }, "onError");
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name((handler) => {
    this.#notFoundHandler = handler;
    return this;
  }, "notFound");
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c2) => {
      const options2 = optionHandler(c2);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c2) => {
      let executionContext = void 0;
      try {
        executionContext = c2.executionCtx;
      } catch {
      }
      return [c2.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c2, next) => {
      const res = await applicationHandler(replaceRequest(c2.req.raw), ...getOptions(c2));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c2) {
    if (err instanceof Error) {
      return this.errorHandler(err, c2);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    }
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c2 = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c2, async () => {
          c2.res = await this.#notFoundHandler(c2);
        });
      } catch (err) {
        return this.#handleError(err, c2);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c2.finalized ? c2.res : this.#notFoundHandler(c2))
      ).catch((err) => this.#handleError(err, c2)) : res ?? this.#notFoundHandler(c2);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c2);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c2);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = /* @__PURE__ */ __name((request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  }, "fetch");
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = /* @__PURE__ */ __name((input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  }, "request");
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = /* @__PURE__ */ __name(() => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  }, "fire");
};

// ../../node_modules/hono/dist/router/reg-exp-router/index.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/hono/dist/router/reg-exp-router/router.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/hono/dist/router/reg-exp-router/matcher.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name(((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }), "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// ../../node_modules/hono/dist/router/reg-exp-router/node.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a2, b3) {
  if (a2.length === 1) {
    return b3.length === 1 ? a2 < b3 ? -1 : 1 : -1;
  }
  if (b3.length === 1) {
    return 1;
  }
  if (a2 === ONLY_WILDCARD_REG_EXP_STR || a2 === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b3 === ONLY_WILDCARD_REG_EXP_STR || b3 === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a2 === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b3 === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a2.length === b3.length ? a2 < b3 ? -1 : 1 : b3.length - a2.length;
}
__name(compareKey, "compareKey");
var Node = class _Node {
  static {
    __name(this, "_Node");
  }
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name2 = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name2 && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k2) => k2 !== ONLY_WILDCARD_REG_EXP_STR && k2 !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name2 !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name2 !== "") {
        paramMap.push([name2, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k2) => k2.length > 1 && k2 !== ONLY_WILDCARD_REG_EXP_STR && k2 !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k2) => {
      const c2 = this.#children[k2];
      return (typeof c2.#varIndex === "number" ? `(${k2})@${c2.#varIndex}` : regExpMetaChars.has(k2) ? `\\${k2}` : k2) + c2.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// ../../node_modules/hono/dist/router/reg-exp-router/trie.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Trie = class {
  static {
    __name(this, "Trie");
  }
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m3) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m3];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// ../../node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h3]) => [h3, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e6) {
      throw e6 === PATH_ERROR ? new UnsupportedPathError(path) : e6;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h3, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h3, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k2 = 0, len3 = keys.length; k2 < len3; k2++) {
        map[keys[k2]] = paramReplacementMap[map[keys[k2]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k2 of Object.keys(middleware).sort((a2, b3) => b3.length - a2.length)) {
    if (buildWildcardRegExp(k2).test(path)) {
      return [...middleware[k2]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = class {
  static {
    __name(this, "RegExpRouter");
  }
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p3) => {
          handlerMap[method][p3] = [...handlerMap[METHOD_NAME_ALL][p3]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re3 = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m3) => {
          middleware[m3][path] ||= findMiddleware(middleware[m3], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m3) => {
        if (method === METHOD_NAME_ALL || method === m3) {
          Object.keys(middleware[m3]).forEach((p3) => {
            re3.test(p3) && middleware[m3][p3].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m3) => {
        if (method === METHOD_NAME_ALL || method === m3) {
          Object.keys(routes[m3]).forEach(
            (p3) => re3.test(p3) && routes[m3][p3].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m3) => {
        if (method === METHOD_NAME_ALL || method === m3) {
          routes[m3][path2] ||= [
            ...findMiddleware(middleware[m3], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m3][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// ../../node_modules/hono/dist/router/reg-exp-router/prepared-router.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/hono/dist/router/smart-router/index.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/hono/dist/router/smart-router/router.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var SmartRouter = class {
  static {
    __name(this, "SmartRouter");
  }
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init3) {
    this.#routers = init3.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e6) {
        if (e6 instanceof UnsupportedPathError) {
          continue;
        }
        throw e6;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// ../../node_modules/hono/dist/router/trie-router/index.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/hono/dist/router/trie-router/router.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/hono/dist/router/trie-router/node.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = class _Node2 {
  static {
    __name(this, "_Node");
  }
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m3 = /* @__PURE__ */ Object.create(null);
      m3[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m3];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p3 = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p3, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p3;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v3, i, a2) => a2.indexOf(v3) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m3 = node.#methods[i];
      const handlerSet = m3[method] || m3[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k2 = 0, len3 = node.#patterns.length; k2 < len3; k2++) {
          const pattern = node.#patterns[k2];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name2, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m3 = matcher.exec(restPathString);
            if (m3) {
              params[name2] = m3[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m3[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name2] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a2, b3) => {
        return a2.score - b3.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// ../../node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  static {
    __name(this, "TrieRouter");
  }
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// ../../node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  static {
    __name(this, "Hono");
  }
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// ../../node_modules/hono/dist/middleware/cors/index.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var cors = /* @__PURE__ */ __name((options) => {
  const defaults3 = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults3,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c2, next) {
    function set(key, value) {
      c2.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = await findAllowOrigin(c2.req.header("origin") || "", c2);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c2.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c2.req.header("origin") || "", c2);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c2.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c2.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c2.res.headers.delete("Content-Length");
      c2.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c2.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c2.header("Vary", "Origin", { append: true });
    }
  }, "cors2");
}, "cors");

// src/routes/health.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var healthRoute = new Hono2();
healthRoute.get("/health", (c2) => {
  return c2.json({ status: "ok" });
});

// src/routes/search.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// src/middleware/auth.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/hono/dist/helper/factory/index.js
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var createMiddleware = /* @__PURE__ */ __name((middleware) => middleware, "createMiddleware");

// ../../packages/database/src/index.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../packages/database/src/client.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/@prisma/adapter-pg/dist/index.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/@prisma/driver-adapter-utils/dist/index.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/@prisma/driver-adapter-utils/node_modules/@prisma/debug/dist/index.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var __defProp2 = Object.defineProperty;
var __export2 = /* @__PURE__ */ __name((target, all) => {
  for (var name2 in all)
    __defProp2(target, name2, { get: all[name2], enumerable: true });
}, "__export");
var colors_exports = {};
__export2(colors_exports, {
  $: /* @__PURE__ */ __name(() => $, "$"),
  bgBlack: /* @__PURE__ */ __name(() => bgBlack, "bgBlack"),
  bgBlue: /* @__PURE__ */ __name(() => bgBlue, "bgBlue"),
  bgCyan: /* @__PURE__ */ __name(() => bgCyan, "bgCyan"),
  bgGreen: /* @__PURE__ */ __name(() => bgGreen, "bgGreen"),
  bgMagenta: /* @__PURE__ */ __name(() => bgMagenta, "bgMagenta"),
  bgRed: /* @__PURE__ */ __name(() => bgRed, "bgRed"),
  bgWhite: /* @__PURE__ */ __name(() => bgWhite, "bgWhite"),
  bgYellow: /* @__PURE__ */ __name(() => bgYellow, "bgYellow"),
  black: /* @__PURE__ */ __name(() => black, "black"),
  blue: /* @__PURE__ */ __name(() => blue, "blue"),
  bold: /* @__PURE__ */ __name(() => bold, "bold"),
  cyan: /* @__PURE__ */ __name(() => cyan, "cyan"),
  dim: /* @__PURE__ */ __name(() => dim, "dim"),
  gray: /* @__PURE__ */ __name(() => gray, "gray"),
  green: /* @__PURE__ */ __name(() => green, "green"),
  grey: /* @__PURE__ */ __name(() => grey, "grey"),
  hidden: /* @__PURE__ */ __name(() => hidden, "hidden"),
  inverse: /* @__PURE__ */ __name(() => inverse, "inverse"),
  italic: /* @__PURE__ */ __name(() => italic, "italic"),
  magenta: /* @__PURE__ */ __name(() => magenta, "magenta"),
  red: /* @__PURE__ */ __name(() => red, "red"),
  reset: /* @__PURE__ */ __name(() => reset, "reset"),
  strikethrough: /* @__PURE__ */ __name(() => strikethrough, "strikethrough"),
  underline: /* @__PURE__ */ __name(() => underline, "underline"),
  white: /* @__PURE__ */ __name(() => white, "white"),
  yellow: /* @__PURE__ */ __name(() => yellow, "yellow")
});
var FORCE_COLOR;
var NODE_DISABLE_COLORS;
var NO_COLOR;
var TERM;
var isTTY = true;
if (typeof process !== "undefined") {
  ({ FORCE_COLOR, NODE_DISABLE_COLORS, NO_COLOR, TERM } = process.env || {});
  isTTY = process.stdout && process.stdout.isTTY;
}
var $ = {
  enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== "dumb" && (FORCE_COLOR != null && FORCE_COLOR !== "0" || isTTY)
};
function init(x3, y3) {
  let rgx = new RegExp(`\\x1b\\[${y3}m`, "g");
  let open = `\x1B[${x3}m`, close = `\x1B[${y3}m`;
  return function(txt) {
    if (!$.enabled || txt == null) return txt;
    return open + (!!~("" + txt).indexOf(close) ? txt.replace(rgx, close + open) : txt) + close;
  };
}
__name(init, "init");
var reset = init(0, 0);
var bold = init(1, 22);
var dim = init(2, 22);
var italic = init(3, 23);
var underline = init(4, 24);
var inverse = init(7, 27);
var hidden = init(8, 28);
var strikethrough = init(9, 29);
var black = init(30, 39);
var red = init(31, 39);
var green = init(32, 39);
var yellow = init(33, 39);
var blue = init(34, 39);
var magenta = init(35, 39);
var cyan = init(36, 39);
var white = init(37, 39);
var gray = init(90, 39);
var grey = init(90, 39);
var bgBlack = init(40, 49);
var bgRed = init(41, 49);
var bgGreen = init(42, 49);
var bgYellow = init(43, 49);
var bgBlue = init(44, 49);
var bgMagenta = init(45, 49);
var bgCyan = init(46, 49);
var bgWhite = init(47, 49);
var MAX_ARGS_HISTORY = 100;
var COLORS = ["green", "yellow", "blue", "magenta", "cyan", "red"];
var argsHistory = [];
var lastTimestamp = Date.now();
var lastColor = 0;
var processEnv = typeof process !== "undefined" ? process.env : {};
globalThis.DEBUG ??= processEnv.DEBUG ?? "";
globalThis.DEBUG_COLORS ??= processEnv.DEBUG_COLORS ? processEnv.DEBUG_COLORS === "true" : true;
var topProps = {
  enable(namespace) {
    if (typeof namespace === "string") {
      globalThis.DEBUG = namespace;
    }
  },
  disable() {
    const prev = globalThis.DEBUG;
    globalThis.DEBUG = "";
    return prev;
  },
  // this is the core logic to check if logging should happen or not
  enabled(namespace) {
    const listenedNamespaces = globalThis.DEBUG.split(",").map((s) => {
      return s.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
    });
    const isListened = listenedNamespaces.some((listenedNamespace) => {
      if (listenedNamespace === "" || listenedNamespace[0] === "-") return false;
      return namespace.match(RegExp(listenedNamespace.split("*").join(".*") + "$"));
    });
    const isExcluded = listenedNamespaces.some((listenedNamespace) => {
      if (listenedNamespace === "" || listenedNamespace[0] !== "-") return false;
      return namespace.match(RegExp(listenedNamespace.slice(1).split("*").join(".*") + "$"));
    });
    return isListened && !isExcluded;
  },
  log: /* @__PURE__ */ __name((...args) => {
    const [namespace, format, ...rest] = args;
    const logWithFormatting = console.warn ?? console.log;
    logWithFormatting(`${namespace} ${format}`, ...rest);
  }, "log"),
  formatters: {}
  // not implemented
};
function debugCreate(namespace) {
  const instanceProps = {
    color: COLORS[lastColor++ % COLORS.length],
    enabled: topProps.enabled(namespace),
    namespace,
    log: topProps.log,
    extend: /* @__PURE__ */ __name(() => {
    }, "extend")
    // not implemented
  };
  const debugCall = /* @__PURE__ */ __name((...args) => {
    const { enabled, namespace: namespace2, color, log: log3 } = instanceProps;
    if (args.length !== 0) {
      argsHistory.push([namespace2, ...args]);
    }
    if (argsHistory.length > MAX_ARGS_HISTORY) {
      argsHistory.shift();
    }
    if (topProps.enabled(namespace2) || enabled) {
      const stringArgs = args.map((arg) => {
        if (typeof arg === "string") {
          return arg;
        }
        return safeStringify(arg);
      });
      const ms2 = `+${Date.now() - lastTimestamp}ms`;
      lastTimestamp = Date.now();
      if (globalThis.DEBUG_COLORS) {
        log3(colors_exports[color](bold(namespace2)), ...stringArgs, colors_exports[color](ms2));
      } else {
        log3(namespace2, ...stringArgs, ms2);
      }
    }
  }, "debugCall");
  return new Proxy(debugCall, {
    get: /* @__PURE__ */ __name((_, prop) => instanceProps[prop], "get"),
    set: /* @__PURE__ */ __name((_, prop, value) => instanceProps[prop] = value, "set")
  });
}
__name(debugCreate, "debugCreate");
var Debug = new Proxy(debugCreate, {
  get: /* @__PURE__ */ __name((_, prop) => topProps[prop], "get"),
  set: /* @__PURE__ */ __name((_, prop, value) => topProps[prop] = value, "set")
});
function safeStringify(value, indent = 2) {
  const cache = /* @__PURE__ */ new Set();
  return JSON.stringify(
    value,
    (key, value2) => {
      if (typeof value2 === "object" && value2 !== null) {
        if (cache.has(value2)) {
          return `[Circular *]`;
        }
        cache.add(value2);
      } else if (typeof value2 === "bigint") {
        return value2.toString();
      }
      return value2;
    },
    indent
  );
}
__name(safeStringify, "safeStringify");

// ../../node_modules/@prisma/driver-adapter-utils/dist/index.mjs
var DriverAdapterError = class extends Error {
  static {
    __name(this, "DriverAdapterError");
  }
  name = "DriverAdapterError";
  cause;
  constructor(payload) {
    super(typeof payload["message"] === "string" ? payload["message"] : payload.kind);
    this.cause = payload;
  }
};
var debug = Debug("driver-adapter-utils");
var ColumnTypeEnum = {
  // Scalars
  Int32: 0,
  Int64: 1,
  Float: 2,
  Double: 3,
  Numeric: 4,
  Boolean: 5,
  Character: 6,
  Text: 7,
  Date: 8,
  Time: 9,
  DateTime: 10,
  Json: 11,
  Enum: 12,
  Bytes: 13,
  Set: 14,
  Uuid: 15,
  // Arrays
  Int32Array: 64,
  Int64Array: 65,
  FloatArray: 66,
  DoubleArray: 67,
  NumericArray: 68,
  BooleanArray: 69,
  CharacterArray: 70,
  TextArray: 71,
  DateArray: 72,
  TimeArray: 73,
  DateTimeArray: 74,
  JsonArray: 75,
  EnumArray: 76,
  BytesArray: 77,
  UuidArray: 78,
  // Custom
  UnknownNumber: 128
};
var mockAdapterErrors = {
  queryRaw: new Error("Not implemented: queryRaw"),
  executeRaw: new Error("Not implemented: executeRaw"),
  startTransaction: new Error("Not implemented: startTransaction"),
  executeScript: new Error("Not implemented: executeScript"),
  dispose: new Error("Not implemented: dispose")
};

// ../../node_modules/pg/esm/index.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var import_lib = __toESM(require_lib2(), 1);
var Client = import_lib.default.Client;
var Pool = import_lib.default.Pool;
var Connection = import_lib.default.Connection;
var types = import_lib.default.types;
var Query = import_lib.default.Query;
var DatabaseError = import_lib.default.DatabaseError;
var escapeIdentifier = import_lib.default.escapeIdentifier;
var escapeLiteral = import_lib.default.escapeLiteral;
var Result = import_lib.default.Result;
var TypeOverrides = import_lib.default.TypeOverrides;
var defaults = import_lib.default.defaults;
var esm_default = import_lib.default;

// ../../node_modules/@prisma/adapter-pg/dist/index.mjs
var import_postgres_array = __toESM(require_postgres_array2(), 1);
var name = "@prisma/adapter-pg";
var FIRST_NORMAL_OBJECT_ID = 16384;
var { types: types2 } = esm_default;
var { builtins: ScalarColumnType, getTypeParser } = types2;
var AdditionalScalarColumnType = {
  NAME: 19
};
var ArrayColumnType = {
  BIT_ARRAY: 1561,
  BOOL_ARRAY: 1e3,
  BYTEA_ARRAY: 1001,
  BPCHAR_ARRAY: 1014,
  CHAR_ARRAY: 1002,
  CIDR_ARRAY: 651,
  DATE_ARRAY: 1182,
  FLOAT4_ARRAY: 1021,
  FLOAT8_ARRAY: 1022,
  INET_ARRAY: 1041,
  INT2_ARRAY: 1005,
  INT4_ARRAY: 1007,
  INT8_ARRAY: 1016,
  JSONB_ARRAY: 3807,
  JSON_ARRAY: 199,
  MONEY_ARRAY: 791,
  NUMERIC_ARRAY: 1231,
  OID_ARRAY: 1028,
  TEXT_ARRAY: 1009,
  TIMESTAMP_ARRAY: 1115,
  TIMESTAMPTZ_ARRAY: 1185,
  TIME_ARRAY: 1183,
  UUID_ARRAY: 2951,
  VARBIT_ARRAY: 1563,
  VARCHAR_ARRAY: 1015,
  XML_ARRAY: 143
};
var UnsupportedNativeDataType = class _UnsupportedNativeDataType extends Error {
  static {
    __name(this, "_UnsupportedNativeDataType");
  }
  // map of type codes to type names
  static typeNames = {
    16: "bool",
    17: "bytea",
    18: "char",
    19: "name",
    20: "int8",
    21: "int2",
    22: "int2vector",
    23: "int4",
    24: "regproc",
    25: "text",
    26: "oid",
    27: "tid",
    28: "xid",
    29: "cid",
    30: "oidvector",
    32: "pg_ddl_command",
    71: "pg_type",
    75: "pg_attribute",
    81: "pg_proc",
    83: "pg_class",
    114: "json",
    142: "xml",
    194: "pg_node_tree",
    269: "table_am_handler",
    325: "index_am_handler",
    600: "point",
    601: "lseg",
    602: "path",
    603: "box",
    604: "polygon",
    628: "line",
    650: "cidr",
    700: "float4",
    701: "float8",
    705: "unknown",
    718: "circle",
    774: "macaddr8",
    790: "money",
    829: "macaddr",
    869: "inet",
    1033: "aclitem",
    1042: "bpchar",
    1043: "varchar",
    1082: "date",
    1083: "time",
    1114: "timestamp",
    1184: "timestamptz",
    1186: "interval",
    1266: "timetz",
    1560: "bit",
    1562: "varbit",
    1700: "numeric",
    1790: "refcursor",
    2202: "regprocedure",
    2203: "regoper",
    2204: "regoperator",
    2205: "regclass",
    2206: "regtype",
    2249: "record",
    2275: "cstring",
    2276: "any",
    2277: "anyarray",
    2278: "void",
    2279: "trigger",
    2280: "language_handler",
    2281: "internal",
    2283: "anyelement",
    2287: "_record",
    2776: "anynonarray",
    2950: "uuid",
    2970: "txid_snapshot",
    3115: "fdw_handler",
    3220: "pg_lsn",
    3310: "tsm_handler",
    3361: "pg_ndistinct",
    3402: "pg_dependencies",
    3500: "anyenum",
    3614: "tsvector",
    3615: "tsquery",
    3642: "gtsvector",
    3734: "regconfig",
    3769: "regdictionary",
    3802: "jsonb",
    3831: "anyrange",
    3838: "event_trigger",
    3904: "int4range",
    3906: "numrange",
    3908: "tsrange",
    3910: "tstzrange",
    3912: "daterange",
    3926: "int8range",
    4072: "jsonpath",
    4089: "regnamespace",
    4096: "regrole",
    4191: "regcollation",
    4451: "int4multirange",
    4532: "nummultirange",
    4533: "tsmultirange",
    4534: "tstzmultirange",
    4535: "datemultirange",
    4536: "int8multirange",
    4537: "anymultirange",
    4538: "anycompatiblemultirange",
    4600: "pg_brin_bloom_summary",
    4601: "pg_brin_minmax_multi_summary",
    5017: "pg_mcv_list",
    5038: "pg_snapshot",
    5069: "xid8",
    5077: "anycompatible",
    5078: "anycompatiblearray",
    5079: "anycompatiblenonarray",
    5080: "anycompatiblerange"
  };
  type;
  constructor(code) {
    super();
    this.type = _UnsupportedNativeDataType.typeNames[code] || "Unknown";
    this.message = `Unsupported column type ${this.type}`;
  }
};
function fieldToColumnType(fieldTypeId) {
  switch (fieldTypeId) {
    case ScalarColumnType.INT2:
    case ScalarColumnType.INT4:
      return ColumnTypeEnum.Int32;
    case ScalarColumnType.INT8:
      return ColumnTypeEnum.Int64;
    case ScalarColumnType.FLOAT4:
      return ColumnTypeEnum.Float;
    case ScalarColumnType.FLOAT8:
      return ColumnTypeEnum.Double;
    case ScalarColumnType.BOOL:
      return ColumnTypeEnum.Boolean;
    case ScalarColumnType.DATE:
      return ColumnTypeEnum.Date;
    case ScalarColumnType.TIME:
    case ScalarColumnType.TIMETZ:
      return ColumnTypeEnum.Time;
    case ScalarColumnType.TIMESTAMP:
    case ScalarColumnType.TIMESTAMPTZ:
      return ColumnTypeEnum.DateTime;
    case ScalarColumnType.NUMERIC:
    case ScalarColumnType.MONEY:
      return ColumnTypeEnum.Numeric;
    case ScalarColumnType.JSON:
    case ScalarColumnType.JSONB:
      return ColumnTypeEnum.Json;
    case ScalarColumnType.UUID:
      return ColumnTypeEnum.Uuid;
    case ScalarColumnType.OID:
      return ColumnTypeEnum.Int64;
    case ScalarColumnType.BPCHAR:
    case ScalarColumnType.TEXT:
    case ScalarColumnType.VARCHAR:
    case ScalarColumnType.BIT:
    case ScalarColumnType.VARBIT:
    case ScalarColumnType.INET:
    case ScalarColumnType.CIDR:
    case ScalarColumnType.XML:
    case AdditionalScalarColumnType.NAME:
      return ColumnTypeEnum.Text;
    case ScalarColumnType.BYTEA:
      return ColumnTypeEnum.Bytes;
    case ArrayColumnType.INT2_ARRAY:
    case ArrayColumnType.INT4_ARRAY:
      return ColumnTypeEnum.Int32Array;
    case ArrayColumnType.FLOAT4_ARRAY:
      return ColumnTypeEnum.FloatArray;
    case ArrayColumnType.FLOAT8_ARRAY:
      return ColumnTypeEnum.DoubleArray;
    case ArrayColumnType.NUMERIC_ARRAY:
    case ArrayColumnType.MONEY_ARRAY:
      return ColumnTypeEnum.NumericArray;
    case ArrayColumnType.BOOL_ARRAY:
      return ColumnTypeEnum.BooleanArray;
    case ArrayColumnType.CHAR_ARRAY:
      return ColumnTypeEnum.CharacterArray;
    case ArrayColumnType.BPCHAR_ARRAY:
    case ArrayColumnType.TEXT_ARRAY:
    case ArrayColumnType.VARCHAR_ARRAY:
    case ArrayColumnType.VARBIT_ARRAY:
    case ArrayColumnType.BIT_ARRAY:
    case ArrayColumnType.INET_ARRAY:
    case ArrayColumnType.CIDR_ARRAY:
    case ArrayColumnType.XML_ARRAY:
      return ColumnTypeEnum.TextArray;
    case ArrayColumnType.DATE_ARRAY:
      return ColumnTypeEnum.DateArray;
    case ArrayColumnType.TIME_ARRAY:
      return ColumnTypeEnum.TimeArray;
    case ArrayColumnType.TIMESTAMP_ARRAY:
      return ColumnTypeEnum.DateTimeArray;
    case ArrayColumnType.TIMESTAMPTZ_ARRAY:
      return ColumnTypeEnum.DateTimeArray;
    case ArrayColumnType.JSON_ARRAY:
    case ArrayColumnType.JSONB_ARRAY:
      return ColumnTypeEnum.JsonArray;
    case ArrayColumnType.BYTEA_ARRAY:
      return ColumnTypeEnum.BytesArray;
    case ArrayColumnType.UUID_ARRAY:
      return ColumnTypeEnum.UuidArray;
    case ArrayColumnType.INT8_ARRAY:
    case ArrayColumnType.OID_ARRAY:
      return ColumnTypeEnum.Int64Array;
    default:
      if (fieldTypeId >= FIRST_NORMAL_OBJECT_ID) {
        return ColumnTypeEnum.Text;
      }
      throw new UnsupportedNativeDataType(fieldTypeId);
  }
}
__name(fieldToColumnType, "fieldToColumnType");
function normalize_array(element_normalizer) {
  return (str2) => (0, import_postgres_array.parse)(str2, element_normalizer);
}
__name(normalize_array, "normalize_array");
function normalize_numeric(numeric) {
  return numeric;
}
__name(normalize_numeric, "normalize_numeric");
function normalize_date(date) {
  return date;
}
__name(normalize_date, "normalize_date");
function normalize_timestamp(time) {
  return `${time.replace(" ", "T")}+00:00`;
}
__name(normalize_timestamp, "normalize_timestamp");
function normalize_timestamptz(time) {
  return time.replace(" ", "T").replace(/[+-]\d{2}(:\d{2})?$/, "+00:00");
}
__name(normalize_timestamptz, "normalize_timestamptz");
function normalize_time(time) {
  return time;
}
__name(normalize_time, "normalize_time");
function normalize_timez(time) {
  return time.replace(/[+-]\d{2}(:\d{2})?$/, "");
}
__name(normalize_timez, "normalize_timez");
function normalize_money(money) {
  return money.slice(1);
}
__name(normalize_money, "normalize_money");
function normalize_xml(xml) {
  return xml;
}
__name(normalize_xml, "normalize_xml");
function toJson(json) {
  return json;
}
__name(toJson, "toJson");
var parsePgBytes = getTypeParser(ScalarColumnType.BYTEA);
var normalizeByteaArray = getTypeParser(ArrayColumnType.BYTEA_ARRAY);
function convertBytes(serializedBytes) {
  return parsePgBytes(serializedBytes);
}
__name(convertBytes, "convertBytes");
function normalizeBit(bit) {
  return bit;
}
__name(normalizeBit, "normalizeBit");
var customParsers = {
  [ScalarColumnType.NUMERIC]: normalize_numeric,
  [ArrayColumnType.NUMERIC_ARRAY]: normalize_array(normalize_numeric),
  [ScalarColumnType.TIME]: normalize_time,
  [ArrayColumnType.TIME_ARRAY]: normalize_array(normalize_time),
  [ScalarColumnType.TIMETZ]: normalize_timez,
  [ScalarColumnType.DATE]: normalize_date,
  [ArrayColumnType.DATE_ARRAY]: normalize_array(normalize_date),
  [ScalarColumnType.TIMESTAMP]: normalize_timestamp,
  [ArrayColumnType.TIMESTAMP_ARRAY]: normalize_array(normalize_timestamp),
  [ScalarColumnType.TIMESTAMPTZ]: normalize_timestamptz,
  [ArrayColumnType.TIMESTAMPTZ_ARRAY]: normalize_array(normalize_timestamptz),
  [ScalarColumnType.MONEY]: normalize_money,
  [ArrayColumnType.MONEY_ARRAY]: normalize_array(normalize_money),
  [ScalarColumnType.JSON]: toJson,
  [ArrayColumnType.JSON_ARRAY]: normalize_array(toJson),
  [ScalarColumnType.JSONB]: toJson,
  [ArrayColumnType.JSONB_ARRAY]: normalize_array(toJson),
  [ScalarColumnType.BYTEA]: convertBytes,
  [ArrayColumnType.BYTEA_ARRAY]: normalizeByteaArray,
  [ArrayColumnType.BIT_ARRAY]: normalize_array(normalizeBit),
  [ArrayColumnType.VARBIT_ARRAY]: normalize_array(normalizeBit),
  [ArrayColumnType.XML_ARRAY]: normalize_array(normalize_xml)
};
function mapArg(arg, argType) {
  if (arg === null) {
    return null;
  }
  if (Array.isArray(arg) && argType.arity === "list") {
    return arg.map((value) => mapArg(value, argType));
  }
  if (typeof arg === "string" && argType.scalarType === "datetime") {
    arg = new Date(arg);
  }
  if (arg instanceof Date) {
    switch (argType.dbType) {
      case "TIME":
      case "TIMETZ":
        return formatTime(arg);
      case "DATE":
        return formatDate(arg);
      default:
        return formatDateTime(arg);
    }
  }
  if (typeof arg === "string" && argType.scalarType === "bytes") {
    return Buffer.from(arg, "base64");
  }
  if (ArrayBuffer.isView(arg)) {
    return new Uint8Array(arg.buffer, arg.byteOffset, arg.byteLength);
  }
  return arg;
}
__name(mapArg, "mapArg");
function formatDateTime(date) {
  const pad = /* @__PURE__ */ __name((n, z3 = 2) => String(n).padStart(z3, "0"), "pad");
  const ms2 = date.getUTCMilliseconds();
  return pad(date.getUTCFullYear(), 4) + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate()) + " " + pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + ":" + pad(date.getUTCSeconds()) + (ms2 ? "." + String(ms2).padStart(3, "0") : "");
}
__name(formatDateTime, "formatDateTime");
function formatDate(date) {
  const pad = /* @__PURE__ */ __name((n, z3 = 2) => String(n).padStart(z3, "0"), "pad");
  return pad(date.getUTCFullYear(), 4) + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate());
}
__name(formatDate, "formatDate");
function formatTime(date) {
  const pad = /* @__PURE__ */ __name((n, z3 = 2) => String(n).padStart(z3, "0"), "pad");
  const ms2 = date.getUTCMilliseconds();
  return pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + ":" + pad(date.getUTCSeconds()) + (ms2 ? "." + String(ms2).padStart(3, "0") : "");
}
__name(formatTime, "formatTime");
var TLS_ERRORS = /* @__PURE__ */ new Set([
  "UNABLE_TO_GET_ISSUER_CERT",
  "UNABLE_TO_GET_CRL",
  "UNABLE_TO_DECRYPT_CERT_SIGNATURE",
  "UNABLE_TO_DECRYPT_CRL_SIGNATURE",
  "UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY",
  "CERT_SIGNATURE_FAILURE",
  "CRL_SIGNATURE_FAILURE",
  "CERT_NOT_YET_VALID",
  "CERT_HAS_EXPIRED",
  "CRL_NOT_YET_VALID",
  "CRL_HAS_EXPIRED",
  "ERROR_IN_CERT_NOT_BEFORE_FIELD",
  "ERROR_IN_CERT_NOT_AFTER_FIELD",
  "ERROR_IN_CRL_LAST_UPDATE_FIELD",
  "ERROR_IN_CRL_NEXT_UPDATE_FIELD",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "SELF_SIGNED_CERT_IN_CHAIN",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "CERT_CHAIN_TOO_LONG",
  "CERT_REVOKED",
  "INVALID_CA",
  "INVALID_PURPOSE",
  "CERT_UNTRUSTED",
  "CERT_REJECTED",
  "HOSTNAME_MISMATCH",
  "ERR_TLS_CERT_ALTNAME_FORMAT",
  "ERR_TLS_CERT_ALTNAME_INVALID"
]);
var SOCKET_ERRORS = /* @__PURE__ */ new Set(["ENOTFOUND", "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT"]);
function convertDriverError(error) {
  if (isSocketError(error)) {
    return mapSocketError(error);
  }
  if (isTlsError(error)) {
    return {
      kind: "TlsConnectionError",
      reason: error.message
    };
  }
  if (isDriverError(error)) {
    return {
      originalCode: error.code,
      originalMessage: error.message,
      ...mapDriverError(error)
    };
  }
  throw error;
}
__name(convertDriverError, "convertDriverError");
function mapDriverError(error) {
  switch (error.code) {
    case "22001":
      return {
        kind: "LengthMismatch",
        column: error.column
      };
    case "22003":
      return {
        kind: "ValueOutOfRange",
        cause: error.message
      };
    case "22P02":
      return {
        kind: "InvalidInputValue",
        message: error.message
      };
    case "23505": {
      const fields = error.detail?.match(/Key \(([^)]+)\)/)?.at(1)?.split(", ");
      return {
        kind: "UniqueConstraintViolation",
        constraint: fields !== void 0 ? { fields } : void 0
      };
    }
    case "23502": {
      const fields = error.detail?.match(/Key \(([^)]+)\)/)?.at(1)?.split(", ");
      return {
        kind: "NullConstraintViolation",
        constraint: fields !== void 0 ? { fields } : void 0
      };
    }
    case "23503": {
      let constraint;
      if (error.column) {
        constraint = { fields: [error.column] };
      } else if (error.constraint) {
        constraint = { index: error.constraint };
      }
      return {
        kind: "ForeignKeyConstraintViolation",
        constraint
      };
    }
    case "3D000":
      return {
        kind: "DatabaseDoesNotExist",
        db: error.message.split(" ").at(1)?.split('"').at(1)
      };
    case "28000":
      return {
        kind: "DatabaseAccessDenied",
        db: error.message.split(",").find((s) => s.startsWith(" database"))?.split('"').at(1)
      };
    case "28P01":
      return {
        kind: "AuthenticationFailed",
        user: error.message.split(" ").pop()?.split('"').at(1)
      };
    case "40001":
      return {
        kind: "TransactionWriteConflict"
      };
    case "42P01":
      return {
        kind: "TableDoesNotExist",
        table: error.message.split(" ").at(1)?.split('"').at(1)
      };
    case "42703":
      return {
        kind: "ColumnNotFound",
        column: error.message.split(" ").at(1)?.split('"').at(1)
      };
    case "42P04":
      return {
        kind: "DatabaseAlreadyExists",
        db: error.message.split(" ").at(1)?.split('"').at(1)
      };
    case "53300":
      return {
        kind: "TooManyConnections",
        cause: error.message
      };
    default:
      return {
        kind: "postgres",
        code: error.code ?? "N/A",
        severity: error.severity ?? "N/A",
        message: error.message,
        detail: error.detail,
        column: error.column,
        hint: error.hint
      };
  }
}
__name(mapDriverError, "mapDriverError");
function isDriverError(error) {
  return typeof error.code === "string" && typeof error.message === "string" && typeof error.severity === "string" && (typeof error.detail === "string" || error.detail === void 0) && (typeof error.column === "string" || error.column === void 0) && (typeof error.hint === "string" || error.hint === void 0);
}
__name(isDriverError, "isDriverError");
function mapSocketError(error) {
  switch (error.code) {
    case "ENOTFOUND":
    case "ECONNREFUSED":
      return {
        kind: "DatabaseNotReachable",
        host: error.address ?? error.hostname,
        port: error.port
      };
    case "ECONNRESET":
      return {
        kind: "ConnectionClosed"
      };
    case "ETIMEDOUT":
      return {
        kind: "SocketTimeout"
      };
  }
}
__name(mapSocketError, "mapSocketError");
function isSocketError(error) {
  return typeof error.code === "string" && typeof error.syscall === "string" && typeof error.errno === "number" && SOCKET_ERRORS.has(error.code);
}
__name(isSocketError, "isSocketError");
function isTlsError(error) {
  if (typeof error.code === "string") {
    return TLS_ERRORS.has(error.code);
  }
  switch (error.message) {
    case "The server does not support SSL connections":
    case "There was an error establishing an SSL connection":
      return true;
  }
  return false;
}
__name(isTlsError, "isTlsError");
var types22 = esm_default.types;
var debug2 = Debug("prisma:driver-adapter:pg");
var PgQueryable = class {
  static {
    __name(this, "PgQueryable");
  }
  constructor(client, pgOptions) {
    this.client = client;
    this.pgOptions = pgOptions;
  }
  provider = "postgres";
  adapterName = name;
  /**
   * Execute a query given as SQL, interpolating the given parameters.
   */
  async queryRaw(query) {
    const tag2 = "[js::query_raw]";
    debug2(`${tag2} %O`, query);
    const { fields, rows } = await this.performIO(query);
    const columnNames = fields.map((field) => field.name);
    let columnTypes = [];
    try {
      columnTypes = fields.map((field) => fieldToColumnType(field.dataTypeID));
    } catch (e6) {
      if (e6 instanceof UnsupportedNativeDataType) {
        throw new DriverAdapterError({
          kind: "UnsupportedNativeDataType",
          type: e6.type
        });
      }
      throw e6;
    }
    const udtParser = this.pgOptions?.userDefinedTypeParser;
    if (udtParser) {
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        if (field.dataTypeID >= FIRST_NORMAL_OBJECT_ID && !Object.hasOwn(customParsers, field.dataTypeID)) {
          for (let j = 0; j < rows.length; j++) {
            rows[j][i] = await udtParser(field.dataTypeID, rows[j][i], this);
          }
        }
      }
    }
    return {
      columnNames,
      columnTypes,
      rows
    };
  }
  /**
   * Execute a query given as SQL, interpolating the given parameters and
   * returning the number of affected rows.
   * Note: Queryable expects a u64, but napi.rs only supports u32.
   */
  async executeRaw(query) {
    const tag2 = "[js::execute_raw]";
    debug2(`${tag2} %O`, query);
    return (await this.performIO(query)).rowCount ?? 0;
  }
  /**
   * Run a query against the database, returning the result set.
   * Should the query fail due to a connection error, the connection is
   * marked as unhealthy.
   */
  async performIO(query) {
    const { sql: sql2, args } = query;
    const values = args.map((arg, i) => mapArg(arg, query.argTypes[i]));
    try {
      const result = await this.client.query(
        {
          text: sql2,
          values,
          rowMode: "array",
          types: {
            // This is the error expected:
            // No overload matches this call.
            // The last overload gave the following error.
            // Type '(oid: number, format?: any) => (json: string) => unknown' is not assignable to type '{ <T>(oid: number): TypeParser<string, string | T>; <T>(oid: number, format: "text"): TypeParser<string, string | T>; <T>(oid: number, format: "binary"): TypeParser<...>; }'.
            //   Type '(json: string) => unknown' is not assignable to type 'TypeParser<Buffer, any>'.
            //     Types of parameters 'json' and 'value' are incompatible.
            //       Type 'Buffer' is not assignable to type 'string'.ts(2769)
            //
            // Because pg-types types expect us to handle both binary and text protocol versions,
            // where as far we can see, pg will ever pass only text version.
            //
            // @ts-expect-error
            getTypeParser: /* @__PURE__ */ __name((oid, format) => {
              if (format === "text" && customParsers[oid]) {
                return customParsers[oid];
              }
              return types22.getTypeParser(oid, format);
            }, "getTypeParser")
          }
        },
        values
      );
      return result;
    } catch (e6) {
      this.onError(e6);
    }
  }
  onError(error) {
    debug2("Error in performIO: %O", error);
    throw new DriverAdapterError(convertDriverError(error));
  }
};
var PgTransaction = class extends PgQueryable {
  static {
    __name(this, "PgTransaction");
  }
  constructor(client, options, pgOptions, cleanup) {
    super(client, pgOptions);
    this.options = options;
    this.pgOptions = pgOptions;
    this.cleanup = cleanup;
  }
  async commit() {
    debug2(`[js::commit]`);
    this.cleanup?.();
    this.client.release();
  }
  async rollback() {
    debug2(`[js::rollback]`);
    this.cleanup?.();
    this.client.release();
  }
};
var PrismaPgAdapter = class extends PgQueryable {
  static {
    __name(this, "PrismaPgAdapter");
  }
  constructor(client, pgOptions, release2) {
    super(client);
    this.pgOptions = pgOptions;
    this.release = release2;
  }
  async startTransaction(isolationLevel) {
    const options = {
      usePhantomQuery: false
    };
    const tag2 = "[js::startTransaction]";
    debug2("%s options: %O", tag2, options);
    const conn = await this.client.connect().catch((error) => this.onError(error));
    const onError = /* @__PURE__ */ __name((err) => {
      debug2(`Error from pool connection: ${err.message} %O`, err);
      this.pgOptions?.onConnectionError?.(err);
    }, "onError");
    conn.on("error", onError);
    const cleanup = /* @__PURE__ */ __name(() => {
      conn.removeListener("error", onError);
    }, "cleanup");
    try {
      const tx = new PgTransaction(conn, options, this.pgOptions, cleanup);
      await tx.executeRaw({ sql: "BEGIN", args: [], argTypes: [] });
      if (isolationLevel) {
        await tx.executeRaw({
          sql: `SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`,
          args: [],
          argTypes: []
        });
      }
      return tx;
    } catch (error) {
      cleanup();
      conn.release(error);
      this.onError(error);
    }
  }
  async executeScript(script) {
    const statements = script.split(";").map((stmt) => stmt.trim()).filter((stmt) => stmt.length > 0);
    for (const stmt of statements) {
      try {
        await this.client.query(stmt);
      } catch (error) {
        this.onError(error);
      }
    }
  }
  getConnectionInfo() {
    return {
      schemaName: this.pgOptions?.schema,
      supportsRelationJoins: true
    };
  }
  async dispose() {
    return this.release?.();
  }
  underlyingDriver() {
    return this.client;
  }
};
var PrismaPgAdapterFactory = class {
  static {
    __name(this, "PrismaPgAdapterFactory");
  }
  constructor(poolOrConfig, options) {
    this.options = options;
    if (poolOrConfig instanceof esm_default.Pool) {
      this.externalPool = poolOrConfig;
      this.config = poolOrConfig.options;
    } else {
      this.externalPool = null;
      this.config = poolOrConfig;
    }
  }
  provider = "postgres";
  adapterName = name;
  config;
  externalPool;
  async connect() {
    const client = this.externalPool ?? new esm_default.Pool(this.config);
    const onIdleClientError = /* @__PURE__ */ __name((err) => {
      debug2(`Error from idle pool client: ${err.message} %O`, err);
      this.options?.onPoolError?.(err);
    }, "onIdleClientError");
    client.on("error", onIdleClientError);
    return new PrismaPgAdapter(client, this.options, async () => {
      if (this.externalPool) {
        if (this.options?.disposeExternalPool) {
          await this.externalPool.end();
          this.externalPool = null;
        } else {
          this.externalPool.removeListener("error", onIdleClientError);
        }
      } else {
        await client.end();
      }
    });
  }
  async connectToShadowDb() {
    const conn = await this.connect();
    const database = `prisma_migrate_shadow_db_${globalThis.crypto.randomUUID()}`;
    await conn.executeScript(`CREATE DATABASE "${database}"`);
    const client = new esm_default.Pool({ ...this.config, database });
    return new PrismaPgAdapter(client, void 0, async () => {
      await conn.executeScript(`DROP DATABASE "${database}"`);
      await client.end();
    });
  }
};

// ../../packages/database/src/generated/prisma/client.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../packages/database/src/generated/prisma/internal/class.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/@prisma/client/runtime/wasm-compiler-edge.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../node_modules/@prisma/client-runtime-utils/dist/index.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
function hasBatchIndex(value) {
  return typeof value["batchRequestIdx"] === "number";
}
__name(hasBatchIndex, "hasBatchIndex");
function setClassName(classObject, name2) {
  Object.defineProperty(classObject, "name", {
    value: name2,
    configurable: true
  });
}
__name(setClassName, "setClassName");
var PrismaClientInitializationError = class _PrismaClientInitializationError extends Error {
  static {
    __name(this, "_PrismaClientInitializationError");
  }
  clientVersion;
  errorCode;
  retryable;
  constructor(message, clientVersion, errorCode) {
    super(message);
    this.name = "PrismaClientInitializationError";
    this.clientVersion = clientVersion;
    this.errorCode = errorCode;
    Error.captureStackTrace(_PrismaClientInitializationError);
  }
  get [Symbol.toStringTag]() {
    return "PrismaClientInitializationError";
  }
};
setClassName(PrismaClientInitializationError, "PrismaClientInitializationError");
var PrismaClientKnownRequestError = class extends Error {
  static {
    __name(this, "PrismaClientKnownRequestError");
  }
  code;
  meta;
  clientVersion;
  batchRequestIdx;
  constructor(message, { code, clientVersion, meta, batchRequestIdx }) {
    super(message);
    this.name = "PrismaClientKnownRequestError";
    this.code = code;
    this.clientVersion = clientVersion;
    this.meta = meta;
    Object.defineProperty(this, "batchRequestIdx", {
      value: batchRequestIdx,
      enumerable: false,
      writable: true
    });
  }
  get [Symbol.toStringTag]() {
    return "PrismaClientKnownRequestError";
  }
};
setClassName(PrismaClientKnownRequestError, "PrismaClientKnownRequestError");
function getBacktrace(log3) {
  if (log3.fields?.message) {
    let str2 = log3.fields?.message;
    if (log3.fields?.file) {
      str2 += ` in ${log3.fields.file}`;
      if (log3.fields?.line) {
        str2 += `:${log3.fields.line}`;
      }
      if (log3.fields?.column) {
        str2 += `:${log3.fields.column}`;
      }
    }
    if (log3.fields?.reason) {
      str2 += `
${log3.fields?.reason}`;
    }
    return str2;
  }
  return "Unknown error";
}
__name(getBacktrace, "getBacktrace");
function isPanic(err) {
  return err.fields?.message === "PANIC";
}
__name(isPanic, "isPanic");
var PrismaClientRustError = class extends Error {
  static {
    __name(this, "PrismaClientRustError");
  }
  clientVersion;
  _isPanic;
  constructor({ clientVersion, error }) {
    const backtrace = getBacktrace(error);
    super(backtrace ?? "Unknown error");
    this._isPanic = isPanic(error);
    this.clientVersion = clientVersion;
  }
  get [Symbol.toStringTag]() {
    return "PrismaClientRustError";
  }
  isPanic() {
    return this._isPanic;
  }
};
setClassName(PrismaClientRustError, "PrismaClientRustError");
var PrismaClientRustPanicError = class extends Error {
  static {
    __name(this, "PrismaClientRustPanicError");
  }
  clientVersion;
  constructor(message, clientVersion) {
    super(message);
    this.name = "PrismaClientRustPanicError";
    this.clientVersion = clientVersion;
  }
  get [Symbol.toStringTag]() {
    return "PrismaClientRustPanicError";
  }
};
setClassName(PrismaClientRustPanicError, "PrismaClientRustPanicError");
var PrismaClientUnknownRequestError = class extends Error {
  static {
    __name(this, "PrismaClientUnknownRequestError");
  }
  clientVersion;
  batchRequestIdx;
  constructor(message, { clientVersion, batchRequestIdx }) {
    super(message);
    this.name = "PrismaClientUnknownRequestError";
    this.clientVersion = clientVersion;
    Object.defineProperty(this, "batchRequestIdx", {
      value: batchRequestIdx,
      writable: true,
      enumerable: false
    });
  }
  get [Symbol.toStringTag]() {
    return "PrismaClientUnknownRequestError";
  }
};
setClassName(PrismaClientUnknownRequestError, "PrismaClientUnknownRequestError");
var PrismaClientValidationError = class extends Error {
  static {
    __name(this, "PrismaClientValidationError");
  }
  name = "PrismaClientValidationError";
  clientVersion;
  constructor(message, { clientVersion }) {
    super(message);
    this.clientVersion = clientVersion;
  }
  get [Symbol.toStringTag]() {
    return "PrismaClientValidationError";
  }
};
setClassName(PrismaClientValidationError, "PrismaClientValidationError");
var secret = Symbol();
var representations = /* @__PURE__ */ new WeakMap();
var ObjectEnumValue = class {
  static {
    __name(this, "ObjectEnumValue");
  }
  constructor(arg) {
    if (arg === secret) {
      representations.set(this, `Prisma.${this._getName()}`);
    } else {
      representations.set(this, `new Prisma.${this._getNamespace()}.${this._getName()}()`);
    }
  }
  _getName() {
    return this.constructor.name;
  }
  toString() {
    return representations.get(this);
  }
};
function setClassName2(classObject, name2) {
  Object.defineProperty(classObject, "name", {
    value: name2,
    configurable: true
  });
}
__name(setClassName2, "setClassName2");
var NullTypesEnumValue = class extends ObjectEnumValue {
  static {
    __name(this, "NullTypesEnumValue");
  }
  _getNamespace() {
    return "NullTypes";
  }
};
var DbNullClass = class extends NullTypesEnumValue {
  static {
    __name(this, "DbNullClass");
  }
  // Phantom private property to prevent structural type equality
  // eslint-disable-next-line no-unused-private-class-members
  #_brand_DbNull;
};
setClassName2(DbNullClass, "DbNull");
var JsonNullClass = class extends NullTypesEnumValue {
  static {
    __name(this, "JsonNullClass");
  }
  // Phantom private property to prevent structural type equality
  // eslint-disable-next-line no-unused-private-class-members
  #_brand_JsonNull;
};
setClassName2(JsonNullClass, "JsonNull");
var AnyNullClass = class extends NullTypesEnumValue {
  static {
    __name(this, "AnyNullClass");
  }
  // Phantom private property to prevent structural type equality
  // eslint-disable-next-line no-unused-private-class-members
  #_brand_AnyNull;
};
setClassName2(AnyNullClass, "AnyNull");
var NullTypes = {
  DbNull: DbNullClass,
  JsonNull: JsonNullClass,
  AnyNull: AnyNullClass
};
var DbNull = new DbNullClass(secret);
var JsonNull = new JsonNullClass(secret);
var AnyNull = new AnyNullClass(secret);
function isDbNull(value) {
  return value === DbNull;
}
__name(isDbNull, "isDbNull");
function isJsonNull(value) {
  return value === JsonNull;
}
__name(isJsonNull, "isJsonNull");
function isAnyNull(value) {
  return value === AnyNull;
}
__name(isAnyNull, "isAnyNull");
var EXP_LIMIT = 9e15;
var MAX_DIGITS = 1e9;
var NUMERALS = "0123456789abcdef";
var LN10 = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058";
var PI = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789";
var DEFAULTS = {
  // These values must be integers within the stated ranges (inclusive).
  // Most of these values can be changed at run-time using the `Decimal.config` method.
  // The maximum number of significant digits of the result of a calculation or base conversion.
  // E.g. `Decimal.config({ precision: 20 });`
  precision: 20,
  // 1 to MAX_DIGITS
  // The rounding mode used when rounding to `precision`.
  //
  // ROUND_UP         0 Away from zero.
  // ROUND_DOWN       1 Towards zero.
  // ROUND_CEIL       2 Towards +Infinity.
  // ROUND_FLOOR      3 Towards -Infinity.
  // ROUND_HALF_UP    4 Towards nearest neighbour. If equidistant, up.
  // ROUND_HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
  // ROUND_HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
  // ROUND_HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
  // ROUND_HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
  //
  // E.g.
  // `Decimal.rounding = 4;`
  // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
  rounding: 4,
  // 0 to 8
  // The modulo mode used when calculating the modulus: a mod n.
  // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
  // The remainder (r) is calculated as: r = a - n * q.
  //
  // UP         0 The remainder is positive if the dividend is negative, else is negative.
  // DOWN       1 The remainder has the same sign as the dividend (JavaScript %).
  // FLOOR      3 The remainder has the same sign as the divisor (Python %).
  // HALF_EVEN  6 The IEEE 754 remainder function.
  // EUCLID     9 Euclidian division. q = sign(n) * floor(a / abs(n)). Always positive.
  //
  // Truncated division (1), floored division (3), the IEEE 754 remainder (6), and Euclidian
  // division (9) are commonly used for the modulus operation. The other rounding modes can also
  // be used, but they may not give useful results.
  modulo: 1,
  // 0 to 9
  // The exponent value at and beneath which `toString` returns exponential notation.
  // JavaScript numbers: -7
  toExpNeg: -7,
  // 0 to -EXP_LIMIT
  // The exponent value at and above which `toString` returns exponential notation.
  // JavaScript numbers: 21
  toExpPos: 21,
  // 0 to EXP_LIMIT
  // The minimum exponent value, beneath which underflow to zero occurs.
  // JavaScript numbers: -324  (5e-324)
  minE: -EXP_LIMIT,
  // -1 to -EXP_LIMIT
  // The maximum exponent value, above which overflow to Infinity occurs.
  // JavaScript numbers: 308  (1.7976931348623157e+308)
  maxE: EXP_LIMIT,
  // 1 to EXP_LIMIT
  // Whether to use cryptographically-secure random number generation, if available.
  crypto: false
  // true/false
};
var inexact;
var quadrant;
var external = true;
var decimalError = "[DecimalError] ";
var invalidArgument = decimalError + "Invalid argument: ";
var precisionLimitExceeded = decimalError + "Precision limit exceeded";
var cryptoUnavailable = decimalError + "crypto unavailable";
var tag = "[object Decimal]";
var mathfloor = Math.floor;
var mathpow = Math.pow;
var isBinary = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i;
var isHex = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i;
var isOctal = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i;
var isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
var BASE = 1e7;
var LOG_BASE = 7;
var MAX_SAFE_INTEGER = 9007199254740991;
var LN10_PRECISION = LN10.length - 1;
var PI_PRECISION = PI.length - 1;
var P = { toStringTag: tag };
P.absoluteValue = P.abs = function() {
  var x3 = new this.constructor(this);
  if (x3.s < 0) x3.s = 1;
  return finalise(x3);
};
P.ceil = function() {
  return finalise(new this.constructor(this), this.e + 1, 2);
};
P.clampedTo = P.clamp = function(min2, max2) {
  var k2, x3 = this, Ctor = x3.constructor;
  min2 = new Ctor(min2);
  max2 = new Ctor(max2);
  if (!min2.s || !max2.s) return new Ctor(NaN);
  if (min2.gt(max2)) throw Error(invalidArgument + max2);
  k2 = x3.cmp(min2);
  return k2 < 0 ? min2 : x3.cmp(max2) > 0 ? max2 : new Ctor(x3);
};
P.comparedTo = P.cmp = function(y3) {
  var i, j, xdL, ydL, x3 = this, xd = x3.d, yd = (y3 = new x3.constructor(y3)).d, xs2 = x3.s, ys2 = y3.s;
  if (!xd || !yd) {
    return !xs2 || !ys2 ? NaN : xs2 !== ys2 ? xs2 : xd === yd ? 0 : !xd ^ xs2 < 0 ? 1 : -1;
  }
  if (!xd[0] || !yd[0]) return xd[0] ? xs2 : yd[0] ? -ys2 : 0;
  if (xs2 !== ys2) return xs2;
  if (x3.e !== y3.e) return x3.e > y3.e ^ xs2 < 0 ? 1 : -1;
  xdL = xd.length;
  ydL = yd.length;
  for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
    if (xd[i] !== yd[i]) return xd[i] > yd[i] ^ xs2 < 0 ? 1 : -1;
  }
  return xdL === ydL ? 0 : xdL > ydL ^ xs2 < 0 ? 1 : -1;
};
P.cosine = P.cos = function() {
  var pr2, rm2, x3 = this, Ctor = x3.constructor;
  if (!x3.d) return new Ctor(NaN);
  if (!x3.d[0]) return new Ctor(1);
  pr2 = Ctor.precision;
  rm2 = Ctor.rounding;
  Ctor.precision = pr2 + Math.max(x3.e, x3.sd()) + LOG_BASE;
  Ctor.rounding = 1;
  x3 = cosine(Ctor, toLessThanHalfPi(Ctor, x3));
  Ctor.precision = pr2;
  Ctor.rounding = rm2;
  return finalise(quadrant == 2 || quadrant == 3 ? x3.neg() : x3, pr2, rm2, true);
};
P.cubeRoot = P.cbrt = function() {
  var e6, m3, n, r, rep, s, sd, t, t3, t3plusx, x3 = this, Ctor = x3.constructor;
  if (!x3.isFinite() || x3.isZero()) return new Ctor(x3);
  external = false;
  s = x3.s * mathpow(x3.s * x3, 1 / 3);
  if (!s || Math.abs(s) == 1 / 0) {
    n = digitsToString(x3.d);
    e6 = x3.e;
    if (s = (e6 - n.length + 1) % 3) n += s == 1 || s == -2 ? "0" : "00";
    s = mathpow(n, 1 / 3);
    e6 = mathfloor((e6 + 1) / 3) - (e6 % 3 == (e6 < 0 ? -1 : 2));
    if (s == 1 / 0) {
      n = "5e" + e6;
    } else {
      n = s.toExponential();
      n = n.slice(0, n.indexOf("e") + 1) + e6;
    }
    r = new Ctor(n);
    r.s = x3.s;
  } else {
    r = new Ctor(s.toString());
  }
  sd = (e6 = Ctor.precision) + 3;
  for (; ; ) {
    t = r;
    t3 = t.times(t).times(t);
    t3plusx = t3.plus(x3);
    r = divide(t3plusx.plus(x3).times(t), t3plusx.plus(t3), sd + 2, 1);
    if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
      n = n.slice(sd - 3, sd + 1);
      if (n == "9999" || !rep && n == "4999") {
        if (!rep) {
          finalise(t, e6 + 1, 0);
          if (t.times(t).times(t).eq(x3)) {
            r = t;
            break;
          }
        }
        sd += 4;
        rep = 1;
      } else {
        if (!+n || !+n.slice(1) && n.charAt(0) == "5") {
          finalise(r, e6 + 1, 1);
          m3 = !r.times(r).times(r).eq(x3);
        }
        break;
      }
    }
  }
  external = true;
  return finalise(r, e6, Ctor.rounding, m3);
};
P.decimalPlaces = P.dp = function() {
  var w3, d = this.d, n = NaN;
  if (d) {
    w3 = d.length - 1;
    n = (w3 - mathfloor(this.e / LOG_BASE)) * LOG_BASE;
    w3 = d[w3];
    if (w3) for (; w3 % 10 == 0; w3 /= 10) n--;
    if (n < 0) n = 0;
  }
  return n;
};
P.dividedBy = P.div = function(y3) {
  return divide(this, new this.constructor(y3));
};
P.dividedToIntegerBy = P.divToInt = function(y3) {
  var x3 = this, Ctor = x3.constructor;
  return finalise(divide(x3, new Ctor(y3), 0, 1, 1), Ctor.precision, Ctor.rounding);
};
P.equals = P.eq = function(y3) {
  return this.cmp(y3) === 0;
};
P.floor = function() {
  return finalise(new this.constructor(this), this.e + 1, 3);
};
P.greaterThan = P.gt = function(y3) {
  return this.cmp(y3) > 0;
};
P.greaterThanOrEqualTo = P.gte = function(y3) {
  var k2 = this.cmp(y3);
  return k2 == 1 || k2 === 0;
};
P.hyperbolicCosine = P.cosh = function() {
  var k2, n, pr2, rm2, len, x3 = this, Ctor = x3.constructor, one = new Ctor(1);
  if (!x3.isFinite()) return new Ctor(x3.s ? 1 / 0 : NaN);
  if (x3.isZero()) return one;
  pr2 = Ctor.precision;
  rm2 = Ctor.rounding;
  Ctor.precision = pr2 + Math.max(x3.e, x3.sd()) + 4;
  Ctor.rounding = 1;
  len = x3.d.length;
  if (len < 32) {
    k2 = Math.ceil(len / 3);
    n = (1 / tinyPow(4, k2)).toString();
  } else {
    k2 = 16;
    n = "2.3283064365386962890625e-10";
  }
  x3 = taylorSeries(Ctor, 1, x3.times(n), new Ctor(1), true);
  var cosh2_x, i = k2, d8 = new Ctor(8);
  for (; i--; ) {
    cosh2_x = x3.times(x3);
    x3 = one.minus(cosh2_x.times(d8.minus(cosh2_x.times(d8))));
  }
  return finalise(x3, Ctor.precision = pr2, Ctor.rounding = rm2, true);
};
P.hyperbolicSine = P.sinh = function() {
  var k2, pr2, rm2, len, x3 = this, Ctor = x3.constructor;
  if (!x3.isFinite() || x3.isZero()) return new Ctor(x3);
  pr2 = Ctor.precision;
  rm2 = Ctor.rounding;
  Ctor.precision = pr2 + Math.max(x3.e, x3.sd()) + 4;
  Ctor.rounding = 1;
  len = x3.d.length;
  if (len < 3) {
    x3 = taylorSeries(Ctor, 2, x3, x3, true);
  } else {
    k2 = 1.4 * Math.sqrt(len);
    k2 = k2 > 16 ? 16 : k2 | 0;
    x3 = x3.times(1 / tinyPow(5, k2));
    x3 = taylorSeries(Ctor, 2, x3, x3, true);
    var sinh2_x, d5 = new Ctor(5), d16 = new Ctor(16), d20 = new Ctor(20);
    for (; k2--; ) {
      sinh2_x = x3.times(x3);
      x3 = x3.times(d5.plus(sinh2_x.times(d16.times(sinh2_x).plus(d20))));
    }
  }
  Ctor.precision = pr2;
  Ctor.rounding = rm2;
  return finalise(x3, pr2, rm2, true);
};
P.hyperbolicTangent = P.tanh = function() {
  var pr2, rm2, x3 = this, Ctor = x3.constructor;
  if (!x3.isFinite()) return new Ctor(x3.s);
  if (x3.isZero()) return new Ctor(x3);
  pr2 = Ctor.precision;
  rm2 = Ctor.rounding;
  Ctor.precision = pr2 + 7;
  Ctor.rounding = 1;
  return divide(x3.sinh(), x3.cosh(), Ctor.precision = pr2, Ctor.rounding = rm2);
};
P.inverseCosine = P.acos = function() {
  var x3 = this, Ctor = x3.constructor, k2 = x3.abs().cmp(1), pr2 = Ctor.precision, rm2 = Ctor.rounding;
  if (k2 !== -1) {
    return k2 === 0 ? x3.isNeg() ? getPi(Ctor, pr2, rm2) : new Ctor(0) : new Ctor(NaN);
  }
  if (x3.isZero()) return getPi(Ctor, pr2 + 4, rm2).times(0.5);
  Ctor.precision = pr2 + 6;
  Ctor.rounding = 1;
  x3 = new Ctor(1).minus(x3).div(x3.plus(1)).sqrt().atan();
  Ctor.precision = pr2;
  Ctor.rounding = rm2;
  return x3.times(2);
};
P.inverseHyperbolicCosine = P.acosh = function() {
  var pr2, rm2, x3 = this, Ctor = x3.constructor;
  if (x3.lte(1)) return new Ctor(x3.eq(1) ? 0 : NaN);
  if (!x3.isFinite()) return new Ctor(x3);
  pr2 = Ctor.precision;
  rm2 = Ctor.rounding;
  Ctor.precision = pr2 + Math.max(Math.abs(x3.e), x3.sd()) + 4;
  Ctor.rounding = 1;
  external = false;
  x3 = x3.times(x3).minus(1).sqrt().plus(x3);
  external = true;
  Ctor.precision = pr2;
  Ctor.rounding = rm2;
  return x3.ln();
};
P.inverseHyperbolicSine = P.asinh = function() {
  var pr2, rm2, x3 = this, Ctor = x3.constructor;
  if (!x3.isFinite() || x3.isZero()) return new Ctor(x3);
  pr2 = Ctor.precision;
  rm2 = Ctor.rounding;
  Ctor.precision = pr2 + 2 * Math.max(Math.abs(x3.e), x3.sd()) + 6;
  Ctor.rounding = 1;
  external = false;
  x3 = x3.times(x3).plus(1).sqrt().plus(x3);
  external = true;
  Ctor.precision = pr2;
  Ctor.rounding = rm2;
  return x3.ln();
};
P.inverseHyperbolicTangent = P.atanh = function() {
  var pr2, rm2, wpr, xsd, x3 = this, Ctor = x3.constructor;
  if (!x3.isFinite()) return new Ctor(NaN);
  if (x3.e >= 0) return new Ctor(x3.abs().eq(1) ? x3.s / 0 : x3.isZero() ? x3 : NaN);
  pr2 = Ctor.precision;
  rm2 = Ctor.rounding;
  xsd = x3.sd();
  if (Math.max(xsd, pr2) < 2 * -x3.e - 1) return finalise(new Ctor(x3), pr2, rm2, true);
  Ctor.precision = wpr = xsd - x3.e;
  x3 = divide(x3.plus(1), new Ctor(1).minus(x3), wpr + pr2, 1);
  Ctor.precision = pr2 + 4;
  Ctor.rounding = 1;
  x3 = x3.ln();
  Ctor.precision = pr2;
  Ctor.rounding = rm2;
  return x3.times(0.5);
};
P.inverseSine = P.asin = function() {
  var halfPi, k2, pr2, rm2, x3 = this, Ctor = x3.constructor;
  if (x3.isZero()) return new Ctor(x3);
  k2 = x3.abs().cmp(1);
  pr2 = Ctor.precision;
  rm2 = Ctor.rounding;
  if (k2 !== -1) {
    if (k2 === 0) {
      halfPi = getPi(Ctor, pr2 + 4, rm2).times(0.5);
      halfPi.s = x3.s;
      return halfPi;
    }
    return new Ctor(NaN);
  }
  Ctor.precision = pr2 + 6;
  Ctor.rounding = 1;
  x3 = x3.div(new Ctor(1).minus(x3.times(x3)).sqrt().plus(1)).atan();
  Ctor.precision = pr2;
  Ctor.rounding = rm2;
  return x3.times(2);
};
P.inverseTangent = P.atan = function() {
  var i, j, k2, n, px, t, r, wpr, x22, x3 = this, Ctor = x3.constructor, pr2 = Ctor.precision, rm2 = Ctor.rounding;
  if (!x3.isFinite()) {
    if (!x3.s) return new Ctor(NaN);
    if (pr2 + 4 <= PI_PRECISION) {
      r = getPi(Ctor, pr2 + 4, rm2).times(0.5);
      r.s = x3.s;
      return r;
    }
  } else if (x3.isZero()) {
    return new Ctor(x3);
  } else if (x3.abs().eq(1) && pr2 + 4 <= PI_PRECISION) {
    r = getPi(Ctor, pr2 + 4, rm2).times(0.25);
    r.s = x3.s;
    return r;
  }
  Ctor.precision = wpr = pr2 + 10;
  Ctor.rounding = 1;
  k2 = Math.min(28, wpr / LOG_BASE + 2 | 0);
  for (i = k2; i; --i) x3 = x3.div(x3.times(x3).plus(1).sqrt().plus(1));
  external = false;
  j = Math.ceil(wpr / LOG_BASE);
  n = 1;
  x22 = x3.times(x3);
  r = new Ctor(x3);
  px = x3;
  for (; i !== -1; ) {
    px = px.times(x22);
    t = r.minus(px.div(n += 2));
    px = px.times(x22);
    r = t.plus(px.div(n += 2));
    if (r.d[j] !== void 0) for (i = j; r.d[i] === t.d[i] && i--; ) ;
  }
  if (k2) r = r.times(2 << k2 - 1);
  external = true;
  return finalise(r, Ctor.precision = pr2, Ctor.rounding = rm2, true);
};
P.isFinite = function() {
  return !!this.d;
};
P.isInteger = P.isInt = function() {
  return !!this.d && mathfloor(this.e / LOG_BASE) > this.d.length - 2;
};
P.isNaN = function() {
  return !this.s;
};
P.isNegative = P.isNeg = function() {
  return this.s < 0;
};
P.isPositive = P.isPos = function() {
  return this.s > 0;
};
P.isZero = function() {
  return !!this.d && this.d[0] === 0;
};
P.lessThan = P.lt = function(y3) {
  return this.cmp(y3) < 0;
};
P.lessThanOrEqualTo = P.lte = function(y3) {
  return this.cmp(y3) < 1;
};
P.logarithm = P.log = function(base) {
  var isBase10, d, denominator, k2, inf, num, sd, r, arg = this, Ctor = arg.constructor, pr2 = Ctor.precision, rm2 = Ctor.rounding, guard = 5;
  if (base == null) {
    base = new Ctor(10);
    isBase10 = true;
  } else {
    base = new Ctor(base);
    d = base.d;
    if (base.s < 0 || !d || !d[0] || base.eq(1)) return new Ctor(NaN);
    isBase10 = base.eq(10);
  }
  d = arg.d;
  if (arg.s < 0 || !d || !d[0] || arg.eq(1)) {
    return new Ctor(d && !d[0] ? -1 / 0 : arg.s != 1 ? NaN : d ? 0 : 1 / 0);
  }
  if (isBase10) {
    if (d.length > 1) {
      inf = true;
    } else {
      for (k2 = d[0]; k2 % 10 === 0; ) k2 /= 10;
      inf = k2 !== 1;
    }
  }
  external = false;
  sd = pr2 + guard;
  num = naturalLogarithm(arg, sd);
  denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
  r = divide(num, denominator, sd, 1);
  if (checkRoundingDigits(r.d, k2 = pr2, rm2)) {
    do {
      sd += 10;
      num = naturalLogarithm(arg, sd);
      denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
      r = divide(num, denominator, sd, 1);
      if (!inf) {
        if (+digitsToString(r.d).slice(k2 + 1, k2 + 15) + 1 == 1e14) {
          r = finalise(r, pr2 + 1, 0);
        }
        break;
      }
    } while (checkRoundingDigits(r.d, k2 += 10, rm2));
  }
  external = true;
  return finalise(r, pr2, rm2);
};
P.minus = P.sub = function(y3) {
  var d, e6, i, j, k2, len, pr2, rm2, xd, xe, xLTy, yd, x3 = this, Ctor = x3.constructor;
  y3 = new Ctor(y3);
  if (!x3.d || !y3.d) {
    if (!x3.s || !y3.s) y3 = new Ctor(NaN);
    else if (x3.d) y3.s = -y3.s;
    else y3 = new Ctor(y3.d || x3.s !== y3.s ? x3 : NaN);
    return y3;
  }
  if (x3.s != y3.s) {
    y3.s = -y3.s;
    return x3.plus(y3);
  }
  xd = x3.d;
  yd = y3.d;
  pr2 = Ctor.precision;
  rm2 = Ctor.rounding;
  if (!xd[0] || !yd[0]) {
    if (yd[0]) y3.s = -y3.s;
    else if (xd[0]) y3 = new Ctor(x3);
    else return new Ctor(rm2 === 3 ? -0 : 0);
    return external ? finalise(y3, pr2, rm2) : y3;
  }
  e6 = mathfloor(y3.e / LOG_BASE);
  xe = mathfloor(x3.e / LOG_BASE);
  xd = xd.slice();
  k2 = xe - e6;
  if (k2) {
    xLTy = k2 < 0;
    if (xLTy) {
      d = xd;
      k2 = -k2;
      len = yd.length;
    } else {
      d = yd;
      e6 = xe;
      len = xd.length;
    }
    i = Math.max(Math.ceil(pr2 / LOG_BASE), len) + 2;
    if (k2 > i) {
      k2 = i;
      d.length = 1;
    }
    d.reverse();
    for (i = k2; i--; ) d.push(0);
    d.reverse();
  } else {
    i = xd.length;
    len = yd.length;
    xLTy = i < len;
    if (xLTy) len = i;
    for (i = 0; i < len; i++) {
      if (xd[i] != yd[i]) {
        xLTy = xd[i] < yd[i];
        break;
      }
    }
    k2 = 0;
  }
  if (xLTy) {
    d = xd;
    xd = yd;
    yd = d;
    y3.s = -y3.s;
  }
  len = xd.length;
  for (i = yd.length - len; i > 0; --i) xd[len++] = 0;
  for (i = yd.length; i > k2; ) {
    if (xd[--i] < yd[i]) {
      for (j = i; j && xd[--j] === 0; ) xd[j] = BASE - 1;
      --xd[j];
      xd[i] += BASE;
    }
    xd[i] -= yd[i];
  }
  for (; xd[--len] === 0; ) xd.pop();
  for (; xd[0] === 0; xd.shift()) --e6;
  if (!xd[0]) return new Ctor(rm2 === 3 ? -0 : 0);
  y3.d = xd;
  y3.e = getBase10Exponent(xd, e6);
  return external ? finalise(y3, pr2, rm2) : y3;
};
P.modulo = P.mod = function(y3) {
  var q2, x3 = this, Ctor = x3.constructor;
  y3 = new Ctor(y3);
  if (!x3.d || !y3.s || y3.d && !y3.d[0]) return new Ctor(NaN);
  if (!y3.d || x3.d && !x3.d[0]) {
    return finalise(new Ctor(x3), Ctor.precision, Ctor.rounding);
  }
  external = false;
  if (Ctor.modulo == 9) {
    q2 = divide(x3, y3.abs(), 0, 3, 1);
    q2.s *= y3.s;
  } else {
    q2 = divide(x3, y3, 0, Ctor.modulo, 1);
  }
  q2 = q2.times(y3);
  external = true;
  return x3.minus(q2);
};
P.naturalExponential = P.exp = function() {
  return naturalExponential(this);
};
P.naturalLogarithm = P.ln = function() {
  return naturalLogarithm(this);
};
P.negated = P.neg = function() {
  var x3 = new this.constructor(this);
  x3.s = -x3.s;
  return finalise(x3);
};
P.plus = P.add = function(y3) {
  var carry, d, e6, i, k2, len, pr2, rm2, xd, yd, x3 = this, Ctor = x3.constructor;
  y3 = new Ctor(y3);
  if (!x3.d || !y3.d) {
    if (!x3.s || !y3.s) y3 = new Ctor(NaN);
    else if (!x3.d) y3 = new Ctor(y3.d || x3.s === y3.s ? x3 : NaN);
    return y3;
  }
  if (x3.s != y3.s) {
    y3.s = -y3.s;
    return x3.minus(y3);
  }
  xd = x3.d;
  yd = y3.d;
  pr2 = Ctor.precision;
  rm2 = Ctor.rounding;
  if (!xd[0] || !yd[0]) {
    if (!yd[0]) y3 = new Ctor(x3);
    return external ? finalise(y3, pr2, rm2) : y3;
  }
  k2 = mathfloor(x3.e / LOG_BASE);
  e6 = mathfloor(y3.e / LOG_BASE);
  xd = xd.slice();
  i = k2 - e6;
  if (i) {
    if (i < 0) {
      d = xd;
      i = -i;
      len = yd.length;
    } else {
      d = yd;
      e6 = k2;
      len = xd.length;
    }
    k2 = Math.ceil(pr2 / LOG_BASE);
    len = k2 > len ? k2 + 1 : len + 1;
    if (i > len) {
      i = len;
      d.length = 1;
    }
    d.reverse();
    for (; i--; ) d.push(0);
    d.reverse();
  }
  len = xd.length;
  i = yd.length;
  if (len - i < 0) {
    i = len;
    d = yd;
    yd = xd;
    xd = d;
  }
  for (carry = 0; i; ) {
    carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
    xd[i] %= BASE;
  }
  if (carry) {
    xd.unshift(carry);
    ++e6;
  }
  for (len = xd.length; xd[--len] == 0; ) xd.pop();
  y3.d = xd;
  y3.e = getBase10Exponent(xd, e6);
  return external ? finalise(y3, pr2, rm2) : y3;
};
P.precision = P.sd = function(z3) {
  var k2, x3 = this;
  if (z3 !== void 0 && z3 !== !!z3 && z3 !== 1 && z3 !== 0) throw Error(invalidArgument + z3);
  if (x3.d) {
    k2 = getPrecision(x3.d);
    if (z3 && x3.e + 1 > k2) k2 = x3.e + 1;
  } else {
    k2 = NaN;
  }
  return k2;
};
P.round = function() {
  var x3 = this, Ctor = x3.constructor;
  return finalise(new Ctor(x3), x3.e + 1, Ctor.rounding);
};
P.sine = P.sin = function() {
  var pr2, rm2, x3 = this, Ctor = x3.constructor;
  if (!x3.isFinite()) return new Ctor(NaN);
  if (x3.isZero()) return new Ctor(x3);
  pr2 = Ctor.precision;
  rm2 = Ctor.rounding;
  Ctor.precision = pr2 + Math.max(x3.e, x3.sd()) + LOG_BASE;
  Ctor.rounding = 1;
  x3 = sine(Ctor, toLessThanHalfPi(Ctor, x3));
  Ctor.precision = pr2;
  Ctor.rounding = rm2;
  return finalise(quadrant > 2 ? x3.neg() : x3, pr2, rm2, true);
};
P.squareRoot = P.sqrt = function() {
  var m3, n, sd, r, rep, t, x3 = this, d = x3.d, e6 = x3.e, s = x3.s, Ctor = x3.constructor;
  if (s !== 1 || !d || !d[0]) {
    return new Ctor(!s || s < 0 && (!d || d[0]) ? NaN : d ? x3 : 1 / 0);
  }
  external = false;
  s = Math.sqrt(+x3);
  if (s == 0 || s == 1 / 0) {
    n = digitsToString(d);
    if ((n.length + e6) % 2 == 0) n += "0";
    s = Math.sqrt(n);
    e6 = mathfloor((e6 + 1) / 2) - (e6 < 0 || e6 % 2);
    if (s == 1 / 0) {
      n = "5e" + e6;
    } else {
      n = s.toExponential();
      n = n.slice(0, n.indexOf("e") + 1) + e6;
    }
    r = new Ctor(n);
  } else {
    r = new Ctor(s.toString());
  }
  sd = (e6 = Ctor.precision) + 3;
  for (; ; ) {
    t = r;
    r = t.plus(divide(x3, t, sd + 2, 1)).times(0.5);
    if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
      n = n.slice(sd - 3, sd + 1);
      if (n == "9999" || !rep && n == "4999") {
        if (!rep) {
          finalise(t, e6 + 1, 0);
          if (t.times(t).eq(x3)) {
            r = t;
            break;
          }
        }
        sd += 4;
        rep = 1;
      } else {
        if (!+n || !+n.slice(1) && n.charAt(0) == "5") {
          finalise(r, e6 + 1, 1);
          m3 = !r.times(r).eq(x3);
        }
        break;
      }
    }
  }
  external = true;
  return finalise(r, e6, Ctor.rounding, m3);
};
P.tangent = P.tan = function() {
  var pr2, rm2, x3 = this, Ctor = x3.constructor;
  if (!x3.isFinite()) return new Ctor(NaN);
  if (x3.isZero()) return new Ctor(x3);
  pr2 = Ctor.precision;
  rm2 = Ctor.rounding;
  Ctor.precision = pr2 + 10;
  Ctor.rounding = 1;
  x3 = x3.sin();
  x3.s = 1;
  x3 = divide(x3, new Ctor(1).minus(x3.times(x3)).sqrt(), pr2 + 10, 0);
  Ctor.precision = pr2;
  Ctor.rounding = rm2;
  return finalise(quadrant == 2 || quadrant == 4 ? x3.neg() : x3, pr2, rm2, true);
};
P.times = P.mul = function(y3) {
  var carry, e6, i, k2, r, rL, t, xdL, ydL, x3 = this, Ctor = x3.constructor, xd = x3.d, yd = (y3 = new Ctor(y3)).d;
  y3.s *= x3.s;
  if (!xd || !xd[0] || !yd || !yd[0]) {
    return new Ctor(!y3.s || xd && !xd[0] && !yd || yd && !yd[0] && !xd ? NaN : !xd || !yd ? y3.s / 0 : y3.s * 0);
  }
  e6 = mathfloor(x3.e / LOG_BASE) + mathfloor(y3.e / LOG_BASE);
  xdL = xd.length;
  ydL = yd.length;
  if (xdL < ydL) {
    r = xd;
    xd = yd;
    yd = r;
    rL = xdL;
    xdL = ydL;
    ydL = rL;
  }
  r = [];
  rL = xdL + ydL;
  for (i = rL; i--; ) r.push(0);
  for (i = ydL; --i >= 0; ) {
    carry = 0;
    for (k2 = xdL + i; k2 > i; ) {
      t = r[k2] + yd[i] * xd[k2 - i - 1] + carry;
      r[k2--] = t % BASE | 0;
      carry = t / BASE | 0;
    }
    r[k2] = (r[k2] + carry) % BASE | 0;
  }
  for (; !r[--rL]; ) r.pop();
  if (carry) ++e6;
  else r.shift();
  y3.d = r;
  y3.e = getBase10Exponent(r, e6);
  return external ? finalise(y3, Ctor.precision, Ctor.rounding) : y3;
};
P.toBinary = function(sd, rm2) {
  return toStringBinary(this, 2, sd, rm2);
};
P.toDecimalPlaces = P.toDP = function(dp, rm2) {
  var x3 = this, Ctor = x3.constructor;
  x3 = new Ctor(x3);
  if (dp === void 0) return x3;
  checkInt32(dp, 0, MAX_DIGITS);
  if (rm2 === void 0) rm2 = Ctor.rounding;
  else checkInt32(rm2, 0, 8);
  return finalise(x3, dp + x3.e + 1, rm2);
};
P.toExponential = function(dp, rm2) {
  var str2, x3 = this, Ctor = x3.constructor;
  if (dp === void 0) {
    str2 = finiteToString(x3, true);
  } else {
    checkInt32(dp, 0, MAX_DIGITS);
    if (rm2 === void 0) rm2 = Ctor.rounding;
    else checkInt32(rm2, 0, 8);
    x3 = finalise(new Ctor(x3), dp + 1, rm2);
    str2 = finiteToString(x3, true, dp + 1);
  }
  return x3.isNeg() && !x3.isZero() ? "-" + str2 : str2;
};
P.toFixed = function(dp, rm2) {
  var str2, y3, x3 = this, Ctor = x3.constructor;
  if (dp === void 0) {
    str2 = finiteToString(x3);
  } else {
    checkInt32(dp, 0, MAX_DIGITS);
    if (rm2 === void 0) rm2 = Ctor.rounding;
    else checkInt32(rm2, 0, 8);
    y3 = finalise(new Ctor(x3), dp + x3.e + 1, rm2);
    str2 = finiteToString(y3, false, dp + y3.e + 1);
  }
  return x3.isNeg() && !x3.isZero() ? "-" + str2 : str2;
};
P.toFraction = function(maxD) {
  var d, d0, d1, d2, e6, k2, n, n0, n1, pr2, q2, r, x3 = this, xd = x3.d, Ctor = x3.constructor;
  if (!xd) return new Ctor(x3);
  n1 = d0 = new Ctor(1);
  d1 = n0 = new Ctor(0);
  d = new Ctor(d1);
  e6 = d.e = getPrecision(xd) - x3.e - 1;
  k2 = e6 % LOG_BASE;
  d.d[0] = mathpow(10, k2 < 0 ? LOG_BASE + k2 : k2);
  if (maxD == null) {
    maxD = e6 > 0 ? d : n1;
  } else {
    n = new Ctor(maxD);
    if (!n.isInt() || n.lt(n1)) throw Error(invalidArgument + n);
    maxD = n.gt(d) ? e6 > 0 ? d : n1 : n;
  }
  external = false;
  n = new Ctor(digitsToString(xd));
  pr2 = Ctor.precision;
  Ctor.precision = e6 = xd.length * LOG_BASE * 2;
  for (; ; ) {
    q2 = divide(n, d, 0, 1, 1);
    d2 = d0.plus(q2.times(d1));
    if (d2.cmp(maxD) == 1) break;
    d0 = d1;
    d1 = d2;
    d2 = n1;
    n1 = n0.plus(q2.times(d2));
    n0 = d2;
    d2 = d;
    d = n.minus(q2.times(d2));
    n = d2;
  }
  d2 = divide(maxD.minus(d0), d1, 0, 1, 1);
  n0 = n0.plus(d2.times(n1));
  d0 = d0.plus(d2.times(d1));
  n0.s = n1.s = x3.s;
  r = divide(n1, d1, e6, 1).minus(x3).abs().cmp(divide(n0, d0, e6, 1).minus(x3).abs()) < 1 ? [n1, d1] : [n0, d0];
  Ctor.precision = pr2;
  external = true;
  return r;
};
P.toHexadecimal = P.toHex = function(sd, rm2) {
  return toStringBinary(this, 16, sd, rm2);
};
P.toNearest = function(y3, rm2) {
  var x3 = this, Ctor = x3.constructor;
  x3 = new Ctor(x3);
  if (y3 == null) {
    if (!x3.d) return x3;
    y3 = new Ctor(1);
    rm2 = Ctor.rounding;
  } else {
    y3 = new Ctor(y3);
    if (rm2 === void 0) {
      rm2 = Ctor.rounding;
    } else {
      checkInt32(rm2, 0, 8);
    }
    if (!x3.d) return y3.s ? x3 : y3;
    if (!y3.d) {
      if (y3.s) y3.s = x3.s;
      return y3;
    }
  }
  if (y3.d[0]) {
    external = false;
    x3 = divide(x3, y3, 0, rm2, 1).times(y3);
    external = true;
    finalise(x3);
  } else {
    y3.s = x3.s;
    x3 = y3;
  }
  return x3;
};
P.toNumber = function() {
  return +this;
};
P.toOctal = function(sd, rm2) {
  return toStringBinary(this, 8, sd, rm2);
};
P.toPower = P.pow = function(y3) {
  var e6, k2, pr2, r, rm2, s, x3 = this, Ctor = x3.constructor, yn2 = +(y3 = new Ctor(y3));
  if (!x3.d || !y3.d || !x3.d[0] || !y3.d[0]) return new Ctor(mathpow(+x3, yn2));
  x3 = new Ctor(x3);
  if (x3.eq(1)) return x3;
  pr2 = Ctor.precision;
  rm2 = Ctor.rounding;
  if (y3.eq(1)) return finalise(x3, pr2, rm2);
  e6 = mathfloor(y3.e / LOG_BASE);
  if (e6 >= y3.d.length - 1 && (k2 = yn2 < 0 ? -yn2 : yn2) <= MAX_SAFE_INTEGER) {
    r = intPow(Ctor, x3, k2, pr2);
    return y3.s < 0 ? new Ctor(1).div(r) : finalise(r, pr2, rm2);
  }
  s = x3.s;
  if (s < 0) {
    if (e6 < y3.d.length - 1) return new Ctor(NaN);
    if ((y3.d[e6] & 1) == 0) s = 1;
    if (x3.e == 0 && x3.d[0] == 1 && x3.d.length == 1) {
      x3.s = s;
      return x3;
    }
  }
  k2 = mathpow(+x3, yn2);
  e6 = k2 == 0 || !isFinite(k2) ? mathfloor(yn2 * (Math.log("0." + digitsToString(x3.d)) / Math.LN10 + x3.e + 1)) : new Ctor(k2 + "").e;
  if (e6 > Ctor.maxE + 1 || e6 < Ctor.minE - 1) return new Ctor(e6 > 0 ? s / 0 : 0);
  external = false;
  Ctor.rounding = x3.s = 1;
  k2 = Math.min(12, (e6 + "").length);
  r = naturalExponential(y3.times(naturalLogarithm(x3, pr2 + k2)), pr2);
  if (r.d) {
    r = finalise(r, pr2 + 5, 1);
    if (checkRoundingDigits(r.d, pr2, rm2)) {
      e6 = pr2 + 10;
      r = finalise(naturalExponential(y3.times(naturalLogarithm(x3, e6 + k2)), e6), e6 + 5, 1);
      if (+digitsToString(r.d).slice(pr2 + 1, pr2 + 15) + 1 == 1e14) {
        r = finalise(r, pr2 + 1, 0);
      }
    }
  }
  r.s = s;
  external = true;
  Ctor.rounding = rm2;
  return finalise(r, pr2, rm2);
};
P.toPrecision = function(sd, rm2) {
  var str2, x3 = this, Ctor = x3.constructor;
  if (sd === void 0) {
    str2 = finiteToString(x3, x3.e <= Ctor.toExpNeg || x3.e >= Ctor.toExpPos);
  } else {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm2 === void 0) rm2 = Ctor.rounding;
    else checkInt32(rm2, 0, 8);
    x3 = finalise(new Ctor(x3), sd, rm2);
    str2 = finiteToString(x3, sd <= x3.e || x3.e <= Ctor.toExpNeg, sd);
  }
  return x3.isNeg() && !x3.isZero() ? "-" + str2 : str2;
};
P.toSignificantDigits = P.toSD = function(sd, rm2) {
  var x3 = this, Ctor = x3.constructor;
  if (sd === void 0) {
    sd = Ctor.precision;
    rm2 = Ctor.rounding;
  } else {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm2 === void 0) rm2 = Ctor.rounding;
    else checkInt32(rm2, 0, 8);
  }
  return finalise(new Ctor(x3), sd, rm2);
};
P.toString = function() {
  var x3 = this, Ctor = x3.constructor, str2 = finiteToString(x3, x3.e <= Ctor.toExpNeg || x3.e >= Ctor.toExpPos);
  return x3.isNeg() && !x3.isZero() ? "-" + str2 : str2;
};
P.truncated = P.trunc = function() {
  return finalise(new this.constructor(this), this.e + 1, 1);
};
P.valueOf = P.toJSON = function() {
  var x3 = this, Ctor = x3.constructor, str2 = finiteToString(x3, x3.e <= Ctor.toExpNeg || x3.e >= Ctor.toExpPos);
  return x3.isNeg() ? "-" + str2 : str2;
};
function digitsToString(d) {
  var i, k2, ws, indexOfLastWord = d.length - 1, str2 = "", w3 = d[0];
  if (indexOfLastWord > 0) {
    str2 += w3;
    for (i = 1; i < indexOfLastWord; i++) {
      ws = d[i] + "";
      k2 = LOG_BASE - ws.length;
      if (k2) str2 += getZeroString(k2);
      str2 += ws;
    }
    w3 = d[i];
    ws = w3 + "";
    k2 = LOG_BASE - ws.length;
    if (k2) str2 += getZeroString(k2);
  } else if (w3 === 0) {
    return "0";
  }
  for (; w3 % 10 === 0; ) w3 /= 10;
  return str2 + w3;
}
__name(digitsToString, "digitsToString");
function checkInt32(i, min2, max2) {
  if (i !== ~~i || i < min2 || i > max2) {
    throw Error(invalidArgument + i);
  }
}
__name(checkInt32, "checkInt32");
function checkRoundingDigits(d, i, rm2, repeating) {
  var di2, k2, r, rd2;
  for (k2 = d[0]; k2 >= 10; k2 /= 10) --i;
  if (--i < 0) {
    i += LOG_BASE;
    di2 = 0;
  } else {
    di2 = Math.ceil((i + 1) / LOG_BASE);
    i %= LOG_BASE;
  }
  k2 = mathpow(10, LOG_BASE - i);
  rd2 = d[di2] % k2 | 0;
  if (repeating == null) {
    if (i < 3) {
      if (i == 0) rd2 = rd2 / 100 | 0;
      else if (i == 1) rd2 = rd2 / 10 | 0;
      r = rm2 < 4 && rd2 == 99999 || rm2 > 3 && rd2 == 49999 || rd2 == 5e4 || rd2 == 0;
    } else {
      r = (rm2 < 4 && rd2 + 1 == k2 || rm2 > 3 && rd2 + 1 == k2 / 2) && (d[di2 + 1] / k2 / 100 | 0) == mathpow(10, i - 2) - 1 || (rd2 == k2 / 2 || rd2 == 0) && (d[di2 + 1] / k2 / 100 | 0) == 0;
    }
  } else {
    if (i < 4) {
      if (i == 0) rd2 = rd2 / 1e3 | 0;
      else if (i == 1) rd2 = rd2 / 100 | 0;
      else if (i == 2) rd2 = rd2 / 10 | 0;
      r = (repeating || rm2 < 4) && rd2 == 9999 || !repeating && rm2 > 3 && rd2 == 4999;
    } else {
      r = ((repeating || rm2 < 4) && rd2 + 1 == k2 || !repeating && rm2 > 3 && rd2 + 1 == k2 / 2) && (d[di2 + 1] / k2 / 1e3 | 0) == mathpow(10, i - 3) - 1;
    }
  }
  return r;
}
__name(checkRoundingDigits, "checkRoundingDigits");
function convertBase(str2, baseIn, baseOut) {
  var j, arr = [0], arrL, i = 0, strL = str2.length;
  for (; i < strL; ) {
    for (arrL = arr.length; arrL--; ) arr[arrL] *= baseIn;
    arr[0] += NUMERALS.indexOf(str2.charAt(i++));
    for (j = 0; j < arr.length; j++) {
      if (arr[j] > baseOut - 1) {
        if (arr[j + 1] === void 0) arr[j + 1] = 0;
        arr[j + 1] += arr[j] / baseOut | 0;
        arr[j] %= baseOut;
      }
    }
  }
  return arr.reverse();
}
__name(convertBase, "convertBase");
function cosine(Ctor, x3) {
  var k2, len, y3;
  if (x3.isZero()) return x3;
  len = x3.d.length;
  if (len < 32) {
    k2 = Math.ceil(len / 3);
    y3 = (1 / tinyPow(4, k2)).toString();
  } else {
    k2 = 16;
    y3 = "2.3283064365386962890625e-10";
  }
  Ctor.precision += k2;
  x3 = taylorSeries(Ctor, 1, x3.times(y3), new Ctor(1));
  for (var i = k2; i--; ) {
    var cos2x = x3.times(x3);
    x3 = cos2x.times(cos2x).minus(cos2x).times(8).plus(1);
  }
  Ctor.precision -= k2;
  return x3;
}
__name(cosine, "cosine");
var divide = /* @__PURE__ */ (function() {
  function multiplyInteger(x3, k2, base) {
    var temp, carry = 0, i = x3.length;
    for (x3 = x3.slice(); i--; ) {
      temp = x3[i] * k2 + carry;
      x3[i] = temp % base | 0;
      carry = temp / base | 0;
    }
    if (carry) x3.unshift(carry);
    return x3;
  }
  __name(multiplyInteger, "multiplyInteger");
  function compare(a2, b3, aL, bL) {
    var i, r;
    if (aL != bL) {
      r = aL > bL ? 1 : -1;
    } else {
      for (i = r = 0; i < aL; i++) {
        if (a2[i] != b3[i]) {
          r = a2[i] > b3[i] ? 1 : -1;
          break;
        }
      }
    }
    return r;
  }
  __name(compare, "compare");
  function subtract(a2, b3, aL, base) {
    var i = 0;
    for (; aL--; ) {
      a2[aL] -= i;
      i = a2[aL] < b3[aL] ? 1 : 0;
      a2[aL] = i * base + a2[aL] - b3[aL];
    }
    for (; !a2[0] && a2.length > 1; ) a2.shift();
  }
  __name(subtract, "subtract");
  return function(x3, y3, pr2, rm2, dp, base) {
    var cmp, e6, i, k2, logBase, more, prod, prodL, q2, qd, rem, remL, rem0, sd, t, xi2, xL, yd0, yL, yz, Ctor = x3.constructor, sign2 = x3.s == y3.s ? 1 : -1, xd = x3.d, yd = y3.d;
    if (!xd || !xd[0] || !yd || !yd[0]) {
      return new Ctor(
        // Return NaN if either NaN, or both Infinity or 0.
        !x3.s || !y3.s || (xd ? yd && xd[0] == yd[0] : !yd) ? NaN : (
          // Return ±0 if x is 0 or y is ±Infinity, or return ±Infinity as y is 0.
          xd && xd[0] == 0 || !yd ? sign2 * 0 : sign2 / 0
        )
      );
    }
    if (base) {
      logBase = 1;
      e6 = x3.e - y3.e;
    } else {
      base = BASE;
      logBase = LOG_BASE;
      e6 = mathfloor(x3.e / logBase) - mathfloor(y3.e / logBase);
    }
    yL = yd.length;
    xL = xd.length;
    q2 = new Ctor(sign2);
    qd = q2.d = [];
    for (i = 0; yd[i] == (xd[i] || 0); i++) ;
    if (yd[i] > (xd[i] || 0)) e6--;
    if (pr2 == null) {
      sd = pr2 = Ctor.precision;
      rm2 = Ctor.rounding;
    } else if (dp) {
      sd = pr2 + (x3.e - y3.e) + 1;
    } else {
      sd = pr2;
    }
    if (sd < 0) {
      qd.push(1);
      more = true;
    } else {
      sd = sd / logBase + 2 | 0;
      i = 0;
      if (yL == 1) {
        k2 = 0;
        yd = yd[0];
        sd++;
        for (; (i < xL || k2) && sd--; i++) {
          t = k2 * base + (xd[i] || 0);
          qd[i] = t / yd | 0;
          k2 = t % yd | 0;
        }
        more = k2 || i < xL;
      } else {
        k2 = base / (yd[0] + 1) | 0;
        if (k2 > 1) {
          yd = multiplyInteger(yd, k2, base);
          xd = multiplyInteger(xd, k2, base);
          yL = yd.length;
          xL = xd.length;
        }
        xi2 = yL;
        rem = xd.slice(0, yL);
        remL = rem.length;
        for (; remL < yL; ) rem[remL++] = 0;
        yz = yd.slice();
        yz.unshift(0);
        yd0 = yd[0];
        if (yd[1] >= base / 2) ++yd0;
        do {
          k2 = 0;
          cmp = compare(yd, rem, yL, remL);
          if (cmp < 0) {
            rem0 = rem[0];
            if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);
            k2 = rem0 / yd0 | 0;
            if (k2 > 1) {
              if (k2 >= base) k2 = base - 1;
              prod = multiplyInteger(yd, k2, base);
              prodL = prod.length;
              remL = rem.length;
              cmp = compare(prod, rem, prodL, remL);
              if (cmp == 1) {
                k2--;
                subtract(prod, yL < prodL ? yz : yd, prodL, base);
              }
            } else {
              if (k2 == 0) cmp = k2 = 1;
              prod = yd.slice();
            }
            prodL = prod.length;
            if (prodL < remL) prod.unshift(0);
            subtract(rem, prod, remL, base);
            if (cmp == -1) {
              remL = rem.length;
              cmp = compare(yd, rem, yL, remL);
              if (cmp < 1) {
                k2++;
                subtract(rem, yL < remL ? yz : yd, remL, base);
              }
            }
            remL = rem.length;
          } else if (cmp === 0) {
            k2++;
            rem = [0];
          }
          qd[i++] = k2;
          if (cmp && rem[0]) {
            rem[remL++] = xd[xi2] || 0;
          } else {
            rem = [xd[xi2]];
            remL = 1;
          }
        } while ((xi2++ < xL || rem[0] !== void 0) && sd--);
        more = rem[0] !== void 0;
      }
      if (!qd[0]) qd.shift();
    }
    if (logBase == 1) {
      q2.e = e6;
      inexact = more;
    } else {
      for (i = 1, k2 = qd[0]; k2 >= 10; k2 /= 10) i++;
      q2.e = i + e6 * logBase - 1;
      finalise(q2, dp ? pr2 + q2.e + 1 : pr2, rm2, more);
    }
    return q2;
  };
})();
function finalise(x3, sd, rm2, isTruncated) {
  var digits, i, j, k2, rd2, roundUp, w3, xd, xdi, Ctor = x3.constructor;
  out: if (sd != null) {
    xd = x3.d;
    if (!xd) return x3;
    for (digits = 1, k2 = xd[0]; k2 >= 10; k2 /= 10) digits++;
    i = sd - digits;
    if (i < 0) {
      i += LOG_BASE;
      j = sd;
      w3 = xd[xdi = 0];
      rd2 = w3 / mathpow(10, digits - j - 1) % 10 | 0;
    } else {
      xdi = Math.ceil((i + 1) / LOG_BASE);
      k2 = xd.length;
      if (xdi >= k2) {
        if (isTruncated) {
          for (; k2++ <= xdi; ) xd.push(0);
          w3 = rd2 = 0;
          digits = 1;
          i %= LOG_BASE;
          j = i - LOG_BASE + 1;
        } else {
          break out;
        }
      } else {
        w3 = k2 = xd[xdi];
        for (digits = 1; k2 >= 10; k2 /= 10) digits++;
        i %= LOG_BASE;
        j = i - LOG_BASE + digits;
        rd2 = j < 0 ? 0 : w3 / mathpow(10, digits - j - 1) % 10 | 0;
      }
    }
    isTruncated = isTruncated || sd < 0 || xd[xdi + 1] !== void 0 || (j < 0 ? w3 : w3 % mathpow(10, digits - j - 1));
    roundUp = rm2 < 4 ? (rd2 || isTruncated) && (rm2 == 0 || rm2 == (x3.s < 0 ? 3 : 2)) : rd2 > 5 || rd2 == 5 && (rm2 == 4 || isTruncated || rm2 == 6 && // Check whether the digit to the left of the rounding digit is odd.
    (i > 0 ? j > 0 ? w3 / mathpow(10, digits - j) : 0 : xd[xdi - 1]) % 10 & 1 || rm2 == (x3.s < 0 ? 8 : 7));
    if (sd < 1 || !xd[0]) {
      xd.length = 0;
      if (roundUp) {
        sd -= x3.e + 1;
        xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
        x3.e = -sd || 0;
      } else {
        xd[0] = x3.e = 0;
      }
      return x3;
    }
    if (i == 0) {
      xd.length = xdi;
      k2 = 1;
      xdi--;
    } else {
      xd.length = xdi + 1;
      k2 = mathpow(10, LOG_BASE - i);
      xd[xdi] = j > 0 ? (w3 / mathpow(10, digits - j) % mathpow(10, j) | 0) * k2 : 0;
    }
    if (roundUp) {
      for (; ; ) {
        if (xdi == 0) {
          for (i = 1, j = xd[0]; j >= 10; j /= 10) i++;
          j = xd[0] += k2;
          for (k2 = 1; j >= 10; j /= 10) k2++;
          if (i != k2) {
            x3.e++;
            if (xd[0] == BASE) xd[0] = 1;
          }
          break;
        } else {
          xd[xdi] += k2;
          if (xd[xdi] != BASE) break;
          xd[xdi--] = 0;
          k2 = 1;
        }
      }
    }
    for (i = xd.length; xd[--i] === 0; ) xd.pop();
  }
  if (external) {
    if (x3.e > Ctor.maxE) {
      x3.d = null;
      x3.e = NaN;
    } else if (x3.e < Ctor.minE) {
      x3.e = 0;
      x3.d = [0];
    }
  }
  return x3;
}
__name(finalise, "finalise");
function finiteToString(x3, isExp, sd) {
  if (!x3.isFinite()) return nonFiniteToString(x3);
  var k2, e6 = x3.e, str2 = digitsToString(x3.d), len = str2.length;
  if (isExp) {
    if (sd && (k2 = sd - len) > 0) {
      str2 = str2.charAt(0) + "." + str2.slice(1) + getZeroString(k2);
    } else if (len > 1) {
      str2 = str2.charAt(0) + "." + str2.slice(1);
    }
    str2 = str2 + (x3.e < 0 ? "e" : "e+") + x3.e;
  } else if (e6 < 0) {
    str2 = "0." + getZeroString(-e6 - 1) + str2;
    if (sd && (k2 = sd - len) > 0) str2 += getZeroString(k2);
  } else if (e6 >= len) {
    str2 += getZeroString(e6 + 1 - len);
    if (sd && (k2 = sd - e6 - 1) > 0) str2 = str2 + "." + getZeroString(k2);
  } else {
    if ((k2 = e6 + 1) < len) str2 = str2.slice(0, k2) + "." + str2.slice(k2);
    if (sd && (k2 = sd - len) > 0) {
      if (e6 + 1 === len) str2 += ".";
      str2 += getZeroString(k2);
    }
  }
  return str2;
}
__name(finiteToString, "finiteToString");
function getBase10Exponent(digits, e6) {
  var w3 = digits[0];
  for (e6 *= LOG_BASE; w3 >= 10; w3 /= 10) e6++;
  return e6;
}
__name(getBase10Exponent, "getBase10Exponent");
function getLn10(Ctor, sd, pr2) {
  if (sd > LN10_PRECISION) {
    external = true;
    if (pr2) Ctor.precision = pr2;
    throw Error(precisionLimitExceeded);
  }
  return finalise(new Ctor(LN10), sd, 1, true);
}
__name(getLn10, "getLn10");
function getPi(Ctor, sd, rm2) {
  if (sd > PI_PRECISION) throw Error(precisionLimitExceeded);
  return finalise(new Ctor(PI), sd, rm2, true);
}
__name(getPi, "getPi");
function getPrecision(digits) {
  var w3 = digits.length - 1, len = w3 * LOG_BASE + 1;
  w3 = digits[w3];
  if (w3) {
    for (; w3 % 10 == 0; w3 /= 10) len--;
    for (w3 = digits[0]; w3 >= 10; w3 /= 10) len++;
  }
  return len;
}
__name(getPrecision, "getPrecision");
function getZeroString(k2) {
  var zs = "";
  for (; k2--; ) zs += "0";
  return zs;
}
__name(getZeroString, "getZeroString");
function intPow(Ctor, x3, n, pr2) {
  var isTruncated, r = new Ctor(1), k2 = Math.ceil(pr2 / LOG_BASE + 4);
  external = false;
  for (; ; ) {
    if (n % 2) {
      r = r.times(x3);
      if (truncate(r.d, k2)) isTruncated = true;
    }
    n = mathfloor(n / 2);
    if (n === 0) {
      n = r.d.length - 1;
      if (isTruncated && r.d[n] === 0) ++r.d[n];
      break;
    }
    x3 = x3.times(x3);
    truncate(x3.d, k2);
  }
  external = true;
  return r;
}
__name(intPow, "intPow");
function isOdd(n) {
  return n.d[n.d.length - 1] & 1;
}
__name(isOdd, "isOdd");
function maxOrMin(Ctor, args, n) {
  var k2, y3, x3 = new Ctor(args[0]), i = 0;
  for (; ++i < args.length; ) {
    y3 = new Ctor(args[i]);
    if (!y3.s) {
      x3 = y3;
      break;
    }
    k2 = x3.cmp(y3);
    if (k2 === n || k2 === 0 && x3.s === n) {
      x3 = y3;
    }
  }
  return x3;
}
__name(maxOrMin, "maxOrMin");
function naturalExponential(x3, sd) {
  var denominator, guard, j, pow2, sum2, t, wpr, rep = 0, i = 0, k2 = 0, Ctor = x3.constructor, rm2 = Ctor.rounding, pr2 = Ctor.precision;
  if (!x3.d || !x3.d[0] || x3.e > 17) {
    return new Ctor(x3.d ? !x3.d[0] ? 1 : x3.s < 0 ? 0 : 1 / 0 : x3.s ? x3.s < 0 ? 0 : x3 : 0 / 0);
  }
  if (sd == null) {
    external = false;
    wpr = pr2;
  } else {
    wpr = sd;
  }
  t = new Ctor(0.03125);
  while (x3.e > -2) {
    x3 = x3.times(t);
    k2 += 5;
  }
  guard = Math.log(mathpow(2, k2)) / Math.LN10 * 2 + 5 | 0;
  wpr += guard;
  denominator = pow2 = sum2 = new Ctor(1);
  Ctor.precision = wpr;
  for (; ; ) {
    pow2 = finalise(pow2.times(x3), wpr, 1);
    denominator = denominator.times(++i);
    t = sum2.plus(divide(pow2, denominator, wpr, 1));
    if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum2.d).slice(0, wpr)) {
      j = k2;
      while (j--) sum2 = finalise(sum2.times(sum2), wpr, 1);
      if (sd == null) {
        if (rep < 3 && checkRoundingDigits(sum2.d, wpr - guard, rm2, rep)) {
          Ctor.precision = wpr += 10;
          denominator = pow2 = t = new Ctor(1);
          i = 0;
          rep++;
        } else {
          return finalise(sum2, Ctor.precision = pr2, rm2, external = true);
        }
      } else {
        Ctor.precision = pr2;
        return sum2;
      }
    }
    sum2 = t;
  }
}
__name(naturalExponential, "naturalExponential");
function naturalLogarithm(y3, sd) {
  var c2, c0, denominator, e6, numerator, rep, sum2, t, wpr, x1, x22, n = 1, guard = 10, x3 = y3, xd = x3.d, Ctor = x3.constructor, rm2 = Ctor.rounding, pr2 = Ctor.precision;
  if (x3.s < 0 || !xd || !xd[0] || !x3.e && xd[0] == 1 && xd.length == 1) {
    return new Ctor(xd && !xd[0] ? -1 / 0 : x3.s != 1 ? NaN : xd ? 0 : x3);
  }
  if (sd == null) {
    external = false;
    wpr = pr2;
  } else {
    wpr = sd;
  }
  Ctor.precision = wpr += guard;
  c2 = digitsToString(xd);
  c0 = c2.charAt(0);
  if (Math.abs(e6 = x3.e) < 15e14) {
    while (c0 < 7 && c0 != 1 || c0 == 1 && c2.charAt(1) > 3) {
      x3 = x3.times(y3);
      c2 = digitsToString(x3.d);
      c0 = c2.charAt(0);
      n++;
    }
    e6 = x3.e;
    if (c0 > 1) {
      x3 = new Ctor("0." + c2);
      e6++;
    } else {
      x3 = new Ctor(c0 + "." + c2.slice(1));
    }
  } else {
    t = getLn10(Ctor, wpr + 2, pr2).times(e6 + "");
    x3 = naturalLogarithm(new Ctor(c0 + "." + c2.slice(1)), wpr - guard).plus(t);
    Ctor.precision = pr2;
    return sd == null ? finalise(x3, pr2, rm2, external = true) : x3;
  }
  x1 = x3;
  sum2 = numerator = x3 = divide(x3.minus(1), x3.plus(1), wpr, 1);
  x22 = finalise(x3.times(x3), wpr, 1);
  denominator = 3;
  for (; ; ) {
    numerator = finalise(numerator.times(x22), wpr, 1);
    t = sum2.plus(divide(numerator, new Ctor(denominator), wpr, 1));
    if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum2.d).slice(0, wpr)) {
      sum2 = sum2.times(2);
      if (e6 !== 0) sum2 = sum2.plus(getLn10(Ctor, wpr + 2, pr2).times(e6 + ""));
      sum2 = divide(sum2, new Ctor(n), wpr, 1);
      if (sd == null) {
        if (checkRoundingDigits(sum2.d, wpr - guard, rm2, rep)) {
          Ctor.precision = wpr += guard;
          t = numerator = x3 = divide(x1.minus(1), x1.plus(1), wpr, 1);
          x22 = finalise(x3.times(x3), wpr, 1);
          denominator = rep = 1;
        } else {
          return finalise(sum2, Ctor.precision = pr2, rm2, external = true);
        }
      } else {
        Ctor.precision = pr2;
        return sum2;
      }
    }
    sum2 = t;
    denominator += 2;
  }
}
__name(naturalLogarithm, "naturalLogarithm");
function nonFiniteToString(x3) {
  return String(x3.s * x3.s / 0);
}
__name(nonFiniteToString, "nonFiniteToString");
function parseDecimal(x3, str2) {
  var e6, i, len;
  if ((e6 = str2.indexOf(".")) > -1) str2 = str2.replace(".", "");
  if ((i = str2.search(/e/i)) > 0) {
    if (e6 < 0) e6 = i;
    e6 += +str2.slice(i + 1);
    str2 = str2.substring(0, i);
  } else if (e6 < 0) {
    e6 = str2.length;
  }
  for (i = 0; str2.charCodeAt(i) === 48; i++) ;
  for (len = str2.length; str2.charCodeAt(len - 1) === 48; --len) ;
  str2 = str2.slice(i, len);
  if (str2) {
    len -= i;
    x3.e = e6 = e6 - i - 1;
    x3.d = [];
    i = (e6 + 1) % LOG_BASE;
    if (e6 < 0) i += LOG_BASE;
    if (i < len) {
      if (i) x3.d.push(+str2.slice(0, i));
      for (len -= LOG_BASE; i < len; ) x3.d.push(+str2.slice(i, i += LOG_BASE));
      str2 = str2.slice(i);
      i = LOG_BASE - str2.length;
    } else {
      i -= len;
    }
    for (; i--; ) str2 += "0";
    x3.d.push(+str2);
    if (external) {
      if (x3.e > x3.constructor.maxE) {
        x3.d = null;
        x3.e = NaN;
      } else if (x3.e < x3.constructor.minE) {
        x3.e = 0;
        x3.d = [0];
      }
    }
  } else {
    x3.e = 0;
    x3.d = [0];
  }
  return x3;
}
__name(parseDecimal, "parseDecimal");
function parseOther(x3, str2) {
  var base, Ctor, divisor, i, isFloat, len, p3, xd, xe;
  if (str2.indexOf("_") > -1) {
    str2 = str2.replace(/(\d)_(?=\d)/g, "$1");
    if (isDecimal.test(str2)) return parseDecimal(x3, str2);
  } else if (str2 === "Infinity" || str2 === "NaN") {
    if (!+str2) x3.s = NaN;
    x3.e = NaN;
    x3.d = null;
    return x3;
  }
  if (isHex.test(str2)) {
    base = 16;
    str2 = str2.toLowerCase();
  } else if (isBinary.test(str2)) {
    base = 2;
  } else if (isOctal.test(str2)) {
    base = 8;
  } else {
    throw Error(invalidArgument + str2);
  }
  i = str2.search(/p/i);
  if (i > 0) {
    p3 = +str2.slice(i + 1);
    str2 = str2.substring(2, i);
  } else {
    str2 = str2.slice(2);
  }
  i = str2.indexOf(".");
  isFloat = i >= 0;
  Ctor = x3.constructor;
  if (isFloat) {
    str2 = str2.replace(".", "");
    len = str2.length;
    i = len - i;
    divisor = intPow(Ctor, new Ctor(base), i, i * 2);
  }
  xd = convertBase(str2, base, BASE);
  xe = xd.length - 1;
  for (i = xe; xd[i] === 0; --i) xd.pop();
  if (i < 0) return new Ctor(x3.s * 0);
  x3.e = getBase10Exponent(xd, xe);
  x3.d = xd;
  external = false;
  if (isFloat) x3 = divide(x3, divisor, len * 4);
  if (p3) x3 = x3.times(Math.abs(p3) < 54 ? mathpow(2, p3) : Decimal.pow(2, p3));
  external = true;
  return x3;
}
__name(parseOther, "parseOther");
function sine(Ctor, x3) {
  var k2, len = x3.d.length;
  if (len < 3) {
    return x3.isZero() ? x3 : taylorSeries(Ctor, 2, x3, x3);
  }
  k2 = 1.4 * Math.sqrt(len);
  k2 = k2 > 16 ? 16 : k2 | 0;
  x3 = x3.times(1 / tinyPow(5, k2));
  x3 = taylorSeries(Ctor, 2, x3, x3);
  var sin2_x, d5 = new Ctor(5), d16 = new Ctor(16), d20 = new Ctor(20);
  for (; k2--; ) {
    sin2_x = x3.times(x3);
    x3 = x3.times(d5.plus(sin2_x.times(d16.times(sin2_x).minus(d20))));
  }
  return x3;
}
__name(sine, "sine");
function taylorSeries(Ctor, n, x3, y3, isHyperbolic) {
  var j, t, u3, x22, i = 1, pr2 = Ctor.precision, k2 = Math.ceil(pr2 / LOG_BASE);
  external = false;
  x22 = x3.times(x3);
  u3 = new Ctor(y3);
  for (; ; ) {
    t = divide(u3.times(x22), new Ctor(n++ * n++), pr2, 1);
    u3 = isHyperbolic ? y3.plus(t) : y3.minus(t);
    y3 = divide(t.times(x22), new Ctor(n++ * n++), pr2, 1);
    t = u3.plus(y3);
    if (t.d[k2] !== void 0) {
      for (j = k2; t.d[j] === u3.d[j] && j--; ) ;
      if (j == -1) break;
    }
    j = u3;
    u3 = y3;
    y3 = t;
    t = j;
    i++;
  }
  external = true;
  t.d.length = k2 + 1;
  return t;
}
__name(taylorSeries, "taylorSeries");
function tinyPow(b3, e6) {
  var n = b3;
  while (--e6) n *= b3;
  return n;
}
__name(tinyPow, "tinyPow");
function toLessThanHalfPi(Ctor, x3) {
  var t, isNeg = x3.s < 0, pi2 = getPi(Ctor, Ctor.precision, 1), halfPi = pi2.times(0.5);
  x3 = x3.abs();
  if (x3.lte(halfPi)) {
    quadrant = isNeg ? 4 : 1;
    return x3;
  }
  t = x3.divToInt(pi2);
  if (t.isZero()) {
    quadrant = isNeg ? 3 : 2;
  } else {
    x3 = x3.minus(t.times(pi2));
    if (x3.lte(halfPi)) {
      quadrant = isOdd(t) ? isNeg ? 2 : 3 : isNeg ? 4 : 1;
      return x3;
    }
    quadrant = isOdd(t) ? isNeg ? 1 : 4 : isNeg ? 3 : 2;
  }
  return x3.minus(pi2).abs();
}
__name(toLessThanHalfPi, "toLessThanHalfPi");
function toStringBinary(x3, baseOut, sd, rm2) {
  var base, e6, i, k2, len, roundUp, str2, xd, y3, Ctor = x3.constructor, isExp = sd !== void 0;
  if (isExp) {
    checkInt32(sd, 1, MAX_DIGITS);
    if (rm2 === void 0) rm2 = Ctor.rounding;
    else checkInt32(rm2, 0, 8);
  } else {
    sd = Ctor.precision;
    rm2 = Ctor.rounding;
  }
  if (!x3.isFinite()) {
    str2 = nonFiniteToString(x3);
  } else {
    str2 = finiteToString(x3);
    i = str2.indexOf(".");
    if (isExp) {
      base = 2;
      if (baseOut == 16) {
        sd = sd * 4 - 3;
      } else if (baseOut == 8) {
        sd = sd * 3 - 2;
      }
    } else {
      base = baseOut;
    }
    if (i >= 0) {
      str2 = str2.replace(".", "");
      y3 = new Ctor(1);
      y3.e = str2.length - i;
      y3.d = convertBase(finiteToString(y3), 10, base);
      y3.e = y3.d.length;
    }
    xd = convertBase(str2, 10, base);
    e6 = len = xd.length;
    for (; xd[--len] == 0; ) xd.pop();
    if (!xd[0]) {
      str2 = isExp ? "0p+0" : "0";
    } else {
      if (i < 0) {
        e6--;
      } else {
        x3 = new Ctor(x3);
        x3.d = xd;
        x3.e = e6;
        x3 = divide(x3, y3, sd, rm2, 0, base);
        xd = x3.d;
        e6 = x3.e;
        roundUp = inexact;
      }
      i = xd[sd];
      k2 = base / 2;
      roundUp = roundUp || xd[sd + 1] !== void 0;
      roundUp = rm2 < 4 ? (i !== void 0 || roundUp) && (rm2 === 0 || rm2 === (x3.s < 0 ? 3 : 2)) : i > k2 || i === k2 && (rm2 === 4 || roundUp || rm2 === 6 && xd[sd - 1] & 1 || rm2 === (x3.s < 0 ? 8 : 7));
      xd.length = sd;
      if (roundUp) {
        for (; ++xd[--sd] > base - 1; ) {
          xd[sd] = 0;
          if (!sd) {
            ++e6;
            xd.unshift(1);
          }
        }
      }
      for (len = xd.length; !xd[len - 1]; --len) ;
      for (i = 0, str2 = ""; i < len; i++) str2 += NUMERALS.charAt(xd[i]);
      if (isExp) {
        if (len > 1) {
          if (baseOut == 16 || baseOut == 8) {
            i = baseOut == 16 ? 4 : 3;
            for (--len; len % i; len++) str2 += "0";
            xd = convertBase(str2, base, baseOut);
            for (len = xd.length; !xd[len - 1]; --len) ;
            for (i = 1, str2 = "1."; i < len; i++) str2 += NUMERALS.charAt(xd[i]);
          } else {
            str2 = str2.charAt(0) + "." + str2.slice(1);
          }
        }
        str2 = str2 + (e6 < 0 ? "p" : "p+") + e6;
      } else if (e6 < 0) {
        for (; ++e6; ) str2 = "0" + str2;
        str2 = "0." + str2;
      } else {
        if (++e6 > len) for (e6 -= len; e6--; ) str2 += "0";
        else if (e6 < len) str2 = str2.slice(0, e6) + "." + str2.slice(e6);
      }
    }
    str2 = (baseOut == 16 ? "0x" : baseOut == 2 ? "0b" : baseOut == 8 ? "0o" : "") + str2;
  }
  return x3.s < 0 ? "-" + str2 : str2;
}
__name(toStringBinary, "toStringBinary");
function truncate(arr, len) {
  if (arr.length > len) {
    arr.length = len;
    return true;
  }
}
__name(truncate, "truncate");
function abs(x3) {
  return new this(x3).abs();
}
__name(abs, "abs");
function acos(x3) {
  return new this(x3).acos();
}
__name(acos, "acos");
function acosh(x3) {
  return new this(x3).acosh();
}
__name(acosh, "acosh");
function add(x3, y3) {
  return new this(x3).plus(y3);
}
__name(add, "add");
function asin(x3) {
  return new this(x3).asin();
}
__name(asin, "asin");
function asinh(x3) {
  return new this(x3).asinh();
}
__name(asinh, "asinh");
function atan(x3) {
  return new this(x3).atan();
}
__name(atan, "atan");
function atanh(x3) {
  return new this(x3).atanh();
}
__name(atanh, "atanh");
function atan2(y3, x3) {
  y3 = new this(y3);
  x3 = new this(x3);
  var r, pr2 = this.precision, rm2 = this.rounding, wpr = pr2 + 4;
  if (!y3.s || !x3.s) {
    r = new this(NaN);
  } else if (!y3.d && !x3.d) {
    r = getPi(this, wpr, 1).times(x3.s > 0 ? 0.25 : 0.75);
    r.s = y3.s;
  } else if (!x3.d || y3.isZero()) {
    r = x3.s < 0 ? getPi(this, pr2, rm2) : new this(0);
    r.s = y3.s;
  } else if (!y3.d || x3.isZero()) {
    r = getPi(this, wpr, 1).times(0.5);
    r.s = y3.s;
  } else if (x3.s < 0) {
    this.precision = wpr;
    this.rounding = 1;
    r = this.atan(divide(y3, x3, wpr, 1));
    x3 = getPi(this, wpr, 1);
    this.precision = pr2;
    this.rounding = rm2;
    r = y3.s < 0 ? r.minus(x3) : r.plus(x3);
  } else {
    r = this.atan(divide(y3, x3, wpr, 1));
  }
  return r;
}
__name(atan2, "atan2");
function cbrt(x3) {
  return new this(x3).cbrt();
}
__name(cbrt, "cbrt");
function ceil(x3) {
  return finalise(x3 = new this(x3), x3.e + 1, 2);
}
__name(ceil, "ceil");
function clamp(x3, min2, max2) {
  return new this(x3).clamp(min2, max2);
}
__name(clamp, "clamp");
function config2(obj) {
  if (!obj || typeof obj !== "object") throw Error(decimalError + "Object expected");
  var i, p3, v3, useDefaults = obj.defaults === true, ps2 = [
    "precision",
    1,
    MAX_DIGITS,
    "rounding",
    0,
    8,
    "toExpNeg",
    -EXP_LIMIT,
    0,
    "toExpPos",
    0,
    EXP_LIMIT,
    "maxE",
    0,
    EXP_LIMIT,
    "minE",
    -EXP_LIMIT,
    0,
    "modulo",
    0,
    9
  ];
  for (i = 0; i < ps2.length; i += 3) {
    if (p3 = ps2[i], useDefaults) this[p3] = DEFAULTS[p3];
    if ((v3 = obj[p3]) !== void 0) {
      if (mathfloor(v3) === v3 && v3 >= ps2[i + 1] && v3 <= ps2[i + 2]) this[p3] = v3;
      else throw Error(invalidArgument + p3 + ": " + v3);
    }
  }
  if (p3 = "crypto", useDefaults) this[p3] = DEFAULTS[p3];
  if ((v3 = obj[p3]) !== void 0) {
    if (v3 === true || v3 === false || v3 === 0 || v3 === 1) {
      if (v3) {
        if (typeof crypto != "undefined" && crypto && (crypto.getRandomValues || crypto.randomBytes)) {
          this[p3] = true;
        } else {
          throw Error(cryptoUnavailable);
        }
      } else {
        this[p3] = false;
      }
    } else {
      throw Error(invalidArgument + p3 + ": " + v3);
    }
  }
  return this;
}
__name(config2, "config");
function cos(x3) {
  return new this(x3).cos();
}
__name(cos, "cos");
function cosh(x3) {
  return new this(x3).cosh();
}
__name(cosh, "cosh");
function clone(obj) {
  var i, p3, ps2;
  function Decimal2(v3) {
    var e6, i2, t, x3 = this;
    if (!(x3 instanceof Decimal2)) return new Decimal2(v3);
    x3.constructor = Decimal2;
    if (isDecimalInstance(v3)) {
      x3.s = v3.s;
      if (external) {
        if (!v3.d || v3.e > Decimal2.maxE) {
          x3.e = NaN;
          x3.d = null;
        } else if (v3.e < Decimal2.minE) {
          x3.e = 0;
          x3.d = [0];
        } else {
          x3.e = v3.e;
          x3.d = v3.d.slice();
        }
      } else {
        x3.e = v3.e;
        x3.d = v3.d ? v3.d.slice() : v3.d;
      }
      return;
    }
    t = typeof v3;
    if (t === "number") {
      if (v3 === 0) {
        x3.s = 1 / v3 < 0 ? -1 : 1;
        x3.e = 0;
        x3.d = [0];
        return;
      }
      if (v3 < 0) {
        v3 = -v3;
        x3.s = -1;
      } else {
        x3.s = 1;
      }
      if (v3 === ~~v3 && v3 < 1e7) {
        for (e6 = 0, i2 = v3; i2 >= 10; i2 /= 10) e6++;
        if (external) {
          if (e6 > Decimal2.maxE) {
            x3.e = NaN;
            x3.d = null;
          } else if (e6 < Decimal2.minE) {
            x3.e = 0;
            x3.d = [0];
          } else {
            x3.e = e6;
            x3.d = [v3];
          }
        } else {
          x3.e = e6;
          x3.d = [v3];
        }
        return;
      }
      if (v3 * 0 !== 0) {
        if (!v3) x3.s = NaN;
        x3.e = NaN;
        x3.d = null;
        return;
      }
      return parseDecimal(x3, v3.toString());
    }
    if (t === "string") {
      if ((i2 = v3.charCodeAt(0)) === 45) {
        v3 = v3.slice(1);
        x3.s = -1;
      } else {
        if (i2 === 43) v3 = v3.slice(1);
        x3.s = 1;
      }
      return isDecimal.test(v3) ? parseDecimal(x3, v3) : parseOther(x3, v3);
    }
    if (t === "bigint") {
      if (v3 < 0) {
        v3 = -v3;
        x3.s = -1;
      } else {
        x3.s = 1;
      }
      return parseDecimal(x3, v3.toString());
    }
    throw Error(invalidArgument + v3);
  }
  __name(Decimal2, "Decimal2");
  Decimal2.prototype = P;
  Decimal2.ROUND_UP = 0;
  Decimal2.ROUND_DOWN = 1;
  Decimal2.ROUND_CEIL = 2;
  Decimal2.ROUND_FLOOR = 3;
  Decimal2.ROUND_HALF_UP = 4;
  Decimal2.ROUND_HALF_DOWN = 5;
  Decimal2.ROUND_HALF_EVEN = 6;
  Decimal2.ROUND_HALF_CEIL = 7;
  Decimal2.ROUND_HALF_FLOOR = 8;
  Decimal2.EUCLID = 9;
  Decimal2.config = Decimal2.set = config2;
  Decimal2.clone = clone;
  Decimal2.isDecimal = isDecimalInstance;
  Decimal2.abs = abs;
  Decimal2.acos = acos;
  Decimal2.acosh = acosh;
  Decimal2.add = add;
  Decimal2.asin = asin;
  Decimal2.asinh = asinh;
  Decimal2.atan = atan;
  Decimal2.atanh = atanh;
  Decimal2.atan2 = atan2;
  Decimal2.cbrt = cbrt;
  Decimal2.ceil = ceil;
  Decimal2.clamp = clamp;
  Decimal2.cos = cos;
  Decimal2.cosh = cosh;
  Decimal2.div = div;
  Decimal2.exp = exp;
  Decimal2.floor = floor;
  Decimal2.hypot = hypot;
  Decimal2.ln = ln;
  Decimal2.log = log;
  Decimal2.log10 = log10;
  Decimal2.log2 = log2;
  Decimal2.max = max;
  Decimal2.min = min;
  Decimal2.mod = mod;
  Decimal2.mul = mul;
  Decimal2.pow = pow;
  Decimal2.random = random;
  Decimal2.round = round;
  Decimal2.sign = sign;
  Decimal2.sin = sin;
  Decimal2.sinh = sinh;
  Decimal2.sqrt = sqrt;
  Decimal2.sub = sub;
  Decimal2.sum = sum;
  Decimal2.tan = tan;
  Decimal2.tanh = tanh;
  Decimal2.trunc = trunc;
  if (obj === void 0) obj = {};
  if (obj) {
    if (obj.defaults !== true) {
      ps2 = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"];
      for (i = 0; i < ps2.length; ) if (!obj.hasOwnProperty(p3 = ps2[i++])) obj[p3] = this[p3];
    }
  }
  Decimal2.config(obj);
  return Decimal2;
}
__name(clone, "clone");
function div(x3, y3) {
  return new this(x3).div(y3);
}
__name(div, "div");
function exp(x3) {
  return new this(x3).exp();
}
__name(exp, "exp");
function floor(x3) {
  return finalise(x3 = new this(x3), x3.e + 1, 3);
}
__name(floor, "floor");
function hypot() {
  var i, n, t = new this(0);
  external = false;
  for (i = 0; i < arguments.length; ) {
    n = new this(arguments[i++]);
    if (!n.d) {
      if (n.s) {
        external = true;
        return new this(1 / 0);
      }
      t = n;
    } else if (t.d) {
      t = t.plus(n.times(n));
    }
  }
  external = true;
  return t.sqrt();
}
__name(hypot, "hypot");
function isDecimalInstance(obj) {
  return obj instanceof Decimal || obj && obj.toStringTag === tag || false;
}
__name(isDecimalInstance, "isDecimalInstance");
function ln(x3) {
  return new this(x3).ln();
}
__name(ln, "ln");
function log(x3, y3) {
  return new this(x3).log(y3);
}
__name(log, "log");
function log2(x3) {
  return new this(x3).log(2);
}
__name(log2, "log2");
function log10(x3) {
  return new this(x3).log(10);
}
__name(log10, "log10");
function max() {
  return maxOrMin(this, arguments, -1);
}
__name(max, "max");
function min() {
  return maxOrMin(this, arguments, 1);
}
__name(min, "min");
function mod(x3, y3) {
  return new this(x3).mod(y3);
}
__name(mod, "mod");
function mul(x3, y3) {
  return new this(x3).mul(y3);
}
__name(mul, "mul");
function pow(x3, y3) {
  return new this(x3).pow(y3);
}
__name(pow, "pow");
function random(sd) {
  var d, e6, k2, n, i = 0, r = new this(1), rd2 = [];
  if (sd === void 0) sd = this.precision;
  else checkInt32(sd, 1, MAX_DIGITS);
  k2 = Math.ceil(sd / LOG_BASE);
  if (!this.crypto) {
    for (; i < k2; ) rd2[i++] = Math.random() * 1e7 | 0;
  } else if (crypto.getRandomValues) {
    d = crypto.getRandomValues(new Uint32Array(k2));
    for (; i < k2; ) {
      n = d[i];
      if (n >= 429e7) {
        d[i] = crypto.getRandomValues(new Uint32Array(1))[0];
      } else {
        rd2[i++] = n % 1e7;
      }
    }
  } else if (crypto.randomBytes) {
    d = crypto.randomBytes(k2 *= 4);
    for (; i < k2; ) {
      n = d[i] + (d[i + 1] << 8) + (d[i + 2] << 16) + ((d[i + 3] & 127) << 24);
      if (n >= 214e7) {
        crypto.randomBytes(4).copy(d, i);
      } else {
        rd2.push(n % 1e7);
        i += 4;
      }
    }
    i = k2 / 4;
  } else {
    throw Error(cryptoUnavailable);
  }
  k2 = rd2[--i];
  sd %= LOG_BASE;
  if (k2 && sd) {
    n = mathpow(10, LOG_BASE - sd);
    rd2[i] = (k2 / n | 0) * n;
  }
  for (; rd2[i] === 0; i--) rd2.pop();
  if (i < 0) {
    e6 = 0;
    rd2 = [0];
  } else {
    e6 = -1;
    for (; rd2[0] === 0; e6 -= LOG_BASE) rd2.shift();
    for (k2 = 1, n = rd2[0]; n >= 10; n /= 10) k2++;
    if (k2 < LOG_BASE) e6 -= LOG_BASE - k2;
  }
  r.e = e6;
  r.d = rd2;
  return r;
}
__name(random, "random");
function round(x3) {
  return finalise(x3 = new this(x3), x3.e + 1, this.rounding);
}
__name(round, "round");
function sign(x3) {
  x3 = new this(x3);
  return x3.d ? x3.d[0] ? x3.s : 0 * x3.s : x3.s || NaN;
}
__name(sign, "sign");
function sin(x3) {
  return new this(x3).sin();
}
__name(sin, "sin");
function sinh(x3) {
  return new this(x3).sinh();
}
__name(sinh, "sinh");
function sqrt(x3) {
  return new this(x3).sqrt();
}
__name(sqrt, "sqrt");
function sub(x3, y3) {
  return new this(x3).sub(y3);
}
__name(sub, "sub");
function sum() {
  var i = 0, args = arguments, x3 = new this(args[i]);
  external = false;
  for (; x3.s && ++i < args.length; ) x3 = x3.plus(args[i]);
  external = true;
  return finalise(x3, this.precision, this.rounding);
}
__name(sum, "sum");
function tan(x3) {
  return new this(x3).tan();
}
__name(tan, "tan");
function tanh(x3) {
  return new this(x3).tanh();
}
__name(tanh, "tanh");
function trunc(x3) {
  return finalise(x3 = new this(x3), x3.e + 1, 1);
}
__name(trunc, "trunc");
P[Symbol.for("nodejs.util.inspect.custom")] = P.toString;
P[Symbol.toStringTag] = "Decimal";
var Decimal = P.constructor = clone(DEFAULTS);
LN10 = new Decimal(LN10);
PI = new Decimal(PI);
var Sql = class _Sql {
  static {
    __name(this, "_Sql");
  }
  constructor(rawStrings, rawValues) {
    if (rawStrings.length - 1 !== rawValues.length) {
      if (rawStrings.length === 0) {
        throw new TypeError("Expected at least 1 string");
      }
      throw new TypeError(`Expected ${rawStrings.length} strings to have ${rawStrings.length - 1} values`);
    }
    const valuesLength = rawValues.reduce((len, value) => len + (value instanceof _Sql ? value.values.length : 1), 0);
    this.values = new Array(valuesLength);
    this.strings = new Array(valuesLength + 1);
    this.strings[0] = rawStrings[0];
    let i = 0, pos = 0;
    while (i < rawValues.length) {
      const child = rawValues[i++];
      const rawString = rawStrings[i];
      if (child instanceof _Sql) {
        this.strings[pos] += child.strings[0];
        let childIndex = 0;
        while (childIndex < child.values.length) {
          this.values[pos++] = child.values[childIndex++];
          this.strings[pos] = child.strings[childIndex];
        }
        this.strings[pos] += rawString;
      } else {
        this.values[pos++] = child;
        this.strings[pos] = rawString;
      }
    }
  }
  get sql() {
    const len = this.strings.length;
    let i = 1;
    let value = this.strings[0];
    while (i < len)
      value += `?${this.strings[i++]}`;
    return value;
  }
  get statement() {
    const len = this.strings.length;
    let i = 1;
    let value = this.strings[0];
    while (i < len)
      value += `:${i}${this.strings[i++]}`;
    return value;
  }
  get text() {
    const len = this.strings.length;
    let i = 1;
    let value = this.strings[0];
    while (i < len)
      value += `$${i}${this.strings[i++]}`;
    return value;
  }
  inspect() {
    return {
      sql: this.sql,
      statement: this.statement,
      text: this.text,
      values: this.values
    };
  }
};
function raw2(value) {
  return new Sql([value], []);
}
__name(raw2, "raw");
var empty = raw2("");

// ../../node_modules/@prisma/client/runtime/wasm-compiler-edge.mjs
var Kl = Object.create;
var ar = Object.defineProperty;
var zl = Object.getOwnPropertyDescriptor;
var Zl = Object.getOwnPropertyNames;
var Yl = Object.getPrototypeOf;
var Xl = Object.prototype.hasOwnProperty;
var pe = /* @__PURE__ */ __name((e6, t) => () => (e6 && (t = e6(e6 = 0)), t), "pe");
var re = /* @__PURE__ */ __name((e6, t) => () => (t || e6((t = { exports: {} }).exports, t), t.exports), "re");
var Et = /* @__PURE__ */ __name((e6, t) => {
  for (var r in t) ar(e6, r, { get: t[r], enumerable: true });
}, "Et");
var Fi = /* @__PURE__ */ __name((e6, t, r, n) => {
  if (t && typeof t == "object" || typeof t == "function") for (let i of Zl(t)) !Xl.call(e6, i) && i !== r && ar(e6, i, { get: /* @__PURE__ */ __name(() => t[i], "get"), enumerable: !(n = zl(t, i)) || n.enumerable });
  return e6;
}, "Fi");
var Ne = /* @__PURE__ */ __name((e6, t, r) => (r = e6 != null ? Kl(Yl(e6)) : {}, Fi(t || !e6 || !e6.__esModule ? ar(r, "default", { value: e6, enumerable: true }) : r, e6)), "Ne");
var eu = /* @__PURE__ */ __name((e6) => Fi(ar({}, "__esModule", { value: true }), e6), "eu");
function yn(e6, t) {
  if (t = t.toLowerCase(), t === "utf8" || t === "utf-8") return new h(iu.encode(e6));
  if (t === "base64" || t === "base64url") return e6 = e6.replace(/-/g, "+").replace(/_/g, "/"), e6 = e6.replace(/[^A-Za-z0-9+/]/g, ""), new h([...atob(e6)].map((r) => r.charCodeAt(0)));
  if (t === "binary" || t === "ascii" || t === "latin1" || t === "latin-1") return new h([...e6].map((r) => r.charCodeAt(0)));
  if (t === "ucs2" || t === "ucs-2" || t === "utf16le" || t === "utf-16le") {
    let r = new h(e6.length * 2), n = new DataView(r.buffer);
    for (let i = 0; i < e6.length; i++) n.setUint16(i * 2, e6.charCodeAt(i), true);
    return r;
  }
  if (t === "hex") {
    let r = new h(e6.length / 2);
    for (let n = 0, i = 0; i < e6.length; i += 2, n++) r[n] = parseInt(e6.slice(i, i + 2), 16);
    return r;
  }
  $i(`encoding "${t}"`);
}
__name(yn, "yn");
function tu(e6) {
  let r = Object.getOwnPropertyNames(DataView.prototype).filter((a2) => a2.startsWith("get") || a2.startsWith("set")), n = r.map((a2) => a2.replace("get", "read").replace("set", "write")), i = /* @__PURE__ */ __name((a2, d) => function(f2 = 0) {
    return Q(f2, "offset"), te(f2, "offset"), J(f2, "offset", this.length - 1), new DataView(this.buffer)[r[a2]](f2, d);
  }, "i"), o2 = /* @__PURE__ */ __name((a2, d) => function(f2, P3 = 0) {
    let A2 = r[a2].match(/set(\w+\d+)/)[1].toLowerCase(), S2 = nu[A2];
    return Q(P3, "offset"), te(P3, "offset"), J(P3, "offset", this.length - 1), ru(f2, "value", S2[0], S2[1]), new DataView(this.buffer)[r[a2]](P3, f2, d), P3 + parseInt(r[a2].match(/\d+/)[0]) / 8;
  }, "o"), s = /* @__PURE__ */ __name((a2) => {
    a2.forEach((d) => {
      d.includes("Uint") && (e6[d.replace("Uint", "UInt")] = e6[d]), d.includes("Float64") && (e6[d.replace("Float64", "Double")] = e6[d]), d.includes("Float32") && (e6[d.replace("Float32", "Float")] = e6[d]);
    });
  }, "s");
  n.forEach((a2, d) => {
    a2.startsWith("read") && (e6[a2] = i(d, false), e6[a2 + "LE"] = i(d, true), e6[a2 + "BE"] = i(d, false)), a2.startsWith("write") && (e6[a2] = o2(d, false), e6[a2 + "LE"] = o2(d, true), e6[a2 + "BE"] = o2(d, false)), s([a2, a2 + "LE", a2 + "BE"]);
  });
}
__name(tu, "tu");
function $i(e6) {
  throw new Error(`Buffer polyfill does not implement "${e6}"`);
}
__name($i, "$i");
function lr(e6, t) {
  if (!(e6 instanceof Uint8Array)) throw new TypeError(`The "${t}" argument must be an instance of Buffer or Uint8Array`);
}
__name(lr, "lr");
function J(e6, t, r = au + 1) {
  if (e6 < 0 || e6 > r) {
    let n = new RangeError(`The value of "${t}" is out of range. It must be >= 0 && <= ${r}. Received ${e6}`);
    throw n.code = "ERR_OUT_OF_RANGE", n;
  }
}
__name(J, "J");
function Q(e6, t) {
  if (typeof e6 != "number") {
    let r = new TypeError(`The "${t}" argument must be of type number. Received type ${typeof e6}.`);
    throw r.code = "ERR_INVALID_ARG_TYPE", r;
  }
}
__name(Q, "Q");
function te(e6, t) {
  if (!Number.isInteger(e6) || Number.isNaN(e6)) {
    let r = new RangeError(`The value of "${t}" is out of range. It must be an integer. Received ${e6}`);
    throw r.code = "ERR_OUT_OF_RANGE", r;
  }
}
__name(te, "te");
function ru(e6, t, r, n) {
  if (e6 < r || e6 > n) {
    let i = new RangeError(`The value of "${t}" is out of range. It must be >= ${r} and <= ${n}. Received ${e6}`);
    throw i.code = "ERR_OUT_OF_RANGE", i;
  }
}
__name(ru, "ru");
function Ui(e6, t) {
  if (typeof e6 != "string") {
    let r = new TypeError(`The "${t}" argument must be of type string. Received type ${typeof e6}`);
    throw r.code = "ERR_INVALID_ARG_TYPE", r;
  }
}
__name(Ui, "Ui");
function lu(e6, t = "utf8") {
  return h.from(e6, t);
}
__name(lu, "lu");
var h;
var nu;
var iu;
var ou;
var su;
var au;
var y;
var hn;
var l = pe(() => {
  "use strict";
  h = class e6 extends Uint8Array {
    static {
      __name(this, "e");
    }
    _isBuffer = true;
    get offset() {
      return this.byteOffset;
    }
    static alloc(t, r = 0, n = "utf8") {
      return Ui(n, "encoding"), e6.allocUnsafe(t).fill(r, n);
    }
    static allocUnsafe(t) {
      return e6.from(t);
    }
    static allocUnsafeSlow(t) {
      return e6.from(t);
    }
    static isBuffer(t) {
      return t && !!t._isBuffer;
    }
    static byteLength(t, r = "utf8") {
      if (typeof t == "string") return yn(t, r).byteLength;
      if (t && t.byteLength) return t.byteLength;
      let n = new TypeError('The "string" argument must be of type string or an instance of Buffer or ArrayBuffer.');
      throw n.code = "ERR_INVALID_ARG_TYPE", n;
    }
    static isEncoding(t) {
      return su.includes(t);
    }
    static compare(t, r) {
      lr(t, "buff1"), lr(r, "buff2");
      for (let n = 0; n < t.length; n++) {
        if (t[n] < r[n]) return -1;
        if (t[n] > r[n]) return 1;
      }
      return t.length === r.length ? 0 : t.length > r.length ? 1 : -1;
    }
    static from(t, r = "utf8") {
      if (t && typeof t == "object" && t.type === "Buffer") return new e6(t.data);
      if (typeof t == "number") return new e6(new Uint8Array(t));
      if (typeof t == "string") return yn(t, r);
      if (ArrayBuffer.isView(t)) {
        let { byteOffset: n, byteLength: i, buffer: o2 } = t;
        return "map" in t && typeof t.map == "function" ? new e6(t.map((s) => s % 256), n, i) : new e6(o2, n, i);
      }
      if (t && typeof t == "object" && ("length" in t || "byteLength" in t || "buffer" in t)) return new e6(t);
      throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
    }
    static concat(t, r) {
      if (t.length === 0) return e6.alloc(0);
      let n = [].concat(...t.map((o2) => [...o2])), i = e6.alloc(r !== void 0 ? r : n.length);
      return i.set(r !== void 0 ? n.slice(0, r) : n), i;
    }
    slice(t = 0, r = this.length) {
      return this.subarray(t, r);
    }
    subarray(t = 0, r = this.length) {
      return Object.setPrototypeOf(super.subarray(t, r), e6.prototype);
    }
    reverse() {
      return super.reverse(), this;
    }
    readIntBE(t, r) {
      Q(t, "offset"), te(t, "offset"), J(t, "offset", this.length - 1), Q(r, "byteLength"), te(r, "byteLength");
      let n = new DataView(this.buffer, t, r), i = 0;
      for (let o2 = 0; o2 < r; o2++) i = i * 256 + n.getUint8(o2);
      return n.getUint8(0) & 128 && (i -= Math.pow(256, r)), i;
    }
    readIntLE(t, r) {
      Q(t, "offset"), te(t, "offset"), J(t, "offset", this.length - 1), Q(r, "byteLength"), te(r, "byteLength");
      let n = new DataView(this.buffer, t, r), i = 0;
      for (let o2 = 0; o2 < r; o2++) i += n.getUint8(o2) * Math.pow(256, o2);
      return n.getUint8(r - 1) & 128 && (i -= Math.pow(256, r)), i;
    }
    readUIntBE(t, r) {
      Q(t, "offset"), te(t, "offset"), J(t, "offset", this.length - 1), Q(r, "byteLength"), te(r, "byteLength");
      let n = new DataView(this.buffer, t, r), i = 0;
      for (let o2 = 0; o2 < r; o2++) i = i * 256 + n.getUint8(o2);
      return i;
    }
    readUintBE(t, r) {
      return this.readUIntBE(t, r);
    }
    readUIntLE(t, r) {
      Q(t, "offset"), te(t, "offset"), J(t, "offset", this.length - 1), Q(r, "byteLength"), te(r, "byteLength");
      let n = new DataView(this.buffer, t, r), i = 0;
      for (let o2 = 0; o2 < r; o2++) i += n.getUint8(o2) * Math.pow(256, o2);
      return i;
    }
    readUintLE(t, r) {
      return this.readUIntLE(t, r);
    }
    writeIntBE(t, r, n) {
      return t = t < 0 ? t + Math.pow(256, n) : t, this.writeUIntBE(t, r, n);
    }
    writeIntLE(t, r, n) {
      return t = t < 0 ? t + Math.pow(256, n) : t, this.writeUIntLE(t, r, n);
    }
    writeUIntBE(t, r, n) {
      Q(r, "offset"), te(r, "offset"), J(r, "offset", this.length - 1), Q(n, "byteLength"), te(n, "byteLength");
      let i = new DataView(this.buffer, r, n);
      for (let o2 = n - 1; o2 >= 0; o2--) i.setUint8(o2, t & 255), t = t / 256;
      return r + n;
    }
    writeUintBE(t, r, n) {
      return this.writeUIntBE(t, r, n);
    }
    writeUIntLE(t, r, n) {
      Q(r, "offset"), te(r, "offset"), J(r, "offset", this.length - 1), Q(n, "byteLength"), te(n, "byteLength");
      let i = new DataView(this.buffer, r, n);
      for (let o2 = 0; o2 < n; o2++) i.setUint8(o2, t & 255), t = t / 256;
      return r + n;
    }
    writeUintLE(t, r, n) {
      return this.writeUIntLE(t, r, n);
    }
    toJSON() {
      return { type: "Buffer", data: Array.from(this) };
    }
    swap16() {
      let t = new DataView(this.buffer, this.byteOffset, this.byteLength);
      for (let r = 0; r < this.length; r += 2) t.setUint16(r, t.getUint16(r, true), false);
      return this;
    }
    swap32() {
      let t = new DataView(this.buffer, this.byteOffset, this.byteLength);
      for (let r = 0; r < this.length; r += 4) t.setUint32(r, t.getUint32(r, true), false);
      return this;
    }
    swap64() {
      let t = new DataView(this.buffer, this.byteOffset, this.byteLength);
      for (let r = 0; r < this.length; r += 8) t.setBigUint64(r, t.getBigUint64(r, true), false);
      return this;
    }
    compare(t, r = 0, n = t.length, i = 0, o2 = this.length) {
      return lr(t, "target"), Q(r, "targetStart"), Q(n, "targetEnd"), Q(i, "sourceStart"), Q(o2, "sourceEnd"), J(r, "targetStart"), J(n, "targetEnd", t.length), J(i, "sourceStart"), J(o2, "sourceEnd", this.length), e6.compare(this.slice(i, o2), t.slice(r, n));
    }
    equals(t) {
      return lr(t, "otherBuffer"), this.length === t.length && this.every((r, n) => r === t[n]);
    }
    copy(t, r = 0, n = 0, i = this.length) {
      J(r, "targetStart"), J(n, "sourceStart", this.length), J(i, "sourceEnd"), r >>>= 0, n >>>= 0, i >>>= 0;
      let o2 = 0;
      for (; n < i && !(this[n] === void 0 || t[r] === void 0); ) t[r] = this[n], o2++, n++, r++;
      return o2;
    }
    write(t, r, n, i = "utf8") {
      let o2 = typeof r == "string" ? 0 : r ?? 0, s = typeof n == "string" ? this.length - o2 : n ?? this.length - o2;
      return i = typeof r == "string" ? r : typeof n == "string" ? n : i, Q(o2, "offset"), Q(s, "length"), J(o2, "offset", this.length), J(s, "length", this.length), (i === "ucs2" || i === "ucs-2" || i === "utf16le" || i === "utf-16le") && (s = s - s % 2), yn(t, i).copy(this, o2, 0, s);
    }
    fill(t = 0, r = 0, n = this.length, i = "utf-8") {
      let o2 = typeof r == "string" ? 0 : r, s = typeof n == "string" ? this.length : n;
      if (i = typeof r == "string" ? r : typeof n == "string" ? n : i, t = e6.from(typeof t == "number" ? [t] : t ?? [], i), Ui(i, "encoding"), J(o2, "offset", this.length), J(s, "end", this.length), t.length !== 0) for (let a2 = o2; a2 < s; a2 += t.length) super.set(t.slice(0, t.length + a2 >= this.length ? this.length - a2 : t.length), a2);
      return this;
    }
    includes(t, r = null, n = "utf-8") {
      return this.indexOf(t, r, n) !== -1;
    }
    lastIndexOf(t, r = null, n = "utf-8") {
      return this.indexOf(t, r, n, true);
    }
    indexOf(t, r = null, n = "utf-8", i = false) {
      let o2 = i ? this.findLastIndex.bind(this) : this.findIndex.bind(this);
      n = typeof r == "string" ? r : n;
      let s = e6.from(typeof t == "number" ? [t] : t, n), a2 = typeof r == "string" ? 0 : r;
      return a2 = typeof r == "number" ? a2 : null, a2 = Number.isNaN(a2) ? null : a2, a2 ??= i ? this.length : 0, a2 = a2 < 0 ? this.length + a2 : a2, s.length === 0 && i === false ? a2 >= this.length ? this.length : a2 : s.length === 0 && i === true ? (a2 >= this.length ? this.length : a2) || this.length : o2((d, f2) => (i ? f2 <= a2 : f2 >= a2) && this[f2] === s[0] && s.every((A2, S2) => this[f2 + S2] === A2));
    }
    toString(t = "utf8", r = 0, n = this.length) {
      if (r = r < 0 ? 0 : r, t = t.toString().toLowerCase(), n <= 0) return "";
      if (t === "utf8" || t === "utf-8") return ou.decode(this.slice(r, n));
      if (t === "base64" || t === "base64url") {
        let i = btoa(this.reduce((o2, s) => o2 + hn(s), ""));
        return t === "base64url" ? i.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : i;
      }
      if (t === "binary" || t === "ascii" || t === "latin1" || t === "latin-1") return this.slice(r, n).reduce((i, o2) => i + hn(o2 & (t === "ascii" ? 127 : 255)), "");
      if (t === "ucs2" || t === "ucs-2" || t === "utf16le" || t === "utf-16le") {
        let i = new DataView(this.buffer.slice(r, n));
        return Array.from({ length: i.byteLength / 2 }, (o2, s) => s * 2 + 1 < i.byteLength ? hn(i.getUint16(s * 2, true)) : "").join("");
      }
      if (t === "hex") return this.slice(r, n).reduce((i, o2) => i + o2.toString(16).padStart(2, "0"), "");
      $i(`encoding "${t}"`);
    }
    toLocaleString() {
      return this.toString();
    }
    inspect() {
      return `<Buffer ${this.toString("hex").match(/.{1,2}/g).join(" ")}>`;
    }
  };
  nu = { int8: [-128, 127], int16: [-32768, 32767], int32: [-2147483648, 2147483647], uint8: [0, 255], uint16: [0, 65535], uint32: [0, 4294967295], float32: [-1 / 0, 1 / 0], float64: [-1 / 0, 1 / 0], bigint64: [-0x8000000000000000n, 0x7fffffffffffffffn], biguint64: [0n, 0xffffffffffffffffn] }, iu = new TextEncoder(), ou = new TextDecoder(), su = ["utf8", "utf-8", "hex", "base64", "ascii", "binary", "base64url", "ucs2", "ucs-2", "utf16le", "utf-16le", "latin1", "latin-1"], au = 4294967295;
  tu(h.prototype);
  y = new Proxy(lu, { construct(e6, [t, r]) {
    return h.from(t, r);
  }, get(e6, t) {
    return h[t];
  } }), hn = String.fromCodePoint;
});
var g;
var x;
var u = pe(() => {
  "use strict";
  g = { nextTick: /* @__PURE__ */ __name((e6, ...t) => {
    setTimeout(() => {
      e6(...t);
    }, 0);
  }, "nextTick"), env: {}, version: "", cwd: /* @__PURE__ */ __name(() => "/", "cwd"), stderr: {}, argv: ["/bin/node"], pid: 1e4 }, { cwd: x } = g;
});
var w;
var c = pe(() => {
  "use strict";
  w = globalThis.performance ?? (() => {
    let e6 = Date.now();
    return { now: /* @__PURE__ */ __name(() => Date.now() - e6, "now") };
  })();
});
var b;
var p = pe(() => {
  "use strict";
  b = /* @__PURE__ */ __name(() => {
  }, "b");
  b.prototype = b;
});
function ji(e6, t) {
  var r, n, i, o2, s, a2, d, f2, P3 = e6.constructor, A2 = P3.precision;
  if (!e6.s || !t.s) return t.s || (t = new P3(e6)), V ? L(t, A2) : t;
  if (d = e6.d, f2 = t.d, s = e6.e, i = t.e, d = d.slice(), o2 = s - i, o2) {
    for (o2 < 0 ? (n = d, o2 = -o2, a2 = f2.length) : (n = f2, i = s, a2 = d.length), s = Math.ceil(A2 / U), a2 = s > a2 ? s + 1 : a2 + 1, o2 > a2 && (o2 = a2, n.length = 1), n.reverse(); o2--; ) n.push(0);
    n.reverse();
  }
  for (a2 = d.length, o2 = f2.length, a2 - o2 < 0 && (o2 = a2, n = f2, f2 = d, d = n), r = 0; o2; ) r = (d[--o2] = d[o2] + f2[o2] + r) / W | 0, d[o2] %= W;
  for (r && (d.unshift(r), ++i), a2 = d.length; d[--a2] == 0; ) d.pop();
  return t.d = d, t.e = i, V ? L(t, A2) : t;
}
__name(ji, "ji");
function de(e6, t, r) {
  if (e6 !== ~~e6 || e6 < t || e6 > r) throw Error(Le + e6);
}
__name(de, "de");
function me(e6) {
  var t, r, n, i = e6.length - 1, o2 = "", s = e6[0];
  if (i > 0) {
    for (o2 += s, t = 1; t < i; t++) n = e6[t] + "", r = U - n.length, r && (o2 += ve(r)), o2 += n;
    s = e6[t], n = s + "", r = U - n.length, r && (o2 += ve(r));
  } else if (s === 0) return "0";
  for (; s % 10 === 0; ) s /= 10;
  return o2 + s;
}
__name(me, "me");
function Qi(e6, t) {
  var r, n, i, o2, s, a2, d = 0, f2 = 0, P3 = e6.constructor, A2 = P3.precision;
  if (H(e6) > 16) throw Error(bn + H(e6));
  if (!e6.s) return new P3(ne);
  for (t == null ? (V = false, a2 = A2) : a2 = t, s = new P3(0.03125); e6.abs().gte(0.1); ) e6 = e6.times(s), f2 += 5;
  for (n = Math.log(De(2, f2)) / Math.LN10 * 2 + 5 | 0, a2 += n, r = i = o2 = new P3(ne), P3.precision = a2; ; ) {
    if (i = L(i.times(e6), a2), r = r.times(++d), s = o2.plus(Ee(i, r, a2)), me(s.d).slice(0, a2) === me(o2.d).slice(0, a2)) {
      for (; f2--; ) o2 = L(o2.times(o2), a2);
      return P3.precision = A2, t == null ? (V = true, L(o2, A2)) : o2;
    }
    o2 = s;
  }
}
__name(Qi, "Qi");
function H(e6) {
  for (var t = e6.e * U, r = e6.d[0]; r >= 10; r /= 10) t++;
  return t;
}
__name(H, "H");
function wn(e6, t, r) {
  if (t > e6.LN10.sd()) throw V = true, r && (e6.precision = r), Error(oe + "LN10 precision limit exceeded");
  return L(new e6(e6.LN10), t);
}
__name(wn, "wn");
function ve(e6) {
  for (var t = ""; e6--; ) t += "0";
  return t;
}
__name(ve, "ve");
function Tt(e6, t) {
  var r, n, i, o2, s, a2, d, f2, P3, A2 = 1, S2 = 10, C2 = e6, M2 = C2.d, R2 = C2.constructor, k2 = R2.precision;
  if (C2.s < 1) throw Error(oe + (C2.s ? "NaN" : "-Infinity"));
  if (C2.eq(ne)) return new R2(0);
  if (t == null ? (V = false, f2 = k2) : f2 = t, C2.eq(10)) return t == null && (V = true), wn(R2, f2);
  if (f2 += S2, R2.precision = f2, r = me(M2), n = r.charAt(0), o2 = H(C2), Math.abs(o2) < 15e14) {
    for (; n < 7 && n != 1 || n == 1 && r.charAt(1) > 3; ) C2 = C2.times(e6), r = me(C2.d), n = r.charAt(0), A2++;
    o2 = H(C2), n > 1 ? (C2 = new R2("0." + r), o2++) : C2 = new R2(n + "." + r.slice(1));
  } else return d = wn(R2, f2 + 2, k2).times(o2 + ""), C2 = Tt(new R2(n + "." + r.slice(1)), f2 - S2).plus(d), R2.precision = k2, t == null ? (V = true, L(C2, k2)) : C2;
  for (a2 = s = C2 = Ee(C2.minus(ne), C2.plus(ne), f2), P3 = L(C2.times(C2), f2), i = 3; ; ) {
    if (s = L(s.times(P3), f2), d = a2.plus(Ee(s, new R2(i), f2)), me(d.d).slice(0, f2) === me(a2.d).slice(0, f2)) return a2 = a2.times(2), o2 !== 0 && (a2 = a2.plus(wn(R2, f2 + 2, k2).times(o2 + ""))), a2 = Ee(a2, new R2(A2), f2), R2.precision = k2, t == null ? (V = true, L(a2, k2)) : a2;
    a2 = d, i += 2;
  }
}
__name(Tt, "Tt");
function qi(e6, t) {
  var r, n, i;
  for ((r = t.indexOf(".")) > -1 && (t = t.replace(".", "")), (n = t.search(/e/i)) > 0 ? (r < 0 && (r = n), r += +t.slice(n + 1), t = t.substring(0, n)) : r < 0 && (r = t.length), n = 0; t.charCodeAt(n) === 48; ) ++n;
  for (i = t.length; t.charCodeAt(i - 1) === 48; ) --i;
  if (t = t.slice(n, i), t) {
    if (i -= n, r = r - n - 1, e6.e = Ke(r / U), e6.d = [], n = (r + 1) % U, r < 0 && (n += U), n < i) {
      for (n && e6.d.push(+t.slice(0, n)), i -= U; n < i; ) e6.d.push(+t.slice(n, n += U));
      t = t.slice(n), n = U - t.length;
    } else n -= i;
    for (; n--; ) t += "0";
    if (e6.d.push(+t), V && (e6.e > ur || e6.e < -ur)) throw Error(bn + r);
  } else e6.s = 0, e6.e = 0, e6.d = [0];
  return e6;
}
__name(qi, "qi");
function L(e6, t, r) {
  var n, i, o2, s, a2, d, f2, P3, A2 = e6.d;
  for (s = 1, o2 = A2[0]; o2 >= 10; o2 /= 10) s++;
  if (n = t - s, n < 0) n += U, i = t, f2 = A2[P3 = 0];
  else {
    if (P3 = Math.ceil((n + 1) / U), o2 = A2.length, P3 >= o2) return e6;
    for (f2 = o2 = A2[P3], s = 1; o2 >= 10; o2 /= 10) s++;
    n %= U, i = n - U + s;
  }
  if (r !== void 0 && (o2 = De(10, s - i - 1), a2 = f2 / o2 % 10 | 0, d = t < 0 || A2[P3 + 1] !== void 0 || f2 % o2, d = r < 4 ? (a2 || d) && (r == 0 || r == (e6.s < 0 ? 3 : 2)) : a2 > 5 || a2 == 5 && (r == 4 || d || r == 6 && (n > 0 ? i > 0 ? f2 / De(10, s - i) : 0 : A2[P3 - 1]) % 10 & 1 || r == (e6.s < 0 ? 8 : 7))), t < 1 || !A2[0]) return d ? (o2 = H(e6), A2.length = 1, t = t - o2 - 1, A2[0] = De(10, (U - t % U) % U), e6.e = Ke(-t / U) || 0) : (A2.length = 1, A2[0] = e6.e = e6.s = 0), e6;
  if (n == 0 ? (A2.length = P3, o2 = 1, P3--) : (A2.length = P3 + 1, o2 = De(10, U - n), A2[P3] = i > 0 ? (f2 / De(10, s - i) % De(10, i) | 0) * o2 : 0), d) for (; ; ) if (P3 == 0) {
    (A2[0] += o2) == W && (A2[0] = 1, ++e6.e);
    break;
  } else {
    if (A2[P3] += o2, A2[P3] != W) break;
    A2[P3--] = 0, o2 = 1;
  }
  for (n = A2.length; A2[--n] === 0; ) A2.pop();
  if (V && (e6.e > ur || e6.e < -ur)) throw Error(bn + H(e6));
  return e6;
}
__name(L, "L");
function Hi(e6, t) {
  var r, n, i, o2, s, a2, d, f2, P3, A2, S2 = e6.constructor, C2 = S2.precision;
  if (!e6.s || !t.s) return t.s ? t.s = -t.s : t = new S2(e6), V ? L(t, C2) : t;
  if (d = e6.d, A2 = t.d, n = t.e, f2 = e6.e, d = d.slice(), s = f2 - n, s) {
    for (P3 = s < 0, P3 ? (r = d, s = -s, a2 = A2.length) : (r = A2, n = f2, a2 = d.length), i = Math.max(Math.ceil(C2 / U), a2) + 2, s > i && (s = i, r.length = 1), r.reverse(), i = s; i--; ) r.push(0);
    r.reverse();
  } else {
    for (i = d.length, a2 = A2.length, P3 = i < a2, P3 && (a2 = i), i = 0; i < a2; i++) if (d[i] != A2[i]) {
      P3 = d[i] < A2[i];
      break;
    }
    s = 0;
  }
  for (P3 && (r = d, d = A2, A2 = r, t.s = -t.s), a2 = d.length, i = A2.length - a2; i > 0; --i) d[a2++] = 0;
  for (i = A2.length; i > s; ) {
    if (d[--i] < A2[i]) {
      for (o2 = i; o2 && d[--o2] === 0; ) d[o2] = W - 1;
      --d[o2], d[i] += W;
    }
    d[i] -= A2[i];
  }
  for (; d[--a2] === 0; ) d.pop();
  for (; d[0] === 0; d.shift()) --n;
  return d[0] ? (t.d = d, t.e = n, V ? L(t, C2) : t) : new S2(0);
}
__name(Hi, "Hi");
function _e(e6, t, r) {
  var n, i = H(e6), o2 = me(e6.d), s = o2.length;
  return t ? (r && (n = r - s) > 0 ? o2 = o2.charAt(0) + "." + o2.slice(1) + ve(n) : s > 1 && (o2 = o2.charAt(0) + "." + o2.slice(1)), o2 = o2 + (i < 0 ? "e" : "e+") + i) : i < 0 ? (o2 = "0." + ve(-i - 1) + o2, r && (n = r - s) > 0 && (o2 += ve(n))) : i >= s ? (o2 += ve(i + 1 - s), r && (n = r - i - 1) > 0 && (o2 = o2 + "." + ve(n))) : ((n = i + 1) < s && (o2 = o2.slice(0, n) + "." + o2.slice(n)), r && (n = r - s) > 0 && (i + 1 === s && (o2 += "."), o2 += ve(n))), e6.s < 0 ? "-" + o2 : o2;
}
__name(_e, "_e");
function Vi(e6, t) {
  if (e6.length > t) return e6.length = t, true;
}
__name(Vi, "Vi");
function Ji(e6) {
  var t, r, n;
  function i(o2) {
    var s = this;
    if (!(s instanceof i)) return new i(o2);
    if (s.constructor = i, o2 instanceof i) {
      s.s = o2.s, s.e = o2.e, s.d = (o2 = o2.d) ? o2.slice() : o2;
      return;
    }
    if (typeof o2 == "number") {
      if (o2 * 0 !== 0) throw Error(Le + o2);
      if (o2 > 0) s.s = 1;
      else if (o2 < 0) o2 = -o2, s.s = -1;
      else {
        s.s = 0, s.e = 0, s.d = [0];
        return;
      }
      if (o2 === ~~o2 && o2 < 1e7) {
        s.e = 0, s.d = [o2];
        return;
      }
      return qi(s, o2.toString());
    } else if (typeof o2 != "string") throw Error(Le + o2);
    if (o2.charCodeAt(0) === 45 ? (o2 = o2.slice(1), s.s = -1) : s.s = 1, cu.test(o2)) qi(s, o2);
    else throw Error(Le + o2);
  }
  __name(i, "i");
  if (i.prototype = v, i.ROUND_UP = 0, i.ROUND_DOWN = 1, i.ROUND_CEIL = 2, i.ROUND_FLOOR = 3, i.ROUND_HALF_UP = 4, i.ROUND_HALF_DOWN = 5, i.ROUND_HALF_EVEN = 6, i.ROUND_HALF_CEIL = 7, i.ROUND_HALF_FLOOR = 8, i.clone = Ji, i.config = i.set = pu, e6 === void 0 && (e6 = {}), e6) for (n = ["precision", "rounding", "toExpNeg", "toExpPos", "LN10"], t = 0; t < n.length; ) e6.hasOwnProperty(r = n[t++]) || (e6[r] = this[r]);
  return i.config(e6), i;
}
__name(Ji, "Ji");
function pu(e6) {
  if (!e6 || typeof e6 != "object") throw Error(oe + "Object expected");
  var t, r, n, i = ["precision", 1, Ge, "rounding", 0, 8, "toExpNeg", -1 / 0, 0, "toExpPos", 0, 1 / 0];
  for (t = 0; t < i.length; t += 3) if ((n = e6[r = i[t]]) !== void 0) if (Ke(n) === n && n >= i[t + 1] && n <= i[t + 2]) this[r] = n;
  else throw Error(Le + r + ": " + n);
  if ((n = e6[r = "LN10"]) !== void 0) if (n == Math.LN10) this[r] = new this(n);
  else throw Error(Le + r + ": " + n);
  return this;
}
__name(pu, "pu");
var Ge;
var uu;
var Wi;
var V;
var oe;
var Le;
var bn;
var Ke;
var De;
var cu;
var ne;
var W;
var U;
var Bi;
var ur;
var v;
var Ee;
var Wi;
var Gi = pe(() => {
  "use strict";
  l();
  u();
  c();
  p();
  m();
  Ge = 1e9, uu = { precision: 20, rounding: 4, toExpNeg: -7, toExpPos: 21, LN10: "2.302585092994045684017991454684364207601101488628772976033327900967572609677352480235997205089598298341967784042286" }, V = true, oe = "[DecimalError] ", Le = oe + "Invalid argument: ", bn = oe + "Exponent out of range: ", Ke = Math.floor, De = Math.pow, cu = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i, W = 1e7, U = 7, Bi = 9007199254740991, ur = Ke(Bi / U), v = {};
  v.absoluteValue = v.abs = function() {
    var e6 = new this.constructor(this);
    return e6.s && (e6.s = 1), e6;
  };
  v.comparedTo = v.cmp = function(e6) {
    var t, r, n, i, o2 = this;
    if (e6 = new o2.constructor(e6), o2.s !== e6.s) return o2.s || -e6.s;
    if (o2.e !== e6.e) return o2.e > e6.e ^ o2.s < 0 ? 1 : -1;
    for (n = o2.d.length, i = e6.d.length, t = 0, r = n < i ? n : i; t < r; ++t) if (o2.d[t] !== e6.d[t]) return o2.d[t] > e6.d[t] ^ o2.s < 0 ? 1 : -1;
    return n === i ? 0 : n > i ^ o2.s < 0 ? 1 : -1;
  };
  v.decimalPlaces = v.dp = function() {
    var e6 = this, t = e6.d.length - 1, r = (t - e6.e) * U;
    if (t = e6.d[t], t) for (; t % 10 == 0; t /= 10) r--;
    return r < 0 ? 0 : r;
  };
  v.dividedBy = v.div = function(e6) {
    return Ee(this, new this.constructor(e6));
  };
  v.dividedToIntegerBy = v.idiv = function(e6) {
    var t = this, r = t.constructor;
    return L(Ee(t, new r(e6), 0, 1), r.precision);
  };
  v.equals = v.eq = function(e6) {
    return !this.cmp(e6);
  };
  v.exponent = function() {
    return H(this);
  };
  v.greaterThan = v.gt = function(e6) {
    return this.cmp(e6) > 0;
  };
  v.greaterThanOrEqualTo = v.gte = function(e6) {
    return this.cmp(e6) >= 0;
  };
  v.isInteger = v.isint = function() {
    return this.e > this.d.length - 2;
  };
  v.isNegative = v.isneg = function() {
    return this.s < 0;
  };
  v.isPositive = v.ispos = function() {
    return this.s > 0;
  };
  v.isZero = function() {
    return this.s === 0;
  };
  v.lessThan = v.lt = function(e6) {
    return this.cmp(e6) < 0;
  };
  v.lessThanOrEqualTo = v.lte = function(e6) {
    return this.cmp(e6) < 1;
  };
  v.logarithm = v.log = function(e6) {
    var t, r = this, n = r.constructor, i = n.precision, o2 = i + 5;
    if (e6 === void 0) e6 = new n(10);
    else if (e6 = new n(e6), e6.s < 1 || e6.eq(ne)) throw Error(oe + "NaN");
    if (r.s < 1) throw Error(oe + (r.s ? "NaN" : "-Infinity"));
    return r.eq(ne) ? new n(0) : (V = false, t = Ee(Tt(r, o2), Tt(e6, o2), o2), V = true, L(t, i));
  };
  v.minus = v.sub = function(e6) {
    var t = this;
    return e6 = new t.constructor(e6), t.s == e6.s ? Hi(t, e6) : ji(t, (e6.s = -e6.s, e6));
  };
  v.modulo = v.mod = function(e6) {
    var t, r = this, n = r.constructor, i = n.precision;
    if (e6 = new n(e6), !e6.s) throw Error(oe + "NaN");
    return r.s ? (V = false, t = Ee(r, e6, 0, 1).times(e6), V = true, r.minus(t)) : L(new n(r), i);
  };
  v.naturalExponential = v.exp = function() {
    return Qi(this);
  };
  v.naturalLogarithm = v.ln = function() {
    return Tt(this);
  };
  v.negated = v.neg = function() {
    var e6 = new this.constructor(this);
    return e6.s = -e6.s || 0, e6;
  };
  v.plus = v.add = function(e6) {
    var t = this;
    return e6 = new t.constructor(e6), t.s == e6.s ? ji(t, e6) : Hi(t, (e6.s = -e6.s, e6));
  };
  v.precision = v.sd = function(e6) {
    var t, r, n, i = this;
    if (e6 !== void 0 && e6 !== !!e6 && e6 !== 1 && e6 !== 0) throw Error(Le + e6);
    if (t = H(i) + 1, n = i.d.length - 1, r = n * U + 1, n = i.d[n], n) {
      for (; n % 10 == 0; n /= 10) r--;
      for (n = i.d[0]; n >= 10; n /= 10) r++;
    }
    return e6 && t > r ? t : r;
  };
  v.squareRoot = v.sqrt = function() {
    var e6, t, r, n, i, o2, s, a2 = this, d = a2.constructor;
    if (a2.s < 1) {
      if (!a2.s) return new d(0);
      throw Error(oe + "NaN");
    }
    for (e6 = H(a2), V = false, i = Math.sqrt(+a2), i == 0 || i == 1 / 0 ? (t = me(a2.d), (t.length + e6) % 2 == 0 && (t += "0"), i = Math.sqrt(t), e6 = Ke((e6 + 1) / 2) - (e6 < 0 || e6 % 2), i == 1 / 0 ? t = "5e" + e6 : (t = i.toExponential(), t = t.slice(0, t.indexOf("e") + 1) + e6), n = new d(t)) : n = new d(i.toString()), r = d.precision, i = s = r + 3; ; ) if (o2 = n, n = o2.plus(Ee(a2, o2, s + 2)).times(0.5), me(o2.d).slice(0, s) === (t = me(n.d)).slice(0, s)) {
      if (t = t.slice(s - 3, s + 1), i == s && t == "4999") {
        if (L(o2, r + 1, 0), o2.times(o2).eq(a2)) {
          n = o2;
          break;
        }
      } else if (t != "9999") break;
      s += 4;
    }
    return V = true, L(n, r);
  };
  v.times = v.mul = function(e6) {
    var t, r, n, i, o2, s, a2, d, f2, P3 = this, A2 = P3.constructor, S2 = P3.d, C2 = (e6 = new A2(e6)).d;
    if (!P3.s || !e6.s) return new A2(0);
    for (e6.s *= P3.s, r = P3.e + e6.e, d = S2.length, f2 = C2.length, d < f2 && (o2 = S2, S2 = C2, C2 = o2, s = d, d = f2, f2 = s), o2 = [], s = d + f2, n = s; n--; ) o2.push(0);
    for (n = f2; --n >= 0; ) {
      for (t = 0, i = d + n; i > n; ) a2 = o2[i] + C2[n] * S2[i - n - 1] + t, o2[i--] = a2 % W | 0, t = a2 / W | 0;
      o2[i] = (o2[i] + t) % W | 0;
    }
    for (; !o2[--s]; ) o2.pop();
    return t ? ++r : o2.shift(), e6.d = o2, e6.e = r, V ? L(e6, A2.precision) : e6;
  };
  v.toDecimalPlaces = v.todp = function(e6, t) {
    var r = this, n = r.constructor;
    return r = new n(r), e6 === void 0 ? r : (de(e6, 0, Ge), t === void 0 ? t = n.rounding : de(t, 0, 8), L(r, e6 + H(r) + 1, t));
  };
  v.toExponential = function(e6, t) {
    var r, n = this, i = n.constructor;
    return e6 === void 0 ? r = _e(n, true) : (de(e6, 0, Ge), t === void 0 ? t = i.rounding : de(t, 0, 8), n = L(new i(n), e6 + 1, t), r = _e(n, true, e6 + 1)), r;
  };
  v.toFixed = function(e6, t) {
    var r, n, i = this, o2 = i.constructor;
    return e6 === void 0 ? _e(i) : (de(e6, 0, Ge), t === void 0 ? t = o2.rounding : de(t, 0, 8), n = L(new o2(i), e6 + H(i) + 1, t), r = _e(n.abs(), false, e6 + H(n) + 1), i.isneg() && !i.isZero() ? "-" + r : r);
  };
  v.toInteger = v.toint = function() {
    var e6 = this, t = e6.constructor;
    return L(new t(e6), H(e6) + 1, t.rounding);
  };
  v.toNumber = function() {
    return +this;
  };
  v.toPower = v.pow = function(e6) {
    var t, r, n, i, o2, s, a2 = this, d = a2.constructor, f2 = 12, P3 = +(e6 = new d(e6));
    if (!e6.s) return new d(ne);
    if (a2 = new d(a2), !a2.s) {
      if (e6.s < 1) throw Error(oe + "Infinity");
      return a2;
    }
    if (a2.eq(ne)) return a2;
    if (n = d.precision, e6.eq(ne)) return L(a2, n);
    if (t = e6.e, r = e6.d.length - 1, s = t >= r, o2 = a2.s, s) {
      if ((r = P3 < 0 ? -P3 : P3) <= Bi) {
        for (i = new d(ne), t = Math.ceil(n / U + 4), V = false; r % 2 && (i = i.times(a2), Vi(i.d, t)), r = Ke(r / 2), r !== 0; ) a2 = a2.times(a2), Vi(a2.d, t);
        return V = true, e6.s < 0 ? new d(ne).div(i) : L(i, n);
      }
    } else if (o2 < 0) throw Error(oe + "NaN");
    return o2 = o2 < 0 && e6.d[Math.max(t, r)] & 1 ? -1 : 1, a2.s = 1, V = false, i = e6.times(Tt(a2, n + f2)), V = true, i = Qi(i), i.s = o2, i;
  };
  v.toPrecision = function(e6, t) {
    var r, n, i = this, o2 = i.constructor;
    return e6 === void 0 ? (r = H(i), n = _e(i, r <= o2.toExpNeg || r >= o2.toExpPos)) : (de(e6, 1, Ge), t === void 0 ? t = o2.rounding : de(t, 0, 8), i = L(new o2(i), e6, t), r = H(i), n = _e(i, e6 <= r || r <= o2.toExpNeg, e6)), n;
  };
  v.toSignificantDigits = v.tosd = function(e6, t) {
    var r = this, n = r.constructor;
    return e6 === void 0 ? (e6 = n.precision, t = n.rounding) : (de(e6, 1, Ge), t === void 0 ? t = n.rounding : de(t, 0, 8)), L(new n(r), e6, t);
  };
  v.toString = v.valueOf = v.val = v.toJSON = v[Symbol.for("nodejs.util.inspect.custom")] = function() {
    var e6 = this, t = H(e6), r = e6.constructor;
    return _e(e6, t <= r.toExpNeg || t >= r.toExpPos);
  };
  Ee = /* @__PURE__ */ (function() {
    function e6(n, i) {
      var o2, s = 0, a2 = n.length;
      for (n = n.slice(); a2--; ) o2 = n[a2] * i + s, n[a2] = o2 % W | 0, s = o2 / W | 0;
      return s && n.unshift(s), n;
    }
    __name(e6, "e");
    function t(n, i, o2, s) {
      var a2, d;
      if (o2 != s) d = o2 > s ? 1 : -1;
      else for (a2 = d = 0; a2 < o2; a2++) if (n[a2] != i[a2]) {
        d = n[a2] > i[a2] ? 1 : -1;
        break;
      }
      return d;
    }
    __name(t, "t");
    function r(n, i, o2) {
      for (var s = 0; o2--; ) n[o2] -= s, s = n[o2] < i[o2] ? 1 : 0, n[o2] = s * W + n[o2] - i[o2];
      for (; !n[0] && n.length > 1; ) n.shift();
    }
    __name(r, "r");
    return function(n, i, o2, s) {
      var a2, d, f2, P3, A2, S2, C2, M2, R2, k2, xe, X2, _, ee2, Me, gn, ae2, or, sr = n.constructor, Gl = n.s == i.s ? 1 : -1, ce2 = n.d, j = i.d;
      if (!n.s) return new sr(n);
      if (!i.s) throw Error(oe + "Division by zero");
      for (d = n.e - i.e, ae2 = j.length, Me = ce2.length, C2 = new sr(Gl), M2 = C2.d = [], f2 = 0; j[f2] == (ce2[f2] || 0); ) ++f2;
      if (j[f2] > (ce2[f2] || 0) && --d, o2 == null ? X2 = o2 = sr.precision : s ? X2 = o2 + (H(n) - H(i)) + 1 : X2 = o2, X2 < 0) return new sr(0);
      if (X2 = X2 / U + 2 | 0, f2 = 0, ae2 == 1) for (P3 = 0, j = j[0], X2++; (f2 < Me || P3) && X2--; f2++) _ = P3 * W + (ce2[f2] || 0), M2[f2] = _ / j | 0, P3 = _ % j | 0;
      else {
        for (P3 = W / (j[0] + 1) | 0, P3 > 1 && (j = e6(j, P3), ce2 = e6(ce2, P3), ae2 = j.length, Me = ce2.length), ee2 = ae2, R2 = ce2.slice(0, ae2), k2 = R2.length; k2 < ae2; ) R2[k2++] = 0;
        or = j.slice(), or.unshift(0), gn = j[0], j[1] >= W / 2 && ++gn;
        do
          P3 = 0, a2 = t(j, R2, ae2, k2), a2 < 0 ? (xe = R2[0], ae2 != k2 && (xe = xe * W + (R2[1] || 0)), P3 = xe / gn | 0, P3 > 1 ? (P3 >= W && (P3 = W - 1), A2 = e6(j, P3), S2 = A2.length, k2 = R2.length, a2 = t(A2, R2, S2, k2), a2 == 1 && (P3--, r(A2, ae2 < S2 ? or : j, S2))) : (P3 == 0 && (a2 = P3 = 1), A2 = j.slice()), S2 = A2.length, S2 < k2 && A2.unshift(0), r(R2, A2, k2), a2 == -1 && (k2 = R2.length, a2 = t(j, R2, ae2, k2), a2 < 1 && (P3++, r(R2, ae2 < k2 ? or : j, k2))), k2 = R2.length) : a2 === 0 && (P3++, R2 = [0]), M2[f2++] = P3, a2 && R2[0] ? R2[k2++] = ce2[ee2] || 0 : (R2 = [ce2[ee2]], k2 = 1);
        while ((ee2++ < Me || R2[0] !== void 0) && X2--);
      }
      return M2[0] || M2.shift(), C2.e = d, L(C2, s ? o2 + H(C2) + 1 : o2);
    };
  })();
  Wi = Ji(uu);
  ne = new Wi(1);
});
var m = pe(() => {
  "use strict";
  Gi();
});
var Pn = {};
Et(Pn, { Hash: /* @__PURE__ */ __name(() => Ct, "Hash"), createHash: /* @__PURE__ */ __name(() => go, "createHash"), default: /* @__PURE__ */ __name(() => Ze, "default"), randomFillSync: /* @__PURE__ */ __name(() => fr, "randomFillSync"), randomUUID: /* @__PURE__ */ __name(() => dr, "randomUUID"), webcrypto: /* @__PURE__ */ __name(() => St, "webcrypto") });
function dr() {
  return globalThis.crypto.randomUUID();
}
__name(dr, "dr");
function fr(e6, t, r) {
  return t !== void 0 && (r !== void 0 ? e6 = e6.subarray(t, t + r) : e6 = e6.subarray(t)), globalThis.crypto.getRandomValues(e6);
}
__name(fr, "fr");
function go(e6) {
  return new Ct(e6);
}
__name(go, "go");
var St;
var Ct;
var Ze;
var Fe = pe(() => {
  "use strict";
  l();
  u();
  c();
  p();
  m();
  St = globalThis.crypto;
  Ct = class {
    static {
      __name(this, "Ct");
    }
    #t = [];
    #e;
    constructor(t) {
      this.#e = t;
    }
    update(t) {
      this.#t.push(t);
    }
    async digest() {
      let t = new Uint8Array(this.#t.reduce((i, o2) => i + o2.length, 0)), r = 0;
      for (let i of this.#t) t.set(i, r), r += i.length;
      let n = await globalThis.crypto.subtle.digest(this.#e, t);
      return new Uint8Array(n);
    }
  }, Ze = { webcrypto: St, randomUUID: dr, randomFillSync: fr, createHash: go, Hash: Ct };
});
var yo = re(() => {
  "use strict";
  l();
  u();
  c();
  p();
  m();
});
var ho = re((ay, wu) => {
  wu.exports = { name: "@prisma/engines-version", version: "7.3.0-16.9d6ad21cbbceab97458517b147a6a09ff43aa735", main: "index.js", types: "index.d.ts", license: "Apache-2.0", author: "Tim Suchanek <suchanek@prisma.io>", prisma: { enginesVersion: "9d6ad21cbbceab97458517b147a6a09ff43aa735" }, repository: { type: "git", url: "https://github.com/prisma/engines-wrapper.git", directory: "packages/engines-version" }, devDependencies: { "@types/node": "18.19.76", typescript: "4.9.5" }, files: ["index.js", "index.d.ts"], scripts: { build: "tsc -d" } };
});
var wo = re((gr) => {
  "use strict";
  l();
  u();
  c();
  p();
  m();
  Object.defineProperty(gr, "__esModule", { value: true });
  gr.enginesVersion = void 0;
  gr.enginesVersion = ho().prisma.enginesVersion;
});
var To = re((xy, Eo) => {
  "use strict";
  l();
  u();
  c();
  p();
  m();
  Eo.exports = (e6, t = 1, r) => {
    if (r = { indent: " ", includeEmptyLines: false, ...r }, typeof e6 != "string") throw new TypeError(`Expected \`input\` to be a \`string\`, got \`${typeof e6}\``);
    if (typeof t != "number") throw new TypeError(`Expected \`count\` to be a \`number\`, got \`${typeof t}\``);
    if (typeof r.indent != "string") throw new TypeError(`Expected \`options.indent\` to be a \`string\`, got \`${typeof r.indent}\``);
    if (t === 0) return e6;
    let n = r.includeEmptyLines ? /^/gm : /^(?!\s*$)/gm;
    return e6.replace(n, r.indent.repeat(t));
  };
});
var Ao = re((Zy, hr) => {
  "use strict";
  l();
  u();
  c();
  p();
  m();
  hr.exports = (e6 = {}) => {
    let t;
    if (e6.repoUrl) t = e6.repoUrl;
    else if (e6.user && e6.repo) t = `https://github.com/${e6.user}/${e6.repo}`;
    else throw new Error("You need to specify either the `repoUrl` option or both the `user` and `repo` options");
    let r = new URL(`${t}/issues/new`), n = ["body", "title", "labels", "template", "milestone", "assignee", "projects"];
    for (let i of n) {
      let o2 = e6[i];
      if (o2 !== void 0) {
        if (i === "labels" || i === "projects") {
          if (!Array.isArray(o2)) throw new TypeError(`The \`${i}\` option should be an array`);
          o2 = o2.join(",");
        }
        r.searchParams.set(i, o2);
      }
    }
    return r.toString();
  };
  hr.exports.default = hr.exports;
});
var In = re((qw, So) => {
  "use strict";
  l();
  u();
  c();
  p();
  m();
  So.exports = /* @__PURE__ */ (function() {
    function e6(t, r, n, i, o2) {
      return t < r || n < r ? t > n ? n + 1 : t + 1 : i === o2 ? r : r + 1;
    }
    __name(e6, "e");
    return function(t, r) {
      if (t === r) return 0;
      if (t.length > r.length) {
        var n = t;
        t = r, r = n;
      }
      for (var i = t.length, o2 = r.length; i > 0 && t.charCodeAt(i - 1) === r.charCodeAt(o2 - 1); ) i--, o2--;
      for (var s = 0; s < i && t.charCodeAt(s) === r.charCodeAt(s); ) s++;
      if (i -= s, o2 -= s, i === 0 || o2 < 3) return o2;
      var a2 = 0, d, f2, P3, A2, S2, C2, M2, R2, k2, xe, X2, _, ee2 = [];
      for (d = 0; d < i; d++) ee2.push(d + 1), ee2.push(t.charCodeAt(s + d));
      for (var Me = ee2.length - 1; a2 < o2 - 3; ) for (k2 = r.charCodeAt(s + (f2 = a2)), xe = r.charCodeAt(s + (P3 = a2 + 1)), X2 = r.charCodeAt(s + (A2 = a2 + 2)), _ = r.charCodeAt(s + (S2 = a2 + 3)), C2 = a2 += 4, d = 0; d < Me; d += 2) M2 = ee2[d], R2 = ee2[d + 1], f2 = e6(M2, f2, P3, k2, R2), P3 = e6(f2, P3, A2, xe, R2), A2 = e6(P3, A2, S2, X2, R2), C2 = e6(A2, S2, C2, _, R2), ee2[d] = C2, S2 = A2, A2 = P3, P3 = f2, f2 = M2;
      for (; a2 < o2; ) for (k2 = r.charCodeAt(s + (f2 = a2)), C2 = ++a2, d = 0; d < Me; d += 2) M2 = ee2[d], ee2[d] = C2 = e6(M2, f2, C2, k2, ee2[d + 1]), f2 = M2;
      return C2;
    };
  })();
});
var Mo = pe(() => {
  "use strict";
  l();
  u();
  c();
  p();
  m();
});
var No = pe(() => {
  "use strict";
  l();
  u();
  c();
  p();
  m();
});
var Dr;
var Xo = pe(() => {
  "use strict";
  l();
  u();
  c();
  p();
  m();
  Dr = class {
    static {
      __name(this, "Dr");
    }
    events = {};
    on(t, r) {
      return this.events[t] || (this.events[t] = []), this.events[t].push(r), this;
    }
    emit(t, ...r) {
      return this.events[t] ? (this.events[t].forEach((n) => {
        n(...r);
      }), true) : false;
    }
  };
});
var Zn = re((Ve) => {
  "use strict";
  l();
  u();
  c();
  p();
  m();
  Object.defineProperty(Ve, "__esModule", { value: true });
  Ve.anumber = zn;
  Ve.abytes = Bs;
  Ve.ahash = mp;
  Ve.aexists = dp;
  Ve.aoutput = fp;
  function zn(e6) {
    if (!Number.isSafeInteger(e6) || e6 < 0) throw new Error("positive integer expected, got " + e6);
  }
  __name(zn, "zn");
  function pp(e6) {
    return e6 instanceof Uint8Array || ArrayBuffer.isView(e6) && e6.constructor.name === "Uint8Array";
  }
  __name(pp, "pp");
  function Bs(e6, ...t) {
    if (!pp(e6)) throw new Error("Uint8Array expected");
    if (t.length > 0 && !t.includes(e6.length)) throw new Error("Uint8Array expected of length " + t + ", got length=" + e6.length);
  }
  __name(Bs, "Bs");
  function mp(e6) {
    if (typeof e6 != "function" || typeof e6.create != "function") throw new Error("Hash should be wrapped by utils.wrapConstructor");
    zn(e6.outputLen), zn(e6.blockLen);
  }
  __name(mp, "mp");
  function dp(e6, t = true) {
    if (e6.destroyed) throw new Error("Hash instance has been destroyed");
    if (t && e6.finished) throw new Error("Hash#digest() has already been called");
  }
  __name(dp, "dp");
  function fp(e6, t) {
    Bs(e6);
    let r = t.outputLen;
    if (e6.length < r) throw new Error("digestInto() expects output buffer of length at least " + r);
  }
  __name(fp, "fp");
});
var ca = re((O2) => {
  "use strict";
  l();
  u();
  c();
  p();
  m();
  Object.defineProperty(O2, "__esModule", { value: true });
  O2.add5L = O2.add5H = O2.add4H = O2.add4L = O2.add3H = O2.add3L = O2.rotlBL = O2.rotlBH = O2.rotlSL = O2.rotlSH = O2.rotr32L = O2.rotr32H = O2.rotrBL = O2.rotrBH = O2.rotrSL = O2.rotrSH = O2.shrSL = O2.shrSH = O2.toBig = void 0;
  O2.fromBig = Xn;
  O2.split = js;
  O2.add = na;
  var Qr = BigInt(2 ** 32 - 1), Yn = BigInt(32);
  function Xn(e6, t = false) {
    return t ? { h: Number(e6 & Qr), l: Number(e6 >> Yn & Qr) } : { h: Number(e6 >> Yn & Qr) | 0, l: Number(e6 & Qr) | 0 };
  }
  __name(Xn, "Xn");
  function js(e6, t = false) {
    let r = new Uint32Array(e6.length), n = new Uint32Array(e6.length);
    for (let i = 0; i < e6.length; i++) {
      let { h: o2, l: s } = Xn(e6[i], t);
      [r[i], n[i]] = [o2, s];
    }
    return [r, n];
  }
  __name(js, "js");
  var Qs = /* @__PURE__ */ __name((e6, t) => BigInt(e6 >>> 0) << Yn | BigInt(t >>> 0), "Qs");
  O2.toBig = Qs;
  var Hs = /* @__PURE__ */ __name((e6, t, r) => e6 >>> r, "Hs");
  O2.shrSH = Hs;
  var Js = /* @__PURE__ */ __name((e6, t, r) => e6 << 32 - r | t >>> r, "Js");
  O2.shrSL = Js;
  var Ws = /* @__PURE__ */ __name((e6, t, r) => e6 >>> r | t << 32 - r, "Ws");
  O2.rotrSH = Ws;
  var Gs = /* @__PURE__ */ __name((e6, t, r) => e6 << 32 - r | t >>> r, "Gs");
  O2.rotrSL = Gs;
  var Ks = /* @__PURE__ */ __name((e6, t, r) => e6 << 64 - r | t >>> r - 32, "Ks");
  O2.rotrBH = Ks;
  var zs = /* @__PURE__ */ __name((e6, t, r) => e6 >>> r - 32 | t << 64 - r, "zs");
  O2.rotrBL = zs;
  var Zs = /* @__PURE__ */ __name((e6, t) => t, "Zs");
  O2.rotr32H = Zs;
  var Ys = /* @__PURE__ */ __name((e6, t) => e6, "Ys");
  O2.rotr32L = Ys;
  var Xs = /* @__PURE__ */ __name((e6, t, r) => e6 << r | t >>> 32 - r, "Xs");
  O2.rotlSH = Xs;
  var ea = /* @__PURE__ */ __name((e6, t, r) => t << r | e6 >>> 32 - r, "ea");
  O2.rotlSL = ea;
  var ta = /* @__PURE__ */ __name((e6, t, r) => t << r - 32 | e6 >>> 64 - r, "ta");
  O2.rotlBH = ta;
  var ra = /* @__PURE__ */ __name((e6, t, r) => e6 << r - 32 | t >>> 64 - r, "ra");
  O2.rotlBL = ra;
  function na(e6, t, r, n) {
    let i = (t >>> 0) + (n >>> 0);
    return { h: e6 + r + (i / 2 ** 32 | 0) | 0, l: i | 0 };
  }
  __name(na, "na");
  var ia = /* @__PURE__ */ __name((e6, t, r) => (e6 >>> 0) + (t >>> 0) + (r >>> 0), "ia");
  O2.add3L = ia;
  var oa = /* @__PURE__ */ __name((e6, t, r, n) => t + r + n + (e6 / 2 ** 32 | 0) | 0, "oa");
  O2.add3H = oa;
  var sa = /* @__PURE__ */ __name((e6, t, r, n) => (e6 >>> 0) + (t >>> 0) + (r >>> 0) + (n >>> 0), "sa");
  O2.add4L = sa;
  var aa = /* @__PURE__ */ __name((e6, t, r, n, i) => t + r + n + i + (e6 / 2 ** 32 | 0) | 0, "aa");
  O2.add4H = aa;
  var la = /* @__PURE__ */ __name((e6, t, r, n, i) => (e6 >>> 0) + (t >>> 0) + (r >>> 0) + (n >>> 0) + (i >>> 0), "la");
  O2.add5L = la;
  var ua = /* @__PURE__ */ __name((e6, t, r, n, i, o2) => t + r + n + i + o2 + (e6 / 2 ** 32 | 0) | 0, "ua");
  O2.add5H = ua;
  var gp = { fromBig: Xn, split: js, toBig: Qs, shrSH: Hs, shrSL: Js, rotrSH: Ws, rotrSL: Gs, rotrBH: Ks, rotrBL: zs, rotr32H: Zs, rotr32L: Ys, rotlSH: Xs, rotlSL: ea, rotlBH: ta, rotlBL: ra, add: na, add3L: ia, add3H: oa, add4L: sa, add4H: aa, add5H: ua, add5L: la };
  O2.default = gp;
});
var pa = re((Hr) => {
  "use strict";
  l();
  u();
  c();
  p();
  m();
  Object.defineProperty(Hr, "__esModule", { value: true });
  Hr.crypto = void 0;
  var Ie = (Fe(), eu(Pn));
  Hr.crypto = Ie && typeof Ie == "object" && "webcrypto" in Ie ? Ie.webcrypto : Ie && typeof Ie == "object" && "randomBytes" in Ie ? Ie : void 0;
});
var fa = re((N2) => {
  "use strict";
  l();
  u();
  c();
  p();
  m();
  Object.defineProperty(N2, "__esModule", { value: true });
  N2.Hash = N2.nextTick = N2.byteSwapIfBE = N2.isLE = void 0;
  N2.isBytes = yp;
  N2.u8 = hp;
  N2.u32 = wp;
  N2.createView = bp;
  N2.rotr = xp;
  N2.rotl = Ep;
  N2.byteSwap = ri;
  N2.byteSwap32 = Tp;
  N2.bytesToHex = Ap;
  N2.hexToBytes = vp;
  N2.asyncLoop = Sp;
  N2.utf8ToBytes = da;
  N2.toBytes = Jr;
  N2.concatBytes = Rp;
  N2.checkOpts = Ip;
  N2.wrapConstructor = Op;
  N2.wrapConstructorWithOpts = kp;
  N2.wrapXOFConstructorWithOpts = Mp;
  N2.randomBytes = Np;
  var dt = pa(), ti = Zn();
  function yp(e6) {
    return e6 instanceof Uint8Array || ArrayBuffer.isView(e6) && e6.constructor.name === "Uint8Array";
  }
  __name(yp, "yp");
  function hp(e6) {
    return new Uint8Array(e6.buffer, e6.byteOffset, e6.byteLength);
  }
  __name(hp, "hp");
  function wp(e6) {
    return new Uint32Array(e6.buffer, e6.byteOffset, Math.floor(e6.byteLength / 4));
  }
  __name(wp, "wp");
  function bp(e6) {
    return new DataView(e6.buffer, e6.byteOffset, e6.byteLength);
  }
  __name(bp, "bp");
  function xp(e6, t) {
    return e6 << 32 - t | e6 >>> t;
  }
  __name(xp, "xp");
  function Ep(e6, t) {
    return e6 << t | e6 >>> 32 - t >>> 0;
  }
  __name(Ep, "Ep");
  N2.isLE = new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68;
  function ri(e6) {
    return e6 << 24 & 4278190080 | e6 << 8 & 16711680 | e6 >>> 8 & 65280 | e6 >>> 24 & 255;
  }
  __name(ri, "ri");
  N2.byteSwapIfBE = N2.isLE ? (e6) => e6 : (e6) => ri(e6);
  function Tp(e6) {
    for (let t = 0; t < e6.length; t++) e6[t] = ri(e6[t]);
  }
  __name(Tp, "Tp");
  var Pp = Array.from({ length: 256 }, (e6, t) => t.toString(16).padStart(2, "0"));
  function Ap(e6) {
    (0, ti.abytes)(e6);
    let t = "";
    for (let r = 0; r < e6.length; r++) t += Pp[e6[r]];
    return t;
  }
  __name(Ap, "Ap");
  var Pe = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
  function ma(e6) {
    if (e6 >= Pe._0 && e6 <= Pe._9) return e6 - Pe._0;
    if (e6 >= Pe.A && e6 <= Pe.F) return e6 - (Pe.A - 10);
    if (e6 >= Pe.a && e6 <= Pe.f) return e6 - (Pe.a - 10);
  }
  __name(ma, "ma");
  function vp(e6) {
    if (typeof e6 != "string") throw new Error("hex string expected, got " + typeof e6);
    let t = e6.length, r = t / 2;
    if (t % 2) throw new Error("hex string expected, got unpadded hex of length " + t);
    let n = new Uint8Array(r);
    for (let i = 0, o2 = 0; i < r; i++, o2 += 2) {
      let s = ma(e6.charCodeAt(o2)), a2 = ma(e6.charCodeAt(o2 + 1));
      if (s === void 0 || a2 === void 0) {
        let d = e6[o2] + e6[o2 + 1];
        throw new Error('hex string expected, got non-hex character "' + d + '" at index ' + o2);
      }
      n[i] = s * 16 + a2;
    }
    return n;
  }
  __name(vp, "vp");
  var Cp = /* @__PURE__ */ __name(async () => {
  }, "Cp");
  N2.nextTick = Cp;
  async function Sp(e6, t, r) {
    let n = Date.now();
    for (let i = 0; i < e6; i++) {
      r(i);
      let o2 = Date.now() - n;
      o2 >= 0 && o2 < t || (await (0, N2.nextTick)(), n += o2);
    }
  }
  __name(Sp, "Sp");
  function da(e6) {
    if (typeof e6 != "string") throw new Error("utf8ToBytes expected string, got " + typeof e6);
    return new Uint8Array(new TextEncoder().encode(e6));
  }
  __name(da, "da");
  function Jr(e6) {
    return typeof e6 == "string" && (e6 = da(e6)), (0, ti.abytes)(e6), e6;
  }
  __name(Jr, "Jr");
  function Rp(...e6) {
    let t = 0;
    for (let n = 0; n < e6.length; n++) {
      let i = e6[n];
      (0, ti.abytes)(i), t += i.length;
    }
    let r = new Uint8Array(t);
    for (let n = 0, i = 0; n < e6.length; n++) {
      let o2 = e6[n];
      r.set(o2, i), i += o2.length;
    }
    return r;
  }
  __name(Rp, "Rp");
  var ei = class {
    static {
      __name(this, "ei");
    }
    clone() {
      return this._cloneInto();
    }
  };
  N2.Hash = ei;
  function Ip(e6, t) {
    if (t !== void 0 && {}.toString.call(t) !== "[object Object]") throw new Error("Options should be object or undefined");
    return Object.assign(e6, t);
  }
  __name(Ip, "Ip");
  function Op(e6) {
    let t = /* @__PURE__ */ __name((n) => e6().update(Jr(n)).digest(), "t"), r = e6();
    return t.outputLen = r.outputLen, t.blockLen = r.blockLen, t.create = () => e6(), t;
  }
  __name(Op, "Op");
  function kp(e6) {
    let t = /* @__PURE__ */ __name((n, i) => e6(i).update(Jr(n)).digest(), "t"), r = e6({});
    return t.outputLen = r.outputLen, t.blockLen = r.blockLen, t.create = (n) => e6(n), t;
  }
  __name(kp, "kp");
  function Mp(e6) {
    let t = /* @__PURE__ */ __name((n, i) => e6(i).update(Jr(n)).digest(), "t"), r = e6({});
    return t.outputLen = r.outputLen, t.blockLen = r.blockLen, t.create = (n) => e6(n), t;
  }
  __name(Mp, "Mp");
  function Np(e6 = 32) {
    if (dt.crypto && typeof dt.crypto.getRandomValues == "function") return dt.crypto.getRandomValues(new Uint8Array(e6));
    if (dt.crypto && typeof dt.crypto.randomBytes == "function") return dt.crypto.randomBytes(e6);
    throw new Error("crypto.getRandomValues must be defined");
  }
  __name(Np, "Np");
});
var Ta = re((q2) => {
  "use strict";
  l();
  u();
  c();
  p();
  m();
  Object.defineProperty(q2, "__esModule", { value: true });
  q2.shake256 = q2.shake128 = q2.keccak_512 = q2.keccak_384 = q2.keccak_256 = q2.keccak_224 = q2.sha3_512 = q2.sha3_384 = q2.sha3_256 = q2.sha3_224 = q2.Keccak = void 0;
  q2.keccakP = xa;
  var ft = Zn(), Qt = ca(), Ae = fa(), ha = [], wa = [], ba = [], Dp = BigInt(0), jt = BigInt(1), Lp = BigInt(2), _p = BigInt(7), Fp = BigInt(256), Up = BigInt(113);
  for (let e6 = 0, t = jt, r = 1, n = 0; e6 < 24; e6++) {
    [r, n] = [n, (2 * r + 3 * n) % 5], ha.push(2 * (5 * n + r)), wa.push((e6 + 1) * (e6 + 2) / 2 % 64);
    let i = Dp;
    for (let o2 = 0; o2 < 7; o2++) t = (t << jt ^ (t >> _p) * Up) % Fp, t & Lp && (i ^= jt << (jt << BigInt(o2)) - jt);
    ba.push(i);
  }
  var [$p, qp] = (0, Qt.split)(ba, true), ga = /* @__PURE__ */ __name((e6, t, r) => r > 32 ? (0, Qt.rotlBH)(e6, t, r) : (0, Qt.rotlSH)(e6, t, r), "ga"), ya = /* @__PURE__ */ __name((e6, t, r) => r > 32 ? (0, Qt.rotlBL)(e6, t, r) : (0, Qt.rotlSL)(e6, t, r), "ya");
  function xa(e6, t = 24) {
    let r = new Uint32Array(10);
    for (let n = 24 - t; n < 24; n++) {
      for (let s = 0; s < 10; s++) r[s] = e6[s] ^ e6[s + 10] ^ e6[s + 20] ^ e6[s + 30] ^ e6[s + 40];
      for (let s = 0; s < 10; s += 2) {
        let a2 = (s + 8) % 10, d = (s + 2) % 10, f2 = r[d], P3 = r[d + 1], A2 = ga(f2, P3, 1) ^ r[a2], S2 = ya(f2, P3, 1) ^ r[a2 + 1];
        for (let C2 = 0; C2 < 50; C2 += 10) e6[s + C2] ^= A2, e6[s + C2 + 1] ^= S2;
      }
      let i = e6[2], o2 = e6[3];
      for (let s = 0; s < 24; s++) {
        let a2 = wa[s], d = ga(i, o2, a2), f2 = ya(i, o2, a2), P3 = ha[s];
        i = e6[P3], o2 = e6[P3 + 1], e6[P3] = d, e6[P3 + 1] = f2;
      }
      for (let s = 0; s < 50; s += 10) {
        for (let a2 = 0; a2 < 10; a2++) r[a2] = e6[s + a2];
        for (let a2 = 0; a2 < 10; a2++) e6[s + a2] ^= ~r[(a2 + 2) % 10] & r[(a2 + 4) % 10];
      }
      e6[0] ^= $p[n], e6[1] ^= qp[n];
    }
    r.fill(0);
  }
  __name(xa, "xa");
  var Ht = class e6 extends Ae.Hash {
    static {
      __name(this, "e");
    }
    constructor(t, r, n, i = false, o2 = 24) {
      if (super(), this.blockLen = t, this.suffix = r, this.outputLen = n, this.enableXOF = i, this.rounds = o2, this.pos = 0, this.posOut = 0, this.finished = false, this.destroyed = false, (0, ft.anumber)(n), 0 >= this.blockLen || this.blockLen >= 200) throw new Error("Sha3 supports only keccak-f1600 function");
      this.state = new Uint8Array(200), this.state32 = (0, Ae.u32)(this.state);
    }
    keccak() {
      Ae.isLE || (0, Ae.byteSwap32)(this.state32), xa(this.state32, this.rounds), Ae.isLE || (0, Ae.byteSwap32)(this.state32), this.posOut = 0, this.pos = 0;
    }
    update(t) {
      (0, ft.aexists)(this);
      let { blockLen: r, state: n } = this;
      t = (0, Ae.toBytes)(t);
      let i = t.length;
      for (let o2 = 0; o2 < i; ) {
        let s = Math.min(r - this.pos, i - o2);
        for (let a2 = 0; a2 < s; a2++) n[this.pos++] ^= t[o2++];
        this.pos === r && this.keccak();
      }
      return this;
    }
    finish() {
      if (this.finished) return;
      this.finished = true;
      let { state: t, suffix: r, pos: n, blockLen: i } = this;
      t[n] ^= r, (r & 128) !== 0 && n === i - 1 && this.keccak(), t[i - 1] ^= 128, this.keccak();
    }
    writeInto(t) {
      (0, ft.aexists)(this, false), (0, ft.abytes)(t), this.finish();
      let r = this.state, { blockLen: n } = this;
      for (let i = 0, o2 = t.length; i < o2; ) {
        this.posOut >= n && this.keccak();
        let s = Math.min(n - this.posOut, o2 - i);
        t.set(r.subarray(this.posOut, this.posOut + s), i), this.posOut += s, i += s;
      }
      return t;
    }
    xofInto(t) {
      if (!this.enableXOF) throw new Error("XOF is not possible for this instance");
      return this.writeInto(t);
    }
    xof(t) {
      return (0, ft.anumber)(t), this.xofInto(new Uint8Array(t));
    }
    digestInto(t) {
      if ((0, ft.aoutput)(t, this), this.finished) throw new Error("digest() was already called");
      return this.writeInto(t), this.destroy(), t;
    }
    digest() {
      return this.digestInto(new Uint8Array(this.outputLen));
    }
    destroy() {
      this.destroyed = true, this.state.fill(0);
    }
    _cloneInto(t) {
      let { blockLen: r, suffix: n, outputLen: i, rounds: o2, enableXOF: s } = this;
      return t || (t = new e6(r, n, i, s, o2)), t.state32.set(this.state32), t.pos = this.pos, t.posOut = this.posOut, t.finished = this.finished, t.rounds = o2, t.suffix = n, t.outputLen = i, t.enableXOF = s, t.destroyed = this.destroyed, t;
    }
  };
  q2.Keccak = Ht;
  var Oe = /* @__PURE__ */ __name((e6, t, r) => (0, Ae.wrapConstructor)(() => new Ht(t, e6, r)), "Oe");
  q2.sha3_224 = Oe(6, 144, 224 / 8);
  q2.sha3_256 = Oe(6, 136, 256 / 8);
  q2.sha3_384 = Oe(6, 104, 384 / 8);
  q2.sha3_512 = Oe(6, 72, 512 / 8);
  q2.keccak_224 = Oe(1, 144, 224 / 8);
  q2.keccak_256 = Oe(1, 136, 256 / 8);
  q2.keccak_384 = Oe(1, 104, 384 / 8);
  q2.keccak_512 = Oe(1, 72, 512 / 8);
  var Ea = /* @__PURE__ */ __name((e6, t, r) => (0, Ae.wrapXOFConstructorWithOpts)((n = {}) => new Ht(t, e6, n.dkLen === void 0 ? r : n.dkLen, true)), "Ea");
  q2.shake128 = Ea(31, 168, 128 / 8);
  q2.shake256 = Ea(31, 136, 256 / 8);
});
var Oa = re((gO, ke) => {
  "use strict";
  l();
  u();
  c();
  p();
  m();
  var { sha3_512: Vp } = Ta(), Aa = 24, Jt = 32, ni = /* @__PURE__ */ __name((e6 = 4, t = Math.random) => {
    let r = "";
    for (; r.length < e6; ) r = r + Math.floor(t() * 36).toString(36);
    return r;
  }, "ni");
  function va(e6) {
    let t = 8n, r = 0n;
    for (let n of e6.values()) {
      let i = BigInt(n);
      r = (r << t) + i;
    }
    return r;
  }
  __name(va, "va");
  var Ca = /* @__PURE__ */ __name((e6 = "") => va(Vp(e6)).toString(36).slice(1), "Ca"), Pa = Array.from({ length: 26 }, (e6, t) => String.fromCharCode(t + 97)), Bp = /* @__PURE__ */ __name((e6) => Pa[Math.floor(e6() * Pa.length)], "Bp"), Sa = /* @__PURE__ */ __name(({ globalObj: e6 = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {}, random: t = Math.random } = {}) => {
    let r = Object.keys(e6).toString(), n = r.length ? r + ni(Jt, t) : ni(Jt, t);
    return Ca(n).substring(0, Jt);
  }, "Sa"), Ra = /* @__PURE__ */ __name((e6) => () => e6++, "Ra"), jp = 476782367, Ia = /* @__PURE__ */ __name(({ random: e6 = Math.random, counter: t = Ra(Math.floor(e6() * jp)), length: r = Aa, fingerprint: n = Sa({ random: e6 }) } = {}) => function() {
    let o2 = Bp(e6), s = Date.now().toString(36), a2 = t().toString(36), d = ni(r, e6), f2 = `${s + d + a2 + n}`;
    return `${o2 + Ca(f2).substring(1, r)}`;
  }, "Ia"), Qp = Ia(), Hp = /* @__PURE__ */ __name((e6, { minLength: t = 2, maxLength: r = Jt } = {}) => {
    let n = e6.length, i = /^[0-9a-z]+$/;
    try {
      if (typeof e6 == "string" && n >= t && n <= r && i.test(e6)) return true;
    } finally {
    }
    return false;
  }, "Hp");
  ke.exports.getConstants = () => ({ defaultLength: Aa, bigLength: Jt });
  ke.exports.init = Ia;
  ke.exports.createId = Qp;
  ke.exports.bufToBigInt = va;
  ke.exports.createCounter = Ra;
  ke.exports.createFingerprint = Sa;
  ke.exports.isCuid = Hp;
});
var ka = re((EO, Wt) => {
  "use strict";
  l();
  u();
  c();
  p();
  m();
  var { createId: Jp, init: Wp, getConstants: Gp, isCuid: Kp } = Oa();
  Wt.exports.createId = Jp;
  Wt.exports.init = Wp;
  Wt.exports.getConstants = Gp;
  Wt.exports.isCuid = Kp;
});
l();
u();
c();
p();
m();
var Zi = {};
Et(Zi, { defineExtension: /* @__PURE__ */ __name(() => Ki, "defineExtension"), getExtensionContext: /* @__PURE__ */ __name(() => zi, "getExtensionContext") });
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
function Ki(e6) {
  return typeof e6 == "function" ? e6 : (t) => t.$extends(e6);
}
__name(Ki, "Ki");
l();
u();
c();
p();
m();
function zi(e6) {
  return e6;
}
__name(zi, "zi");
var Xi = {};
Et(Xi, { validator: /* @__PURE__ */ __name(() => Yi, "validator") });
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
function Yi(...e6) {
  return (t) => t;
}
__name(Yi, "Yi");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var fe = class {
  static {
    __name(this, "fe");
  }
  _map = /* @__PURE__ */ new Map();
  get(t) {
    return this._map.get(t)?.value;
  }
  set(t, r) {
    this._map.set(t, { value: r });
  }
  getOrCreate(t, r) {
    let n = this._map.get(t);
    if (n) return n.value;
    let i = r();
    return this.set(t, i), i;
  }
};
l();
u();
c();
p();
m();
function Ce(e6) {
  return e6.substring(0, 1).toLowerCase() + e6.substring(1);
}
__name(Ce, "Ce");
l();
u();
c();
p();
m();
function eo(e6, t) {
  let r = {};
  for (let n of e6) {
    let i = n[t];
    r[i] = n;
  }
  return r;
}
__name(eo, "eo");
l();
u();
c();
p();
m();
function Pt(e6) {
  let t;
  return { get() {
    return t || (t = { value: e6() }), t.value;
  } };
}
__name(Pt, "Pt");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var En;
var to;
var ro;
var no;
var io = true;
typeof g < "u" && ({ FORCE_COLOR: En, NODE_DISABLE_COLORS: to, NO_COLOR: ro, TERM: no } = g.env || {}, io = g.stdout && g.stdout.isTTY);
var du = { enabled: !to && ro == null && no !== "dumb" && (En != null && En !== "0" || io) };
function F(e6, t) {
  let r = new RegExp(`\\x1b\\[${t}m`, "g"), n = `\x1B[${e6}m`, i = `\x1B[${t}m`;
  return function(o2) {
    return !du.enabled || o2 == null ? o2 : n + (~("" + o2).indexOf(i) ? o2.replace(r, i + n) : o2) + i;
  };
}
__name(F, "F");
var cg = F(0, 0);
var cr = F(1, 22);
var pr = F(2, 22);
var pg2 = F(3, 23);
var mr = F(4, 24);
var mg = F(7, 27);
var dg = F(8, 28);
var fg = F(9, 29);
var gg = F(30, 39);
var ze = F(31, 39);
var oo = F(32, 39);
var so = F(33, 39);
var ao = F(34, 39);
var yg = F(35, 39);
var lo = F(36, 39);
var hg = F(37, 39);
var uo = F(90, 39);
var wg = F(90, 39);
var bg = F(40, 49);
var xg = F(41, 49);
var Eg = F(42, 49);
var Tg = F(43, 49);
var Pg = F(44, 49);
var Ag = F(45, 49);
var vg = F(46, 49);
var Cg = F(47, 49);
l();
u();
c();
p();
m();
var fu = 100;
var co = ["green", "yellow", "blue", "magenta", "cyan", "red"];
var At = [];
var po = Date.now();
var gu = 0;
var Tn = typeof g < "u" ? g.env : {};
globalThis.DEBUG ??= Tn.DEBUG ?? "";
globalThis.DEBUG_COLORS ??= Tn.DEBUG_COLORS ? Tn.DEBUG_COLORS === "true" : true;
var vt = { enable(e6) {
  typeof e6 == "string" && (globalThis.DEBUG = e6);
}, disable() {
  let e6 = globalThis.DEBUG;
  return globalThis.DEBUG = "", e6;
}, enabled(e6) {
  let t = globalThis.DEBUG.split(",").map((i) => i.replace(/[.+?^${}()|[\]\\]/g, "\\$&")), r = t.some((i) => i === "" || i[0] === "-" ? false : e6.match(RegExp(i.split("*").join(".*") + "$"))), n = t.some((i) => i === "" || i[0] !== "-" ? false : e6.match(RegExp(i.slice(1).split("*").join(".*") + "$")));
  return r && !n;
}, log: /* @__PURE__ */ __name((...e6) => {
  let [t, r, ...n] = e6;
  (console.warn ?? console.log)(`${t} ${r}`, ...n);
}, "log"), formatters: {} };
function yu(e6) {
  let t = { color: co[gu++ % co.length], enabled: vt.enabled(e6), namespace: e6, log: vt.log, extend: /* @__PURE__ */ __name(() => {
  }, "extend") }, r = /* @__PURE__ */ __name((...n) => {
    let { enabled: i, namespace: o2, color: s, log: a2 } = t;
    if (n.length !== 0 && At.push([o2, ...n]), At.length > fu && At.shift(), vt.enabled(o2) || i) {
      let d = n.map((P3) => typeof P3 == "string" ? P3 : hu(P3)), f2 = `+${Date.now() - po}ms`;
      po = Date.now(), a2(o2, ...d, f2);
    }
  }, "r");
  return new Proxy(r, { get: /* @__PURE__ */ __name((n, i) => t[i], "get"), set: /* @__PURE__ */ __name((n, i, o2) => t[i] = o2, "set") });
}
__name(yu, "yu");
var Z = new Proxy(yu, { get: /* @__PURE__ */ __name((e6, t) => vt[t], "get"), set: /* @__PURE__ */ __name((e6, t, r) => vt[t] = r, "set") });
function hu(e6, t = 2) {
  let r = /* @__PURE__ */ new Set();
  return JSON.stringify(e6, (n, i) => {
    if (typeof i == "object" && i !== null) {
      if (r.has(i)) return "[Circular *]";
      r.add(i);
    } else if (typeof i == "bigint") return i.toString();
    return i;
  }, t);
}
__name(hu, "hu");
function mo(e6 = 7500) {
  let t = At.map(([r, ...n]) => `${r} ${n.map((i) => typeof i == "string" ? i : JSON.stringify(i)).join(" ")}`).join(`
`);
  return t.length < e6 ? t : t.slice(-e6);
}
__name(mo, "mo");
function fo() {
  At.length = 0;
}
__name(fo, "fo");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var bo = "prisma+postgres";
var yr = `${bo}:`;
function xo(e6) {
  return e6?.toString().startsWith(`${yr}//`) ?? false;
}
__name(xo, "xo");
function An(e6) {
  if (!xo(e6)) return false;
  let { host: t } = new URL(e6);
  return t.includes("localhost") || t.includes("127.0.0.1") || t.includes("[::1]");
}
__name(An, "An");
var It = {};
Et(It, { error: /* @__PURE__ */ __name(() => Eu, "error"), info: /* @__PURE__ */ __name(() => xu, "info"), log: /* @__PURE__ */ __name(() => bu, "log"), query: /* @__PURE__ */ __name(() => Tu, "query"), should: /* @__PURE__ */ __name(() => Po, "should"), tags: /* @__PURE__ */ __name(() => Rt, "tags"), warn: /* @__PURE__ */ __name(() => vn, "warn") });
l();
u();
c();
p();
m();
var Rt = { error: ze("prisma:error"), warn: so("prisma:warn"), info: lo("prisma:info"), query: ao("prisma:query") };
var Po = { warn: /* @__PURE__ */ __name(() => !g.env.PRISMA_DISABLE_WARNINGS, "warn") };
function bu(...e6) {
  console.log(...e6);
}
__name(bu, "bu");
function vn(e6, ...t) {
  Po.warn() && console.warn(`${Rt.warn} ${e6}`, ...t);
}
__name(vn, "vn");
function xu(e6, ...t) {
  console.info(`${Rt.info} ${e6}`, ...t);
}
__name(xu, "xu");
function Eu(e6, ...t) {
  console.error(`${Rt.error} ${e6}`, ...t);
}
__name(Eu, "Eu");
function Tu(e6, ...t) {
  console.log(`${Rt.query} ${e6}`, ...t);
}
__name(Tu, "Tu");
l();
u();
c();
p();
m();
function Te(e6, t) {
  throw new Error(t);
}
__name(Te, "Te");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
function Cn({ onlyFirst: e6 = false } = {}) {
  let r = ["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?(?:\\u0007|\\u001B\\u005C|\\u009C))", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"].join("|");
  return new RegExp(r, e6 ? void 0 : "g");
}
__name(Cn, "Cn");
var Pu = Cn();
function Ye(e6) {
  if (typeof e6 != "string") throw new TypeError(`Expected a \`string\`, got \`${typeof e6}\``);
  return e6.replace(Pu, "");
}
__name(Ye, "Ye");
l();
u();
c();
p();
m();
function Sn(e6, t) {
  return Object.prototype.hasOwnProperty.call(e6, t);
}
__name(Sn, "Sn");
l();
u();
c();
p();
m();
function wr(e6, t) {
  let r = {};
  for (let n of Object.keys(e6)) r[n] = t(e6[n], n);
  return r;
}
__name(wr, "wr");
l();
u();
c();
p();
m();
function Rn(e6, t) {
  if (e6.length === 0) return;
  let r = e6[0];
  for (let n = 1; n < e6.length; n++) t(r, e6[n]) < 0 && (r = e6[n]);
  return r;
}
__name(Rn, "Rn");
l();
u();
c();
p();
m();
function Ot(e6, t) {
  Object.defineProperty(e6, "name", { value: t, configurable: true });
}
__name(Ot, "Ot");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
function Xe(e6) {
  return e6 instanceof Date || Object.prototype.toString.call(e6) === "[object Date]";
}
__name(Xe, "Xe");
function br(e6) {
  return e6.toString() !== "Invalid Date";
}
__name(br, "br");
l();
u();
c();
p();
m();
function et(e6) {
  return Decimal.isDecimal(e6) ? true : e6 !== null && typeof e6 == "object" && typeof e6.s == "number" && typeof e6.e == "number" && typeof e6.toFixed == "function" && Array.isArray(e6.d);
}
__name(et, "et");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var xr = {};
Et(xr, { ModelAction: /* @__PURE__ */ __name(() => kt, "ModelAction"), datamodelEnumToSchemaEnum: /* @__PURE__ */ __name(() => vu, "datamodelEnumToSchemaEnum") });
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
function vu(e6) {
  return { name: e6.name, values: e6.values.map((t) => t.name) };
}
__name(vu, "vu");
l();
u();
c();
p();
m();
var kt = ((_) => (_.findUnique = "findUnique", _.findUniqueOrThrow = "findUniqueOrThrow", _.findFirst = "findFirst", _.findFirstOrThrow = "findFirstOrThrow", _.findMany = "findMany", _.create = "create", _.createMany = "createMany", _.createManyAndReturn = "createManyAndReturn", _.update = "update", _.updateMany = "updateMany", _.updateManyAndReturn = "updateManyAndReturn", _.upsert = "upsert", _.delete = "delete", _.deleteMany = "deleteMany", _.groupBy = "groupBy", _.count = "count", _.aggregate = "aggregate", _.findRaw = "findRaw", _.aggregateRaw = "aggregateRaw", _))(kt || {});
var Cu = Ne(To());
var Su = { red: ze, gray: uo, dim: pr, bold: cr, underline: mr, highlightSource: /* @__PURE__ */ __name((e6) => e6.highlight(), "highlightSource") };
var Ru = { red: /* @__PURE__ */ __name((e6) => e6, "red"), gray: /* @__PURE__ */ __name((e6) => e6, "gray"), dim: /* @__PURE__ */ __name((e6) => e6, "dim"), bold: /* @__PURE__ */ __name((e6) => e6, "bold"), underline: /* @__PURE__ */ __name((e6) => e6, "underline"), highlightSource: /* @__PURE__ */ __name((e6) => e6, "highlightSource") };
function Iu({ message: e6, originalMethod: t, isPanic: r, callArguments: n }) {
  return { functionName: `prisma.${t}()`, message: e6, isPanic: r ?? false, callArguments: n };
}
__name(Iu, "Iu");
function Ou({ functionName: e6, location: t, message: r, isPanic: n, contextLines: i, callArguments: o2 }, s) {
  let a2 = [""], d = t ? " in" : ":";
  if (n ? (a2.push(s.red(`Oops, an unknown error occurred! This is ${s.bold("on us")}, you did nothing wrong.`)), a2.push(s.red(`It occurred in the ${s.bold(`\`${e6}\``)} invocation${d}`))) : a2.push(s.red(`Invalid ${s.bold(`\`${e6}\``)} invocation${d}`)), t && a2.push(s.underline(ku(t))), i) {
    a2.push("");
    let f2 = [i.toString()];
    o2 && (f2.push(o2), f2.push(s.dim(")"))), a2.push(f2.join("")), o2 && a2.push("");
  } else a2.push(""), o2 && a2.push(o2), a2.push("");
  return a2.push(r), a2.join(`
`);
}
__name(Ou, "Ou");
function ku(e6) {
  let t = [e6.fileName];
  return e6.lineNumber && t.push(String(e6.lineNumber)), e6.columnNumber && t.push(String(e6.columnNumber)), t.join(":");
}
__name(ku, "ku");
function Er(e6) {
  let t = e6.showColors ? Su : Ru, r;
  return typeof $getTemplateParameters < "u" ? r = $getTemplateParameters(e6, t) : r = Iu(e6), Ou(r, t);
}
__name(Er, "Er");
l();
u();
c();
p();
m();
var Lo = Ne(In());
l();
u();
c();
p();
m();
function Oo(e6, t, r) {
  let n = ko(e6), i = Mu(n), o2 = Du(i);
  o2 ? Tr(o2, t, r) : t.addErrorMessage(() => "Unknown error");
}
__name(Oo, "Oo");
function ko(e6) {
  return e6.errors.flatMap((t) => t.kind === "Union" ? ko(t) : [t]);
}
__name(ko, "ko");
function Mu(e6) {
  let t = /* @__PURE__ */ new Map(), r = [];
  for (let n of e6) {
    if (n.kind !== "InvalidArgumentType") {
      r.push(n);
      continue;
    }
    let i = `${n.selectionPath.join(".")}:${n.argumentPath.join(".")}`, o2 = t.get(i);
    o2 ? t.set(i, { ...n, argument: { ...n.argument, typeNames: Nu(o2.argument.typeNames, n.argument.typeNames) } }) : t.set(i, n);
  }
  return r.push(...t.values()), r;
}
__name(Mu, "Mu");
function Nu(e6, t) {
  return [...new Set(e6.concat(t))];
}
__name(Nu, "Nu");
function Du(e6) {
  return Rn(e6, (t, r) => {
    let n = Ro(t), i = Ro(r);
    return n !== i ? n - i : Io(t) - Io(r);
  });
}
__name(Du, "Du");
function Ro(e6) {
  let t = 0;
  return Array.isArray(e6.selectionPath) && (t += e6.selectionPath.length), Array.isArray(e6.argumentPath) && (t += e6.argumentPath.length), t;
}
__name(Ro, "Ro");
function Io(e6) {
  switch (e6.kind) {
    case "InvalidArgumentValue":
    case "ValueTooLarge":
      return 20;
    case "InvalidArgumentType":
      return 10;
    case "RequiredArgumentMissing":
      return -10;
    default:
      return 0;
  }
}
__name(Io, "Io");
l();
u();
c();
p();
m();
var ie = class {
  static {
    __name(this, "ie");
  }
  constructor(t, r) {
    this.name = t;
    this.value = r;
  }
  isRequired = false;
  makeRequired() {
    return this.isRequired = true, this;
  }
  write(t) {
    let { colors: { green: r } } = t.context;
    t.addMarginSymbol(r(this.isRequired ? "+" : "?")), t.write(r(this.name)), this.isRequired || t.write(r("?")), t.write(r(": ")), typeof this.value == "string" ? t.write(r(this.value)) : t.write(this.value);
  }
};
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
No();
l();
u();
c();
p();
m();
var tt = class {
  static {
    __name(this, "tt");
  }
  constructor(t = 0, r) {
    this.context = r;
    this.currentIndent = t;
  }
  lines = [];
  currentLine = "";
  currentIndent = 0;
  marginSymbol;
  afterNextNewLineCallback;
  write(t) {
    return typeof t == "string" ? this.currentLine += t : t.write(this), this;
  }
  writeJoined(t, r, n = (i, o2) => o2.write(i)) {
    let i = r.length - 1;
    for (let o2 = 0; o2 < r.length; o2++) n(r[o2], this), o2 !== i && this.write(t);
    return this;
  }
  writeLine(t) {
    return this.write(t).newLine();
  }
  newLine() {
    this.lines.push(this.indentedCurrentLine()), this.currentLine = "", this.marginSymbol = void 0;
    let t = this.afterNextNewLineCallback;
    return this.afterNextNewLineCallback = void 0, t?.(), this;
  }
  withIndent(t) {
    return this.indent(), t(this), this.unindent(), this;
  }
  afterNextNewline(t) {
    return this.afterNextNewLineCallback = t, this;
  }
  indent() {
    return this.currentIndent++, this;
  }
  unindent() {
    return this.currentIndent > 0 && this.currentIndent--, this;
  }
  addMarginSymbol(t) {
    return this.marginSymbol = t, this;
  }
  toString() {
    return this.lines.concat(this.indentedCurrentLine()).join(`
`);
  }
  getCurrentLineLength() {
    return this.currentLine.length;
  }
  indentedCurrentLine() {
    let t = this.currentLine.padStart(this.currentLine.length + 2 * this.currentIndent);
    return this.marginSymbol ? this.marginSymbol + t.slice(1) : t;
  }
};
Mo();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var Pr = class {
  static {
    __name(this, "Pr");
  }
  constructor(t) {
    this.value = t;
  }
  write(t) {
    t.write(this.value);
  }
  markAsError() {
    this.value.markAsError();
  }
};
l();
u();
c();
p();
m();
var Ar = /* @__PURE__ */ __name((e6) => e6, "Ar");
var vr = { bold: Ar, red: Ar, green: Ar, dim: Ar, enabled: false };
var Do = { bold: cr, red: ze, green: oo, dim: pr, enabled: true };
var rt = { write(e6) {
  e6.writeLine(",");
} };
l();
u();
c();
p();
m();
var ge = class {
  static {
    __name(this, "ge");
  }
  constructor(t) {
    this.contents = t;
  }
  isUnderlined = false;
  color = /* @__PURE__ */ __name((t) => t, "color");
  underline() {
    return this.isUnderlined = true, this;
  }
  setColor(t) {
    return this.color = t, this;
  }
  write(t) {
    let r = t.getCurrentLineLength();
    t.write(this.color(this.contents)), this.isUnderlined && t.afterNextNewline(() => {
      t.write(" ".repeat(r)).writeLine(this.color("~".repeat(this.contents.length)));
    });
  }
};
l();
u();
c();
p();
m();
var Se = class {
  static {
    __name(this, "Se");
  }
  hasError = false;
  markAsError() {
    return this.hasError = true, this;
  }
};
var nt = class extends Se {
  static {
    __name(this, "nt");
  }
  items = [];
  addItem(t) {
    return this.items.push(new Pr(t)), this;
  }
  getField(t) {
    return this.items[t];
  }
  getPrintWidth() {
    return this.items.length === 0 ? 2 : Math.max(...this.items.map((r) => r.value.getPrintWidth())) + 2;
  }
  write(t) {
    if (this.items.length === 0) {
      this.writeEmpty(t);
      return;
    }
    this.writeWithItems(t);
  }
  writeEmpty(t) {
    let r = new ge("[]");
    this.hasError && r.setColor(t.context.colors.red).underline(), t.write(r);
  }
  writeWithItems(t) {
    let { colors: r } = t.context;
    t.writeLine("[").withIndent(() => t.writeJoined(rt, this.items).newLine()).write("]"), this.hasError && t.afterNextNewline(() => {
      t.writeLine(r.red("~".repeat(this.getPrintWidth())));
    });
  }
  asObject() {
  }
};
var it = class e extends Se {
  static {
    __name(this, "e");
  }
  fields = {};
  suggestions = [];
  addField(t) {
    this.fields[t.name] = t;
  }
  addSuggestion(t) {
    this.suggestions.push(t);
  }
  getField(t) {
    return this.fields[t];
  }
  getDeepField(t) {
    let [r, ...n] = t, i = this.getField(r);
    if (!i) return;
    let o2 = i;
    for (let s of n) {
      let a2;
      if (o2.value instanceof e ? a2 = o2.value.getField(s) : o2.value instanceof nt && (a2 = o2.value.getField(Number(s))), !a2) return;
      o2 = a2;
    }
    return o2;
  }
  getDeepFieldValue(t) {
    return t.length === 0 ? this : this.getDeepField(t)?.value;
  }
  hasField(t) {
    return !!this.getField(t);
  }
  removeAllFields() {
    this.fields = {};
  }
  removeField(t) {
    delete this.fields[t];
  }
  getFields() {
    return this.fields;
  }
  isEmpty() {
    return Object.keys(this.fields).length === 0;
  }
  getFieldValue(t) {
    return this.getField(t)?.value;
  }
  getDeepSubSelectionValue(t) {
    let r = this;
    for (let n of t) {
      if (!(r instanceof e)) return;
      let i = r.getSubSelectionValue(n);
      if (!i) return;
      r = i;
    }
    return r;
  }
  getDeepSelectionParent(t) {
    let r = this.getSelectionParent();
    if (!r) return;
    let n = r;
    for (let i of t) {
      let o2 = n.value.getFieldValue(i);
      if (!o2 || !(o2 instanceof e)) return;
      let s = o2.getSelectionParent();
      if (!s) return;
      n = s;
    }
    return n;
  }
  getSelectionParent() {
    let t = this.getField("select")?.value.asObject();
    if (t) return { kind: "select", value: t };
    let r = this.getField("include")?.value.asObject();
    if (r) return { kind: "include", value: r };
  }
  getSubSelectionValue(t) {
    return this.getSelectionParent()?.value.fields[t].value;
  }
  getPrintWidth() {
    let t = Object.values(this.fields);
    return t.length == 0 ? 2 : Math.max(...t.map((n) => n.getPrintWidth())) + 2;
  }
  write(t) {
    let r = Object.values(this.fields);
    if (r.length === 0 && this.suggestions.length === 0) {
      this.writeEmpty(t);
      return;
    }
    this.writeWithContents(t, r);
  }
  asObject() {
    return this;
  }
  writeEmpty(t) {
    let r = new ge("{}");
    this.hasError && r.setColor(t.context.colors.red).underline(), t.write(r);
  }
  writeWithContents(t, r) {
    t.writeLine("{").withIndent(() => {
      t.writeJoined(rt, [...r, ...this.suggestions]).newLine();
    }), t.write("}"), this.hasError && t.afterNextNewline(() => {
      t.writeLine(t.context.colors.red("~".repeat(this.getPrintWidth())));
    });
  }
};
l();
u();
c();
p();
m();
var G = class extends Se {
  static {
    __name(this, "G");
  }
  constructor(r) {
    super();
    this.text = r;
  }
  getPrintWidth() {
    return this.text.length;
  }
  write(r) {
    let n = new ge(this.text);
    this.hasError && n.underline().setColor(r.context.colors.red), r.write(n);
  }
  asObject() {
  }
};
l();
u();
c();
p();
m();
var Mt = class {
  static {
    __name(this, "Mt");
  }
  fields = [];
  addField(t, r) {
    return this.fields.push({ write(n) {
      let { green: i, dim: o2 } = n.context.colors;
      n.write(i(o2(`${t}: ${r}`))).addMarginSymbol(i(o2("+")));
    } }), this;
  }
  write(t) {
    let { colors: { green: r } } = t.context;
    t.writeLine(r("{")).withIndent(() => {
      t.writeJoined(rt, this.fields).newLine();
    }).write(r("}")).addMarginSymbol(r("+"));
  }
};
function Tr(e6, t, r) {
  switch (e6.kind) {
    case "MutuallyExclusiveFields":
      Lu(e6, t);
      break;
    case "IncludeOnScalar":
      _u(e6, t);
      break;
    case "EmptySelection":
      Fu(e6, t, r);
      break;
    case "UnknownSelectionField":
      Vu(e6, t);
      break;
    case "InvalidSelectionValue":
      Bu(e6, t);
      break;
    case "UnknownArgument":
      ju(e6, t);
      break;
    case "UnknownInputField":
      Qu(e6, t);
      break;
    case "RequiredArgumentMissing":
      Hu(e6, t);
      break;
    case "InvalidArgumentType":
      Ju(e6, t);
      break;
    case "InvalidArgumentValue":
      Wu(e6, t);
      break;
    case "ValueTooLarge":
      Gu(e6, t);
      break;
    case "SomeFieldsMissing":
      Ku(e6, t);
      break;
    case "TooManyFieldsGiven":
      zu(e6, t);
      break;
    case "Union":
      Oo(e6, t, r);
      break;
    default:
      throw new Error("not implemented: " + e6.kind);
  }
}
__name(Tr, "Tr");
function Lu(e6, t) {
  let r = t.arguments.getDeepSubSelectionValue(e6.selectionPath)?.asObject();
  r && (r.getField(e6.firstField)?.markAsError(), r.getField(e6.secondField)?.markAsError()), t.addErrorMessage((n) => `Please ${n.bold("either")} use ${n.green(`\`${e6.firstField}\``)} or ${n.green(`\`${e6.secondField}\``)}, but ${n.red("not both")} at the same time.`);
}
__name(Lu, "Lu");
function _u(e6, t) {
  let [r, n] = ot(e6.selectionPath), i = e6.outputType, o2 = t.arguments.getDeepSelectionParent(r)?.value;
  if (o2 && (o2.getField(n)?.markAsError(), i)) for (let s of i.fields) s.isRelation && o2.addSuggestion(new ie(s.name, "true"));
  t.addErrorMessage((s) => {
    let a2 = `Invalid scalar field ${s.red(`\`${n}\``)} for ${s.bold("include")} statement`;
    return i ? a2 += ` on model ${s.bold(i.name)}. ${Nt(s)}` : a2 += ".", a2 += `
Note that ${s.bold("include")} statements only accept relation fields.`, a2;
  });
}
__name(_u, "_u");
function Fu(e6, t, r) {
  let n = t.arguments.getDeepSubSelectionValue(e6.selectionPath)?.asObject();
  if (n) {
    let i = n.getField("omit")?.value.asObject();
    if (i) {
      Uu(e6, t, i);
      return;
    }
    if (n.hasField("select")) {
      $u(e6, t);
      return;
    }
  }
  if (r?.[Ce(e6.outputType.name)]) {
    qu(e6, t);
    return;
  }
  t.addErrorMessage(() => `Unknown field at "${e6.selectionPath.join(".")} selection"`);
}
__name(Fu, "Fu");
function Uu(e6, t, r) {
  r.removeAllFields();
  for (let n of e6.outputType.fields) r.addSuggestion(new ie(n.name, "false"));
  t.addErrorMessage((n) => `The ${n.red("omit")} statement includes every field of the model ${n.bold(e6.outputType.name)}. At least one field must be included in the result`);
}
__name(Uu, "Uu");
function $u(e6, t) {
  let r = e6.outputType, n = t.arguments.getDeepSelectionParent(e6.selectionPath)?.value, i = n?.isEmpty() ?? false;
  n && (n.removeAllFields(), Uo(n, r)), t.addErrorMessage((o2) => i ? `The ${o2.red("`select`")} statement for type ${o2.bold(r.name)} must not be empty. ${Nt(o2)}` : `The ${o2.red("`select`")} statement for type ${o2.bold(r.name)} needs ${o2.bold("at least one truthy value")}.`);
}
__name($u, "$u");
function qu(e6, t) {
  let r = new Mt();
  for (let i of e6.outputType.fields) i.isRelation || r.addField(i.name, "false");
  let n = new ie("omit", r).makeRequired();
  if (e6.selectionPath.length === 0) t.arguments.addSuggestion(n);
  else {
    let [i, o2] = ot(e6.selectionPath), a2 = t.arguments.getDeepSelectionParent(i)?.value.asObject()?.getField(o2);
    if (a2) {
      let d = a2?.value.asObject() ?? new it();
      d.addSuggestion(n), a2.value = d;
    }
  }
  t.addErrorMessage((i) => `The global ${i.red("omit")} configuration excludes every field of the model ${i.bold(e6.outputType.name)}. At least one field must be included in the result`);
}
__name(qu, "qu");
function Vu(e6, t) {
  let r = $o(e6.selectionPath, t);
  if (r.parentKind !== "unknown") {
    r.field.markAsError();
    let n = r.parent;
    switch (r.parentKind) {
      case "select":
        Uo(n, e6.outputType);
        break;
      case "include":
        Zu(n, e6.outputType);
        break;
      case "omit":
        Yu(n, e6.outputType);
        break;
    }
  }
  t.addErrorMessage((n) => {
    let i = [`Unknown field ${n.red(`\`${r.fieldName}\``)}`];
    return r.parentKind !== "unknown" && i.push(`for ${n.bold(r.parentKind)} statement`), i.push(`on model ${n.bold(`\`${e6.outputType.name}\``)}.`), i.push(Nt(n)), i.join(" ");
  });
}
__name(Vu, "Vu");
function Bu(e6, t) {
  let r = $o(e6.selectionPath, t);
  r.parentKind !== "unknown" && r.field.value.markAsError(), t.addErrorMessage((n) => `Invalid value for selection field \`${n.red(r.fieldName)}\`: ${e6.underlyingError}`);
}
__name(Bu, "Bu");
function ju(e6, t) {
  let r = e6.argumentPath[0], n = t.arguments.getDeepSubSelectionValue(e6.selectionPath)?.asObject();
  n && (n.getField(r)?.markAsError(), Xu(n, e6.arguments)), t.addErrorMessage((i) => _o(i, r, e6.arguments.map((o2) => o2.name)));
}
__name(ju, "ju");
function Qu(e6, t) {
  let [r, n] = ot(e6.argumentPath), i = t.arguments.getDeepSubSelectionValue(e6.selectionPath)?.asObject();
  if (i) {
    i.getDeepField(e6.argumentPath)?.markAsError();
    let o2 = i.getDeepFieldValue(r)?.asObject();
    o2 && qo(o2, e6.inputType);
  }
  t.addErrorMessage((o2) => _o(o2, n, e6.inputType.fields.map((s) => s.name)));
}
__name(Qu, "Qu");
function _o(e6, t, r) {
  let n = [`Unknown argument \`${e6.red(t)}\`.`], i = tc(t, r);
  return i && n.push(`Did you mean \`${e6.green(i)}\`?`), r.length > 0 && n.push(Nt(e6)), n.join(" ");
}
__name(_o, "_o");
function Hu(e6, t) {
  let r;
  t.addErrorMessage((d) => r?.value instanceof G && r.value.text === "null" ? `Argument \`${d.green(o2)}\` must not be ${d.red("null")}.` : `Argument \`${d.green(o2)}\` is missing.`);
  let n = t.arguments.getDeepSubSelectionValue(e6.selectionPath)?.asObject();
  if (!n) return;
  let [i, o2] = ot(e6.argumentPath), s = new Mt(), a2 = n.getDeepFieldValue(i)?.asObject();
  if (a2) {
    if (r = a2.getField(o2), r && a2.removeField(o2), e6.inputTypes.length === 1 && e6.inputTypes[0].kind === "object") {
      for (let d of e6.inputTypes[0].fields) s.addField(d.name, d.typeNames.join(" | "));
      a2.addSuggestion(new ie(o2, s).makeRequired());
    } else {
      let d = e6.inputTypes.map(Fo).join(" | ");
      a2.addSuggestion(new ie(o2, d).makeRequired());
    }
    if (e6.dependentArgumentPath) {
      n.getDeepField(e6.dependentArgumentPath)?.markAsError();
      let [, d] = ot(e6.dependentArgumentPath);
      t.addErrorMessage((f2) => `Argument \`${f2.green(o2)}\` is required because argument \`${f2.green(d)}\` was provided.`);
    }
  }
}
__name(Hu, "Hu");
function Fo(e6) {
  return e6.kind === "list" ? `${Fo(e6.elementType)}[]` : e6.name;
}
__name(Fo, "Fo");
function Ju(e6, t) {
  let r = e6.argument.name, n = t.arguments.getDeepSubSelectionValue(e6.selectionPath)?.asObject();
  n && n.getDeepFieldValue(e6.argumentPath)?.markAsError(), t.addErrorMessage((i) => {
    let o2 = Cr("or", e6.argument.typeNames.map((s) => i.green(s)));
    return `Argument \`${i.bold(r)}\`: Invalid value provided. Expected ${o2}, provided ${i.red(e6.inferredType)}.`;
  });
}
__name(Ju, "Ju");
function Wu(e6, t) {
  let r = e6.argument.name, n = t.arguments.getDeepSubSelectionValue(e6.selectionPath)?.asObject();
  n && n.getDeepFieldValue(e6.argumentPath)?.markAsError(), t.addErrorMessage((i) => {
    let o2 = [`Invalid value for argument \`${i.bold(r)}\``];
    if (e6.underlyingError && o2.push(`: ${e6.underlyingError}`), o2.push("."), e6.argument.typeNames.length > 0) {
      let s = Cr("or", e6.argument.typeNames.map((a2) => i.green(a2)));
      o2.push(` Expected ${s}.`);
    }
    return o2.join("");
  });
}
__name(Wu, "Wu");
function Gu(e6, t) {
  let r = e6.argument.name, n = t.arguments.getDeepSubSelectionValue(e6.selectionPath)?.asObject(), i;
  if (n) {
    let s = n.getDeepField(e6.argumentPath)?.value;
    s?.markAsError(), s instanceof G && (i = s.text);
  }
  t.addErrorMessage((o2) => {
    let s = ["Unable to fit value"];
    return i && s.push(o2.red(i)), s.push(`into a 64-bit signed integer for field \`${o2.bold(r)}\``), s.join(" ");
  });
}
__name(Gu, "Gu");
function Ku(e6, t) {
  let r = e6.argumentPath[e6.argumentPath.length - 1], n = t.arguments.getDeepSubSelectionValue(e6.selectionPath)?.asObject();
  if (n) {
    let i = n.getDeepFieldValue(e6.argumentPath)?.asObject();
    i && qo(i, e6.inputType);
  }
  t.addErrorMessage((i) => {
    let o2 = [`Argument \`${i.bold(r)}\` of type ${i.bold(e6.inputType.name)} needs`];
    return e6.constraints.minFieldCount === 1 ? e6.constraints.requiredFields ? o2.push(`${i.green("at least one of")} ${Cr("or", e6.constraints.requiredFields.map((s) => `\`${i.bold(s)}\``))} arguments.`) : o2.push(`${i.green("at least one")} argument.`) : o2.push(`${i.green(`at least ${e6.constraints.minFieldCount}`)} arguments.`), o2.push(Nt(i)), o2.join(" ");
  });
}
__name(Ku, "Ku");
function zu(e6, t) {
  let r = e6.argumentPath[e6.argumentPath.length - 1], n = t.arguments.getDeepSubSelectionValue(e6.selectionPath)?.asObject(), i = [];
  if (n) {
    let o2 = n.getDeepFieldValue(e6.argumentPath)?.asObject();
    o2 && (o2.markAsError(), i = Object.keys(o2.getFields()));
  }
  t.addErrorMessage((o2) => {
    let s = [`Argument \`${o2.bold(r)}\` of type ${o2.bold(e6.inputType.name)} needs`];
    return e6.constraints.minFieldCount === 1 && e6.constraints.maxFieldCount == 1 ? s.push(`${o2.green("exactly one")} argument,`) : e6.constraints.maxFieldCount == 1 ? s.push(`${o2.green("at most one")} argument,`) : s.push(`${o2.green(`at most ${e6.constraints.maxFieldCount}`)} arguments,`), s.push(`but you provided ${Cr("and", i.map((a2) => o2.red(a2)))}. Please choose`), e6.constraints.maxFieldCount === 1 ? s.push("one.") : s.push(`${e6.constraints.maxFieldCount}.`), s.join(" ");
  });
}
__name(zu, "zu");
function Uo(e6, t) {
  for (let r of t.fields) e6.hasField(r.name) || e6.addSuggestion(new ie(r.name, "true"));
}
__name(Uo, "Uo");
function Zu(e6, t) {
  for (let r of t.fields) r.isRelation && !e6.hasField(r.name) && e6.addSuggestion(new ie(r.name, "true"));
}
__name(Zu, "Zu");
function Yu(e6, t) {
  for (let r of t.fields) !e6.hasField(r.name) && !r.isRelation && e6.addSuggestion(new ie(r.name, "true"));
}
__name(Yu, "Yu");
function Xu(e6, t) {
  for (let r of t) e6.hasField(r.name) || e6.addSuggestion(new ie(r.name, r.typeNames.join(" | ")));
}
__name(Xu, "Xu");
function $o(e6, t) {
  let [r, n] = ot(e6), i = t.arguments.getDeepSubSelectionValue(r)?.asObject();
  if (!i) return { parentKind: "unknown", fieldName: n };
  let o2 = i.getFieldValue("select")?.asObject(), s = i.getFieldValue("include")?.asObject(), a2 = i.getFieldValue("omit")?.asObject(), d = o2?.getField(n);
  return o2 && d ? { parentKind: "select", parent: o2, field: d, fieldName: n } : (d = s?.getField(n), s && d ? { parentKind: "include", field: d, parent: s, fieldName: n } : (d = a2?.getField(n), a2 && d ? { parentKind: "omit", field: d, parent: a2, fieldName: n } : { parentKind: "unknown", fieldName: n }));
}
__name($o, "$o");
function qo(e6, t) {
  if (t.kind === "object") for (let r of t.fields) e6.hasField(r.name) || e6.addSuggestion(new ie(r.name, r.typeNames.join(" | ")));
}
__name(qo, "qo");
function ot(e6) {
  let t = [...e6], r = t.pop();
  if (!r) throw new Error("unexpected empty path");
  return [t, r];
}
__name(ot, "ot");
function Nt({ green: e6, enabled: t }) {
  return "Available options are " + (t ? `listed in ${e6("green")}` : "marked with ?") + ".";
}
__name(Nt, "Nt");
function Cr(e6, t) {
  if (t.length === 1) return t[0];
  let r = [...t], n = r.pop();
  return `${r.join(", ")} ${e6} ${n}`;
}
__name(Cr, "Cr");
var ec = 3;
function tc(e6, t) {
  let r = 1 / 0, n;
  for (let i of t) {
    let o2 = (0, Lo.default)(e6, i);
    o2 > ec || o2 < r && (r = o2, n = i);
  }
  return n;
}
__name(tc, "tc");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var Dt = class {
  static {
    __name(this, "Dt");
  }
  modelName;
  name;
  typeName;
  isList;
  isEnum;
  constructor(t, r, n, i, o2) {
    this.modelName = t, this.name = r, this.typeName = n, this.isList = i, this.isEnum = o2;
  }
  _toGraphQLInputType() {
    let t = this.isList ? "List" : "", r = this.isEnum ? "Enum" : "";
    return `${t}${r}${this.typeName}FieldRefInput<${this.modelName}>`;
  }
};
function st(e6) {
  return e6 instanceof Dt;
}
__name(st, "st");
l();
u();
c();
p();
m();
var Vo = ": ";
var Sr = class {
  static {
    __name(this, "Sr");
  }
  constructor(t, r) {
    this.name = t;
    this.value = r;
  }
  hasError = false;
  markAsError() {
    this.hasError = true;
  }
  getPrintWidth() {
    return this.name.length + this.value.getPrintWidth() + Vo.length;
  }
  write(t) {
    let r = new ge(this.name);
    this.hasError && r.underline().setColor(t.context.colors.red), t.write(r).write(Vo).write(this.value);
  }
};
var kn = class {
  static {
    __name(this, "kn");
  }
  arguments;
  errorMessages = [];
  constructor(t) {
    this.arguments = t;
  }
  write(t) {
    t.write(this.arguments);
  }
  addErrorMessage(t) {
    this.errorMessages.push(t);
  }
  renderAllMessages(t) {
    return this.errorMessages.map((r) => r(t)).join(`
`);
  }
};
function at(e6) {
  return new kn(Bo(e6));
}
__name(at, "at");
function Bo(e6) {
  let t = new it();
  for (let [r, n] of Object.entries(e6)) {
    let i = new Sr(r, jo(n));
    t.addField(i);
  }
  return t;
}
__name(Bo, "Bo");
function jo(e6) {
  if (typeof e6 == "string") return new G(JSON.stringify(e6));
  if (typeof e6 == "number" || typeof e6 == "boolean") return new G(String(e6));
  if (typeof e6 == "bigint") return new G(`${e6}n`);
  if (e6 === null) return new G("null");
  if (e6 === void 0) return new G("undefined");
  if (et(e6)) return new G(`new Prisma.Decimal("${e6.toFixed()}")`);
  if (e6 instanceof Uint8Array) return y.isBuffer(e6) ? new G(`Buffer.alloc(${e6.byteLength})`) : new G(`new Uint8Array(${e6.byteLength})`);
  if (e6 instanceof Date) {
    let t = br(e6) ? e6.toISOString() : "Invalid Date";
    return new G(`new Date("${t}")`);
  }
  return e6 instanceof ObjectEnumValue ? new G(`Prisma.${e6._getName()}`) : st(e6) ? new G(`prisma.${Ce(e6.modelName)}.$fields.${e6.name}`) : Array.isArray(e6) ? nc(e6) : typeof e6 == "object" ? Bo(e6) : new G(Object.prototype.toString.call(e6));
}
__name(jo, "jo");
function nc(e6) {
  let t = new nt();
  for (let r of e6) t.addItem(jo(r));
  return t;
}
__name(nc, "nc");
function Rr(e6, t) {
  let r = t === "pretty" ? Do : vr, n = e6.renderAllMessages(r), i = new tt(0, { colors: r }).write(e6).toString();
  return { message: n, args: i };
}
__name(Rr, "Rr");
function Ir({ args: e6, errors: t, errorFormat: r, callsite: n, originalMethod: i, clientVersion: o2, globalOmit: s }) {
  let a2 = at(e6);
  for (let A2 of t) Tr(A2, a2, s);
  let { message: d, args: f2 } = Rr(a2, r), P3 = Er({ message: d, callsite: n, originalMethod: i, showColors: r === "pretty", callArguments: f2 });
  throw new PrismaClientValidationError(P3, { clientVersion: o2 });
}
__name(Ir, "Ir");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
function ye(e6) {
  return e6.replace(/^./, (t) => t.toLowerCase());
}
__name(ye, "ye");
l();
u();
c();
p();
m();
function Ho(e6, t, r) {
  let n = ye(r);
  return !t.result || !(t.result.$allModels || t.result[n]) ? e6 : oc({ ...e6, ...Qo(t.name, e6, t.result.$allModels), ...Qo(t.name, e6, t.result[n]) });
}
__name(Ho, "Ho");
function oc(e6) {
  let t = new fe(), r = /* @__PURE__ */ __name((n, i) => t.getOrCreate(n, () => i.has(n) ? [n] : (i.add(n), e6[n] ? e6[n].needs.flatMap((o2) => r(o2, i)) : [n])), "r");
  return wr(e6, (n) => ({ ...n, needs: r(n.name, /* @__PURE__ */ new Set()) }));
}
__name(oc, "oc");
function Qo(e6, t, r) {
  return r ? wr(r, ({ needs: n, compute: i }, o2) => ({ name: o2, needs: n ? Object.keys(n).filter((s) => n[s]) : [], compute: sc(t, o2, i) })) : {};
}
__name(Qo, "Qo");
function sc(e6, t, r) {
  let n = e6?.[t]?.compute;
  return n ? (i) => r({ ...i, [t]: n(i) }) : r;
}
__name(sc, "sc");
function Jo(e6, t) {
  if (!t) return e6;
  let r = { ...e6 };
  for (let n of Object.values(t)) if (e6[n.name]) for (let i of n.needs) r[i] = true;
  return r;
}
__name(Jo, "Jo");
function Wo(e6, t) {
  if (!t) return e6;
  let r = { ...e6 };
  for (let n of Object.values(t)) if (!e6[n.name]) for (let i of n.needs) delete r[i];
  return r;
}
__name(Wo, "Wo");
var Or = class {
  static {
    __name(this, "Or");
  }
  constructor(t, r) {
    this.extension = t;
    this.previous = r;
  }
  computedFieldsCache = new fe();
  modelExtensionsCache = new fe();
  queryCallbacksCache = new fe();
  clientExtensions = Pt(() => this.extension.client ? { ...this.previous?.getAllClientExtensions(), ...this.extension.client } : this.previous?.getAllClientExtensions());
  batchCallbacks = Pt(() => {
    let t = this.previous?.getAllBatchQueryCallbacks() ?? [], r = this.extension.query?.$__internalBatch;
    return r ? t.concat(r) : t;
  });
  getAllComputedFields(t) {
    return this.computedFieldsCache.getOrCreate(t, () => Ho(this.previous?.getAllComputedFields(t), this.extension, t));
  }
  getAllClientExtensions() {
    return this.clientExtensions.get();
  }
  getAllModelExtensions(t) {
    return this.modelExtensionsCache.getOrCreate(t, () => {
      let r = ye(t);
      return !this.extension.model || !(this.extension.model[r] || this.extension.model.$allModels) ? this.previous?.getAllModelExtensions(t) : { ...this.previous?.getAllModelExtensions(t), ...this.extension.model.$allModels, ...this.extension.model[r] };
    });
  }
  getAllQueryCallbacks(t, r) {
    return this.queryCallbacksCache.getOrCreate(`${t}:${r}`, () => {
      let n = this.previous?.getAllQueryCallbacks(t, r) ?? [], i = [], o2 = this.extension.query;
      return !o2 || !(o2[t] || o2.$allModels || o2[r] || o2.$allOperations) ? n : (o2[t] !== void 0 && (o2[t][r] !== void 0 && i.push(o2[t][r]), o2[t].$allOperations !== void 0 && i.push(o2[t].$allOperations)), t !== "$none" && o2.$allModels !== void 0 && (o2.$allModels[r] !== void 0 && i.push(o2.$allModels[r]), o2.$allModels.$allOperations !== void 0 && i.push(o2.$allModels.$allOperations)), o2[r] !== void 0 && i.push(o2[r]), o2.$allOperations !== void 0 && i.push(o2.$allOperations), n.concat(i));
    });
  }
  getAllBatchQueryCallbacks() {
    return this.batchCallbacks.get();
  }
};
var lt = class e2 {
  static {
    __name(this, "e");
  }
  constructor(t) {
    this.head = t;
  }
  static empty() {
    return new e2();
  }
  static single(t) {
    return new e2(new Or(t));
  }
  isEmpty() {
    return this.head === void 0;
  }
  append(t) {
    return new e2(new Or(t, this.head));
  }
  getAllComputedFields(t) {
    return this.head?.getAllComputedFields(t);
  }
  getAllClientExtensions() {
    return this.head?.getAllClientExtensions();
  }
  getAllModelExtensions(t) {
    return this.head?.getAllModelExtensions(t);
  }
  getAllQueryCallbacks(t, r) {
    return this.head?.getAllQueryCallbacks(t, r) ?? [];
  }
  getAllBatchQueryCallbacks() {
    return this.head?.getAllBatchQueryCallbacks() ?? [];
  }
};
l();
u();
c();
p();
m();
var kr = class {
  static {
    __name(this, "kr");
  }
  constructor(t) {
    this.name = t;
  }
};
function Go(e6) {
  return e6 instanceof kr;
}
__name(Go, "Go");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var Ko = Symbol();
var Lt = class {
  static {
    __name(this, "Lt");
  }
  constructor(t) {
    if (t !== Ko) throw new Error("Skip instance can not be constructed directly");
  }
  ifUndefined(t) {
    return t === void 0 ? Mn : t;
  }
};
var Mn = new Lt(Ko);
function he(e6) {
  return e6 instanceof Lt;
}
__name(he, "he");
var mc = { findUnique: "findUnique", findUniqueOrThrow: "findUniqueOrThrow", findFirst: "findFirst", findFirstOrThrow: "findFirstOrThrow", findMany: "findMany", count: "aggregate", create: "createOne", createMany: "createMany", createManyAndReturn: "createManyAndReturn", update: "updateOne", updateMany: "updateMany", updateManyAndReturn: "updateManyAndReturn", upsert: "upsertOne", delete: "deleteOne", deleteMany: "deleteMany", executeRaw: "executeRaw", queryRaw: "queryRaw", aggregate: "aggregate", groupBy: "groupBy", runCommandRaw: "runCommandRaw", findRaw: "findRaw", aggregateRaw: "aggregateRaw" };
var zo = "explicitly `undefined` values are not allowed";
function Dn({ modelName: e6, action: t, args: r, runtimeDataModel: n, extensions: i = lt.empty(), callsite: o2, clientMethod: s, errorFormat: a2, clientVersion: d, previewFeatures: f2, globalOmit: P3 }) {
  let A2 = new Nn({ runtimeDataModel: n, modelName: e6, action: t, rootArgs: r, callsite: o2, extensions: i, selectionPath: [], argumentPath: [], originalMethod: s, errorFormat: a2, clientVersion: d, previewFeatures: f2, globalOmit: P3 });
  return { modelName: e6, action: mc[t], query: _t(r, A2) };
}
__name(Dn, "Dn");
function _t({ select: e6, include: t, ...r } = {}, n) {
  let i = r.omit;
  return delete r.omit, { arguments: Yo(r, n), selection: dc(e6, t, i, n) };
}
__name(_t, "_t");
function dc(e6, t, r, n) {
  return e6 ? (t ? n.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "include", secondField: "select", selectionPath: n.getSelectionPath() }) : r && n.throwValidationError({ kind: "MutuallyExclusiveFields", firstField: "omit", secondField: "select", selectionPath: n.getSelectionPath() }), hc(e6, n)) : fc(n, t, r);
}
__name(dc, "dc");
function fc(e6, t, r) {
  let n = {};
  return e6.modelOrType && !e6.isRawAction() && (n.$composites = true, n.$scalars = true), t && gc(n, t, e6), yc(n, r, e6), n;
}
__name(fc, "fc");
function gc(e6, t, r) {
  for (let [n, i] of Object.entries(t)) {
    if (he(i)) continue;
    let o2 = r.nestSelection(n);
    if (Ln(i, o2), i === false || i === void 0) {
      e6[n] = false;
      continue;
    }
    let s = r.findField(n);
    if (s && s.kind !== "object" && r.throwValidationError({ kind: "IncludeOnScalar", selectionPath: r.getSelectionPath().concat(n), outputType: r.getOutputTypeDescription() }), s) {
      e6[n] = _t(i === true ? {} : i, o2);
      continue;
    }
    if (i === true) {
      e6[n] = true;
      continue;
    }
    e6[n] = _t(i, o2);
  }
}
__name(gc, "gc");
function yc(e6, t, r) {
  let n = r.getComputedFields(), i = { ...r.getGlobalOmit(), ...t }, o2 = Wo(i, n);
  for (let [s, a2] of Object.entries(o2)) {
    if (he(a2)) continue;
    Ln(a2, r.nestSelection(s));
    let d = r.findField(s);
    n?.[s] && !d || (e6[s] = !a2);
  }
}
__name(yc, "yc");
function hc(e6, t) {
  let r = {}, n = t.getComputedFields(), i = Jo(e6, n);
  for (let [o2, s] of Object.entries(i)) {
    if (he(s)) continue;
    let a2 = t.nestSelection(o2);
    Ln(s, a2);
    let d = t.findField(o2);
    if (!(n?.[o2] && !d)) {
      if (s === false || s === void 0 || he(s)) {
        r[o2] = false;
        continue;
      }
      if (s === true) {
        d?.kind === "object" ? r[o2] = _t({}, a2) : r[o2] = true;
        continue;
      }
      r[o2] = _t(s, a2);
    }
  }
  return r;
}
__name(hc, "hc");
function Zo(e6, t) {
  if (e6 === null) return null;
  if (typeof e6 == "string" || typeof e6 == "number" || typeof e6 == "boolean") return e6;
  if (typeof e6 == "bigint") return { $type: "BigInt", value: String(e6) };
  if (Xe(e6)) {
    if (br(e6)) return { $type: "DateTime", value: e6.toISOString() };
    t.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: t.getSelectionPath(), argumentPath: t.getArgumentPath(), argument: { name: t.getArgumentName(), typeNames: ["Date"] }, underlyingError: "Provided Date object is invalid" });
  }
  if (Go(e6)) return { $type: "Param", value: e6.name };
  if (st(e6)) return { $type: "FieldRef", value: { _ref: e6.name, _container: e6.modelName } };
  if (Array.isArray(e6)) return wc(e6, t);
  if (ArrayBuffer.isView(e6)) {
    let { buffer: r, byteOffset: n, byteLength: i } = e6;
    return { $type: "Bytes", value: y.from(r, n, i).toString("base64") };
  }
  if (bc(e6)) return e6.values;
  if (et(e6)) return { $type: "Decimal", value: e6.toFixed() };
  if (e6 instanceof ObjectEnumValue) {
    if (!isDbNull(e6) && !isJsonNull(e6) && !isAnyNull(e6)) throw new Error("Invalid ObjectEnumValue");
    return { $type: "Enum", value: e6._getName() };
  }
  if (xc(e6)) return e6.toJSON();
  if (typeof e6 == "object") return Yo(e6, t);
  t.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: t.getSelectionPath(), argumentPath: t.getArgumentPath(), argument: { name: t.getArgumentName(), typeNames: [] }, underlyingError: `We could not serialize ${Object.prototype.toString.call(e6)} value. Serialize the object to JSON or implement a ".toJSON()" method on it` });
}
__name(Zo, "Zo");
function Yo(e6, t) {
  if (e6.$type) return { $type: "Raw", value: e6 };
  let r = {};
  for (let n in e6) {
    let i = e6[n], o2 = t.nestArgument(n);
    he(i) || (i !== void 0 ? r[n] = Zo(i, o2) : t.isPreviewFeatureOn("strictUndefinedChecks") && t.throwValidationError({ kind: "InvalidArgumentValue", argumentPath: o2.getArgumentPath(), selectionPath: t.getSelectionPath(), argument: { name: t.getArgumentName(), typeNames: [] }, underlyingError: zo }));
  }
  return r;
}
__name(Yo, "Yo");
function wc(e6, t) {
  let r = [];
  for (let n = 0; n < e6.length; n++) {
    let i = t.nestArgument(String(n)), o2 = e6[n];
    if (o2 === void 0 || he(o2)) {
      let s = o2 === void 0 ? "undefined" : "Prisma.skip";
      t.throwValidationError({ kind: "InvalidArgumentValue", selectionPath: i.getSelectionPath(), argumentPath: i.getArgumentPath(), argument: { name: `${t.getArgumentName()}[${n}]`, typeNames: [] }, underlyingError: `Can not use \`${s}\` value within array. Use \`null\` or filter out \`${s}\` values` });
    }
    r.push(Zo(o2, i));
  }
  return r;
}
__name(wc, "wc");
function bc(e6) {
  return typeof e6 == "object" && e6 !== null && e6.__prismaRawParameters__ === true;
}
__name(bc, "bc");
function xc(e6) {
  return typeof e6 == "object" && e6 !== null && typeof e6.toJSON == "function";
}
__name(xc, "xc");
function Ln(e6, t) {
  e6 === void 0 && t.isPreviewFeatureOn("strictUndefinedChecks") && t.throwValidationError({ kind: "InvalidSelectionValue", selectionPath: t.getSelectionPath(), underlyingError: zo });
}
__name(Ln, "Ln");
var Nn = class e3 {
  static {
    __name(this, "e");
  }
  constructor(t) {
    this.params = t;
    this.params.modelName && (this.modelOrType = this.params.runtimeDataModel.models[this.params.modelName] ?? this.params.runtimeDataModel.types[this.params.modelName]);
  }
  modelOrType;
  throwValidationError(t) {
    Ir({ errors: [t], originalMethod: this.params.originalMethod, args: this.params.rootArgs ?? {}, callsite: this.params.callsite, errorFormat: this.params.errorFormat, clientVersion: this.params.clientVersion, globalOmit: this.params.globalOmit });
  }
  getSelectionPath() {
    return this.params.selectionPath;
  }
  getArgumentPath() {
    return this.params.argumentPath;
  }
  getArgumentName() {
    return this.params.argumentPath[this.params.argumentPath.length - 1];
  }
  getOutputTypeDescription() {
    if (!(!this.params.modelName || !this.modelOrType)) return { name: this.params.modelName, fields: this.modelOrType.fields.map((t) => ({ name: t.name, typeName: "boolean", isRelation: t.kind === "object" })) };
  }
  isRawAction() {
    return ["executeRaw", "queryRaw", "runCommandRaw", "findRaw", "aggregateRaw"].includes(this.params.action);
  }
  isPreviewFeatureOn(t) {
    return this.params.previewFeatures.includes(t);
  }
  getComputedFields() {
    if (this.params.modelName) return this.params.extensions.getAllComputedFields(this.params.modelName);
  }
  findField(t) {
    return this.modelOrType?.fields.find((r) => r.name === t);
  }
  nestSelection(t) {
    let r = this.findField(t), n = r?.kind === "object" ? r.type : void 0;
    return new e3({ ...this.params, modelName: n, selectionPath: this.params.selectionPath.concat(t) });
  }
  getGlobalOmit() {
    return this.params.modelName && this.shouldApplyGlobalOmit() ? this.params.globalOmit?.[Ce(this.params.modelName)] ?? {} : {};
  }
  shouldApplyGlobalOmit() {
    switch (this.params.action) {
      case "findFirst":
      case "findFirstOrThrow":
      case "findUniqueOrThrow":
      case "findMany":
      case "upsert":
      case "findUnique":
      case "createManyAndReturn":
      case "create":
      case "update":
      case "updateManyAndReturn":
      case "delete":
        return true;
      case "executeRaw":
      case "aggregateRaw":
      case "runCommandRaw":
      case "findRaw":
      case "createMany":
      case "deleteMany":
      case "groupBy":
      case "updateMany":
      case "count":
      case "aggregate":
      case "queryRaw":
        return false;
      default:
        Te(this.params.action, "Unknown action");
    }
  }
  nestArgument(t) {
    return new e3({ ...this.params, argumentPath: this.params.argumentPath.concat(t) });
  }
};
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var Fn = /* @__PURE__ */ new WeakMap();
var Mr = "$$PrismaTypedSql";
var Ft = class {
  static {
    __name(this, "Ft");
  }
  constructor(t, r) {
    Fn.set(this, { sql: t, values: r }), Object.defineProperty(this, Mr, { value: Mr });
  }
  get sql() {
    return Fn.get(this).sql;
  }
  get values() {
    return Fn.get(this).values;
  }
};
function Nr(e6) {
  return e6 != null && e6[Mr] === Mr;
}
__name(Nr, "Nr");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
Xo();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
function Ut(e6) {
  return { getKeys() {
    return Object.keys(e6);
  }, getPropertyValue(t) {
    return e6[t];
  } };
}
__name(Ut, "Ut");
l();
u();
c();
p();
m();
function Y(e6, t) {
  return { getKeys() {
    return [e6];
  }, getPropertyValue() {
    return t();
  } };
}
__name(Y, "Y");
l();
u();
c();
p();
m();
function Ue(e6) {
  let t = new fe();
  return { getKeys() {
    return e6.getKeys();
  }, getPropertyValue(r) {
    return t.getOrCreate(r, () => e6.getPropertyValue(r));
  }, getPropertyDescriptor(r) {
    return e6.getPropertyDescriptor?.(r);
  } };
}
__name(Ue, "Ue");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var Lr = { enumerable: true, configurable: true, writable: true };
function _r(e6) {
  let t = new Set(e6);
  return { getPrototypeOf: /* @__PURE__ */ __name(() => Object.prototype, "getPrototypeOf"), getOwnPropertyDescriptor: /* @__PURE__ */ __name(() => Lr, "getOwnPropertyDescriptor"), has: /* @__PURE__ */ __name((r, n) => t.has(n), "has"), set: /* @__PURE__ */ __name((r, n, i) => t.add(n) && Reflect.set(r, n, i), "set"), ownKeys: /* @__PURE__ */ __name(() => [...t], "ownKeys") };
}
__name(_r, "_r");
var es = Symbol.for("nodejs.util.inspect.custom");
function le(e6, t) {
  let r = Ac(t), n = /* @__PURE__ */ new Set(), i = new Proxy(e6, { get(o2, s) {
    if (n.has(s)) return o2[s];
    let a2 = r.get(s);
    return a2 ? a2.getPropertyValue(s) : o2[s];
  }, has(o2, s) {
    if (n.has(s)) return true;
    let a2 = r.get(s);
    return a2 ? a2.has?.(s) ?? true : Reflect.has(o2, s);
  }, ownKeys(o2) {
    let s = ts(Reflect.ownKeys(o2), r), a2 = ts(Array.from(r.keys()), r);
    return [.../* @__PURE__ */ new Set([...s, ...a2, ...n])];
  }, set(o2, s, a2) {
    return r.get(s)?.getPropertyDescriptor?.(s)?.writable === false ? false : (n.add(s), Reflect.set(o2, s, a2));
  }, getOwnPropertyDescriptor(o2, s) {
    let a2 = Reflect.getOwnPropertyDescriptor(o2, s);
    if (a2 && !a2.configurable) return a2;
    let d = r.get(s);
    return d ? d.getPropertyDescriptor ? { ...Lr, ...d?.getPropertyDescriptor(s) } : Lr : a2;
  }, defineProperty(o2, s, a2) {
    return n.add(s), Reflect.defineProperty(o2, s, a2);
  }, getPrototypeOf: /* @__PURE__ */ __name(() => Object.prototype, "getPrototypeOf") });
  return i[es] = function() {
    let o2 = { ...this };
    return delete o2[es], o2;
  }, i;
}
__name(le, "le");
function Ac(e6) {
  let t = /* @__PURE__ */ new Map();
  for (let r of e6) {
    let n = r.getKeys();
    for (let i of n) t.set(i, r);
  }
  return t;
}
__name(Ac, "Ac");
function ts(e6, t) {
  return e6.filter((r) => t.get(r)?.has?.(r) ?? true);
}
__name(ts, "ts");
l();
u();
c();
p();
m();
function ut(e6) {
  return { getKeys() {
    return e6;
  }, has() {
    return false;
  }, getPropertyValue() {
  } };
}
__name(ut, "ut");
l();
u();
c();
p();
m();
function rs(e6) {
  if (e6 === void 0) return "";
  let t = at(e6);
  return new tt(0, { colors: vr }).write(t).toString();
}
__name(rs, "rs");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var Un = class {
  static {
    __name(this, "Un");
  }
  getLocation() {
    return null;
  }
};
function Re(e6) {
  return typeof $EnabledCallSite == "function" && e6 !== "minimal" ? new $EnabledCallSite() : new Un();
}
__name(Re, "Re");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var ns = { _avg: true, _count: true, _sum: true, _min: true, _max: true };
function ct(e6 = {}) {
  let t = Cc(e6);
  return Object.entries(t).reduce((n, [i, o2]) => (ns[i] !== void 0 ? n.select[i] = { select: o2 } : n[i] = o2, n), { select: {} });
}
__name(ct, "ct");
function Cc(e6 = {}) {
  return typeof e6._count == "boolean" ? { ...e6, _count: { _all: e6._count } } : e6;
}
__name(Cc, "Cc");
function Fr(e6 = {}) {
  return (t) => (typeof e6._count == "boolean" && (t._count = t._count._all), t);
}
__name(Fr, "Fr");
function is(e6, t) {
  let r = Fr(e6);
  return t({ action: "aggregate", unpacker: r, argsMapper: ct })(e6);
}
__name(is, "is");
l();
u();
c();
p();
m();
function Sc(e6 = {}) {
  let { select: t, ...r } = e6;
  return typeof t == "object" ? ct({ ...r, _count: t }) : ct({ ...r, _count: { _all: true } });
}
__name(Sc, "Sc");
function Rc(e6 = {}) {
  return typeof e6.select == "object" ? (t) => Fr(e6)(t)._count : (t) => Fr(e6)(t)._count._all;
}
__name(Rc, "Rc");
function os(e6, t) {
  return t({ action: "count", unpacker: Rc(e6), argsMapper: Sc })(e6);
}
__name(os, "os");
l();
u();
c();
p();
m();
function Ic(e6 = {}) {
  let t = ct(e6);
  if (Array.isArray(t.by)) for (let r of t.by) typeof r == "string" && (t.select[r] = true);
  else typeof t.by == "string" && (t.select[t.by] = true);
  return t;
}
__name(Ic, "Ic");
function Oc(e6 = {}) {
  return (t) => (typeof e6?._count == "boolean" && t.forEach((r) => {
    r._count = r._count._all;
  }), t);
}
__name(Oc, "Oc");
function ss(e6, t) {
  return t({ action: "groupBy", unpacker: Oc(e6), argsMapper: Ic })(e6);
}
__name(ss, "ss");
function as(e6, t, r) {
  if (t === "aggregate") return (n) => is(n, r);
  if (t === "count") return (n) => os(n, r);
  if (t === "groupBy") return (n) => ss(n, r);
}
__name(as, "as");
l();
u();
c();
p();
m();
function ls(e6, t) {
  let r = t.fields.filter((i) => !i.relationName), n = eo(r, "name");
  return new Proxy({}, { get(i, o2) {
    if (o2 in i || typeof o2 == "symbol") return i[o2];
    let s = n[o2];
    if (s) return new Dt(e6, o2, s.type, s.isList, s.kind === "enum");
  }, ..._r(Object.keys(n)) });
}
__name(ls, "ls");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var us = /* @__PURE__ */ __name((e6) => Array.isArray(e6) ? e6 : e6.split("."), "us");
var $n = /* @__PURE__ */ __name((e6, t) => us(t).reduce((r, n) => r && r[n], e6), "$n");
var cs = /* @__PURE__ */ __name((e6, t, r) => us(t).reduceRight((n, i, o2, s) => Object.assign({}, $n(e6, s.slice(0, o2)), { [i]: n }), r), "cs");
function kc(e6, t) {
  return e6 === void 0 || t === void 0 ? [] : [...t, "select", e6];
}
__name(kc, "kc");
function Mc(e6, t, r) {
  return t === void 0 ? e6 ?? {} : cs(t, r, e6 || true);
}
__name(Mc, "Mc");
function qn(e6, t, r, n, i, o2) {
  let a2 = e6._runtimeDataModel.models[t].fields.reduce((d, f2) => ({ ...d, [f2.name]: f2 }), {});
  return (d) => {
    let f2 = Re(e6._errorFormat), P3 = kc(n, i), A2 = Mc(d, o2, P3), S2 = r({ dataPath: P3, callsite: f2 })(A2), C2 = Nc(e6, t);
    return new Proxy(S2, { get(M2, R2) {
      if (!C2.includes(R2)) return M2[R2];
      let xe = [a2[R2].type, r, R2], X2 = [P3, A2];
      return qn(e6, ...xe, ...X2);
    }, ..._r([...C2, ...Object.getOwnPropertyNames(S2)]) });
  };
}
__name(qn, "qn");
function Nc(e6, t) {
  return e6._runtimeDataModel.models[t].fields.filter((r) => r.kind === "object").map((r) => r.name);
}
__name(Nc, "Nc");
var Dc = ["findUnique", "findUniqueOrThrow", "findFirst", "findFirstOrThrow", "create", "update", "upsert", "delete"];
var Lc = ["aggregate", "count", "groupBy"];
function Vn(e6, t) {
  let r = e6._extensions.getAllModelExtensions(t) ?? {}, n = [_c(e6, t), Uc(e6, t), Ut(r), Y("name", () => t), Y("$name", () => t), Y("$parent", () => e6._appliedParent)];
  return le({}, n);
}
__name(Vn, "Vn");
function _c(e6, t) {
  let r = ye(t), n = Object.keys(kt).concat("count");
  return { getKeys() {
    return n;
  }, getPropertyValue(i) {
    let o2 = i, s = /* @__PURE__ */ __name((a2) => (d) => {
      let f2 = Re(e6._errorFormat);
      return e6._createPrismaPromise((P3) => {
        let A2 = { args: d, dataPath: [], action: o2, model: t, clientMethod: `${r}.${i}`, jsModelName: r, transaction: P3, callsite: f2 };
        return e6._request({ ...A2, ...a2 });
      }, { action: o2, args: d, model: t });
    }, "s");
    return Dc.includes(o2) ? qn(e6, t, s) : Fc(i) ? as(e6, i, s) : s({});
  } };
}
__name(_c, "_c");
function Fc(e6) {
  return Lc.includes(e6);
}
__name(Fc, "Fc");
function Uc(e6, t) {
  return Ue(Y("fields", () => {
    let r = e6._runtimeDataModel.models[t];
    return ls(t, r);
  }));
}
__name(Uc, "Uc");
l();
u();
c();
p();
m();
function ps(e6) {
  return e6.replace(/^./, (t) => t.toUpperCase());
}
__name(ps, "ps");
var Bn = Symbol();
function $t(e6) {
  let t = [$c(e6), qc(e6), Y(Bn, () => e6), Y("$parent", () => e6._appliedParent)], r = e6._extensions.getAllClientExtensions();
  return r && t.push(Ut(r)), le(e6, t);
}
__name($t, "$t");
function $c(e6) {
  let t = Object.getPrototypeOf(e6._originalClient), r = [...new Set(Object.getOwnPropertyNames(t))];
  return { getKeys() {
    return r;
  }, getPropertyValue(n) {
    return e6[n];
  } };
}
__name($c, "$c");
function qc(e6) {
  let t = Object.keys(e6._runtimeDataModel.models), r = t.map(ye), n = [...new Set(t.concat(r))];
  return Ue({ getKeys() {
    return n;
  }, getPropertyValue(i) {
    let o2 = ps(i);
    if (e6._runtimeDataModel.models[o2] !== void 0) return Vn(e6, o2);
    if (e6._runtimeDataModel.models[i] !== void 0) return Vn(e6, i);
  }, getPropertyDescriptor(i) {
    if (!r.includes(i)) return { enumerable: false };
  } });
}
__name(qc, "qc");
function ms(e6) {
  return e6[Bn] ? e6[Bn] : e6;
}
__name(ms, "ms");
function ds(e6) {
  if (typeof e6 == "function") return e6(this);
  let t = Object.create(this._originalClient, { _extensions: { value: this._extensions.append(e6) }, _appliedParent: { value: this, configurable: true }, $on: { value: void 0 } });
  return $t(t);
}
__name(ds, "ds");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
function fs({ result: e6, modelName: t, select: r, omit: n, extensions: i }) {
  let o2 = i.getAllComputedFields(t);
  if (!o2) return e6;
  let s = [], a2 = [];
  for (let d of Object.values(o2)) {
    if (n) {
      if (n[d.name]) continue;
      let f2 = d.needs.filter((P3) => n[P3]);
      f2.length > 0 && a2.push(ut(f2));
    } else if (r) {
      if (!r[d.name]) continue;
      let f2 = d.needs.filter((P3) => !r[P3]);
      f2.length > 0 && a2.push(ut(f2));
    }
    Vc(e6, d.needs) && s.push(Bc(d, le(e6, s)));
  }
  return s.length > 0 || a2.length > 0 ? le(e6, [...s, ...a2]) : e6;
}
__name(fs, "fs");
function Vc(e6, t) {
  return t.every((r) => Sn(e6, r));
}
__name(Vc, "Vc");
function Bc(e6, t) {
  return Ue(Y(e6.name, () => e6.compute(t)));
}
__name(Bc, "Bc");
l();
u();
c();
p();
m();
function Ur({ visitor: e6, result: t, args: r, runtimeDataModel: n, modelName: i }) {
  if (Array.isArray(t)) {
    for (let s = 0; s < t.length; s++) t[s] = Ur({ result: t[s], args: r, modelName: i, runtimeDataModel: n, visitor: e6 });
    return t;
  }
  let o2 = e6(t, i, r) ?? t;
  return r.include && gs({ includeOrSelect: r.include, result: o2, parentModelName: i, runtimeDataModel: n, visitor: e6 }), r.select && gs({ includeOrSelect: r.select, result: o2, parentModelName: i, runtimeDataModel: n, visitor: e6 }), o2;
}
__name(Ur, "Ur");
function gs({ includeOrSelect: e6, result: t, parentModelName: r, runtimeDataModel: n, visitor: i }) {
  for (let [o2, s] of Object.entries(e6)) {
    if (!s || t[o2] == null || he(s)) continue;
    let d = n.models[r].fields.find((P3) => P3.name === o2);
    if (!d || d.kind !== "object" || !d.relationName) continue;
    let f2 = typeof s == "object" ? s : {};
    t[o2] = Ur({ visitor: i, result: t[o2], args: f2, modelName: d.type, runtimeDataModel: n });
  }
}
__name(gs, "gs");
function ys({ result: e6, modelName: t, args: r, extensions: n, runtimeDataModel: i, globalOmit: o2 }) {
  return n.isEmpty() || e6 == null || typeof e6 != "object" || !i.models[t] ? e6 : Ur({ result: e6, args: r ?? {}, modelName: t, runtimeDataModel: i, visitor: /* @__PURE__ */ __name((a2, d, f2) => {
    let P3 = ye(d);
    return fs({ result: a2, modelName: P3, select: f2.select, omit: f2.select ? void 0 : { ...o2?.[P3], ...f2.omit }, extensions: n });
  }, "visitor") });
}
__name(ys, "ys");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var jc = ["$connect", "$disconnect", "$on", "$transaction", "$extends"];
var hs = jc;
function bs(e6) {
  if (e6 instanceof Sql) return Jc(e6);
  if (Nr(e6)) return Wc(e6);
  if (Array.isArray(e6)) {
    let r = [e6[0]];
    for (let n = 1; n < e6.length; n++) r[n] = qt(e6[n]);
    return r;
  }
  let t = {};
  for (let r in e6) t[r] = qt(e6[r]);
  return t;
}
__name(bs, "bs");
function Jc(e6) {
  return new Sql(e6.strings, e6.values);
}
__name(Jc, "Jc");
function Wc(e6) {
  return new Ft(e6.sql, e6.values);
}
__name(Wc, "Wc");
function qt(e6) {
  if (typeof e6 != "object" || e6 == null || e6 instanceof ObjectEnumValue || st(e6)) return e6;
  if (et(e6)) return new Decimal(e6.toFixed());
  if (Xe(e6)) return /* @__PURE__ */ new Date(+e6);
  if (ArrayBuffer.isView(e6)) return e6.slice(0);
  if (Array.isArray(e6)) {
    let t = e6.length, r;
    for (r = Array(t); t--; ) r[t] = qt(e6[t]);
    return r;
  }
  if (typeof e6 == "object") {
    let t = {};
    for (let r in e6) r === "__proto__" ? Object.defineProperty(t, r, { value: qt(e6[r]), configurable: true, enumerable: true, writable: true }) : t[r] = qt(e6[r]);
    return t;
  }
  Te(e6, "Unknown value");
}
__name(qt, "qt");
function Es(e6, t, r, n = 0) {
  return e6._createPrismaPromise((i) => {
    let o2 = t.customDataProxyFetch;
    return "transaction" in t && i !== void 0 && (t.transaction?.kind === "batch" && t.transaction.lock.then(), t.transaction = i), n === r.length ? e6._executeRequest(t) : r[n]({ model: t.model, operation: t.model ? t.action : t.clientMethod, args: bs(t.args ?? {}), __internalParams: t, query: /* @__PURE__ */ __name((s, a2 = t) => {
      let d = a2.customDataProxyFetch;
      return a2.customDataProxyFetch = vs(o2, d), a2.args = s, Es(e6, a2, r, n + 1);
    }, "query") });
  });
}
__name(Es, "Es");
function Ts(e6, t) {
  let { jsModelName: r, action: n, clientMethod: i } = t, o2 = r ? n : i;
  if (e6._extensions.isEmpty()) return e6._executeRequest(t);
  let s = e6._extensions.getAllQueryCallbacks(r ?? "$none", o2);
  return Es(e6, t, s);
}
__name(Ts, "Ts");
function Ps(e6) {
  return (t) => {
    let r = { requests: t }, n = t[0].extensions.getAllBatchQueryCallbacks();
    return n.length ? As(r, n, 0, e6) : e6(r);
  };
}
__name(Ps, "Ps");
function As(e6, t, r, n) {
  if (r === t.length) return n(e6);
  let i = e6.customDataProxyFetch, o2 = e6.requests[0].transaction;
  return t[r]({ args: { queries: e6.requests.map((s) => ({ model: s.modelName, operation: s.action, args: s.args })), transaction: o2 ? { isolationLevel: o2.kind === "batch" ? o2.isolationLevel : void 0 } : void 0 }, __internalParams: e6, query(s, a2 = e6) {
    let d = a2.customDataProxyFetch;
    return a2.customDataProxyFetch = vs(i, d), As(a2, t, r + 1, n);
  } });
}
__name(As, "As");
var xs = /* @__PURE__ */ __name((e6) => e6, "xs");
function vs(e6 = xs, t = xs) {
  return (r) => e6(t(r));
}
__name(vs, "vs");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
function D(e6, t) {
  throw new Error(t);
}
__name(D, "D");
function jn(e6, t) {
  return e6 === t || e6 !== null && t !== null && typeof e6 == "object" && typeof t == "object" && Object.keys(e6).length === Object.keys(t).length && Object.keys(e6).every((r) => jn(e6[r], t[r]));
}
__name(jn, "jn");
function pt(e6, t) {
  let r = Object.keys(e6), n = Object.keys(t);
  return (r.length < n.length ? r : n).every((o2) => {
    if (typeof e6[o2] == typeof t[o2] && typeof e6[o2] != "object") return e6[o2] === t[o2];
    if (Decimal.isDecimal(e6[o2]) || Decimal.isDecimal(t[o2])) {
      let s = Cs(e6[o2]), a2 = Cs(t[o2]);
      return s && a2 && s.equals(a2);
    } else if (e6[o2] instanceof Uint8Array || t[o2] instanceof Uint8Array) {
      let s = Ss(e6[o2]), a2 = Ss(t[o2]);
      return s && a2 && s.equals(a2);
    } else {
      if (e6[o2] instanceof Date || t[o2] instanceof Date) return Rs(e6[o2])?.getTime() === Rs(t[o2])?.getTime();
      if (typeof e6[o2] == "bigint" || typeof t[o2] == "bigint") return Is(e6[o2]) === Is(t[o2]);
      if (typeof e6[o2] == "number" || typeof t[o2] == "number") return Os(e6[o2]) === Os(t[o2]);
    }
    return jn(e6[o2], t[o2]);
  });
}
__name(pt, "pt");
function Cs(e6) {
  return Decimal.isDecimal(e6) ? e6 : typeof e6 == "number" || typeof e6 == "string" ? new Decimal(e6) : void 0;
}
__name(Cs, "Cs");
function Ss(e6) {
  return y.isBuffer(e6) ? e6 : e6 instanceof Uint8Array ? y.from(e6.buffer, e6.byteOffset, e6.byteLength) : typeof e6 == "string" ? y.from(e6, "base64") : void 0;
}
__name(Ss, "Ss");
function Rs(e6) {
  return e6 instanceof Date ? e6 : typeof e6 == "string" || typeof e6 == "number" ? new Date(e6) : void 0;
}
__name(Rs, "Rs");
function Is(e6) {
  return typeof e6 == "bigint" ? e6 : typeof e6 == "number" || typeof e6 == "string" ? BigInt(e6) : void 0;
}
__name(Is, "Is");
function Os(e6) {
  return typeof e6 == "number" ? e6 : typeof e6 == "string" ? Number(e6) : void 0;
}
__name(Os, "Os");
function Vt(e6) {
  return JSON.stringify(e6, (t, r) => typeof r == "bigint" ? r.toString() : ArrayBuffer.isView(r) ? y.from(r.buffer, r.byteOffset, r.byteLength).toString("base64") : r);
}
__name(Vt, "Vt");
function Kc(e6) {
  return e6 !== null && typeof e6 == "object" && typeof e6.$type == "string";
}
__name(Kc, "Kc");
function zc(e6, t) {
  let r = {};
  for (let n of Object.keys(e6)) r[n] = t(e6[n], n);
  return r;
}
__name(zc, "zc");
function $e(e6) {
  return e6 === null ? e6 : Array.isArray(e6) ? e6.map($e) : typeof e6 == "object" ? Kc(e6) ? Zc(e6) : e6.constructor !== null && e6.constructor.name !== "Object" ? e6 : zc(e6, $e) : e6;
}
__name($e, "$e");
function Zc({ $type: e6, value: t }) {
  switch (e6) {
    case "BigInt":
      return BigInt(t);
    case "Bytes": {
      let { buffer: r, byteOffset: n, byteLength: i } = y.from(t, "base64");
      return new Uint8Array(r, n, i);
    }
    case "DateTime":
      return new Date(t);
    case "Decimal":
      return new Decimal(t);
    case "Json":
      return JSON.parse(t);
    default:
      D(t, "Unknown tagged value");
  }
}
__name(Zc, "Zc");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
function qr(e6) {
  return e6.name === "DriverAdapterError" && typeof e6.cause == "object";
}
__name(qr, "qr");
l();
u();
c();
p();
m();
var I = { Int32: 0, Int64: 1, Float: 2, Double: 3, Numeric: 4, Boolean: 5, Character: 6, Text: 7, Date: 8, Time: 9, DateTime: 10, Json: 11, Enum: 12, Bytes: 13, Set: 14, Uuid: 15, Int32Array: 64, Int64Array: 65, FloatArray: 66, DoubleArray: 67, NumericArray: 68, BooleanArray: 69, CharacterArray: 70, TextArray: 71, DateArray: 72, TimeArray: 73, DateTimeArray: 74, JsonArray: 75, EnumArray: 76, BytesArray: 77, UuidArray: 78, UnknownNumber: 128 };
var K = class extends Error {
  static {
    __name(this, "K");
  }
  name = "UserFacingError";
  code;
  meta;
  constructor(t, r, n) {
    super(t), this.code = r, this.meta = n ?? {};
  }
  toQueryResponseErrorObject() {
    return { error: this.message, user_facing_error: { is_panic: false, message: this.message, meta: this.meta, error_code: this.code } };
  }
};
function mt(e6) {
  if (!qr(e6)) throw e6;
  let t = Yc(e6), r = ks(e6);
  throw !t || !r ? e6 : new K(r, t, { driverAdapterError: e6 });
}
__name(mt, "mt");
function Hn(e6) {
  throw qr(e6) ? new K(`Raw query failed. Code: \`${e6.cause.originalCode ?? "N/A"}\`. Message: \`${e6.cause.originalMessage ?? ks(e6)}\``, "P2010", { driverAdapterError: e6 }) : e6;
}
__name(Hn, "Hn");
function Yc(e6) {
  switch (e6.cause.kind) {
    case "AuthenticationFailed":
      return "P1000";
    case "DatabaseNotReachable":
      return "P1001";
    case "DatabaseDoesNotExist":
      return "P1003";
    case "SocketTimeout":
      return "P1008";
    case "DatabaseAlreadyExists":
      return "P1009";
    case "DatabaseAccessDenied":
      return "P1010";
    case "TlsConnectionError":
      return "P1011";
    case "ConnectionClosed":
      return "P1017";
    case "TransactionAlreadyClosed":
      return "P1018";
    case "LengthMismatch":
      return "P2000";
    case "UniqueConstraintViolation":
      return "P2002";
    case "ForeignKeyConstraintViolation":
      return "P2003";
    case "InvalidInputValue":
      return "P2007";
    case "UnsupportedNativeDataType":
      return "P2010";
    case "NullConstraintViolation":
      return "P2011";
    case "ValueOutOfRange":
      return "P2020";
    case "TableDoesNotExist":
      return "P2021";
    case "ColumnNotFound":
      return "P2022";
    case "InvalidIsolationLevel":
    case "InconsistentColumnData":
      return "P2023";
    case "MissingFullTextSearchIndex":
      return "P2030";
    case "TransactionWriteConflict":
      return "P2034";
    case "GenericJs":
      return "P2036";
    case "TooManyConnections":
      return "P2037";
    case "postgres":
    case "sqlite":
    case "mysql":
    case "mssql":
      return;
    default:
      D(e6.cause, `Unknown error: ${e6.cause}`);
  }
}
__name(Yc, "Yc");
function ks(e6) {
  switch (e6.cause.kind) {
    case "AuthenticationFailed":
      return `Authentication failed against the database server, the provided database credentials for \`${e6.cause.user ?? "(not available)"}\` are not valid`;
    case "DatabaseNotReachable": {
      let t = e6.cause.host && e6.cause.port ? `${e6.cause.host}:${e6.cause.port}` : e6.cause.host;
      return `Can't reach database server${t ? ` at ${t}` : ""}`;
    }
    case "DatabaseDoesNotExist":
      return `Database \`${e6.cause.db ?? "(not available)"}\` does not exist on the database server`;
    case "SocketTimeout":
      return "Operation has timed out";
    case "DatabaseAlreadyExists":
      return `Database \`${e6.cause.db ?? "(not available)"}\` already exists on the database server`;
    case "DatabaseAccessDenied":
      return `User was denied access on the database \`${e6.cause.db ?? "(not available)"}\``;
    case "TlsConnectionError":
      return `Error opening a TLS connection: ${e6.cause.reason}`;
    case "ConnectionClosed":
      return "Server has closed the connection.";
    case "TransactionAlreadyClosed":
      return e6.cause.cause;
    case "LengthMismatch":
      return `The provided value for the column is too long for the column's type. Column: ${e6.cause.column ?? "(not available)"}`;
    case "UniqueConstraintViolation":
      return `Unique constraint failed on the ${Qn(e6.cause.constraint)}`;
    case "ForeignKeyConstraintViolation":
      return `Foreign key constraint violated on the ${Qn(e6.cause.constraint)}`;
    case "UnsupportedNativeDataType":
      return `Failed to deserialize column of type '${e6.cause.type}'. If you're using $queryRaw and this column is explicitly marked as \`Unsupported\` in your Prisma schema, try casting this column to any supported Prisma type such as \`String\`.`;
    case "NullConstraintViolation":
      return `Null constraint violation on the ${Qn(e6.cause.constraint)}`;
    case "ValueOutOfRange":
      return `Value out of range for the type: ${e6.cause.cause}`;
    case "TableDoesNotExist":
      return `The table \`${e6.cause.table ?? "(not available)"}\` does not exist in the current database.`;
    case "ColumnNotFound":
      return `The column \`${e6.cause.column ?? "(not available)"}\` does not exist in the current database.`;
    case "InvalidIsolationLevel":
      return `Error in connector: Conversion error: ${e6.cause.level}`;
    case "InconsistentColumnData":
      return `Inconsistent column data: ${e6.cause.cause}`;
    case "MissingFullTextSearchIndex":
      return "Cannot find a fulltext index to use for the native search, try adding a @@fulltext([Fields...]) to your schema";
    case "TransactionWriteConflict":
      return "Transaction failed due to a write conflict or a deadlock. Please retry your transaction";
    case "GenericJs":
      return `Error in external connector (id ${e6.cause.id})`;
    case "TooManyConnections":
      return `Too many database connections opened: ${e6.cause.cause}`;
    case "InvalidInputValue":
      return `Invalid input value: ${e6.cause.message}`;
    case "sqlite":
    case "postgres":
    case "mysql":
    case "mssql":
      return;
    default:
      D(e6.cause, `Unknown error: ${e6.cause}`);
  }
}
__name(ks, "ks");
function Qn(e6) {
  return e6 && "fields" in e6 ? `fields: (${e6.fields.map((t) => `\`${t}\``).join(", ")})` : e6 && "index" in e6 ? `constraint: \`${e6.index}\`` : e6 && "foreignKey" in e6 ? "foreign key" : "(not available)";
}
__name(Qn, "Qn");
function Ms(e6, t) {
  let r = e6.map((i) => t.keys.reduce((o2, s) => (o2[s] = $e(i[s]), o2), {})), n = new Set(t.nestedSelection);
  return t.arguments.map((i) => {
    let o2 = r.findIndex((s) => pt(s, i));
    if (o2 === -1) return t.expectNonEmpty ? new K("An operation failed because it depends on one or more records that were required but not found", "P2025") : null;
    {
      let s = Object.entries(e6[o2]).filter(([a2]) => n.has(a2));
      return Object.fromEntries(s);
    }
  });
}
__name(Ms, "Ms");
l();
u();
c();
p();
m();
var $2 = class extends K {
  static {
    __name(this, "$");
  }
  name = "DataMapperError";
  constructor(t, r) {
    super(t, "P2023", r);
  }
};
var Ns = /* @__PURE__ */ new WeakMap();
function ep(e6) {
  let t = Ns.get(e6);
  return t || (t = Object.entries(e6), Ns.set(e6, t)), t;
}
__name(ep, "ep");
function Ls(e6, t, r) {
  switch (t.type) {
    case "affectedRows":
      if (typeof e6 != "number") throw new $2(`Expected an affected rows count, got: ${typeof e6} (${e6})`);
      return { count: e6 };
    case "object":
      return Wn(e6, t.fields, r, t.skipNulls);
    case "field":
      return Jn(e6, "<result>", t.fieldType, r);
    default:
      D(t, `Invalid data mapping type: '${t.type}'`);
  }
}
__name(Ls, "Ls");
function Wn(e6, t, r, n) {
  if (e6 === null) return null;
  if (Array.isArray(e6)) {
    let i = e6;
    return n && (i = i.filter((o2) => o2 !== null)), i.map((o2) => Ds(o2, t, r));
  }
  if (typeof e6 == "object") return Ds(e6, t, r);
  if (typeof e6 == "string") {
    let i;
    try {
      i = JSON.parse(e6);
    } catch (o2) {
      throw new $2("Expected an array or object, got a string that is not valid JSON", { cause: o2 });
    }
    return Wn(i, t, r, n);
  }
  throw new $2(`Expected an array or an object, got: ${typeof e6}`);
}
__name(Wn, "Wn");
function Ds(e6, t, r) {
  if (typeof e6 != "object") throw new $2(`Expected an object, but got '${typeof e6}'`);
  let n = {};
  for (let [i, o2] of ep(t)) switch (o2.type) {
    case "affectedRows":
      throw new $2(`Unexpected 'AffectedRows' node in data mapping for field '${i}'`);
    case "object": {
      let { serializedName: s, fields: a2, skipNulls: d } = o2;
      if (s !== null && !Object.hasOwn(e6, s)) throw new $2(`Missing data field (Object): '${i}'; node: ${JSON.stringify(o2)}; data: ${JSON.stringify(e6)}`);
      let f2 = s !== null ? e6[s] : e6;
      n[i] = Wn(f2, a2, r, d);
      break;
    }
    case "field":
      {
        let s = o2.dbName;
        if (Object.hasOwn(e6, s)) n[i] = tp(e6[s], s, o2.fieldType, r);
        else throw new $2(`Missing data field (Value): '${s}'; node: ${JSON.stringify(o2)}; data: ${JSON.stringify(e6)}`);
      }
      break;
    default:
      D(o2, `DataMapper: Invalid data mapping node type: '${o2.type}'`);
  }
  return n;
}
__name(Ds, "Ds");
function tp(e6, t, r, n) {
  return e6 === null ? r.arity === "list" ? [] : null : r.arity === "list" ? e6.map((o2, s) => Jn(o2, `${t}[${s}]`, r, n)) : Jn(e6, t, r, n);
}
__name(tp, "tp");
function Jn(e6, t, r, n) {
  switch (r.type) {
    case "unsupported":
      return e6;
    case "string": {
      if (typeof e6 != "string") throw new $2(`Expected a string in column '${t}', got ${typeof e6}: ${e6}`);
      return e6;
    }
    case "int":
      switch (typeof e6) {
        case "number":
          return Math.trunc(e6);
        case "string": {
          let i = Math.trunc(Number(e6));
          if (Number.isNaN(i) || !Number.isFinite(i)) throw new $2(`Expected an integer in column '${t}', got string: ${e6}`);
          if (!Number.isSafeInteger(i)) throw new $2(`Integer value in column '${t}' is too large to represent as a JavaScript number without loss of precision, got: ${e6}. Consider using BigInt type.`);
          return i;
        }
        default:
          throw new $2(`Expected an integer in column '${t}', got ${typeof e6}: ${e6}`);
      }
    case "bigint": {
      if (typeof e6 != "number" && typeof e6 != "string") throw new $2(`Expected a bigint in column '${t}', got ${typeof e6}: ${e6}`);
      return { $type: "BigInt", value: e6 };
    }
    case "float": {
      if (typeof e6 == "number") return e6;
      if (typeof e6 == "string") {
        let i = Number(e6);
        if (Number.isNaN(i) && !/^[-+]?nan$/.test(e6.toLowerCase())) throw new $2(`Expected a float in column '${t}', got string: ${e6}`);
        return i;
      }
      throw new $2(`Expected a float in column '${t}', got ${typeof e6}: ${e6}`);
    }
    case "boolean": {
      if (typeof e6 == "boolean") return e6;
      if (typeof e6 == "number") return e6 === 1;
      if (typeof e6 == "string") {
        if (e6 === "true" || e6 === "TRUE" || e6 === "1") return true;
        if (e6 === "false" || e6 === "FALSE" || e6 === "0") return false;
        throw new $2(`Expected a boolean in column '${t}', got ${typeof e6}: ${e6}`);
      }
      if (Array.isArray(e6) || e6 instanceof Uint8Array) {
        for (let i of e6) if (i !== 0) return true;
        return false;
      }
      throw new $2(`Expected a boolean in column '${t}', got ${typeof e6}: ${e6}`);
    }
    case "decimal":
      if (typeof e6 != "number" && typeof e6 != "string" && !Decimal.isDecimal(e6)) throw new $2(`Expected a decimal in column '${t}', got ${typeof e6}: ${e6}`);
      return { $type: "Decimal", value: e6 };
    case "datetime": {
      if (typeof e6 == "string") return { $type: "DateTime", value: np(e6) };
      if (typeof e6 == "number" || e6 instanceof Date) return { $type: "DateTime", value: e6 };
      throw new $2(`Expected a date in column '${t}', got ${typeof e6}: ${e6}`);
    }
    case "object":
      return { $type: "Json", value: Vt(e6) };
    case "json":
      return { $type: "Json", value: `${e6}` };
    case "bytes": {
      switch (r.encoding) {
        case "base64":
          if (typeof e6 != "string") throw new $2(`Expected a base64-encoded byte array in column '${t}', got ${typeof e6}: ${e6}`);
          return { $type: "Bytes", value: e6 };
        case "hex":
          if (typeof e6 != "string" || !e6.startsWith("\\x")) throw new $2(`Expected a hex-encoded byte array in column '${t}', got ${typeof e6}: ${e6}`);
          return { $type: "Bytes", value: y.from(e6.slice(2), "hex").toString("base64") };
        case "array":
          if (Array.isArray(e6)) return { $type: "Bytes", value: y.from(e6).toString("base64") };
          if (e6 instanceof Uint8Array) return { $type: "Bytes", value: y.from(e6).toString("base64") };
          throw new $2(`Expected a byte array in column '${t}', got ${typeof e6}: ${e6}`);
        default:
          D(r.encoding, `DataMapper: Unknown bytes encoding: ${r.encoding}`);
      }
      break;
    }
    case "enum": {
      let i = n[r.name];
      if (i === void 0) throw new $2(`Unknown enum '${r.name}'`);
      let o2 = i[`${e6}`];
      if (o2 === void 0) throw new $2(`Value '${e6}' not found in enum '${r.name}'`);
      return o2;
    }
    default:
      D(r, `DataMapper: Unknown result type: ${r.type}`);
  }
}
__name(Jn, "Jn");
var rp = /\d{2}:\d{2}:\d{2}(?:\.\d+)?(Z|[+-]\d{2}(:?\d{2})?)?$/;
function np(e6) {
  let t = rp.exec(e6);
  if (t === null) return `${e6}T00:00:00Z`;
  let r = e6, [n, i, o2] = t;
  if (i !== void 0 && i !== "Z" && o2 === void 0 ? r = `${e6}:00` : i === void 0 && (r = `${e6}Z`), n.length === e6.length) return `1970-01-01T${r}`;
  let s = t.index - 1;
  return r[s] === " " && (r = `${r.slice(0, s)}T${r.slice(s + 1)}`), r;
}
__name(np, "np");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
function we(e6) {
  if (typeof e6 != "object") return e6;
  var t, r, n = Object.prototype.toString.call(e6);
  if (n === "[object Object]") {
    if (e6.constructor !== Object && typeof e6.constructor == "function") {
      r = new e6.constructor();
      for (t in e6) e6.hasOwnProperty(t) && r[t] !== e6[t] && (r[t] = we(e6[t]));
    } else {
      r = {};
      for (t in e6) t === "__proto__" ? Object.defineProperty(r, t, { value: we(e6[t]), configurable: true, enumerable: true, writable: true }) : r[t] = we(e6[t]);
    }
    return r;
  }
  if (n === "[object Array]") {
    for (t = e6.length, r = Array(t); t--; ) r[t] = we(e6[t]);
    return r;
  }
  return n === "[object Set]" ? (r = /* @__PURE__ */ new Set(), e6.forEach(function(i) {
    r.add(we(i));
  }), r) : n === "[object Map]" ? (r = /* @__PURE__ */ new Map(), e6.forEach(function(i, o2) {
    r.set(we(o2), we(i));
  }), r) : n === "[object Date]" ? /* @__PURE__ */ new Date(+e6) : n === "[object RegExp]" ? (r = new RegExp(e6.source, e6.flags), r.lastIndex = e6.lastIndex, r) : n === "[object DataView]" ? new e6.constructor(we(e6.buffer)) : n === "[object ArrayBuffer]" ? e6.slice(0) : n.slice(-6) === "Array]" ? new e6.constructor(e6) : e6;
}
__name(we, "we");
function ip(e6) {
  let t = Object.entries(e6);
  return t.length === 0 ? "" : (t.sort(([n], [i]) => n.localeCompare(i)), `/*${t.map(([n, i]) => {
    let o2 = encodeURIComponent(n), s = encodeURIComponent(i).replace(/'/g, "\\'");
    return `${o2}='${s}'`;
  }).join(",")}*/`);
}
__name(ip, "ip");
function Vr(e6, t) {
  let r = {};
  for (let n of e6) {
    let i = n(we(t));
    for (let [o2, s] of Object.entries(i)) s !== void 0 && (r[o2] = s);
  }
  return r;
}
__name(Vr, "Vr");
function _s(e6, t) {
  let r = Vr(e6, t);
  return ip(r);
}
__name(_s, "_s");
function Fs(e6, t) {
  return t ? `${e6} ${t}` : e6;
}
__name(Fs, "Fs");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var Bt;
(function(e6) {
  e6[e6.INTERNAL = 0] = "INTERNAL", e6[e6.SERVER = 1] = "SERVER", e6[e6.CLIENT = 2] = "CLIENT", e6[e6.PRODUCER = 3] = "PRODUCER", e6[e6.CONSUMER = 4] = "CONSUMER";
})(Bt || (Bt = {}));
function op(e6) {
  switch (e6) {
    case "postgresql":
    case "postgres":
    case "prisma+postgres":
      return "postgresql";
    case "sqlserver":
      return "mssql";
    case "mysql":
    case "sqlite":
    case "cockroachdb":
    case "mongodb":
      return e6;
    default:
      D(e6, `Unknown provider: ${e6}`);
  }
}
__name(op, "op");
async function Br({ query: e6, tracingHelper: t, provider: r, onQuery: n, execute: i }) {
  let o2 = n === void 0 ? i : async () => {
    let s = /* @__PURE__ */ new Date(), a2 = w.now(), d = await i(), f2 = w.now();
    return n({ timestamp: s, duration: f2 - a2, query: e6.sql, params: e6.args }), d;
  };
  return t.isEnabled() ? await t.runInChildSpan({ name: "db_query", kind: Bt.CLIENT, attributes: { "db.query.text": e6.sql, "db.system.name": op(r) } }, o2) : o2();
}
__name(Br, "Br");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
function qe(e6, t) {
  var r = "000000000" + e6;
  return r.substr(r.length - t);
}
__name(qe, "qe");
var Us = Ne(yo(), 1);
function sp() {
  try {
    return Us.default.hostname();
  } catch {
    return g.env._CLUSTER_NETWORK_NAME_ || g.env.COMPUTERNAME || "hostname";
  }
}
__name(sp, "sp");
var $s = 2;
var ap = qe(g.pid.toString(36), $s);
var qs = sp();
var lp = qs.length;
var up = qe(qs.split("").reduce(function(e6, t) {
  return +e6 + t.charCodeAt(0);
}, +lp + 36).toString(36), $s);
function Gn() {
  return ap + up;
}
__name(Gn, "Gn");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
function jr(e6) {
  return typeof e6 == "string" && /^c[a-z0-9]{20,32}$/.test(e6);
}
__name(jr, "jr");
function Kn(e6) {
  let n = Math.pow(36, 4), i = 0;
  function o2() {
    return qe((Math.random() * n << 0).toString(36), 4);
  }
  __name(o2, "o");
  function s() {
    return i = i < n ? i : 0, i++, i - 1;
  }
  __name(s, "s");
  function a2() {
    var d = "c", f2 = (/* @__PURE__ */ new Date()).getTime().toString(36), P3 = qe(s().toString(36), 4), A2 = e6(), S2 = o2() + o2();
    return d + f2 + P3 + A2 + S2;
  }
  __name(a2, "a");
  return a2.fingerprint = e6, a2.isCuid = jr, a2;
}
__name(Kn, "Kn");
var cp = Kn(Gn);
var Vs = cp;
var Ua = Ne(ka());
l();
u();
c();
p();
m();
Fe();
l();
u();
c();
p();
m();
var Ma = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
var zp = 128;
var Be;
var gt;
function Zp(e6) {
  !Be || Be.length < e6 ? (Be = y.allocUnsafe(e6 * zp), St.getRandomValues(Be), gt = 0) : gt + e6 > Be.length && (St.getRandomValues(Be), gt = 0), gt += e6;
}
__name(Zp, "Zp");
function ii(e6 = 21) {
  Zp(e6 |= 0);
  let t = "";
  for (let r = gt - e6; r < gt; r++) t += Ma[Be[r] & 63];
  return t;
}
__name(ii, "ii");
l();
u();
c();
p();
m();
Fe();
var Da = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
var Gt = 32;
var Yp = 16;
var La = 10;
var Na = 281474976710655;
var je;
(function(e6) {
  e6.Base32IncorrectEncoding = "B32_ENC_INVALID", e6.DecodeTimeInvalidCharacter = "DEC_TIME_CHAR", e6.DecodeTimeValueMalformed = "DEC_TIME_MALFORMED", e6.EncodeTimeNegative = "ENC_TIME_NEG", e6.EncodeTimeSizeExceeded = "ENC_TIME_SIZE_EXCEED", e6.EncodeTimeValueMalformed = "ENC_TIME_MALFORMED", e6.PRNGDetectFailure = "PRNG_DETECT", e6.ULIDInvalid = "ULID_INVALID", e6.Unexpected = "UNEXPECTED", e6.UUIDInvalid = "UUID_INVALID";
})(je || (je = {}));
var Qe = class extends Error {
  static {
    __name(this, "Qe");
  }
  constructor(t, r) {
    super(`${r} (${t})`), this.name = "ULIDError", this.code = t;
  }
};
function Xp(e6) {
  let t = Math.floor(e6() * Gt);
  return t === Gt && (t = Gt - 1), Da.charAt(t);
}
__name(Xp, "Xp");
function em(e6) {
  let t = tm(), r = t && (t.crypto || t.msCrypto) || (typeof Ze < "u" ? Ze : null);
  if (typeof r?.getRandomValues == "function") return () => {
    let n = new Uint8Array(1);
    return r.getRandomValues(n), n[0] / 255;
  };
  if (typeof r?.randomBytes == "function") return () => r.randomBytes(1).readUInt8() / 255;
  if (Ze?.randomBytes) return () => Ze.randomBytes(1).readUInt8() / 255;
  throw new Qe(je.PRNGDetectFailure, "Failed to find a reliable PRNG");
}
__name(em, "em");
function tm() {
  return im() ? self : typeof window < "u" ? window : typeof globalThis < "u" || typeof globalThis < "u" ? globalThis : null;
}
__name(tm, "tm");
function rm(e6, t) {
  let r = "";
  for (; e6 > 0; e6--) r = Xp(t) + r;
  return r;
}
__name(rm, "rm");
function nm(e6, t = La) {
  if (isNaN(e6)) throw new Qe(je.EncodeTimeValueMalformed, `Time must be a number: ${e6}`);
  if (e6 > Na) throw new Qe(je.EncodeTimeSizeExceeded, `Cannot encode a time larger than ${Na}: ${e6}`);
  if (e6 < 0) throw new Qe(je.EncodeTimeNegative, `Time must be positive: ${e6}`);
  if (Number.isInteger(e6) === false) throw new Qe(je.EncodeTimeValueMalformed, `Time must be an integer: ${e6}`);
  let r, n = "";
  for (let i = t; i > 0; i--) r = e6 % Gt, n = Da.charAt(r) + n, e6 = (e6 - r) / Gt;
  return n;
}
__name(nm, "nm");
function im() {
  return typeof WorkerGlobalScope < "u" && self instanceof WorkerGlobalScope;
}
__name(im, "im");
function _a(e6, t) {
  let r = t || em(), n = !e6 || isNaN(e6) ? Date.now() : e6;
  return nm(n, La) + rm(Yp, r);
}
__name(_a, "_a");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var z = [];
for (let e6 = 0; e6 < 256; ++e6) z.push((e6 + 256).toString(16).slice(1));
function Wr(e6, t = 0) {
  return (z[e6[t + 0]] + z[e6[t + 1]] + z[e6[t + 2]] + z[e6[t + 3]] + "-" + z[e6[t + 4]] + z[e6[t + 5]] + "-" + z[e6[t + 6]] + z[e6[t + 7]] + "-" + z[e6[t + 8]] + z[e6[t + 9]] + "-" + z[e6[t + 10]] + z[e6[t + 11]] + z[e6[t + 12]] + z[e6[t + 13]] + z[e6[t + 14]] + z[e6[t + 15]]).toLowerCase();
}
__name(Wr, "Wr");
l();
u();
c();
p();
m();
Fe();
var Kr = new Uint8Array(256);
var Gr = Kr.length;
function yt() {
  return Gr > Kr.length - 16 && (fr(Kr), Gr = 0), Kr.slice(Gr, Gr += 16);
}
__name(yt, "yt");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
Fe();
var oi = { randomUUID: dr };
function om(e6, t, r) {
  if (oi.randomUUID && !t && !e6) return oi.randomUUID();
  e6 = e6 || {};
  let n = e6.random ?? e6.rng?.() ?? yt();
  if (n.length < 16) throw new Error("Random bytes length must be >= 16");
  if (n[6] = n[6] & 15 | 64, n[8] = n[8] & 63 | 128, t) {
    if (r = r || 0, r < 0 || r + 16 > t.length) throw new RangeError(`UUID byte range ${r}:${r + 15} is out of buffer bounds`);
    for (let i = 0; i < 16; ++i) t[r + i] = n[i];
    return t;
  }
  return Wr(n);
}
__name(om, "om");
var si = om;
l();
u();
c();
p();
m();
var ai = {};
function sm(e6, t, r) {
  let n;
  if (e6) n = Fa(e6.random ?? e6.rng?.() ?? yt(), e6.msecs, e6.seq, t, r);
  else {
    let i = Date.now(), o2 = yt();
    am(ai, i, o2), n = Fa(o2, ai.msecs, ai.seq, t, r);
  }
  return t ?? Wr(n);
}
__name(sm, "sm");
function am(e6, t, r) {
  return e6.msecs ??= -1 / 0, e6.seq ??= 0, t > e6.msecs ? (e6.seq = r[6] << 23 | r[7] << 16 | r[8] << 8 | r[9], e6.msecs = t) : (e6.seq = e6.seq + 1 | 0, e6.seq === 0 && e6.msecs++), e6;
}
__name(am, "am");
function Fa(e6, t, r, n, i = 0) {
  if (e6.length < 16) throw new Error("Random bytes length must be >= 16");
  if (!n) n = new Uint8Array(16), i = 0;
  else if (i < 0 || i + 16 > n.length) throw new RangeError(`UUID byte range ${i}:${i + 15} is out of buffer bounds`);
  return t ??= Date.now(), r ??= e6[6] * 127 << 24 | e6[7] << 16 | e6[8] << 8 | e6[9], n[i++] = t / 1099511627776 & 255, n[i++] = t / 4294967296 & 255, n[i++] = t / 16777216 & 255, n[i++] = t / 65536 & 255, n[i++] = t / 256 & 255, n[i++] = t & 255, n[i++] = 112 | r >>> 28 & 15, n[i++] = r >>> 20 & 255, n[i++] = 128 | r >>> 14 & 63, n[i++] = r >>> 6 & 255, n[i++] = r << 2 & 255 | e6[10] & 3, n[i++] = e6[11], n[i++] = e6[12], n[i++] = e6[13], n[i++] = e6[14], n[i++] = e6[15], n;
}
__name(Fa, "Fa");
var li = sm;
var zr = class {
  static {
    __name(this, "zr");
  }
  #t = {};
  constructor() {
    this.register("uuid", new ci()), this.register("cuid", new pi()), this.register("ulid", new mi()), this.register("nanoid", new di()), this.register("product", new fi());
  }
  snapshot() {
    return Object.create(this.#t, { now: { value: new ui() } });
  }
  register(t, r) {
    this.#t[t] = r;
  }
};
var ui = class {
  static {
    __name(this, "ui");
  }
  #t = /* @__PURE__ */ new Date();
  generate() {
    return this.#t.toISOString();
  }
};
var ci = class {
  static {
    __name(this, "ci");
  }
  generate(t) {
    if (t === 4) return si();
    if (t === 7) return li();
    throw new Error("Invalid UUID generator arguments");
  }
};
var pi = class {
  static {
    __name(this, "pi");
  }
  generate(t) {
    if (t === 1) return Vs();
    if (t === 2) return (0, Ua.createId)();
    throw new Error("Invalid CUID generator arguments");
  }
};
var mi = class {
  static {
    __name(this, "mi");
  }
  generate() {
    return _a();
  }
};
var di = class {
  static {
    __name(this, "di");
  }
  generate(t) {
    if (typeof t == "number") return ii(t);
    if (t === void 0) return ii();
    throw new Error("Invalid Nanoid generator arguments");
  }
};
var fi = class {
  static {
    __name(this, "fi");
  }
  generate(t, r) {
    if (t === void 0 || r === void 0) throw new Error("Invalid Product generator arguments");
    return Array.isArray(t) && Array.isArray(r) ? t.flatMap((n) => r.map((i) => [n, i])) : Array.isArray(t) ? t.map((n) => [n, r]) : Array.isArray(r) ? r.map((n) => [t, n]) : [[t, r]];
  }
};
l();
u();
c();
p();
m();
function Zr(e6, t) {
  return e6 == null ? e6 : typeof e6 == "string" ? Zr(JSON.parse(e6), t) : Array.isArray(e6) ? um(e6, t) : lm(e6, t);
}
__name(Zr, "Zr");
function lm(e6, t) {
  if (t.pagination) {
    let { skip: r, take: n, cursor: i } = t.pagination;
    if (r !== null && r > 0 || n === 0 || i !== null && !pt(e6, i)) return null;
  }
  return qa(e6, t.nested);
}
__name(lm, "lm");
function qa(e6, t) {
  for (let [r, n] of Object.entries(t)) e6[r] = Zr(e6[r], n);
  return e6;
}
__name(qa, "qa");
function um(e6, t) {
  if (t.distinct !== null) {
    let r = t.linkingFields !== null ? [...t.distinct, ...t.linkingFields] : t.distinct;
    e6 = cm(e6, r);
  }
  return t.pagination && (e6 = pm(e6, t.pagination, t.linkingFields)), t.reverse && e6.reverse(), Object.keys(t.nested).length === 0 ? e6 : e6.map((r) => qa(r, t.nested));
}
__name(um, "um");
function cm(e6, t) {
  let r = /* @__PURE__ */ new Set(), n = [];
  for (let i of e6) {
    let o2 = ht(i, t);
    r.has(o2) || (r.add(o2), n.push(i));
  }
  return n;
}
__name(cm, "cm");
function pm(e6, t, r) {
  if (r === null) return $a(e6, t);
  let n = /* @__PURE__ */ new Map();
  for (let o2 of e6) {
    let s = ht(o2, r);
    n.has(s) || n.set(s, []), n.get(s).push(o2);
  }
  let i = Array.from(n.entries());
  return i.sort(([o2], [s]) => o2 < s ? -1 : o2 > s ? 1 : 0), i.flatMap(([, o2]) => $a(o2, t));
}
__name(pm, "pm");
function $a(e6, { cursor: t, skip: r, take: n }) {
  let i = t !== null ? e6.findIndex((a2) => pt(a2, t)) : 0;
  if (i === -1) return [];
  let o2 = i + (r ?? 0), s = n !== null ? o2 + n : e6.length;
  return e6.slice(o2, s);
}
__name($a, "$a");
function ht(e6, t) {
  return JSON.stringify(t.map((r) => e6[r]));
}
__name(ht, "ht");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
function gi(e6) {
  return typeof e6 == "object" && e6 !== null && e6.prisma__type === "param";
}
__name(gi, "gi");
function yi(e6) {
  return typeof e6 == "object" && e6 !== null && e6.prisma__type === "generatorCall";
}
__name(yi, "yi");
function bi(e6, t, r, n) {
  let i = e6.args.map((o2) => ue(o2, t, r));
  switch (e6.type) {
    case "rawSql":
      return [fm(e6.sql, i, e6.argTypes)];
    case "templateSql":
      return (e6.chunkable ? ym(e6.fragments, i, n) : [i]).map((s) => {
        if (n !== void 0 && s.length > n) throw new K("The query parameter limit supported by your database is exceeded.", "P2029");
        return mm(e6.fragments, e6.placeholderFormat, s, e6.argTypes);
      });
    default:
      D(e6.type, "Invalid query type");
  }
}
__name(bi, "bi");
function ue(e6, t, r) {
  for (; gm(e6); ) if (gi(e6)) {
    let n = t[e6.prisma__value.name];
    if (n === void 0) throw new Error(`Missing value for query variable ${e6.prisma__value.name}`);
    e6 = n;
  } else if (yi(e6)) {
    let { name: n, args: i } = e6.prisma__value, o2 = r[n];
    if (!o2) throw new Error(`Encountered an unknown generator '${n}'`);
    e6 = o2.generate(...i.map((s) => ue(s, t, r)));
  } else D(e6, `Unexpected unevaluated value type: ${e6}`);
  return Array.isArray(e6) && (e6 = e6.map((n) => ue(n, t, r))), e6;
}
__name(ue, "ue");
function mm(e6, t, r, n) {
  let i = "", o2 = { placeholderNumber: 1 }, s = [], a2 = [];
  for (let d of wi(e6, r, n)) {
    if (i += dm(d, t, o2), d.type === "stringChunk") continue;
    let f2 = s.length, P3 = s.push(...Va(d)) - f2;
    if (d.argType.arity === "tuple") {
      if (P3 % d.argType.elements.length !== 0) throw new Error(`Malformed query template. Expected the number of parameters to match the tuple arity, but got ${P3} parameters for a tuple of arity ${d.argType.elements.length}.`);
      for (let A2 = 0; A2 < P3 / d.argType.elements.length; A2++) a2.push(...d.argType.elements);
    } else for (let A2 = 0; A2 < P3; A2++) a2.push(d.argType);
  }
  return { sql: i, args: s, argTypes: a2 };
}
__name(mm, "mm");
function dm(e6, t, r) {
  let n = e6.type;
  switch (n) {
    case "parameter":
      return hi(t, r.placeholderNumber++);
    case "stringChunk":
      return e6.chunk;
    case "parameterTuple":
      return `(${e6.value.length == 0 ? "NULL" : e6.value.map(() => hi(t, r.placeholderNumber++)).join(",")})`;
    case "parameterTupleList":
      return e6.value.map((i) => {
        let o2 = i.map(() => hi(t, r.placeholderNumber++)).join(e6.itemSeparator);
        return `${e6.itemPrefix}${o2}${e6.itemSuffix}`;
      }).join(e6.groupSeparator);
    default:
      D(n, "Invalid fragment type");
  }
}
__name(dm, "dm");
function hi(e6, t) {
  return e6.hasNumbering ? `${e6.prefix}${t}` : e6.prefix;
}
__name(hi, "hi");
function fm(e6, t, r) {
  return { sql: e6, args: t, argTypes: r };
}
__name(fm, "fm");
function gm(e6) {
  return gi(e6) || yi(e6);
}
__name(gm, "gm");
function* wi(e6, t, r) {
  let n = 0;
  for (let i of e6) switch (i.type) {
    case "parameter": {
      if (n >= t.length) throw new Error(`Malformed query template. Fragments attempt to read over ${t.length} parameters.`);
      yield { ...i, value: t[n], argType: r?.[n] }, n++;
      break;
    }
    case "stringChunk": {
      yield i;
      break;
    }
    case "parameterTuple": {
      if (n >= t.length) throw new Error(`Malformed query template. Fragments attempt to read over ${t.length} parameters.`);
      let o2 = t[n];
      yield { ...i, value: Array.isArray(o2) ? o2 : [o2], argType: r?.[n] }, n++;
      break;
    }
    case "parameterTupleList": {
      if (n >= t.length) throw new Error(`Malformed query template. Fragments attempt to read over ${t.length} parameters.`);
      let o2 = t[n];
      if (!Array.isArray(o2)) throw new Error("Malformed query template. Tuple list expected.");
      if (o2.length === 0) throw new Error("Malformed query template. Tuple list cannot be empty.");
      for (let s of o2) if (!Array.isArray(s)) throw new Error("Malformed query template. Tuple expected.");
      yield { ...i, value: o2, argType: r?.[n] }, n++;
      break;
    }
  }
}
__name(wi, "wi");
function* Va(e6) {
  switch (e6.type) {
    case "parameter":
      yield e6.value;
      break;
    case "stringChunk":
      break;
    case "parameterTuple":
      yield* e6.value;
      break;
    case "parameterTupleList":
      for (let t of e6.value) yield* t;
      break;
  }
}
__name(Va, "Va");
function ym(e6, t, r) {
  let n = 0, i = 0;
  for (let s of wi(e6, t, void 0)) {
    let a2 = 0;
    for (let d of Va(s)) a2++;
    i = Math.max(i, a2), n += a2;
  }
  let o2 = [[]];
  for (let s of wi(e6, t, void 0)) switch (s.type) {
    case "parameter": {
      for (let a2 of o2) a2.push(s.value);
      break;
    }
    case "stringChunk":
      break;
    case "parameterTuple": {
      let a2 = s.value.length, d = [];
      if (r && o2.length === 1 && a2 === i && n > r && n - a2 < r) {
        let f2 = r - (n - a2);
        d = hm(s.value, f2);
      } else d = [s.value];
      o2 = o2.flatMap((f2) => d.map((P3) => [...f2, P3]));
      break;
    }
    case "parameterTupleList": {
      let a2 = s.value.reduce((A2, S2) => A2 + S2.length, 0), d = [], f2 = [], P3 = 0;
      for (let A2 of s.value) r && o2.length === 1 && a2 === i && f2.length > 0 && n - a2 + P3 + A2.length > r && (d.push(f2), f2 = [], P3 = 0), f2.push(A2), P3 += A2.length;
      f2.length > 0 && d.push(f2), o2 = o2.flatMap((A2) => d.map((S2) => [...A2, S2]));
      break;
    }
  }
  return o2;
}
__name(ym, "ym");
function hm(e6, t) {
  let r = [];
  for (let n = 0; n < e6.length; n += t) r.push(e6.slice(n, n + t));
  return r;
}
__name(hm, "hm");
l();
u();
c();
p();
m();
function Ba(e6) {
  return e6.rows.map((t) => t.reduce((r, n, i) => (r[e6.columnNames[i]] = n, r), {}));
}
__name(Ba, "Ba");
function ja(e6) {
  return { columns: e6.columnNames, types: e6.columnTypes.map((t) => wm(t)), rows: e6.rows.map((t) => t.map((r, n) => Kt(r, e6.columnTypes[n]))) };
}
__name(ja, "ja");
function Kt(e6, t) {
  if (e6 === null) return null;
  switch (t) {
    case I.Int32:
      switch (typeof e6) {
        case "number":
          return Math.trunc(e6);
        case "string":
          return Math.trunc(Number(e6));
        default:
          throw new Error(`Cannot serialize value of type ${typeof e6} as Int32`);
      }
    case I.Int32Array:
      if (!Array.isArray(e6)) throw new Error(`Cannot serialize value of type ${typeof e6} as Int32Array`);
      return e6.map((r) => Kt(r, I.Int32));
    case I.Int64:
      switch (typeof e6) {
        case "number":
          return BigInt(Math.trunc(e6));
        case "string":
          return e6;
        default:
          throw new Error(`Cannot serialize value of type ${typeof e6} as Int64`);
      }
    case I.Int64Array:
      if (!Array.isArray(e6)) throw new Error(`Cannot serialize value of type ${typeof e6} as Int64Array`);
      return e6.map((r) => Kt(r, I.Int64));
    case I.Json:
      switch (typeof e6) {
        case "string":
          return JSON.parse(e6);
        default:
          throw new Error(`Cannot serialize value of type ${typeof e6} as Json`);
      }
    case I.JsonArray:
      if (!Array.isArray(e6)) throw new Error(`Cannot serialize value of type ${typeof e6} as JsonArray`);
      return e6.map((r) => Kt(r, I.Json));
    case I.Boolean:
      switch (typeof e6) {
        case "boolean":
          return e6;
        case "string":
          return e6 === "true" || e6 === "1";
        case "number":
          return e6 === 1;
        default:
          throw new Error(`Cannot serialize value of type ${typeof e6} as Boolean`);
      }
    case I.BooleanArray:
      if (!Array.isArray(e6)) throw new Error(`Cannot serialize value of type ${typeof e6} as BooleanArray`);
      return e6.map((r) => Kt(r, I.Boolean));
    default:
      return e6;
  }
}
__name(Kt, "Kt");
function wm(e6) {
  switch (e6) {
    case I.Int32:
      return "int";
    case I.Int64:
      return "bigint";
    case I.Float:
      return "float";
    case I.Double:
      return "double";
    case I.Text:
      return "string";
    case I.Enum:
      return "enum";
    case I.Bytes:
      return "bytes";
    case I.Boolean:
      return "bool";
    case I.Character:
      return "char";
    case I.Numeric:
      return "decimal";
    case I.Json:
      return "json";
    case I.Uuid:
      return "uuid";
    case I.DateTime:
      return "datetime";
    case I.Date:
      return "date";
    case I.Time:
      return "time";
    case I.Int32Array:
      return "int-array";
    case I.Int64Array:
      return "bigint-array";
    case I.FloatArray:
      return "float-array";
    case I.DoubleArray:
      return "double-array";
    case I.TextArray:
      return "string-array";
    case I.EnumArray:
      return "string-array";
    case I.BytesArray:
      return "bytes-array";
    case I.BooleanArray:
      return "bool-array";
    case I.CharacterArray:
      return "char-array";
    case I.NumericArray:
      return "decimal-array";
    case I.JsonArray:
      return "json-array";
    case I.UuidArray:
      return "uuid-array";
    case I.DateTimeArray:
      return "datetime-array";
    case I.DateArray:
      return "date-array";
    case I.TimeArray:
      return "time-array";
    case I.UnknownNumber:
      return "unknown";
    case I.Set:
      return "string";
    default:
      D(e6, `Unexpected column type: ${e6}`);
  }
}
__name(wm, "wm");
l();
u();
c();
p();
m();
function Qa(e6, t, r) {
  if (!t.every((n) => xi(e6, n))) {
    let n = bm(e6, r), i = xm(r);
    throw new K(n, i, r.context);
  }
}
__name(Qa, "Qa");
function xi(e6, t) {
  switch (t.type) {
    case "rowCountEq":
      return Array.isArray(e6) ? e6.length === t.args : e6 === null ? t.args === 0 : t.args === 1;
    case "rowCountNeq":
      return Array.isArray(e6) ? e6.length !== t.args : e6 === null ? t.args !== 0 : t.args !== 1;
    case "affectedRowCountEq":
      return e6 === t.args;
    case "never":
      return false;
    default:
      D(t, `Unknown rule type: ${t.type}`);
  }
}
__name(xi, "xi");
function bm(e6, t) {
  switch (t.error_identifier) {
    case "RELATION_VIOLATION":
      return `The change you are trying to make would violate the required relation '${t.context.relation}' between the \`${t.context.modelA}\` and \`${t.context.modelB}\` models.`;
    case "MISSING_RECORD":
      return `An operation failed because it depends on one or more records that were required but not found. No record was found for ${t.context.operation}.`;
    case "MISSING_RELATED_RECORD": {
      let r = t.context.neededFor ? ` (needed to ${t.context.neededFor})` : "";
      return `An operation failed because it depends on one or more records that were required but not found. No '${t.context.model}' record${r} was found for ${t.context.operation} on ${t.context.relationType} relation '${t.context.relation}'.`;
    }
    case "INCOMPLETE_CONNECT_INPUT":
      return `An operation failed because it depends on one or more records that were required but not found. Expected ${t.context.expectedRows} records to be connected, found only ${Array.isArray(e6) ? e6.length : e6}.`;
    case "INCOMPLETE_CONNECT_OUTPUT":
      return `The required connected records were not found. Expected ${t.context.expectedRows} records to be connected after connect operation on ${t.context.relationType} relation '${t.context.relation}', found ${Array.isArray(e6) ? e6.length : e6}.`;
    case "RECORDS_NOT_CONNECTED":
      return `The records for relation \`${t.context.relation}\` between the \`${t.context.parent}\` and \`${t.context.child}\` models are not connected.`;
    default:
      D(t, `Unknown error identifier: ${t}`);
  }
}
__name(bm, "bm");
function xm(e6) {
  switch (e6.error_identifier) {
    case "RELATION_VIOLATION":
      return "P2014";
    case "RECORDS_NOT_CONNECTED":
      return "P2017";
    case "INCOMPLETE_CONNECT_OUTPUT":
      return "P2018";
    case "MISSING_RECORD":
    case "MISSING_RELATED_RECORD":
    case "INCOMPLETE_CONNECT_INPUT":
      return "P2025";
    default:
      D(e6, `Unknown error identifier: ${e6}`);
  }
}
__name(xm, "xm");
var zt = class e4 {
  static {
    __name(this, "e");
  }
  #t;
  #e = new zr();
  #n;
  #r;
  #o;
  #i;
  #s;
  constructor({ onQuery: t, tracingHelper: r, serializer: n, rawSerializer: i, provider: o2, connectionInfo: s }) {
    this.#t = t, this.#n = r, this.#r = n, this.#o = i ?? n, this.#i = o2, this.#s = s;
  }
  static forSql(t) {
    return new e4({ onQuery: t.onQuery, tracingHelper: t.tracingHelper, serializer: Ba, rawSerializer: ja, provider: t.provider, connectionInfo: t.connectionInfo });
  }
  async run(t, r) {
    let { value: n } = await this.interpretNode(t, { ...r, generators: this.#e.snapshot() }).catch((i) => mt(i));
    return n;
  }
  async interpretNode(t, r) {
    switch (t.type) {
      case "value":
        return { value: ue(t.args, r.scope, r.generators) };
      case "seq": {
        let n;
        for (let i of t.args) n = await this.interpretNode(i, r);
        return n ?? { value: void 0 };
      }
      case "get":
        return { value: r.scope[t.args.name] };
      case "let": {
        let n = Object.create(r.scope);
        for (let i of t.args.bindings) {
          let { value: o2 } = await this.interpretNode(i.expr, { ...r, scope: n });
          n[i.name] = o2;
        }
        return this.interpretNode(t.args.expr, { ...r, scope: n });
      }
      case "getFirstNonEmpty": {
        for (let n of t.args.names) {
          let i = r.scope[n];
          if (!Ha(i)) return { value: i };
        }
        return { value: [] };
      }
      case "concat": {
        let n = await Promise.all(t.args.map((i) => this.interpretNode(i, r).then((o2) => o2.value)));
        return { value: n.length > 0 ? n.reduce((i, o2) => i.concat(Ei(o2)), []) : [] };
      }
      case "sum": {
        let n = await Promise.all(t.args.map((i) => this.interpretNode(i, r).then((o2) => o2.value)));
        return { value: n.length > 0 ? n.reduce((i, o2) => be(i) + be(o2)) : 0 };
      }
      case "execute": {
        let n = bi(t.args, r.scope, r.generators, this.#a()), i = 0;
        for (let o2 of n) {
          let s = Ja(o2, r.sqlCommenter);
          i += await this.#l(s, r.queryable, () => r.queryable.executeRaw(s).catch((a2) => t.args.type === "rawSql" ? Hn(a2) : mt(a2)));
        }
        return { value: i };
      }
      case "query": {
        let n = bi(t.args, r.scope, r.generators, this.#a()), i;
        for (let o2 of n) {
          let s = Ja(o2, r.sqlCommenter), a2 = await this.#l(s, r.queryable, () => r.queryable.queryRaw(s).catch((d) => t.args.type === "rawSql" ? Hn(d) : mt(d)));
          i === void 0 ? i = a2 : (i.rows.push(...a2.rows), i.lastInsertId = a2.lastInsertId);
        }
        return { value: t.args.type === "rawSql" ? this.#o(i) : this.#r(i), lastInsertId: i?.lastInsertId };
      }
      case "reverse": {
        let { value: n, lastInsertId: i } = await this.interpretNode(t.args, r);
        return { value: Array.isArray(n) ? n.reverse() : n, lastInsertId: i };
      }
      case "unique": {
        let { value: n, lastInsertId: i } = await this.interpretNode(t.args, r);
        if (!Array.isArray(n)) return { value: n, lastInsertId: i };
        if (n.length > 1) throw new Error(`Expected zero or one element, got ${n.length}`);
        return { value: n[0] ?? null, lastInsertId: i };
      }
      case "required": {
        let { value: n, lastInsertId: i } = await this.interpretNode(t.args, r);
        if (Ha(n)) throw new Error("Required value is empty");
        return { value: n, lastInsertId: i };
      }
      case "mapField": {
        let { value: n, lastInsertId: i } = await this.interpretNode(t.args.records, r);
        return { value: Wa(n, t.args.field), lastInsertId: i };
      }
      case "join": {
        let { value: n, lastInsertId: i } = await this.interpretNode(t.args.parent, r);
        if (n === null) return { value: null, lastInsertId: i };
        let o2 = await Promise.all(t.args.children.map(async (s) => ({ joinExpr: s, childRecords: (await this.interpretNode(s.child, r)).value })));
        return { value: Em(n, o2), lastInsertId: i };
      }
      case "transaction": {
        if (!r.transactionManager.enabled) return this.interpretNode(t.args, r);
        let n = r.transactionManager.manager, i = await n.startInternalTransaction(), o2 = await n.getTransaction(i, "query");
        try {
          let s = await this.interpretNode(t.args, { ...r, queryable: o2 });
          return await n.commitTransaction(i.id), s;
        } catch (s) {
          throw await n.rollbackTransaction(i.id), s;
        }
      }
      case "dataMap": {
        let { value: n, lastInsertId: i } = await this.interpretNode(t.args.expr, r);
        return { value: Ls(n, t.args.structure, t.args.enums), lastInsertId: i };
      }
      case "validate": {
        let { value: n, lastInsertId: i } = await this.interpretNode(t.args.expr, r);
        return Qa(n, t.args.rules, t.args), { value: n, lastInsertId: i };
      }
      case "if": {
        let { value: n } = await this.interpretNode(t.args.value, r);
        return xi(n, t.args.rule) ? await this.interpretNode(t.args.then, r) : await this.interpretNode(t.args.else, r);
      }
      case "unit":
        return { value: void 0 };
      case "diff": {
        let { value: n } = await this.interpretNode(t.args.from, r), { value: i } = await this.interpretNode(t.args.to, r), o2 = /* @__PURE__ */ __name((a2) => a2 !== null ? ht(Yr(a2), t.args.fields) : null, "o"), s = new Set(Ei(i).map(o2));
        return { value: Ei(n).filter((a2) => !s.has(o2(a2))) };
      }
      case "process": {
        let { value: n, lastInsertId: i } = await this.interpretNode(t.args.expr, r);
        return { value: Zr(n, t.args.operations), lastInsertId: i };
      }
      case "initializeRecord": {
        let { lastInsertId: n } = await this.interpretNode(t.args.expr, r), i = {};
        for (let [o2, s] of Object.entries(t.args.fields)) i[o2] = Tm(s, n, r.scope, r.generators);
        return { value: i, lastInsertId: n };
      }
      case "mapRecord": {
        let { value: n, lastInsertId: i } = await this.interpretNode(t.args.expr, r), o2 = n === null ? {} : Yr(n);
        for (let [s, a2] of Object.entries(t.args.fields)) o2[s] = Pm(a2, o2[s], r.scope, r.generators);
        return { value: o2, lastInsertId: i };
      }
      default:
        D(t, `Unexpected node type: ${t.type}`);
    }
  }
  #a() {
    return this.#s?.maxBindValues !== void 0 ? this.#s.maxBindValues : this.#u();
  }
  #u() {
    if (this.#i !== void 0) switch (this.#i) {
      case "cockroachdb":
      case "postgres":
      case "postgresql":
      case "prisma+postgres":
        return 32766;
      case "mysql":
        return 65535;
      case "sqlite":
        return 999;
      case "sqlserver":
        return 2098;
      case "mongodb":
        return;
      default:
        D(this.#i, `Unexpected provider: ${this.#i}`);
    }
  }
  #l(t, r, n) {
    return Br({ query: t, execute: n, provider: this.#i ?? r.provider, tracingHelper: this.#n, onQuery: this.#t });
  }
};
function Ha(e6) {
  return Array.isArray(e6) ? e6.length === 0 : e6 == null;
}
__name(Ha, "Ha");
function Ei(e6) {
  return Array.isArray(e6) ? e6 : [e6];
}
__name(Ei, "Ei");
function be(e6) {
  if (typeof e6 == "number") return e6;
  if (typeof e6 == "string") return Number(e6);
  throw new Error(`Expected number, got ${typeof e6}`);
}
__name(be, "be");
function Yr(e6) {
  if (typeof e6 == "object" && e6 !== null) return e6;
  throw new Error(`Expected object, got ${typeof e6}`);
}
__name(Yr, "Yr");
function Wa(e6, t) {
  return Array.isArray(e6) ? e6.map((r) => Wa(r, t)) : typeof e6 == "object" && e6 !== null ? e6[t] ?? null : e6;
}
__name(Wa, "Wa");
function Em(e6, t) {
  for (let { joinExpr: r, childRecords: n } of t) {
    let i = r.on.map(([a2]) => a2), o2 = r.on.map(([, a2]) => a2), s = {};
    for (let a2 of Array.isArray(e6) ? e6 : [e6]) {
      let d = Yr(a2), f2 = ht(d, i);
      s[f2] || (s[f2] = []), s[f2].push(d), r.isRelationUnique ? d[r.parentField] = null : d[r.parentField] = [];
    }
    for (let a2 of Array.isArray(n) ? n : [n]) {
      if (a2 === null) continue;
      let d = ht(Yr(a2), o2);
      for (let f2 of s[d] ?? []) r.isRelationUnique ? f2[r.parentField] = a2 : f2[r.parentField].push(a2);
    }
  }
  return e6;
}
__name(Em, "Em");
function Tm(e6, t, r, n) {
  switch (e6.type) {
    case "value":
      return ue(e6.value, r, n);
    case "lastInsertId":
      return t;
    default:
      D(e6, `Unexpected field initializer type: ${e6.type}`);
  }
}
__name(Tm, "Tm");
function Pm(e6, t, r, n) {
  switch (e6.type) {
    case "set":
      return ue(e6.value, r, n);
    case "add":
      return be(t) + be(ue(e6.value, r, n));
    case "subtract":
      return be(t) - be(ue(e6.value, r, n));
    case "multiply":
      return be(t) * be(ue(e6.value, r, n));
    case "divide": {
      let i = be(t), o2 = be(ue(e6.value, r, n));
      return o2 === 0 ? null : i / o2;
    }
    default:
      D(e6, `Unexpected field operation type: ${e6.type}`);
  }
}
__name(Pm, "Pm");
function Ja(e6, t) {
  if (!t || t.plugins.length === 0) return e6;
  let r = _s(t.plugins, { query: t.queryInfo, sql: e6.sql });
  return r ? { ...e6, sql: Fs(e6.sql, r) } : e6;
}
__name(Ja, "Ja");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
async function Am() {
  return globalThis.crypto ?? await Promise.resolve().then(() => (Fe(), Pn));
}
__name(Am, "Am");
async function Ga() {
  return (await Am()).randomUUID();
}
__name(Ga, "Ga");
l();
u();
c();
p();
m();
async function Ka(e6, t) {
  return new Promise((r) => {
    e6.addEventListener(t, r, { once: true });
  });
}
__name(Ka, "Ka");
l();
u();
c();
p();
m();
var se = class extends K {
  static {
    __name(this, "se");
  }
  name = "TransactionManagerError";
  constructor(t, r) {
    super("Transaction API error: " + t, "P2028", r);
  }
};
var Zt = class extends se {
  static {
    __name(this, "Zt");
  }
  constructor() {
    super("Transaction not found. Transaction ID is invalid, refers to an old closed transaction Prisma doesn't have information about anymore, or was obtained before disconnecting.");
  }
};
var Xr = class extends se {
  static {
    __name(this, "Xr");
  }
  constructor(t) {
    super(`Transaction already closed: A ${t} cannot be executed on a committed transaction.`);
  }
};
var en = class extends se {
  static {
    __name(this, "en");
  }
  constructor(t) {
    super(`Transaction already closed: A ${t} cannot be executed on a transaction that was rolled back.`);
  }
};
var tn = class extends se {
  static {
    __name(this, "tn");
  }
  constructor() {
    super("Unable to start a transaction in the given time.");
  }
};
var rn = class extends se {
  static {
    __name(this, "rn");
  }
  constructor(t, { timeout: r, timeTaken: n }) {
    super(`A ${t} cannot be executed on an expired transaction. The timeout for this transaction was ${r} ms, however ${n} ms passed since the start of the transaction. Consider increasing the interactive transaction timeout or doing less work in the transaction.`, { operation: t, timeout: r, timeTaken: n });
  }
};
var wt = class extends se {
  static {
    __name(this, "wt");
  }
  constructor(t) {
    super(`Internal Consistency Error: ${t}`);
  }
};
var nn = class extends se {
  static {
    __name(this, "nn");
  }
  constructor(t) {
    super(`Invalid isolation level: ${t}`, { isolationLevel: t });
  }
};
var vm = 100;
var bt = Z("prisma:client:transactionManager");
var Cm = /* @__PURE__ */ __name(() => ({ sql: "COMMIT", args: [], argTypes: [] }), "Cm");
var Sm = /* @__PURE__ */ __name(() => ({ sql: "ROLLBACK", args: [], argTypes: [] }), "Sm");
var Rm = /* @__PURE__ */ __name(() => ({ sql: '-- Implicit "COMMIT" query via underlying driver', args: [], argTypes: [] }), "Rm");
var Im = /* @__PURE__ */ __name(() => ({ sql: '-- Implicit "ROLLBACK" query via underlying driver', args: [], argTypes: [] }), "Im");
var Yt = class {
  static {
    __name(this, "Yt");
  }
  transactions = /* @__PURE__ */ new Map();
  closedTransactions = [];
  driverAdapter;
  transactionOptions;
  tracingHelper;
  #t;
  #e;
  constructor({ driverAdapter: t, transactionOptions: r, tracingHelper: n, onQuery: i, provider: o2 }) {
    this.driverAdapter = t, this.transactionOptions = r, this.tracingHelper = n, this.#t = i, this.#e = o2;
  }
  async startInternalTransaction(t) {
    let r = t !== void 0 ? this.#s(t) : {};
    return await this.tracingHelper.runInChildSpan("start_transaction", () => this.#n(r));
  }
  async startTransaction(t) {
    let r = t !== void 0 ? this.#s(t) : this.transactionOptions;
    return await this.tracingHelper.runInChildSpan("start_transaction", () => this.#n(r));
  }
  async #n(t) {
    let r = { id: await Ga(), status: "waiting", timer: void 0, timeout: t.timeout, startedAt: Date.now(), transaction: void 0 }, n = new AbortController(), i = za(() => n.abort(), t.maxWait);
    i?.unref?.();
    let o2 = this.driverAdapter.startTransaction(t.isolationLevel).catch(mt);
    switch (r.transaction = await Promise.race([o2.finally(() => clearTimeout(i)), Ka(n.signal, "abort").then(() => {
    })]), this.transactions.set(r.id, r), r.status) {
      case "waiting":
        if (n.signal.aborted) throw o2.then((s) => s.rollback()).catch((s) => bt("error in discarded transaction:", s)), await this.#i(r, "timed_out"), new tn();
        return r.status = "running", r.timer = this.#o(r.id, t.timeout), { id: r.id };
      case "timed_out":
      case "running":
      case "committed":
      case "rolled_back":
        throw new wt(`Transaction in invalid state ${r.status} although it just finished startup.`);
      default:
        D(r.status, "Unknown transaction status.");
    }
  }
  async commitTransaction(t) {
    return await this.tracingHelper.runInChildSpan("commit_transaction", async () => {
      let r = this.#r(t, "commit");
      await this.#i(r, "committed");
    });
  }
  async rollbackTransaction(t) {
    return await this.tracingHelper.runInChildSpan("rollback_transaction", async () => {
      let r = this.#r(t, "rollback");
      await this.#i(r, "rolled_back");
    });
  }
  async getTransaction(t, r) {
    let n = this.#r(t.id, r);
    if (n.status === "closing" && (await n.closing, n = this.#r(t.id, r)), !n.transaction) throw new Zt();
    return n.transaction;
  }
  #r(t, r) {
    let n = this.transactions.get(t);
    if (!n) {
      let i = this.closedTransactions.find((o2) => o2.id === t);
      if (i) switch (bt("Transaction already closed.", { transactionId: t, status: i.status }), i.status) {
        case "closing":
        case "waiting":
        case "running":
          throw new wt("Active transaction found in closed transactions list.");
        case "committed":
          throw new Xr(r);
        case "rolled_back":
          throw new en(r);
        case "timed_out":
          throw new rn(r, { timeout: i.timeout, timeTaken: Date.now() - i.startedAt });
      }
      else throw bt("Transaction not found.", t), new Zt();
    }
    if (["committed", "rolled_back", "timed_out"].includes(n.status)) throw new wt("Closed transaction found in active transactions map.");
    return n;
  }
  async cancelAllTransactions() {
    await Promise.allSettled([...this.transactions.values()].map((t) => this.#i(t, "rolled_back")));
  }
  #o(t, r) {
    let n = Date.now(), i = za(async () => {
      bt("Transaction timed out.", { transactionId: t, timeoutStartedAt: n, timeout: r });
      let o2 = this.transactions.get(t);
      o2 && ["running", "waiting"].includes(o2.status) ? await this.#i(o2, "timed_out") : bt("Transaction already committed or rolled back when timeout happened.", t);
    }, r);
    return i?.unref?.(), i;
  }
  async #i(t, r) {
    let n = /* @__PURE__ */ __name(async () => {
      bt("Closing transaction.", { transactionId: t.id, status: r });
      try {
        if (t.transaction && r === "committed") if (t.transaction.options.usePhantomQuery) await this.#a(Rm(), t.transaction, () => t.transaction.commit());
        else {
          let i = Cm();
          await this.#a(i, t.transaction, () => t.transaction.executeRaw(i)).then(() => t.transaction.commit(), (o2) => {
            let s = /* @__PURE__ */ __name(() => Promise.reject(o2), "s");
            return t.transaction.rollback().then(s, s);
          });
        }
        else if (t.transaction) if (t.transaction.options.usePhantomQuery) await this.#a(Im(), t.transaction, () => t.transaction.rollback());
        else {
          let i = Sm();
          try {
            await this.#a(i, t.transaction, () => t.transaction.executeRaw(i));
          } finally {
            await t.transaction.rollback();
          }
        }
      } finally {
        t.status = r, clearTimeout(t.timer), t.timer = void 0, this.transactions.delete(t.id), this.closedTransactions.push(t), this.closedTransactions.length > vm && this.closedTransactions.shift();
      }
    }, "n");
    t.status === "closing" ? (await t.closing, this.#r(t.id, r === "committed" ? "commit" : "rollback")) : await Object.assign(t, { status: "closing", reason: r, closing: n() }).closing;
  }
  #s(t) {
    if (!t.timeout) throw new se("timeout is required");
    if (!t.maxWait) throw new se("maxWait is required");
    if (t.isolationLevel === "SNAPSHOT") throw new nn(t.isolationLevel);
    return { ...t, timeout: t.timeout, maxWait: t.maxWait };
  }
  #a(t, r, n) {
    return Br({ query: t, execute: n, provider: this.#e ?? r.provider, tracingHelper: this.tracingHelper, onQuery: this.#t });
  }
};
function za(e6, t) {
  return t !== void 0 ? setTimeout(e6, t) : void 0;
}
__name(za, "za");
var on2 = "7.3.0";
l();
u();
c();
p();
m();
var Za = { bigint: "bigint", date: "datetime", decimal: "decimal", bytes: "bytes" };
function Xa(e6) {
  let t;
  try {
    t = JSON.parse(e6);
  } catch (i) {
    throw new Error(`Received invalid serialized parameters: ${i.message}`);
  }
  if (!Array.isArray(t)) throw new Error("Received invalid serialized parameters: expected an array");
  let r = t.map((i) => el(i)), n = t.map((i) => km(i));
  return { args: r, argTypes: n };
}
__name(Xa, "Xa");
function el(e6) {
  if (Array.isArray(e6)) return e6.map((t) => el(t));
  if (typeof e6 == "object" && e6 !== null && "prisma__value" in e6) {
    if (!("prisma__type" in e6)) throw new Error("Invalid serialized parameter, prisma__type should be present when prisma__value is present");
    return `${e6.prisma__value}`;
  }
  return typeof e6 == "object" && e6 !== null ? JSON.stringify(e6) : e6;
}
__name(el, "el");
function km(e6) {
  return Array.isArray(e6) ? { scalarType: e6.length > 0 ? Ya(e6[0]) : "unknown", arity: "list" } : { scalarType: Ya(e6), arity: "scalar" };
}
__name(km, "km");
function Ya(e6) {
  return typeof e6 == "object" && e6 !== null && "prisma__type" in e6 && typeof e6.prisma__type == "string" && e6.prisma__type in Za ? Za[e6.prisma__type] : typeof e6 == "number" ? "decimal" : typeof e6 == "string" ? "string" : "unknown";
}
__name(Ya, "Ya");
l();
u();
c();
p();
m();
function tl(e6, t) {
  return { batch: e6, transaction: t?.kind === "batch" ? { isolationLevel: t.options.isolationLevel } : void 0 };
}
__name(tl, "tl");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
function rl(e6) {
  return e6 ? e6.replace(/".*"/g, '"X"').replace(/[\s:\[]([+-]?([0-9]*[.])?[0-9]+)/g, (t) => `${t[0]}5`) : "";
}
__name(rl, "rl");
l();
u();
c();
p();
m();
function nl(e6) {
  return e6.split(`
`).map((t) => t.replace(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)\s*/, "").replace(/\+\d+\s*ms$/, "")).join(`
`);
}
__name(nl, "nl");
l();
u();
c();
p();
m();
var il = Ne(Ao());
function ol({ title: e6, user: t = "prisma", repo: r = "prisma", template: n = "bug_report.yml", body: i }) {
  return (0, il.default)({ user: t, repo: r, template: n, title: e6, body: i });
}
__name(ol, "ol");
function sl({ version: e6, binaryTarget: t, title: r, description: n, engineVersion: i, database: o2, query: s }) {
  let a2 = mo(6e3 - (s?.length ?? 0)), d = nl(Ye(a2)), f2 = n ? `# Description
\`\`\`
${n}
\`\`\`` : "", P3 = Ye(`Hi Prisma Team! My Prisma Client just crashed. This is the report:
## Versions

| Name            | Version            |
|-----------------|--------------------|
| Node            | ${g.version?.padEnd(19)}| 
| OS              | ${t?.padEnd(19)}|
| Prisma Client   | ${e6?.padEnd(19)}|
| Query Engine    | ${i?.padEnd(19)}|
| Database        | ${o2?.padEnd(19)}|

${f2}

## Logs
\`\`\`
${d}
\`\`\`

## Client Snippet
\`\`\`ts
// PLEASE FILL YOUR CODE SNIPPET HERE
\`\`\`

## Schema
\`\`\`prisma
// PLEASE ADD YOUR SCHEMA HERE IF POSSIBLE
\`\`\`

## Prisma Engine Query
\`\`\`
${s ? rl(s) : ""}
\`\`\`
`), A2 = ol({ title: r, body: P3 });
  return `${r}

This is a non-recoverable error which probably happens when the Prisma Query Engine has a panic.

${mr(A2)}

If you want the Prisma team to look into it, please open the link above \u{1F64F}
To increase the chance of success, please post your schema and a snippet of
how you used Prisma Client in the issue. 
`;
}
__name(sl, "sl");
l();
u();
c();
p();
m();
var sn = class e5 {
  static {
    __name(this, "e");
  }
  #t;
  #e;
  #n;
  #r;
  #o;
  constructor(t, r, n) {
    this.#t = t, this.#e = r, this.#n = n, this.#r = r.getConnectionInfo?.(), this.#o = zt.forSql({ onQuery: this.#t.onQuery, tracingHelper: this.#t.tracingHelper, provider: this.#t.provider, connectionInfo: this.#r });
  }
  static async connect(t) {
    let r, n;
    try {
      r = await t.driverAdapterFactory.connect(), n = new Yt({ driverAdapter: r, transactionOptions: t.transactionOptions, tracingHelper: t.tracingHelper, onQuery: t.onQuery, provider: t.provider });
    } catch (i) {
      throw await r?.dispose(), i;
    }
    return new e5(t, r, n);
  }
  getConnectionInfo() {
    let t = this.#r ?? { supportsRelationJoins: false };
    return Promise.resolve({ provider: this.#e.provider, connectionInfo: t });
  }
  async execute({ plan: t, placeholderValues: r, transaction: n, batchIndex: i, queryInfo: o2 }) {
    let s = n ? await this.#n.getTransaction(n, i !== void 0 ? "batch query" : "query") : this.#e;
    return await this.#o.run(t, { queryable: s, transactionManager: n ? { enabled: false } : { enabled: true, manager: this.#n }, scope: r, sqlCommenter: this.#t.sqlCommenters && { plugins: this.#t.sqlCommenters, queryInfo: o2 } });
  }
  async startTransaction(t) {
    return { ...await this.#n.startTransaction(t), payload: void 0 };
  }
  async commitTransaction(t) {
    await this.#n.commitTransaction(t.id);
  }
  async rollbackTransaction(t) {
    await this.#n.rollbackTransaction(t.id);
  }
  async disconnect() {
    try {
      await this.#n.cancelAllTransactions();
    } finally {
      await this.#e.dispose();
    }
  }
  apiKey() {
    return null;
  }
};
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var an = /^[\u0009\u0020-\u007E\u0080-\u00FF]+$/;
function al(e6, t, r) {
  let n = r || {}, i = n.encode || encodeURIComponent;
  if (typeof i != "function") throw new TypeError("option encode is invalid");
  if (!an.test(e6)) throw new TypeError("argument name is invalid");
  let o2 = i(t);
  if (o2 && !an.test(o2)) throw new TypeError("argument val is invalid");
  let s = e6 + "=" + o2;
  if (n.maxAge !== void 0 && n.maxAge !== null) {
    let a2 = n.maxAge - 0;
    if (Number.isNaN(a2) || !Number.isFinite(a2)) throw new TypeError("option maxAge is invalid");
    s += "; Max-Age=" + Math.floor(a2);
  }
  if (n.domain) {
    if (!an.test(n.domain)) throw new TypeError("option domain is invalid");
    s += "; Domain=" + n.domain;
  }
  if (n.path) {
    if (!an.test(n.path)) throw new TypeError("option path is invalid");
    s += "; Path=" + n.path;
  }
  if (n.expires) {
    if (!Mm(n.expires) || Number.isNaN(n.expires.valueOf())) throw new TypeError("option expires is invalid");
    s += "; Expires=" + n.expires.toUTCString();
  }
  if (n.httpOnly && (s += "; HttpOnly"), n.secure && (s += "; Secure"), n.priority) switch (typeof n.priority == "string" ? n.priority.toLowerCase() : n.priority) {
    case "low": {
      s += "; Priority=Low";
      break;
    }
    case "medium": {
      s += "; Priority=Medium";
      break;
    }
    case "high": {
      s += "; Priority=High";
      break;
    }
    default:
      throw new TypeError("option priority is invalid");
  }
  if (n.sameSite) switch (typeof n.sameSite == "string" ? n.sameSite.toLowerCase() : n.sameSite) {
    case true: {
      s += "; SameSite=Strict";
      break;
    }
    case "lax": {
      s += "; SameSite=Lax";
      break;
    }
    case "strict": {
      s += "; SameSite=Strict";
      break;
    }
    case "none": {
      s += "; SameSite=None";
      break;
    }
    default:
      throw new TypeError("option sameSite is invalid");
  }
  return n.partitioned && (s += "; Partitioned"), s;
}
__name(al, "al");
function Mm(e6) {
  return Object.prototype.toString.call(e6) === "[object Date]" || e6 instanceof Date;
}
__name(Mm, "Mm");
function ll(e6, t) {
  let r = (e6 || "").split(";").filter((d) => typeof d == "string" && !!d.trim()), n = r.shift() || "", i = Nm(n), o2 = i.name, s = i.value;
  try {
    s = t?.decode === false ? s : (t?.decode || decodeURIComponent)(s);
  } catch {
  }
  let a2 = { name: o2, value: s };
  for (let d of r) {
    let f2 = d.split("="), P3 = (f2.shift() || "").trimStart().toLowerCase(), A2 = f2.join("=");
    switch (P3) {
      case "expires": {
        a2.expires = new Date(A2);
        break;
      }
      case "max-age": {
        a2.maxAge = Number.parseInt(A2, 10);
        break;
      }
      case "secure": {
        a2.secure = true;
        break;
      }
      case "httponly": {
        a2.httpOnly = true;
        break;
      }
      case "samesite": {
        a2.sameSite = A2;
        break;
      }
      default:
        a2[P3] = A2;
    }
  }
  return a2;
}
__name(ll, "ll");
function Nm(e6) {
  let t = "", r = "", n = e6.split("=");
  return n.length > 1 ? (t = n.shift(), r = n.join("=")) : r = e6, { name: t, value: r };
}
__name(Nm, "Nm");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var ln2 = class extends Error {
  static {
    __name(this, "ln");
  }
  clientVersion;
  cause;
  constructor(t, r) {
    super(t), this.clientVersion = r.clientVersion, this.cause = r.cause;
  }
  get [Symbol.toStringTag]() {
    return this.name;
  }
};
var un = class extends ln2 {
  static {
    __name(this, "un");
  }
  isRetryable;
  constructor(t, r) {
    super(t, r), this.isRetryable = r.isRetryable ?? true;
  }
};
l();
u();
c();
p();
m();
function ul(e6, t) {
  return { ...e6, isRetryable: t };
}
__name(ul, "ul");
var He = class extends un {
  static {
    __name(this, "He");
  }
  name = "InvalidDatasourceError";
  code = "P6001";
  constructor(t, r) {
    super(t, ul(r, false));
  }
};
Ot(He, "InvalidDatasourceError");
function cl(e6) {
  let t = { clientVersion: e6.clientVersion }, r;
  try {
    r = new URL(e6.accelerateUrl);
  } catch (d) {
    let f2 = d.message;
    throw new He(`Error validating \`accelerateUrl\`, the URL cannot be parsed, reason: ${f2}`, t);
  }
  let { protocol: n, searchParams: i } = r;
  if (n !== "prisma:" && n !== yr) throw new He("Error validating `accelerateUrl`: the URL must start with the protocol `prisma://` or `prisma+postgres://`", t);
  let o2 = i.get("api_key");
  if (o2 === null || o2.length < 1) throw new He("Error validating `accelerateUrl`: the URL must contain a valid API key", t);
  let s = An(r) ? "http:" : "https:";
  g.env.TEST_CLIENT_ENGINE_REMOTE_EXECUTOR && r.searchParams.has("use_http") && (s = "http:");
  let a2 = new URL(r.href.replace(n, s));
  return { apiKey: o2, url: a2 };
}
__name(cl, "cl");
l();
u();
c();
p();
m();
var pl = Ne(wo());
var cn = class {
  static {
    __name(this, "cn");
  }
  apiKey;
  tracingHelper;
  logLevel;
  logQueries;
  engineHash;
  constructor({ apiKey: t, tracingHelper: r, logLevel: n, logQueries: i, engineHash: o2 }) {
    this.apiKey = t, this.tracingHelper = r, this.logLevel = n, this.logQueries = i, this.engineHash = o2;
  }
  build({ traceparent: t, transactionId: r } = {}) {
    let n = { Accept: "application/json", Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json", "Prisma-Engine-Hash": this.engineHash, "Prisma-Engine-Version": pl.enginesVersion };
    this.tracingHelper.isEnabled() && (n.traceparent = t ?? this.tracingHelper.getTraceParent()), r && (n["X-Transaction-Id"] = r);
    let i = this.#t();
    return i.length > 0 && (n["X-Capture-Telemetry"] = i.join(", ")), n;
  }
  #t() {
    let t = [];
    return this.tracingHelper.isEnabled() && t.push("tracing"), this.logLevel && t.push(this.logLevel), this.logQueries && t.push("query"), t;
  }
};
l();
u();
c();
p();
m();
function Dm(e6) {
  return e6[0] * 1e3 + e6[1] / 1e6;
}
__name(Dm, "Dm");
function Ti(e6) {
  return new Date(Dm(e6));
}
__name(Ti, "Ti");
var ml = Z("prisma:client:clientEngine:remoteExecutor");
var pn = class {
  static {
    __name(this, "pn");
  }
  #t;
  #e;
  #n;
  #r;
  #o;
  #i;
  constructor(t) {
    this.#t = t.clientVersion, this.#r = t.logEmitter, this.#o = t.tracingHelper, this.#i = t.sqlCommenters;
    let { url: r, apiKey: n } = cl({ clientVersion: t.clientVersion, accelerateUrl: t.accelerateUrl });
    this.#n = new Pi(r), this.#e = new cn({ apiKey: n, engineHash: t.clientVersion, logLevel: t.logLevel, logQueries: t.logQueries, tracingHelper: t.tracingHelper });
  }
  async getConnectionInfo() {
    return await this.#s({ path: "/connection-info", method: "GET" });
  }
  async execute({ plan: t, placeholderValues: r, batchIndex: n, model: i, operation: o2, transaction: s, customFetch: a2, queryInfo: d }) {
    let f2 = d && this.#i?.length ? Vr(this.#i, { query: d }) : void 0;
    return (await this.#s({ path: s ? `/transaction/${s.id}/query` : "/query", method: "POST", body: { model: i, operation: o2, plan: t, params: r, comments: f2 && Object.keys(f2).length > 0 ? f2 : void 0 }, batchRequestIdx: n, fetch: a2 })).data;
  }
  async startTransaction(t) {
    return { ...await this.#s({ path: "/transaction/start", method: "POST", body: t }), payload: void 0 };
  }
  async commitTransaction(t) {
    await this.#s({ path: `/transaction/${t.id}/commit`, method: "POST" });
  }
  async rollbackTransaction(t) {
    await this.#s({ path: `/transaction/${t.id}/rollback`, method: "POST" });
  }
  disconnect() {
    return Promise.resolve();
  }
  apiKey() {
    return this.#e.apiKey;
  }
  async #s({ path: t, method: r, body: n, fetch: i = globalThis.fetch, batchRequestIdx: o2 }) {
    let s = await this.#n.request({ method: r, path: t, headers: this.#e.build(), body: n, fetch: i });
    s.ok || await this.#a(s, o2);
    let a2 = await s.json();
    return typeof a2.extensions == "object" && a2.extensions !== null && this.#u(a2.extensions), a2;
  }
  async #a(t, r) {
    let n = t.headers.get("Prisma-Error-Code"), i = await t.text(), o2, s = i;
    try {
      o2 = JSON.parse(i);
    } catch {
      o2 = {};
    }
    typeof o2.code == "string" && (n = o2.code), typeof o2.error == "string" ? s = o2.error : typeof o2.message == "string" ? s = o2.message : typeof o2.InvalidRequestError == "object" && o2.InvalidRequestError !== null && typeof o2.InvalidRequestError.reason == "string" && (s = o2.InvalidRequestError.reason), s = s || `HTTP ${t.status}: ${t.statusText}`;
    let a2 = typeof o2.meta == "object" && o2.meta !== null ? o2.meta : o2;
    throw new PrismaClientKnownRequestError(s, { clientVersion: this.#t, code: n ?? "P6000", batchRequestIdx: r, meta: a2 });
  }
  #u(t) {
    if (t.logs) for (let r of t.logs) this.#l(r);
    t.spans && this.#o.dispatchEngineSpans(t.spans);
  }
  #l(t) {
    switch (t.level) {
      case "debug":
      case "trace":
        ml(t);
        break;
      case "error":
      case "warn":
      case "info": {
        this.#r.emit(t.level, { timestamp: Ti(t.timestamp), message: t.attributes.message ?? "", target: t.target ?? "RemoteExecutor" });
        break;
      }
      case "query": {
        this.#r.emit("query", { query: t.attributes.query ?? "", timestamp: Ti(t.timestamp), duration: t.attributes.duration_ms ?? 0, params: t.attributes.params ?? "", target: t.target ?? "RemoteExecutor" });
        break;
      }
      default:
        throw new Error(`Unexpected log level: ${t.level}`);
    }
  }
};
var Pi = class {
  static {
    __name(this, "Pi");
  }
  #t;
  #e;
  #n;
  constructor(t) {
    this.#t = t, this.#e = /* @__PURE__ */ new Map();
  }
  async request({ method: t, path: r, headers: n, body: i, fetch: o2 }) {
    let s = new URL(r, this.#t), a2 = this.#r(s);
    a2 && (n.Cookie = a2), this.#n && (n["Accelerate-Query-Engine-Jwt"] = this.#n);
    let d = await o2(s.href, { method: t, body: i !== void 0 ? JSON.stringify(i) : void 0, headers: n });
    return ml(t, s, d.status, d.statusText), this.#n = d.headers.get("Accelerate-Query-Engine-Jwt") ?? void 0, this.#o(s, d), d;
  }
  #r(t) {
    let r = [], n = /* @__PURE__ */ new Date();
    for (let [i, o2] of this.#e) {
      if (o2.expires && o2.expires < n) {
        this.#e.delete(i);
        continue;
      }
      let s = o2.domain ?? t.hostname, a2 = o2.path ?? "/";
      t.hostname.endsWith(s) && t.pathname.startsWith(a2) && r.push(al(o2.name, o2.value));
    }
    return r.length > 0 ? r.join("; ") : void 0;
  }
  #o(t, r) {
    let n = r.headers.getSetCookie?.() || [];
    if (n.length === 0) {
      let i = r.headers.get("Set-Cookie");
      i && n.push(i);
    }
    for (let i of n) {
      let o2 = ll(i), s = o2.domain ?? t.hostname, a2 = o2.path ?? "/", d = `${s}:${a2}:${o2.name}`;
      this.#e.set(d, { name: o2.name, value: o2.value, domain: s, path: a2, expires: o2.expires });
    }
  }
};
l();
u();
c();
p();
m();
var Ai = {};
var fl = { async loadQueryCompiler(e6) {
  let { clientVersion: t, compilerWasm: r } = e6;
  if (r === void 0) throw new PrismaClientInitializationError("WASM query compiler was unexpectedly `undefined`", t);
  let n;
  return e6.activeProvider === void 0 || Ai[e6.activeProvider] === void 0 ? (n = (async () => {
    let i = await r.getRuntime(), o2 = await r.getQueryCompilerWasmModule();
    if (o2 == null) throw new PrismaClientInitializationError("The loaded wasm module was unexpectedly `undefined` or `null` once loaded", t);
    let s = { [r.importName]: i }, a2 = new WebAssembly.Instance(o2, s), d = a2.exports.__wbindgen_start;
    return i.__wbg_set_wasm(a2.exports), d(), i.QueryCompiler;
  })(), e6.activeProvider !== void 0 && (Ai[e6.activeProvider] = n)) : n = Ai[e6.activeProvider], await n;
} };
var _m = "P2038";
var Xt = Z("prisma:client:clientEngine");
var bl = globalThis;
bl.PRISMA_WASM_PANIC_REGISTRY = { set_message(e6) {
  throw new PrismaClientRustPanicError(e6, on2);
} };
var tr = class {
  static {
    __name(this, "tr");
  }
  name = "ClientEngine";
  #t;
  #e = { type: "disconnected" };
  #n;
  #r;
  config;
  datamodel;
  logEmitter;
  logQueries;
  logLevel;
  tracingHelper;
  #o;
  constructor(t, r) {
    if (t.accelerateUrl !== void 0) this.#r = { remote: true, accelerateUrl: t.accelerateUrl };
    else if (t.adapter) this.#r = { remote: false, driverAdapterFactory: t.adapter }, Xt("Using driver adapter: %O", t.adapter);
    else throw new PrismaClientInitializationError("Missing configured driver adapter. Engine type `client` requires an active driver adapter. Please check your PrismaClient initialization code.", t.clientVersion, _m);
    this.#n = r ?? fl, this.config = t, this.logQueries = t.logQueries ?? false, this.logLevel = t.logLevel ?? "error", this.logEmitter = t.logEmitter, this.datamodel = t.inlineSchema, this.tracingHelper = t.tracingHelper, t.enableDebugLogs && (this.logLevel = "debug"), this.logQueries && (this.#o = (n) => {
      this.logEmitter.emit("query", { ...n, params: Vt(n.params), target: "ClientEngine" });
    });
  }
  async #i() {
    switch (this.#e.type) {
      case "disconnected": {
        let t = this.tracingHelper.runInChildSpan("connect", async () => {
          let r, n;
          try {
            r = await this.#s(), n = await this.#a(r);
          } catch (o2) {
            throw this.#e = { type: "disconnected" }, n?.free(), await r?.disconnect(), o2;
          }
          let i = { executor: r, queryCompiler: n };
          return this.#e = { type: "connected", engine: i }, i;
        });
        return this.#e = { type: "connecting", promise: t }, await t;
      }
      case "connecting":
        return await this.#e.promise;
      case "connected":
        return this.#e.engine;
      case "disconnecting":
        return await this.#e.promise, await this.#i();
    }
  }
  async #s() {
    return this.#r.remote ? new pn({ clientVersion: this.config.clientVersion, accelerateUrl: this.#r.accelerateUrl, logEmitter: this.logEmitter, logLevel: this.logLevel, logQueries: this.logQueries, tracingHelper: this.tracingHelper, sqlCommenters: this.config.sqlCommenters }) : await sn.connect({ driverAdapterFactory: this.#r.driverAdapterFactory, tracingHelper: this.tracingHelper, transactionOptions: { ...this.config.transactionOptions, isolationLevel: this.#m(this.config.transactionOptions.isolationLevel) }, onQuery: this.#o, provider: this.config.activeProvider, sqlCommenters: this.config.sqlCommenters });
  }
  async #a(t) {
    let r = this.#t;
    r === void 0 && (r = await this.#n.loadQueryCompiler(this.config), this.#t = r);
    let { provider: n, connectionInfo: i } = await t.getConnectionInfo();
    try {
      return this.#c(() => new r({ datamodel: this.datamodel, provider: n, connectionInfo: i }), void 0, false);
    } catch (o2) {
      throw this.#u(o2);
    }
  }
  #u(t) {
    if (t instanceof PrismaClientRustPanicError) return t;
    try {
      let r = JSON.parse(t.message);
      return new PrismaClientInitializationError(r.message, this.config.clientVersion, r.error_code);
    } catch {
      return t;
    }
  }
  #l(t, r) {
    if (t instanceof PrismaClientInitializationError) return t;
    if (t.code === "GenericFailure" && t.message?.startsWith("PANIC:")) return new PrismaClientRustPanicError(yl(this, t.message, r), this.config.clientVersion);
    if (t instanceof K) return new PrismaClientKnownRequestError(t.message, { code: t.code, meta: t.meta, clientVersion: this.config.clientVersion });
    try {
      let n = JSON.parse(t);
      return new PrismaClientUnknownRequestError(`${n.message}
${n.backtrace}`, { clientVersion: this.config.clientVersion });
    } catch {
      return t;
    }
  }
  #p(t) {
    return t instanceof PrismaClientRustPanicError ? t : typeof t.message == "string" && typeof t.code == "string" ? new PrismaClientKnownRequestError(t.message, { code: t.code, meta: t.meta, clientVersion: this.config.clientVersion }) : typeof t.message == "string" ? new PrismaClientUnknownRequestError(t.message, { clientVersion: this.config.clientVersion }) : t;
  }
  #c(t, r, n = true) {
    let i = bl.PRISMA_WASM_PANIC_REGISTRY.set_message, o2;
    globalThis.PRISMA_WASM_PANIC_REGISTRY.set_message = (s) => {
      o2 = s;
    };
    try {
      return t();
    } finally {
      if (globalThis.PRISMA_WASM_PANIC_REGISTRY.set_message = i, o2) throw this.#t = void 0, n && this.stop().catch((s) => Xt("failed to disconnect:", s)), new PrismaClientRustPanicError(yl(this, o2, r), this.config.clientVersion);
    }
  }
  onBeforeExit() {
    throw new Error('"beforeExit" hook is not applicable to the client engine, it is only relevant and implemented for the binary engine. Please add your event listener to the `process` object directly instead.');
  }
  async start() {
    await this.#i();
  }
  async stop() {
    switch (this.#e.type) {
      case "disconnected":
        return;
      case "connecting":
        return await this.#e.promise, await this.stop();
      case "connected": {
        let t = this.#e.engine, r = this.tracingHelper.runInChildSpan("disconnect", async () => {
          try {
            await t.executor.disconnect(), t.queryCompiler.free();
          } finally {
            this.#e = { type: "disconnected" };
          }
        });
        return this.#e = { type: "disconnecting", promise: r }, await r;
      }
      case "disconnecting":
        return await this.#e.promise;
    }
  }
  version() {
    return "unknown";
  }
  async transaction(t, r, n) {
    let i, { executor: o2 } = await this.#i();
    try {
      if (t === "start") {
        let s = n;
        i = await o2.startTransaction({ ...s, isolationLevel: this.#m(s.isolationLevel) });
      } else if (t === "commit") {
        let s = n;
        await o2.commitTransaction(s);
      } else if (t === "rollback") {
        let s = n;
        await o2.rollbackTransaction(s);
      } else Te(t, "Invalid transaction action.");
    } catch (s) {
      throw this.#l(s);
    }
    return i ? { id: i.id, payload: void 0 } : void 0;
  }
  async request(t, { interactiveTransaction: r, customDataProxyFetch: n }) {
    Xt("sending request");
    let { executor: i, queryCompiler: o2 } = await this.#i().catch((a2) => {
      throw this.#l(a2, JSON.stringify(t));
    }), s = this.#f(t, o2);
    try {
      Xt("query plan created", s);
      let a2 = {}, d = await i.execute({ plan: s, model: t.modelName, operation: t.action, placeholderValues: a2, transaction: r, batchIndex: void 0, customFetch: n?.(globalThis.fetch), queryInfo: { type: "single", modelName: t.modelName, action: t.action, query: t.query } });
      return Xt("query plan executed"), { data: { [t.action]: d } };
    } catch (a2) {
      throw this.#l(a2, JSON.stringify(t));
    }
  }
  async requestBatch(t, { transaction: r, customDataProxyFetch: n }) {
    if (t.length === 0) return [];
    let i = t[0].action, o2 = t[0].modelName, s = tl(t, r), { executor: a2, queryCompiler: d } = await this.#i().catch((P3) => {
      throw this.#l(P3, JSON.stringify(s));
    }), f2 = this.#g(s, d);
    try {
      let P3;
      r?.kind === "itx" && (P3 = r.options);
      let A2 = {};
      switch (f2.type) {
        case "multi": {
          if (r?.kind !== "itx") {
            let M2 = r?.options.isolationLevel ? { ...this.config.transactionOptions, isolationLevel: r.options.isolationLevel } : this.config.transactionOptions;
            P3 = await this.transaction("start", {}, M2);
          }
          let S2 = [], C2 = false;
          for (let [M2, R2] of f2.plans.entries()) try {
            let k2 = await a2.execute({ plan: R2, placeholderValues: A2, model: t[M2].modelName, operation: t[M2].action, batchIndex: M2, transaction: P3, customFetch: n?.(globalThis.fetch), queryInfo: { type: "single", ...t[M2] } });
            S2.push({ data: { [t[M2].action]: k2 } });
          } catch (k2) {
            S2.push(k2), C2 = true;
            break;
          }
          return P3 !== void 0 && r?.kind !== "itx" && (C2 ? await this.transaction("rollback", {}, P3) : await this.transaction("commit", {}, P3)), S2;
        }
        case "compacted": {
          if (!t.every((M2) => M2.action === i && M2.modelName === o2)) {
            let M2 = t.map((k2) => k2.action).join(", "), R2 = t.map((k2) => k2.modelName).join(", ");
            throw new Error(`Internal error: All queries in a compacted batch must have the same action and model name, but received actions: [${M2}] and model names: [${R2}]. This indicates a bug in the client. Please report this issue to the Prisma team with your query details.`);
          }
          if (o2 === void 0) throw new Error("Internal error: A compacted batch cannot contain raw queries. This indicates a bug in the client. Please report this issue to the Prisma team with your query details.");
          let S2 = await a2.execute({ plan: f2.plan, placeholderValues: A2, model: o2, operation: i, batchIndex: void 0, transaction: P3, customFetch: n?.(globalThis.fetch), queryInfo: { type: "compacted", action: i, modelName: o2, queries: t } });
          return Ms(S2, f2).map((M2) => ({ data: { [i]: M2 } }));
        }
      }
    } catch (P3) {
      throw this.#l(P3, JSON.stringify(s));
    }
  }
  async apiKey() {
    let { executor: t } = await this.#i();
    return t.apiKey();
  }
  #f(t, r) {
    if (hl(t)) return wl(t);
    try {
      return this.#c(() => this.#d({ queries: [t], execute: /* @__PURE__ */ __name(() => r.compile(JSON.stringify(t)), "execute") }));
    } catch (n) {
      throw this.#p(n);
    }
  }
  #g(t, r) {
    let n = t.batch.filter(hl);
    if (n.length === t.batch.length) return { type: "multi", plans: n.map((i) => wl(i)) };
    try {
      return this.#c(() => this.#d({ queries: t.batch, execute: /* @__PURE__ */ __name(() => r.compileBatch(JSON.stringify(t)), "execute") }));
    } catch (i) {
      throw this.#p(i);
    }
  }
  #m(t) {
    switch (t) {
      case void 0:
        return;
      case "ReadUncommitted":
        return "READ UNCOMMITTED";
      case "ReadCommitted":
        return "READ COMMITTED";
      case "RepeatableRead":
        return "REPEATABLE READ";
      case "Serializable":
        return "SERIALIZABLE";
      case "Snapshot":
        return "SNAPSHOT";
      default:
        throw new PrismaClientKnownRequestError(`Inconsistent column data: Conversion failed: Invalid isolation level \`${t}\``, { code: "P2023", clientVersion: this.config.clientVersion, meta: { providedIsolationLevel: t } });
    }
  }
  #d({ queries: t, execute: r }) {
    return this.tracingHelper.runInChildSpan({ name: "compile", attributes: { models: t.map((n) => n.modelName).filter((n) => n !== void 0), actions: t.map((n) => n.action) } }, r);
  }
};
function yl(e6, t, r) {
  return sl({ binaryTarget: void 0, title: t, version: e6.config.clientVersion, engineVersion: "unknown", database: e6.config.activeProvider, query: r });
}
__name(yl, "yl");
function hl(e6) {
  return e6.action === "queryRaw" || e6.action === "executeRaw";
}
__name(hl, "hl");
function wl(e6) {
  let t = e6.query.arguments.query, { args: r, argTypes: n } = Xa(e6.query.arguments.parameters);
  return { type: e6.action === "queryRaw" ? "query" : "execute", args: { type: "rawSql", sql: t, args: r, argTypes: n } };
}
__name(wl, "wl");
function xl(e6) {
  return new tr(e6);
}
__name(xl, "xl");
l();
u();
c();
p();
m();
var El = /* @__PURE__ */ __name((e6) => ({ command: e6 }), "El");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var Tl = /* @__PURE__ */ __name((e6) => e6.strings.reduce((t, r, n) => `${t}@P${n}${r}`), "Tl");
l();
u();
c();
p();
m();
function xt(e6) {
  try {
    return Pl(e6, "fast");
  } catch {
    return Pl(e6, "slow");
  }
}
__name(xt, "xt");
function Pl(e6, t) {
  return JSON.stringify(e6.map((r) => vl(r, t)));
}
__name(Pl, "Pl");
function vl(e6, t) {
  if (Array.isArray(e6)) return e6.map((r) => vl(r, t));
  if (typeof e6 == "bigint") return { prisma__type: "bigint", prisma__value: e6.toString() };
  if (Xe(e6)) return { prisma__type: "date", prisma__value: e6.toJSON() };
  if (Decimal.isDecimal(e6)) return { prisma__type: "decimal", prisma__value: e6.toJSON() };
  if (y.isBuffer(e6)) return { prisma__type: "bytes", prisma__value: e6.toString("base64") };
  if (Um(e6)) return { prisma__type: "bytes", prisma__value: y.from(e6).toString("base64") };
  if (ArrayBuffer.isView(e6)) {
    let { buffer: r, byteOffset: n, byteLength: i } = e6;
    return { prisma__type: "bytes", prisma__value: y.from(r, n, i).toString("base64") };
  }
  return typeof e6 == "object" && t === "slow" ? Cl(e6) : e6;
}
__name(vl, "vl");
function Um(e6) {
  return e6 instanceof ArrayBuffer || e6 instanceof SharedArrayBuffer ? true : typeof e6 == "object" && e6 !== null ? e6[Symbol.toStringTag] === "ArrayBuffer" || e6[Symbol.toStringTag] === "SharedArrayBuffer" : false;
}
__name(Um, "Um");
function Cl(e6) {
  if (typeof e6 != "object" || e6 === null) return e6;
  if (typeof e6.toJSON == "function") return e6.toJSON();
  if (Array.isArray(e6)) return e6.map(Al);
  let t = {};
  for (let r of Object.keys(e6)) t[r] = Al(e6[r]);
  return t;
}
__name(Cl, "Cl");
function Al(e6) {
  return typeof e6 == "bigint" ? e6.toString() : Cl(e6);
}
__name(Al, "Al");
var qm = /^(\s*alter\s)/i;
var Sl = Z("prisma:client");
function Si(e6, t, r, n) {
  if (!(e6 !== "postgresql" && e6 !== "cockroachdb") && r.length > 0 && qm.exec(t)) throw new Error(`Running ALTER using ${n} is not supported
Using the example below you can still execute your query with Prisma, but please note that it is vulnerable to SQL injection attacks and requires you to take care of input sanitization.

Example:
  await prisma.$executeRawUnsafe(\`ALTER USER prisma WITH PASSWORD '\${password}'\`)

More Information: https://pris.ly/d/execute-raw
`);
}
__name(Si, "Si");
var Ri = /* @__PURE__ */ __name(({ clientMethod: e6, activeProvider: t }) => (r) => {
  let n = "", i;
  if (Nr(r)) n = r.sql, i = { values: xt(r.values), __prismaRawParameters__: true };
  else if (Array.isArray(r)) {
    let [o2, ...s] = r;
    n = o2, i = { values: xt(s || []), __prismaRawParameters__: true };
  } else switch (t) {
    case "sqlite":
    case "mysql": {
      n = r.sql, i = { values: xt(r.values), __prismaRawParameters__: true };
      break;
    }
    case "cockroachdb":
    case "postgresql":
    case "postgres": {
      n = r.text, i = { values: xt(r.values), __prismaRawParameters__: true };
      break;
    }
    case "sqlserver": {
      n = Tl(r), i = { values: xt(r.values), __prismaRawParameters__: true };
      break;
    }
    default:
      throw new Error(`The ${t} provider does not support ${e6}`);
  }
  return i?.values ? Sl(`prisma.${e6}(${n}, ${i.values})`) : Sl(`prisma.${e6}(${n})`), { query: n, parameters: i };
}, "Ri");
var Rl = { requestArgsToMiddlewareArgs(e6) {
  return [e6.strings, ...e6.values];
}, middlewareArgsToRequestArgs(e6) {
  let [t, ...r] = e6;
  return new Sql(t, r);
} };
var Il = { requestArgsToMiddlewareArgs(e6) {
  return [e6];
}, middlewareArgsToRequestArgs(e6) {
  return e6[0];
} };
l();
u();
c();
p();
m();
function Ii(e6) {
  return function(r, n) {
    let i, o2 = /* @__PURE__ */ __name((s = e6) => {
      try {
        return s === void 0 || s?.kind === "itx" ? i ??= Ol(r(s)) : Ol(r(s));
      } catch (a2) {
        return Promise.reject(a2);
      }
    }, "o");
    return { get spec() {
      return n;
    }, then(s, a2) {
      return o2().then(s, a2);
    }, catch(s) {
      return o2().catch(s);
    }, finally(s) {
      return o2().finally(s);
    }, requestTransaction(s) {
      let a2 = o2(s);
      return a2.requestTransaction ? a2.requestTransaction(s) : a2;
    }, [Symbol.toStringTag]: "PrismaPromise" };
  };
}
__name(Ii, "Ii");
function Ol(e6) {
  return typeof e6.then == "function" ? e6 : Promise.resolve(e6);
}
__name(Ol, "Ol");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
var kl = { name: "@prisma/instrumentation-contract", version: "7.3.0", description: "Shared types and utilities for Prisma instrumentation", main: "dist/index.js", module: "dist/index.mjs", types: "dist/index.d.ts", exports: { ".": { require: { types: "./dist/index.d.ts", default: "./dist/index.js" }, import: { types: "./dist/index.d.mts", default: "./dist/index.mjs" } } }, license: "Apache-2.0", homepage: "https://www.prisma.io", repository: { type: "git", url: "https://github.com/prisma/prisma.git", directory: "packages/instrumentation-contract" }, bugs: "https://github.com/prisma/prisma/issues", scripts: { dev: "DEV=true tsx helpers/build.ts", build: "tsx helpers/build.ts", prepublishOnly: "pnpm run build", test: "vitest run" }, files: ["dist"], sideEffects: false, devDependencies: { "@opentelemetry/api": "1.9.0" }, peerDependencies: { "@opentelemetry/api": "^1.8" } };
var Bm = kl.version.split(".")[0];
var jm = "PRISMA_INSTRUMENTATION";
var Qm = `V${Bm}_PRISMA_INSTRUMENTATION`;
var Ml = globalThis;
function Nl() {
  let e6 = Ml[Qm];
  return e6?.helper ? e6.helper : Ml[jm]?.helper;
}
__name(Nl, "Nl");
var Hm = { isEnabled() {
  return false;
}, getTraceParent() {
  return "00-10-10-00";
}, dispatchEngineSpans() {
}, getActiveContext() {
}, runInChildSpan(e6, t) {
  return t();
} };
var Oi = class {
  static {
    __name(this, "Oi");
  }
  isEnabled() {
    return this.getTracingHelper().isEnabled();
  }
  getTraceParent(t) {
    return this.getTracingHelper().getTraceParent(t);
  }
  dispatchEngineSpans(t) {
    return this.getTracingHelper().dispatchEngineSpans(t);
  }
  getActiveContext() {
    return this.getTracingHelper().getActiveContext();
  }
  runInChildSpan(t, r) {
    return this.getTracingHelper().runInChildSpan(t, r);
  }
  getTracingHelper() {
    return Nl() ?? Hm;
  }
};
function Dl() {
  return new Oi();
}
__name(Dl, "Dl");
l();
u();
c();
p();
m();
function Ll(e6, t = () => {
}) {
  let r, n = new Promise((i) => r = i);
  return { then(i) {
    return --e6 === 0 && r(t()), i?.(n);
  } };
}
__name(Ll, "Ll");
l();
u();
c();
p();
m();
function _l(e6) {
  return typeof e6 == "string" ? e6 : e6.reduce((t, r) => {
    let n = typeof r == "string" ? r : r.level;
    return n === "query" ? t : t && (r === "info" || t === "info") ? "info" : n;
  }, void 0);
}
__name(_l, "_l");
l();
u();
c();
p();
m();
l();
u();
c();
p();
m();
function Fl(e6) {
  if (e6.action !== "findUnique" && e6.action !== "findUniqueOrThrow") return;
  let t = [];
  return e6.modelName && t.push(e6.modelName), e6.query.arguments && t.push(ki(e6.query.arguments)), t.push(ki(e6.query.selection)), t.join("");
}
__name(Fl, "Fl");
function ki(e6) {
  return `(${Object.keys(e6).sort().map((r) => {
    let n = e6[r];
    return typeof n == "object" && n !== null ? `(${r} ${ki(n)})` : r;
  }).join(" ")})`;
}
__name(ki, "ki");
l();
u();
c();
p();
m();
var Jm = { aggregate: false, aggregateRaw: false, createMany: true, createManyAndReturn: true, createOne: true, deleteMany: true, deleteOne: true, executeRaw: true, findFirst: false, findFirstOrThrow: false, findMany: false, findRaw: false, findUnique: false, findUniqueOrThrow: false, groupBy: false, queryRaw: false, runCommandRaw: true, updateMany: true, updateManyAndReturn: true, updateOne: true, upsertOne: true };
function Mi(e6) {
  return Jm[e6];
}
__name(Mi, "Mi");
l();
u();
c();
p();
m();
var mn = class {
  static {
    __name(this, "mn");
  }
  constructor(t) {
    this.options = t;
    this.batches = {};
  }
  batches;
  tickActive = false;
  request(t) {
    let r = this.options.batchBy(t);
    return r ? (this.batches[r] || (this.batches[r] = [], this.tickActive || (this.tickActive = true, g.nextTick(() => {
      this.dispatchBatches(), this.tickActive = false;
    }))), new Promise((n, i) => {
      this.batches[r].push({ request: t, resolve: n, reject: i });
    })) : this.options.singleLoader(t);
  }
  dispatchBatches() {
    for (let t in this.batches) {
      let r = this.batches[t];
      delete this.batches[t], r.length === 1 ? this.options.singleLoader(r[0].request).then((n) => {
        n instanceof Error ? r[0].reject(n) : r[0].resolve(n);
      }).catch((n) => {
        r[0].reject(n);
      }) : (r.sort((n, i) => this.options.batchOrder(n.request, i.request)), this.options.batchLoader(r.map((n) => n.request)).then((n) => {
        if (n instanceof Error) for (let i = 0; i < r.length; i++) r[i].reject(n);
        else for (let i = 0; i < r.length; i++) {
          let o2 = n[i];
          o2 instanceof Error ? r[i].reject(o2) : r[i].resolve(o2);
        }
      }).catch((n) => {
        for (let i = 0; i < r.length; i++) r[i].reject(n);
      }));
    }
  }
  get [Symbol.toStringTag]() {
    return "DataLoader";
  }
};
l();
u();
c();
p();
m();
function Je(e6, t) {
  if (t === null) return t;
  switch (e6) {
    case "bigint":
      return BigInt(t);
    case "bytes": {
      let { buffer: r, byteOffset: n, byteLength: i } = y.from(t, "base64");
      return new Uint8Array(r, n, i);
    }
    case "decimal":
      return new Decimal(t);
    case "datetime":
    case "date":
      return new Date(t);
    case "time":
      return /* @__PURE__ */ new Date(`1970-01-01T${t}Z`);
    case "bigint-array":
      return t.map((r) => Je("bigint", r));
    case "bytes-array":
      return t.map((r) => Je("bytes", r));
    case "decimal-array":
      return t.map((r) => Je("decimal", r));
    case "datetime-array":
      return t.map((r) => Je("datetime", r));
    case "date-array":
      return t.map((r) => Je("date", r));
    case "time-array":
      return t.map((r) => Je("time", r));
    default:
      return t;
  }
}
__name(Je, "Je");
function Ni(e6) {
  let t = [], r = Gm(e6);
  for (let n = 0; n < e6.rows.length; n++) {
    let i = e6.rows[n], o2 = { ...r };
    for (let s = 0; s < i.length; s++) o2[e6.columns[s]] = Je(e6.types[s], i[s]);
    t.push(o2);
  }
  return t;
}
__name(Ni, "Ni");
function Gm(e6) {
  let t = {};
  for (let r = 0; r < e6.columns.length; r++) t[e6.columns[r]] = null;
  return t;
}
__name(Gm, "Gm");
var zm = Z("prisma:client:request_handler");
var fn = class {
  static {
    __name(this, "fn");
  }
  client;
  dataloader;
  logEmitter;
  constructor(t, r) {
    this.logEmitter = r, this.client = t, this.dataloader = new mn({ batchLoader: Ps(async ({ requests: n, customDataProxyFetch: i }) => {
      let { transaction: o2, otelParentCtx: s } = n[0], a2 = n.map((A2) => A2.protocolQuery), d = this.client._tracingHelper.getTraceParent(s), f2 = n.some((A2) => Mi(A2.protocolQuery.action));
      return (await this.client._engine.requestBatch(a2, { traceparent: d, transaction: Zm(o2), containsWrite: f2, customDataProxyFetch: i })).map((A2, S2) => {
        if (A2 instanceof Error) return A2;
        try {
          return this.mapQueryEngineResult(n[S2], A2);
        } catch (C2) {
          return C2;
        }
      });
    }), singleLoader: /* @__PURE__ */ __name(async (n) => {
      let i = n.transaction?.kind === "itx" ? Ul(n.transaction) : void 0, o2 = await this.client._engine.request(n.protocolQuery, { traceparent: this.client._tracingHelper.getTraceParent(), interactiveTransaction: i, isWrite: Mi(n.protocolQuery.action), customDataProxyFetch: n.customDataProxyFetch });
      return this.mapQueryEngineResult(n, o2);
    }, "singleLoader"), batchBy: /* @__PURE__ */ __name((n) => n.transaction?.id ? `transaction-${n.transaction.id}` : Fl(n.protocolQuery), "batchBy"), batchOrder(n, i) {
      return n.transaction?.kind === "batch" && i.transaction?.kind === "batch" ? n.transaction.index - i.transaction.index : 0;
    } });
  }
  async request(t) {
    try {
      return await this.dataloader.request(t);
    } catch (r) {
      let { clientMethod: n, callsite: i, transaction: o2, args: s, modelName: a2 } = t;
      this.handleAndLogRequestError({ error: r, clientMethod: n, callsite: i, transaction: o2, args: s, modelName: a2, globalOmit: t.globalOmit });
    }
  }
  mapQueryEngineResult({ dataPath: t, unpacker: r }, n) {
    let i = n?.data, o2 = this.unpack(i, t, r);
    return g.env.PRISMA_CLIENT_GET_TIME ? { data: o2 } : o2;
  }
  handleAndLogRequestError(t) {
    try {
      this.handleRequestError(t);
    } catch (r) {
      throw this.logEmitter && this.logEmitter.emit("error", { message: r.message, target: t.clientMethod, timestamp: /* @__PURE__ */ new Date() }), r;
    }
  }
  handleRequestError({ error: t, clientMethod: r, callsite: n, transaction: i, args: o2, modelName: s, globalOmit: a2 }) {
    if (zm(t), Ym(t, i)) throw t;
    if (t instanceof PrismaClientKnownRequestError && Xm(t)) {
      let f2 = $l(t.meta);
      Ir({ args: o2, errors: [f2], callsite: n, errorFormat: this.client._errorFormat, originalMethod: r, clientVersion: this.client._clientVersion, globalOmit: a2 });
    }
    let d = t.message;
    if (n && (d = Er({ callsite: n, originalMethod: r, isPanic: t.isPanic, showColors: this.client._errorFormat === "pretty", message: d })), d = this.sanitizeMessage(d), t.code) {
      let f2 = s ? { modelName: s, ...t.meta } : t.meta;
      throw new PrismaClientKnownRequestError(d, { code: t.code, clientVersion: this.client._clientVersion, meta: f2, batchRequestIdx: t.batchRequestIdx });
    } else {
      if (t.isPanic) throw new PrismaClientRustPanicError(d, this.client._clientVersion);
      if (t instanceof PrismaClientUnknownRequestError) throw new PrismaClientUnknownRequestError(d, { clientVersion: this.client._clientVersion, batchRequestIdx: t.batchRequestIdx });
      if (t instanceof PrismaClientInitializationError) throw new PrismaClientInitializationError(d, this.client._clientVersion);
      if (t instanceof PrismaClientRustPanicError) throw new PrismaClientRustPanicError(d, this.client._clientVersion);
    }
    throw t.clientVersion = this.client._clientVersion, t;
  }
  sanitizeMessage(t) {
    return this.client._errorFormat && this.client._errorFormat !== "pretty" ? Ye(t) : t;
  }
  unpack(t, r, n) {
    if (!t || (t.data && (t = t.data), !t)) return t;
    let i = Object.keys(t)[0], o2 = Object.values(t)[0], s = r.filter((f2) => f2 !== "select" && f2 !== "include"), a2 = $n(o2, s), d = i === "queryRaw" ? Ni(a2) : $e(a2);
    return n ? n(d) : d;
  }
  get [Symbol.toStringTag]() {
    return "RequestHandler";
  }
};
function Zm(e6) {
  if (e6) {
    if (e6.kind === "batch") return { kind: "batch", options: { isolationLevel: e6.isolationLevel } };
    if (e6.kind === "itx") return { kind: "itx", options: Ul(e6) };
    Te(e6, "Unknown transaction kind");
  }
}
__name(Zm, "Zm");
function Ul(e6) {
  return { id: e6.id, payload: e6.payload };
}
__name(Ul, "Ul");
function Ym(e6, t) {
  return hasBatchIndex(e6) && t?.kind === "batch" && e6.batchRequestIdx !== t.index;
}
__name(Ym, "Ym");
function Xm(e6) {
  return e6.code === "P2009" || e6.code === "P2012";
}
__name(Xm, "Xm");
function $l(e6) {
  if (e6.kind === "Union") return { kind: "Union", errors: e6.errors.map($l) };
  if (Array.isArray(e6.selectionPath)) {
    let [, ...t] = e6.selectionPath;
    return { ...e6, selectionPath: t };
  }
  return e6;
}
__name($l, "$l");
l();
u();
c();
p();
m();
var _i = on2;
l();
u();
c();
p();
m();
var Ql = Ne(In());
l();
u();
c();
p();
m();
var B = class extends Error {
  static {
    __name(this, "B");
  }
  constructor(t) {
    super(t + `
Read more at https://pris.ly/d/client-constructor`), this.name = "PrismaClientConstructorValidationError";
  }
  get [Symbol.toStringTag]() {
    return "PrismaClientConstructorValidationError";
  }
};
Ot(B, "PrismaClientConstructorValidationError");
var ql = ["errorFormat", "adapter", "accelerateUrl", "log", "transactionOptions", "omit", "comments", "__internal"];
var Vl = ["pretty", "colorless", "minimal"];
var Bl = ["info", "query", "warn", "error"];
var ed = { adapter: /* @__PURE__ */ __name(() => {
}, "adapter"), accelerateUrl: /* @__PURE__ */ __name((e6) => {
  if (e6 !== void 0) {
    if (typeof e6 != "string") throw new B(`Invalid value ${JSON.stringify(e6)} for "accelerateUrl" provided to PrismaClient constructor.`);
    if (e6.trim().length === 0) throw new B('"accelerateUrl" provided to PrismaClient constructor must be a non-empty string.');
  }
}, "accelerateUrl"), errorFormat: /* @__PURE__ */ __name((e6) => {
  if (e6) {
    if (typeof e6 != "string") throw new B(`Invalid value ${JSON.stringify(e6)} for "errorFormat" provided to PrismaClient constructor.`);
    if (!Vl.includes(e6)) {
      let t = rr(e6, Vl);
      throw new B(`Invalid errorFormat ${e6} provided to PrismaClient constructor.${t}`);
    }
  }
}, "errorFormat"), log: /* @__PURE__ */ __name((e6) => {
  if (!e6) return;
  if (!Array.isArray(e6)) throw new B(`Invalid value ${JSON.stringify(e6)} for "log" provided to PrismaClient constructor.`);
  function t(r) {
    if (typeof r == "string" && !Bl.includes(r)) {
      let n = rr(r, Bl);
      throw new B(`Invalid log level "${r}" provided to PrismaClient constructor.${n}`);
    }
  }
  __name(t, "t");
  for (let r of e6) {
    t(r);
    let n = { level: t, emit: /* @__PURE__ */ __name((i) => {
      let o2 = ["stdout", "event"];
      if (!o2.includes(i)) {
        let s = rr(i, o2);
        throw new B(`Invalid value ${JSON.stringify(i)} for "emit" in logLevel provided to PrismaClient constructor.${s}`);
      }
    }, "emit") };
    if (r && typeof r == "object") for (let [i, o2] of Object.entries(r)) if (n[i]) n[i](o2);
    else throw new B(`Invalid property ${i} for "log" provided to PrismaClient constructor`);
  }
}, "log"), transactionOptions: /* @__PURE__ */ __name((e6) => {
  if (!e6) return;
  let t = e6.maxWait;
  if (t != null && t <= 0) throw new B(`Invalid value ${t} for maxWait in "transactionOptions" provided to PrismaClient constructor. maxWait needs to be greater than 0`);
  let r = e6.timeout;
  if (r != null && r <= 0) throw new B(`Invalid value ${r} for timeout in "transactionOptions" provided to PrismaClient constructor. timeout needs to be greater than 0`);
}, "transactionOptions"), omit: /* @__PURE__ */ __name((e6, t) => {
  if (typeof e6 != "object") throw new B('"omit" option is expected to be an object.');
  if (e6 === null) throw new B('"omit" option can not be `null`');
  let r = [];
  for (let [n, i] of Object.entries(e6)) {
    let o2 = nd(n, t.runtimeDataModel);
    if (!o2) {
      r.push({ kind: "UnknownModel", modelKey: n });
      continue;
    }
    for (let [s, a2] of Object.entries(i)) {
      let d = o2.fields.find((f2) => f2.name === s);
      if (!d) {
        r.push({ kind: "UnknownField", modelKey: n, fieldName: s });
        continue;
      }
      if (d.relationName) {
        r.push({ kind: "RelationInOmit", modelKey: n, fieldName: s });
        continue;
      }
      typeof a2 != "boolean" && r.push({ kind: "InvalidFieldValue", modelKey: n, fieldName: s });
    }
  }
  if (r.length > 0) throw new B(id(e6, r));
}, "omit"), comments: /* @__PURE__ */ __name((e6) => {
  if (e6 !== void 0) {
    if (!Array.isArray(e6)) throw new B(`Invalid value ${JSON.stringify(e6)} for "comments" provided to PrismaClient constructor. Expected an array of SQL commenter plugins.`);
    for (let t = 0; t < e6.length; t++) if (typeof e6[t] != "function") throw new B(`Invalid value at index ${t} for "comments" provided to PrismaClient constructor. Each plugin must be a function.`);
  }
}, "comments"), __internal: /* @__PURE__ */ __name((e6) => {
  if (!e6) return;
  let t = ["debug", "engine", "configOverride"];
  if (typeof e6 != "object") throw new B(`Invalid value ${JSON.stringify(e6)} for "__internal" to PrismaClient constructor`);
  for (let [r] of Object.entries(e6)) if (!t.includes(r)) {
    let n = rr(r, t);
    throw new B(`Invalid property ${JSON.stringify(r)} for "__internal" provided to PrismaClient constructor.${n}`);
  }
}, "__internal") };
function td(e6) {
  let t = e6.adapter !== void 0, r = e6.accelerateUrl !== void 0;
  if (t && r) throw new B('The "adapter" and "accelerateUrl" options are mutually exclusive. Please provide only one of them.');
  if (!t && !r) throw new B('Using engine type "client" requires either "adapter" or "accelerateUrl" to be provided to PrismaClient constructor.');
}
__name(td, "td");
function Hl(e6, t) {
  for (let [r, n] of Object.entries(e6)) {
    if (!ql.includes(r)) {
      let i = rr(r, ql);
      throw new B(`Unknown property ${r} provided to PrismaClient constructor.${i}`);
    }
    ed[r](n, t);
  }
  td(e6);
}
__name(Hl, "Hl");
function rr(e6, t) {
  if (t.length === 0 || typeof e6 != "string") return "";
  let r = rd(e6, t);
  return r ? ` Did you mean "${r}"?` : "";
}
__name(rr, "rr");
function rd(e6, t) {
  if (t.length === 0) return null;
  let r = t.map((i) => ({ value: i, distance: (0, Ql.default)(e6, i) }));
  r.sort((i, o2) => i.distance < o2.distance ? -1 : 1);
  let n = r[0];
  return n.distance < 3 ? n.value : null;
}
__name(rd, "rd");
function nd(e6, t) {
  return jl(t.models, e6) ?? jl(t.types, e6);
}
__name(nd, "nd");
function jl(e6, t) {
  let r = Object.keys(e6).find((n) => Ce(n) === t);
  if (r) return e6[r];
}
__name(jl, "jl");
function id(e6, t) {
  let r = at(e6);
  for (let o2 of t) switch (o2.kind) {
    case "UnknownModel":
      r.arguments.getField(o2.modelKey)?.markAsError(), r.addErrorMessage(() => `Unknown model name: ${o2.modelKey}.`);
      break;
    case "UnknownField":
      r.arguments.getDeepField([o2.modelKey, o2.fieldName])?.markAsError(), r.addErrorMessage(() => `Model "${o2.modelKey}" does not have a field named "${o2.fieldName}".`);
      break;
    case "RelationInOmit":
      r.arguments.getDeepField([o2.modelKey, o2.fieldName])?.markAsError(), r.addErrorMessage(() => 'Relations are already excluded by default and can not be specified in "omit".');
      break;
    case "InvalidFieldValue":
      r.arguments.getDeepFieldValue([o2.modelKey, o2.fieldName])?.markAsError(), r.addErrorMessage(() => "Omit field option value must be a boolean.");
      break;
  }
  let { message: n, args: i } = Rr(r, "colorless");
  return `Error validating "omit" option:

${i}

${n}`;
}
__name(id, "id");
l();
u();
c();
p();
m();
function Jl(e6) {
  return e6.length === 0 ? Promise.resolve([]) : new Promise((t, r) => {
    let n = new Array(e6.length), i = null, o2 = false, s = 0, a2 = /* @__PURE__ */ __name(() => {
      o2 || (s++, s === e6.length && (o2 = true, i ? r(i) : t(n)));
    }, "a"), d = /* @__PURE__ */ __name((f2) => {
      o2 || (o2 = true, r(f2));
    }, "d");
    for (let f2 = 0; f2 < e6.length; f2++) e6[f2].then((P3) => {
      n[f2] = P3, a2();
    }, (P3) => {
      if (!hasBatchIndex(P3)) {
        d(P3);
        return;
      }
      P3.batchRequestIdx === f2 ? d(P3) : (i || (i = P3), a2());
    });
  });
}
__name(Jl, "Jl");
var nr = Z("prisma:client");
typeof globalThis == "object" && (globalThis.NODE_CLIENT = true);
var ad = { requestArgsToMiddlewareArgs: /* @__PURE__ */ __name((e6) => e6, "requestArgsToMiddlewareArgs"), middlewareArgsToRequestArgs: /* @__PURE__ */ __name((e6) => e6, "middlewareArgsToRequestArgs") };
var ld = Symbol.for("prisma.client.transaction.id");
var ud = { id: 0, nextId() {
  return ++this.id;
} };
function cd(e6) {
  class t {
    static {
      __name(this, "t");
    }
    _originalClient = this;
    _runtimeDataModel;
    _requestHandler;
    _connectionPromise;
    _disconnectionPromise;
    _engineConfig;
    _accelerateEngineConfig;
    _clientVersion;
    _errorFormat;
    _tracingHelper;
    _previewFeatures;
    _activeProvider;
    _globalOmit;
    _extensions;
    _engine;
    _appliedParent;
    _createPrismaPromise = Ii();
    constructor(n) {
      if (!n) throw new PrismaClientInitializationError("`PrismaClient` needs to be constructed with a non-empty, valid `PrismaClientOptions`:\n\n```\nnew PrismaClient({\n  ...\n})\n```\n\nor\n\n```\nconstructor() {\n  super({ ... });\n}\n```\n          ", _i);
      e6 = n.__internal?.configOverride?.(e6) ?? e6, Hl(n, e6);
      let i = new Dr().on("error", () => {
      });
      this._extensions = lt.empty(), this._previewFeatures = e6.previewFeatures, this._clientVersion = e6.clientVersion ?? _i, this._activeProvider = e6.activeProvider, this._globalOmit = n?.omit, this._tracingHelper = Dl();
      let o2;
      if (n.adapter) {
        o2 = n.adapter;
        let s = e6.activeProvider === "postgresql" || e6.activeProvider === "cockroachdb" ? "postgres" : e6.activeProvider;
        if (o2.provider !== s) throw new PrismaClientInitializationError(`The Driver Adapter \`${o2.adapterName}\`, based on \`${o2.provider}\`, is not compatible with the provider \`${s}\` specified in the Prisma schema.`, this._clientVersion);
      }
      try {
        let s = n ?? {}, d = (s.__internal ?? {}).debug === true;
        if (d && Z.enable("prisma:client"), s.errorFormat ? this._errorFormat = s.errorFormat : g.env.NODE_ENV === "production" ? this._errorFormat = "minimal" : g.env.NO_COLOR ? this._errorFormat = "colorless" : this._errorFormat = "colorless", this._runtimeDataModel = e6.runtimeDataModel, this._engineConfig = { enableDebugLogs: d, logLevel: s.log && _l(s.log), logQueries: s.log && !!(typeof s.log == "string" ? s.log === "query" : s.log.find((f2) => typeof f2 == "string" ? f2 === "query" : f2.level === "query")), compilerWasm: e6.compilerWasm, clientVersion: e6.clientVersion, previewFeatures: this._previewFeatures, activeProvider: e6.activeProvider, inlineSchema: e6.inlineSchema, tracingHelper: this._tracingHelper, transactionOptions: { maxWait: s.transactionOptions?.maxWait ?? 2e3, timeout: s.transactionOptions?.timeout ?? 5e3, isolationLevel: s.transactionOptions?.isolationLevel }, logEmitter: i, adapter: o2, accelerateUrl: s.accelerateUrl, sqlCommenters: s.comments }, this._accelerateEngineConfig = Object.create(this._engineConfig), this._accelerateEngineConfig.accelerateUtils = { resolveDatasourceUrl: /* @__PURE__ */ __name(() => {
          if (s.accelerateUrl) return s.accelerateUrl;
          throw new PrismaClientInitializationError(`\`accelerateUrl\` is required when using \`@prisma/extension-accelerate\`:

new PrismaClient({
  accelerateUrl: "prisma://...",
}).$extends(withAccelerate())
`, e6.clientVersion);
        }, "resolveDatasourceUrl") }, nr("clientVersion", e6.clientVersion), this._engine = xl(this._engineConfig), this._requestHandler = new fn(this, i), s.log) for (let f2 of s.log) {
          let P3 = typeof f2 == "string" ? f2 : f2.emit === "stdout" ? f2.level : null;
          P3 && this.$on(P3, (A2) => {
            It.log(`${It.tags[P3] ?? ""}`, A2.message || A2.query);
          });
        }
      } catch (s) {
        throw s.clientVersion = this._clientVersion, s;
      }
      return this._appliedParent = $t(this);
    }
    get [Symbol.toStringTag]() {
      return "PrismaClient";
    }
    $on(n, i) {
      return n === "beforeExit" ? this._engine.onBeforeExit(i) : n && this._engineConfig.logEmitter.on(n, i), this;
    }
    $connect() {
      try {
        return this._engine.start();
      } catch (n) {
        throw n.clientVersion = this._clientVersion, n;
      }
    }
    async $disconnect() {
      try {
        await this._engine.stop();
      } catch (n) {
        throw n.clientVersion = this._clientVersion, n;
      } finally {
        fo();
      }
    }
    $executeRawInternal(n, i, o2, s) {
      let a2 = this._activeProvider;
      return this._request({ action: "executeRaw", args: o2, transaction: n, clientMethod: i, argsMapper: Ri({ clientMethod: i, activeProvider: a2 }), callsite: Re(this._errorFormat), dataPath: [], middlewareArgsMapper: s });
    }
    $executeRaw(n, ...i) {
      return this._createPrismaPromise((o2) => {
        if (n.raw !== void 0 || n.sql !== void 0) {
          let [s, a2] = Wl(n, i);
          return Si(this._activeProvider, s.text, s.values, Array.isArray(n) ? "prisma.$executeRaw`<SQL>`" : "prisma.$executeRaw(sql`<SQL>`)"), this.$executeRawInternal(o2, "$executeRaw", s, a2);
        }
        throw new PrismaClientValidationError("`$executeRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#executeraw\n", { clientVersion: this._clientVersion });
      });
    }
    $executeRawUnsafe(n, ...i) {
      return this._createPrismaPromise((o2) => (Si(this._activeProvider, n, i, "prisma.$executeRawUnsafe(<SQL>, [...values])"), this.$executeRawInternal(o2, "$executeRawUnsafe", [n, ...i])));
    }
    $runCommandRaw(n) {
      if (e6.activeProvider !== "mongodb") throw new PrismaClientValidationError(`The ${e6.activeProvider} provider does not support $runCommandRaw. Use the mongodb provider.`, { clientVersion: this._clientVersion });
      return this._createPrismaPromise((i) => this._request({ args: n, clientMethod: "$runCommandRaw", dataPath: [], action: "runCommandRaw", argsMapper: El, callsite: Re(this._errorFormat), transaction: i }));
    }
    async $queryRawInternal(n, i, o2, s) {
      let a2 = this._activeProvider;
      return this._request({ action: "queryRaw", args: o2, transaction: n, clientMethod: i, argsMapper: Ri({ clientMethod: i, activeProvider: a2 }), callsite: Re(this._errorFormat), dataPath: [], middlewareArgsMapper: s });
    }
    $queryRaw(n, ...i) {
      return this._createPrismaPromise((o2) => {
        if (n.raw !== void 0 || n.sql !== void 0) return this.$queryRawInternal(o2, "$queryRaw", ...Wl(n, i));
        throw new PrismaClientValidationError("`$queryRaw` is a tag function, please use it like the following:\n```\nconst result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`\n```\n\nOr read our docs at https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#queryraw\n", { clientVersion: this._clientVersion });
      });
    }
    $queryRawTyped(n) {
      return this._createPrismaPromise((i) => {
        if (!this._hasPreviewFlag("typedSql")) throw new PrismaClientValidationError("`typedSql` preview feature must be enabled in order to access $queryRawTyped API", { clientVersion: this._clientVersion });
        return this.$queryRawInternal(i, "$queryRawTyped", n);
      });
    }
    $queryRawUnsafe(n, ...i) {
      return this._createPrismaPromise((o2) => this.$queryRawInternal(o2, "$queryRawUnsafe", [n, ...i]));
    }
    _transactionWithArray({ promises: n, options: i }) {
      let o2 = ud.nextId(), s = Ll(n.length), a2 = n.map((d, f2) => {
        if (d?.[Symbol.toStringTag] !== "PrismaPromise") throw new Error("All elements of the array need to be Prisma Client promises. Hint: Please make sure you are not awaiting the Prisma client calls you intended to pass in the $transaction function.");
        let P3 = i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel, A2 = { kind: "batch", id: o2, index: f2, isolationLevel: P3, lock: s };
        return d.requestTransaction?.(A2) ?? d;
      });
      return Jl(a2);
    }
    async _transactionWithCallback({ callback: n, options: i }) {
      let o2 = { traceparent: this._tracingHelper.getTraceParent() }, s = { maxWait: i?.maxWait ?? this._engineConfig.transactionOptions.maxWait, timeout: i?.timeout ?? this._engineConfig.transactionOptions.timeout, isolationLevel: i?.isolationLevel ?? this._engineConfig.transactionOptions.isolationLevel }, a2 = await this._engine.transaction("start", o2, s), d;
      try {
        let f2 = { kind: "itx", ...a2 };
        d = await n(this._createItxClient(f2)), await this._engine.transaction("commit", o2, a2);
      } catch (f2) {
        throw await this._engine.transaction("rollback", o2, a2).catch(() => {
        }), f2;
      }
      return d;
    }
    _createItxClient(n) {
      return le($t(le(ms(this), [Y("_appliedParent", () => this._appliedParent._createItxClient(n)), Y("_createPrismaPromise", () => Ii(n)), Y(ld, () => n.id)])), [ut(hs)]);
    }
    $transaction(n, i) {
      let o2;
      typeof n == "function" ? this._engineConfig.adapter?.adapterName === "@prisma/adapter-d1" ? o2 = /* @__PURE__ */ __name(() => {
        throw new Error("Cloudflare D1 does not support interactive transactions. We recommend you to refactor your queries with that limitation in mind, and use batch transactions with `prisma.$transactions([])` where applicable.");
      }, "o") : o2 = /* @__PURE__ */ __name(() => this._transactionWithCallback({ callback: n, options: i }), "o") : o2 = /* @__PURE__ */ __name(() => this._transactionWithArray({ promises: n, options: i }), "o");
      let s = { name: "transaction", attributes: { method: "$transaction" } };
      return this._tracingHelper.runInChildSpan(s, o2);
    }
    _request(n) {
      n.otelParentCtx = this._tracingHelper.getActiveContext();
      let i = n.middlewareArgsMapper ?? ad, o2 = { args: i.requestArgsToMiddlewareArgs(n.args), dataPath: n.dataPath, runInTransaction: !!n.transaction, action: n.action, model: n.model }, s = { operation: { name: "operation", attributes: { method: o2.action, model: o2.model, name: o2.model ? `${o2.model}.${o2.action}` : o2.action } } }, a2 = /* @__PURE__ */ __name(async (d) => {
        let { runInTransaction: f2, args: P3, ...A2 } = d, S2 = { ...n, ...A2 };
        P3 && (S2.args = i.middlewareArgsToRequestArgs(P3)), n.transaction !== void 0 && f2 === false && delete S2.transaction;
        let C2 = await Ts(this, S2);
        return S2.model ? ys({ result: C2, modelName: S2.model, args: S2.args, extensions: this._extensions, runtimeDataModel: this._runtimeDataModel, globalOmit: this._globalOmit }) : C2;
      }, "a");
      return this._tracingHelper.runInChildSpan(s.operation, () => a2(o2));
    }
    async _executeRequest({ args: n, clientMethod: i, dataPath: o2, callsite: s, action: a2, model: d, argsMapper: f2, transaction: P3, unpacker: A2, otelParentCtx: S2, customDataProxyFetch: C2 }) {
      try {
        n = f2 ? f2(n) : n;
        let M2 = { name: "serialize" }, R2 = this._tracingHelper.runInChildSpan(M2, () => Dn({ modelName: d, runtimeDataModel: this._runtimeDataModel, action: a2, args: n, clientMethod: i, callsite: s, extensions: this._extensions, errorFormat: this._errorFormat, clientVersion: this._clientVersion, previewFeatures: this._previewFeatures, globalOmit: this._globalOmit }));
        return Z.enabled("prisma:client") && (nr("Prisma Client call:"), nr(`prisma.${i}(${rs(n)})`), nr("Generated request:"), nr(JSON.stringify(R2, null, 2) + `
`)), P3?.kind === "batch" && await P3.lock, this._requestHandler.request({ protocolQuery: R2, modelName: d, action: a2, clientMethod: i, dataPath: o2, callsite: s, args: n, extensions: this._extensions, transaction: P3, unpacker: A2, otelParentCtx: S2, otelChildCtx: this._tracingHelper.getActiveContext(), globalOmit: this._globalOmit, customDataProxyFetch: C2 });
      } catch (M2) {
        throw M2.clientVersion = this._clientVersion, M2;
      }
    }
    _hasPreviewFlag(n) {
      return !!this._engineConfig.previewFeatures?.includes(n);
    }
    $extends = ds;
  }
  return t;
}
__name(cd, "cd");
function Wl(e6, t) {
  return pd(e6) ? [new Sql(e6, t), Rl] : [e6, Il];
}
__name(Wl, "Wl");
function pd(e6) {
  return Array.isArray(e6) && Array.isArray(e6.raw);
}
__name(pd, "pd");
l();
u();
c();
p();
m();
var md = /* @__PURE__ */ new Set(["toJSON", "$$typeof", "asymmetricMatch", Symbol.iterator, Symbol.toStringTag, Symbol.isConcatSpreadable, Symbol.toPrimitive]);
function dd(e6) {
  return new Proxy(e6, { get(t, r) {
    if (r in t) return t[r];
    if (!md.has(r)) throw new TypeError(`Invalid enum value: ${String(r)}`);
  } });
}
__name(dd, "dd");
l();
u();
c();
p();
m();

// ../../packages/database/src/generated/prisma/internal/class.ts
var config3 = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": 'generator client {\n  provider   = "prisma-client"\n  output     = "../src/generated/prisma"\n  engineType = "client"\n  runtime    = "cloudflare"\n}\n\ngenerator clientNode {\n  provider   = "prisma-client"\n  output     = "../src/generated/prisma-node"\n  engineType = "client"\n  runtime    = "nodejs"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Skill {\n  id           String  @id\n  slug         String  @unique\n  name         String\n  description  String\n  summary      String? @db.Text\n  categories   Json?\n  capabilities Json?\n  keywords     Json?\n  contentHash  String? @map("content_hash")\n\n  // Source\n  sourceType    String  @default("direct") @map("source_type")\n  githubRepo    String? @map("github_repo")\n  githubPath    String? @map("github_path")\n  hasScripts    Boolean @default(false) @map("has_scripts")\n  hasReferences Boolean @default(false) @map("has_references")\n\n  // Stats\n  downloads Int @default(0)\n\n  // Vectorization\n  vectorizedAt DateTime? @map("vectorized_at") @db.Timestamptz\n\n  // Timestamps\n  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz\n  updatedAt   DateTime  @default(now()) @updatedAt @map("updated_at") @db.Timestamptz\n  publishedAt DateTime? @map("published_at") @db.Timestamptz\n\n  chunks SkillChunk[]\n\n  @@index([githubRepo, githubPath], map: "idx_skills_github")\n  @@index([downloads(sort: Desc)], map: "idx_skills_downloads")\n  @@index([createdAt(sort: Desc)], map: "idx_skills_created")\n  @@map("skills")\n}\n\n// \u2500\u2500\u2500 Better Auth models \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\nmodel User {\n  id            String   @id\n  name          String\n  email         String   @unique\n  emailVerified Boolean  @default(false) @map("email_verified")\n  image         String?\n  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz\n  updatedAt     DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz\n\n  sessions    Session[]\n  accounts    Account[]\n  deviceCodes DeviceCode[]\n  searchUsage SearchUsage[]\n\n  ownedNamespaces Namespace[]       @relation("ownedNamespaces")\n  namespaceAccess NamespaceAccess[]\n\n  @@map("users")\n}\n\nmodel Session {\n  id        String   @id\n  token     String   @unique\n  expiresAt DateTime @map("expires_at") @db.Timestamptz\n  ipAddress String?  @map("ip_address")\n  userAgent String?  @map("user_agent")\n  userId    String   @map("user_id")\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz\n  updatedAt DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz\n\n  @@map("sessions")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String    @map("account_id")\n  providerId            String    @map("provider_id")\n  userId                String    @map("user_id")\n  accessToken           String?   @map("access_token") @db.Text\n  refreshToken          String?   @map("refresh_token") @db.Text\n  idToken               String?   @map("id_token") @db.Text\n  accessTokenExpiresAt  DateTime? @map("access_token_expires_at") @db.Timestamptz\n  refreshTokenExpiresAt DateTime? @map("refresh_token_expires_at") @db.Timestamptz\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now()) @map("created_at") @db.Timestamptz\n  updatedAt             DateTime  @default(now()) @updatedAt @map("updated_at") @db.Timestamptz\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@map("accounts")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime @map("expires_at") @db.Timestamptz\n  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz\n  updatedAt  DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz\n\n  @@map("verifications")\n}\n\n// \u2500\u2500\u2500 Device code flow \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\nmodel DeviceCode {\n  id           String    @id @default(cuid())\n  deviceCode   String    @unique @map("device_code")\n  userCode     String    @unique @map("user_code")\n  status       String    @default("pending") // pending | confirmed | expired\n  userId       String?   @map("user_id")\n  sessionToken String?   @map("session_token")\n  expiresAt    DateTime  @map("expires_at") @db.Timestamptz\n  lastPolledAt DateTime? @map("last_polled_at") @db.Timestamptz\n  createdAt    DateTime  @default(now()) @map("created_at") @db.Timestamptz\n\n  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([expiresAt], map: "idx_device_codes_expires")\n  @@map("device_codes")\n}\n\n// \u2500\u2500\u2500 Search usage \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\nmodel SearchUsage {\n  id         String   @id @default(cuid())\n  userId     String   @map("user_id")\n  query      String\n  searchedAt DateTime @default(now()) @map("searched_at") @db.Timestamptz\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId, searchedAt], map: "idx_search_usage_user_time")\n  @@map("search_usage")\n}\n\n// \u2500\u2500\u2500 Vector search \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n\nmodel SkillChunk {\n  id         String   @id // "{skillId}::{chunkIndex}"\n  skillId    String   @map("skill_id")\n  chunkId    String   @map("chunk_id")\n  title      String\n  text       String   @db.Text\n  chunkIndex Int      @map("chunk_index")\n  namespace  String   @default("public") @map("namespace")\n  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz\n  updatedAt  DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz\n  // embedding vector(1536) \u2014 added via raw SQL in migration\n\n  skill        Skill     @relation(fields: [skillId], references: [id], onDelete: Cascade)\n  namespaceRef Namespace @relation(fields: [namespace], references: [id])\n\n  @@index([skillId], map: "idx_skill_chunks_skill_id")\n  @@index([namespace], map: "idx_skill_chunks_namespace")\n  @@map("skill_chunks")\n}\n\nmodel Namespace {\n  id        String   @id // "public", "pub_tailwind", "org_acme", "usr_abc"\n  name      String // Display name\n  type      String // "system" | "personal" | "org" | "publisher" | "collection"\n  ownerId   String   @map("owner_id")\n  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz\n\n  owner   User              @relation("ownedNamespaces", fields: [ownerId], references: [id])\n  members NamespaceAccess[]\n  chunks  SkillChunk[]\n\n  @@map("namespaces")\n}\n\nmodel NamespaceAccess {\n  id          String   @id @default(cuid())\n  namespaceId String   @map("namespace_id")\n  userId      String   @map("user_id")\n  role        String   @default("reader") // "reader" | "publisher"\n  grantedAt   DateTime @default(now()) @map("granted_at") @db.Timestamptz\n\n  namespace Namespace @relation(fields: [namespaceId], references: [id], onDelete: Cascade)\n  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([namespaceId, userId], map: "uq_namespace_access")\n  @@index([userId], map: "idx_namespace_access_user")\n  @@map("namespace_access")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config3.runtimeDataModel = JSON.parse('{"models":{"Skill":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"slug","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"summary","kind":"scalar","type":"String"},{"name":"categories","kind":"scalar","type":"Json"},{"name":"capabilities","kind":"scalar","type":"Json"},{"name":"keywords","kind":"scalar","type":"Json"},{"name":"contentHash","kind":"scalar","type":"String","dbName":"content_hash"},{"name":"sourceType","kind":"scalar","type":"String","dbName":"source_type"},{"name":"githubRepo","kind":"scalar","type":"String","dbName":"github_repo"},{"name":"githubPath","kind":"scalar","type":"String","dbName":"github_path"},{"name":"hasScripts","kind":"scalar","type":"Boolean","dbName":"has_scripts"},{"name":"hasReferences","kind":"scalar","type":"Boolean","dbName":"has_references"},{"name":"downloads","kind":"scalar","type":"Int"},{"name":"vectorizedAt","kind":"scalar","type":"DateTime","dbName":"vectorized_at"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"publishedAt","kind":"scalar","type":"DateTime","dbName":"published_at"},{"name":"chunks","kind":"object","type":"SkillChunk","relationName":"SkillToSkillChunk"}],"dbName":"skills"},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean","dbName":"email_verified"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"deviceCodes","kind":"object","type":"DeviceCode","relationName":"DeviceCodeToUser"},{"name":"searchUsage","kind":"object","type":"SearchUsage","relationName":"SearchUsageToUser"},{"name":"ownedNamespaces","kind":"object","type":"Namespace","relationName":"ownedNamespaces"},{"name":"namespaceAccess","kind":"object","type":"NamespaceAccess","relationName":"NamespaceAccessToUser"}],"dbName":"users"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"token","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime","dbName":"expires_at"},{"name":"ipAddress","kind":"scalar","type":"String","dbName":"ip_address"},{"name":"userAgent","kind":"scalar","type":"String","dbName":"user_agent"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"}],"dbName":"sessions"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String","dbName":"account_id"},{"name":"providerId","kind":"scalar","type":"String","dbName":"provider_id"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"accessToken","kind":"scalar","type":"String","dbName":"access_token"},{"name":"refreshToken","kind":"scalar","type":"String","dbName":"refresh_token"},{"name":"idToken","kind":"scalar","type":"String","dbName":"id_token"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime","dbName":"access_token_expires_at"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime","dbName":"refresh_token_expires_at"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"}],"dbName":"accounts"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime","dbName":"expires_at"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"}],"dbName":"verifications"},"DeviceCode":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"deviceCode","kind":"scalar","type":"String","dbName":"device_code"},{"name":"userCode","kind":"scalar","type":"String","dbName":"user_code"},{"name":"status","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"sessionToken","kind":"scalar","type":"String","dbName":"session_token"},{"name":"expiresAt","kind":"scalar","type":"DateTime","dbName":"expires_at"},{"name":"lastPolledAt","kind":"scalar","type":"DateTime","dbName":"last_polled_at"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"user","kind":"object","type":"User","relationName":"DeviceCodeToUser"}],"dbName":"device_codes"},"SearchUsage":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"query","kind":"scalar","type":"String"},{"name":"searchedAt","kind":"scalar","type":"DateTime","dbName":"searched_at"},{"name":"user","kind":"object","type":"User","relationName":"SearchUsageToUser"}],"dbName":"search_usage"},"SkillChunk":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"skillId","kind":"scalar","type":"String","dbName":"skill_id"},{"name":"chunkId","kind":"scalar","type":"String","dbName":"chunk_id"},{"name":"title","kind":"scalar","type":"String"},{"name":"text","kind":"scalar","type":"String"},{"name":"chunkIndex","kind":"scalar","type":"Int","dbName":"chunk_index"},{"name":"namespace","kind":"scalar","type":"String","dbName":"namespace"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"updatedAt","kind":"scalar","type":"DateTime","dbName":"updated_at"},{"name":"skill","kind":"object","type":"Skill","relationName":"SkillToSkillChunk"},{"name":"namespaceRef","kind":"object","type":"Namespace","relationName":"NamespaceToSkillChunk"}],"dbName":"skill_chunks"},"Namespace":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"type","kind":"scalar","type":"String"},{"name":"ownerId","kind":"scalar","type":"String","dbName":"owner_id"},{"name":"createdAt","kind":"scalar","type":"DateTime","dbName":"created_at"},{"name":"owner","kind":"object","type":"User","relationName":"ownedNamespaces"},{"name":"members","kind":"object","type":"NamespaceAccess","relationName":"NamespaceToNamespaceAccess"},{"name":"chunks","kind":"object","type":"SkillChunk","relationName":"NamespaceToSkillChunk"}],"dbName":"namespaces"},"NamespaceAccess":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"namespaceId","kind":"scalar","type":"String","dbName":"namespace_id"},{"name":"userId","kind":"scalar","type":"String","dbName":"user_id"},{"name":"role","kind":"scalar","type":"String"},{"name":"grantedAt","kind":"scalar","type":"DateTime","dbName":"granted_at"},{"name":"namespace","kind":"object","type":"Namespace","relationName":"NamespaceToNamespaceAccess"},{"name":"user","kind":"object","type":"User","relationName":"NamespaceAccessToUser"}],"dbName":"namespace_access"}},"enums":{},"types":{}}');
config3.compilerWasm = {
  getRuntime: /* @__PURE__ */ __name(async () => await Promise.resolve().then(() => (init_query_compiler_fast_bg(), query_compiler_fast_bg_exports)), "getRuntime"),
  getQueryCompilerWasmModule: /* @__PURE__ */ __name(async () => {
    const { default: module } = await import("./57e7a36c2a815bccc54346f1aa0e141274363527-query_compiler_fast_bg.wasm?module");
    return module;
  }, "getQueryCompilerWasmModule"),
  importName: "./query_compiler_fast_bg.js"
};
if (typeof globalThis !== "undefined" && globalThis["DEBUG"] || typeof process !== "undefined" && process.env && process.env.DEBUG || void 0) {
  Z.enable(typeof globalThis !== "undefined" && globalThis["DEBUG"] || typeof process !== "undefined" && process.env && process.env.DEBUG || void 0);
}
function getPrismaClientClass() {
  return cd(config3);
}
__name(getPrismaClientClass, "getPrismaClientClass");

// ../../packages/database/src/generated/prisma/internal/prismaNamespace.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var getExtensionContext = Zi.getExtensionContext;
var NullTypes2 = {
  DbNull: NullTypes.DbNull,
  JsonNull: NullTypes.JsonNull,
  AnyNull: NullTypes.AnyNull
};
var TransactionIsolationLevel = dd({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = Zi.defineExtension;

// ../../packages/database/src/generated/prisma/enums.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// ../../packages/database/src/generated/prisma/client.ts
globalThis["__dirname"] = "/";
var PrismaClient = getPrismaClientClass();

// ../../packages/database/src/client.ts
function createDatabaseClient(connectionString) {
  const adapter = new PrismaPgAdapterFactory({ connectionString });
  return new PrismaClient({ adapter });
}
__name(createDatabaseClient, "createDatabaseClient");

// ../../packages/database/src/index.ts
function getDb(env2) {
  return createDatabaseClient(env2.HYPERDRIVE.connectionString);
}
__name(getDb, "getDb");

// src/middleware/auth.ts
var authMiddleware = createMiddleware(async (c2, next) => {
  const authorization = c2.req.header("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return c2.json({ error: "Missing or invalid Authorization header" }, 401);
  }
  const token = authorization.slice("Bearer ".length);
  if (!token) {
    return c2.json({ error: "Empty token" }, 401);
  }
  const db = getDb(c2.env);
  c2.set("db", db);
  const session = await db.session.findFirst({
    where: { token },
    include: { user: true }
  });
  if (!session || session.expiresAt < /* @__PURE__ */ new Date()) {
    return c2.json({ error: "Invalid or expired session" }, 401);
  }
  c2.set("userId", session.userId);
  await next();
});

// src/middleware/rate-limit.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var MAX_SEARCHES_PER_DAY = 30;
var rateLimitMiddleware = createMiddleware(async (c2, next) => {
  const db = c2.var.db;
  const userId = c2.var.userId;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1e3);
  const count = await db.searchUsage.count({
    where: {
      userId,
      searchedAt: { gte: since }
    }
  });
  if (count >= MAX_SEARCHES_PER_DAY) {
    return c2.json(
      {
        error: "Rate limit exceeded",
        message: `You have reached the maximum of ${MAX_SEARCHES_PER_DAY} searches per 24 hours. Please try again later.`
      },
      429
    );
  }
  c2.set("remainingSearches", MAX_SEARCHES_PER_DAY - count - 1);
  await next();
});

// src/lib/search.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// src/lib/embedding.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/index.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/internal/qs/index.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/internal/qs/formats.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var default_format = "RFC3986";
var formatters = {
  RFC1738: /* @__PURE__ */ __name((v3) => String(v3).replace(/%20/g, "+"), "RFC1738"),
  RFC3986: /* @__PURE__ */ __name((v3) => String(v3), "RFC3986")
};
var RFC1738 = "RFC1738";

// node_modules/openai/internal/qs/stringify.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/internal/qs/utils.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var is_array = Array.isArray;
var hex_table = (() => {
  const array = [];
  for (let i = 0; i < 256; ++i) {
    array.push("%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase());
  }
  return array;
})();
var limit = 1024;
var encode = /* @__PURE__ */ __name((str2, _defaultEncoder, charset, _kind, format) => {
  if (str2.length === 0) {
    return str2;
  }
  let string = str2;
  if (typeof str2 === "symbol") {
    string = Symbol.prototype.toString.call(str2);
  } else if (typeof str2 !== "string") {
    string = String(str2);
  }
  if (charset === "iso-8859-1") {
    return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
      return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
    });
  }
  let out = "";
  for (let j = 0; j < string.length; j += limit) {
    const segment = string.length >= limit ? string.slice(j, j + limit) : string;
    const arr = [];
    for (let i = 0; i < segment.length; ++i) {
      let c2 = segment.charCodeAt(i);
      if (c2 === 45 || // -
      c2 === 46 || // .
      c2 === 95 || // _
      c2 === 126 || // ~
      c2 >= 48 && c2 <= 57 || // 0-9
      c2 >= 65 && c2 <= 90 || // a-z
      c2 >= 97 && c2 <= 122 || // A-Z
      format === RFC1738 && (c2 === 40 || c2 === 41)) {
        arr[arr.length] = segment.charAt(i);
        continue;
      }
      if (c2 < 128) {
        arr[arr.length] = hex_table[c2];
        continue;
      }
      if (c2 < 2048) {
        arr[arr.length] = hex_table[192 | c2 >> 6] + hex_table[128 | c2 & 63];
        continue;
      }
      if (c2 < 55296 || c2 >= 57344) {
        arr[arr.length] = hex_table[224 | c2 >> 12] + hex_table[128 | c2 >> 6 & 63] + hex_table[128 | c2 & 63];
        continue;
      }
      i += 1;
      c2 = 65536 + ((c2 & 1023) << 10 | segment.charCodeAt(i) & 1023);
      arr[arr.length] = hex_table[240 | c2 >> 18] + hex_table[128 | c2 >> 12 & 63] + hex_table[128 | c2 >> 6 & 63] + hex_table[128 | c2 & 63];
    }
    out += arr.join("");
  }
  return out;
}, "encode");
function is_buffer(obj) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
}
__name(is_buffer, "is_buffer");
function maybe_map(val, fn2) {
  if (is_array(val)) {
    const mapped = [];
    for (let i = 0; i < val.length; i += 1) {
      mapped.push(fn2(val[i]));
    }
    return mapped;
  }
  return fn2(val);
}
__name(maybe_map, "maybe_map");

// node_modules/openai/internal/qs/stringify.mjs
var has = Object.prototype.hasOwnProperty;
var array_prefix_generators = {
  brackets(prefix) {
    return String(prefix) + "[]";
  },
  comma: "comma",
  indices(prefix, key) {
    return String(prefix) + "[" + key + "]";
  },
  repeat(prefix) {
    return String(prefix);
  }
};
var is_array2 = Array.isArray;
var push = Array.prototype.push;
var push_to_array = /* @__PURE__ */ __name(function(arr, value_or_array) {
  push.apply(arr, is_array2(value_or_array) ? value_or_array : [value_or_array]);
}, "push_to_array");
var to_ISO = Date.prototype.toISOString;
var defaults2 = {
  addQueryPrefix: false,
  allowDots: false,
  allowEmptyArrays: false,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: false,
  delimiter: "&",
  encode: true,
  encodeDotInKeys: false,
  encoder: encode,
  encodeValuesOnly: false,
  format: default_format,
  formatter: formatters[default_format],
  /** @deprecated */
  indices: false,
  serializeDate(date) {
    return to_ISO.call(date);
  },
  skipNulls: false,
  strictNullHandling: false
};
function is_non_nullish_primitive(v3) {
  return typeof v3 === "string" || typeof v3 === "number" || typeof v3 === "boolean" || typeof v3 === "symbol" || typeof v3 === "bigint";
}
__name(is_non_nullish_primitive, "is_non_nullish_primitive");
var sentinel = {};
function inner_stringify(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
  let obj = object;
  let tmp_sc = sideChannel;
  let step = 0;
  let find_flag = false;
  while ((tmp_sc = tmp_sc.get(sentinel)) !== void 0 && !find_flag) {
    const pos = tmp_sc.get(object);
    step += 1;
    if (typeof pos !== "undefined") {
      if (pos === step) {
        throw new RangeError("Cyclic object value");
      } else {
        find_flag = true;
      }
    }
    if (typeof tmp_sc.get(sentinel) === "undefined") {
      step = 0;
    }
  }
  if (typeof filter === "function") {
    obj = filter(prefix, obj);
  } else if (obj instanceof Date) {
    obj = serializeDate?.(obj);
  } else if (generateArrayPrefix === "comma" && is_array2(obj)) {
    obj = maybe_map(obj, function(value) {
      if (value instanceof Date) {
        return serializeDate?.(value);
      }
      return value;
    });
  }
  if (obj === null) {
    if (strictNullHandling) {
      return encoder && !encodeValuesOnly ? (
        // @ts-expect-error
        encoder(prefix, defaults2.encoder, charset, "key", format)
      ) : prefix;
    }
    obj = "";
  }
  if (is_non_nullish_primitive(obj) || is_buffer(obj)) {
    if (encoder) {
      const key_value = encodeValuesOnly ? prefix : encoder(prefix, defaults2.encoder, charset, "key", format);
      return [
        formatter?.(key_value) + "=" + // @ts-expect-error
        formatter?.(encoder(obj, defaults2.encoder, charset, "value", format))
      ];
    }
    return [formatter?.(prefix) + "=" + formatter?.(String(obj))];
  }
  const values = [];
  if (typeof obj === "undefined") {
    return values;
  }
  let obj_keys;
  if (generateArrayPrefix === "comma" && is_array2(obj)) {
    if (encodeValuesOnly && encoder) {
      obj = maybe_map(obj, encoder);
    }
    obj_keys = [{ value: obj.length > 0 ? obj.join(",") || null : void 0 }];
  } else if (is_array2(filter)) {
    obj_keys = filter;
  } else {
    const keys = Object.keys(obj);
    obj_keys = sort ? keys.sort(sort) : keys;
  }
  const encoded_prefix = encodeDotInKeys ? String(prefix).replace(/\./g, "%2E") : String(prefix);
  const adjusted_prefix = commaRoundTrip && is_array2(obj) && obj.length === 1 ? encoded_prefix + "[]" : encoded_prefix;
  if (allowEmptyArrays && is_array2(obj) && obj.length === 0) {
    return adjusted_prefix + "[]";
  }
  for (let j = 0; j < obj_keys.length; ++j) {
    const key = obj_keys[j];
    const value = (
      // @ts-ignore
      typeof key === "object" && typeof key.value !== "undefined" ? key.value : obj[key]
    );
    if (skipNulls && value === null) {
      continue;
    }
    const encoded_key = allowDots && encodeDotInKeys ? key.replace(/\./g, "%2E") : key;
    const key_prefix = is_array2(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjusted_prefix, encoded_key) : adjusted_prefix : adjusted_prefix + (allowDots ? "." + encoded_key : "[" + encoded_key + "]");
    sideChannel.set(object, step);
    const valueSideChannel = /* @__PURE__ */ new WeakMap();
    valueSideChannel.set(sentinel, sideChannel);
    push_to_array(values, inner_stringify(
      value,
      key_prefix,
      generateArrayPrefix,
      commaRoundTrip,
      allowEmptyArrays,
      strictNullHandling,
      skipNulls,
      encodeDotInKeys,
      // @ts-ignore
      generateArrayPrefix === "comma" && encodeValuesOnly && is_array2(obj) ? null : encoder,
      filter,
      sort,
      allowDots,
      serializeDate,
      format,
      formatter,
      encodeValuesOnly,
      charset,
      valueSideChannel
    ));
  }
  return values;
}
__name(inner_stringify, "inner_stringify");
function normalize_stringify_options(opts = defaults2) {
  if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
    throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  }
  if (typeof opts.encodeDotInKeys !== "undefined" && typeof opts.encodeDotInKeys !== "boolean") {
    throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  }
  if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") {
    throw new TypeError("Encoder has to be a function.");
  }
  const charset = opts.charset || defaults2.charset;
  if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  }
  let format = default_format;
  if (typeof opts.format !== "undefined") {
    if (!has.call(formatters, opts.format)) {
      throw new TypeError("Unknown format option provided.");
    }
    format = opts.format;
  }
  const formatter = formatters[format];
  let filter = defaults2.filter;
  if (typeof opts.filter === "function" || is_array2(opts.filter)) {
    filter = opts.filter;
  }
  let arrayFormat;
  if (opts.arrayFormat && opts.arrayFormat in array_prefix_generators) {
    arrayFormat = opts.arrayFormat;
  } else if ("indices" in opts) {
    arrayFormat = opts.indices ? "indices" : "repeat";
  } else {
    arrayFormat = defaults2.arrayFormat;
  }
  if ("commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") {
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  }
  const allowDots = typeof opts.allowDots === "undefined" ? !!opts.encodeDotInKeys === true ? true : defaults2.allowDots : !!opts.allowDots;
  return {
    addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults2.addQueryPrefix,
    // @ts-ignore
    allowDots,
    allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults2.allowEmptyArrays,
    arrayFormat,
    charset,
    charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults2.charsetSentinel,
    commaRoundTrip: !!opts.commaRoundTrip,
    delimiter: typeof opts.delimiter === "undefined" ? defaults2.delimiter : opts.delimiter,
    encode: typeof opts.encode === "boolean" ? opts.encode : defaults2.encode,
    encodeDotInKeys: typeof opts.encodeDotInKeys === "boolean" ? opts.encodeDotInKeys : defaults2.encodeDotInKeys,
    encoder: typeof opts.encoder === "function" ? opts.encoder : defaults2.encoder,
    encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults2.encodeValuesOnly,
    filter,
    format,
    formatter,
    serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults2.serializeDate,
    skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults2.skipNulls,
    // @ts-ignore
    sort: typeof opts.sort === "function" ? opts.sort : null,
    strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults2.strictNullHandling
  };
}
__name(normalize_stringify_options, "normalize_stringify_options");
function stringify(object, opts = {}) {
  let obj = object;
  const options = normalize_stringify_options(opts);
  let obj_keys;
  let filter;
  if (typeof options.filter === "function") {
    filter = options.filter;
    obj = filter("", obj);
  } else if (is_array2(options.filter)) {
    filter = options.filter;
    obj_keys = filter;
  }
  const keys = [];
  if (typeof obj !== "object" || obj === null) {
    return "";
  }
  const generateArrayPrefix = array_prefix_generators[options.arrayFormat];
  const commaRoundTrip = generateArrayPrefix === "comma" && options.commaRoundTrip;
  if (!obj_keys) {
    obj_keys = Object.keys(obj);
  }
  if (options.sort) {
    obj_keys.sort(options.sort);
  }
  const sideChannel = /* @__PURE__ */ new WeakMap();
  for (let i = 0; i < obj_keys.length; ++i) {
    const key = obj_keys[i];
    if (options.skipNulls && obj[key] === null) {
      continue;
    }
    push_to_array(keys, inner_stringify(
      obj[key],
      key,
      // @ts-expect-error
      generateArrayPrefix,
      commaRoundTrip,
      options.allowEmptyArrays,
      options.strictNullHandling,
      options.skipNulls,
      options.encodeDotInKeys,
      options.encode ? options.encoder : null,
      options.filter,
      options.sort,
      options.allowDots,
      options.serializeDate,
      options.format,
      options.formatter,
      options.encodeValuesOnly,
      options.charset,
      sideChannel
    ));
  }
  const joined = keys.join(options.delimiter);
  let prefix = options.addQueryPrefix === true ? "?" : "";
  if (options.charsetSentinel) {
    if (options.charset === "iso-8859-1") {
      prefix += "utf8=%26%2310003%3B&";
    } else {
      prefix += "utf8=%E2%9C%93&";
    }
  }
  return joined.length > 0 ? prefix + joined : "";
}
__name(stringify, "stringify");

// node_modules/openai/core.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/version.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var VERSION = "4.104.0";

// node_modules/openai/streaming.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/_shims/index.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/_shims/registry.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var auto = false;
var kind = void 0;
var fetch2 = void 0;
var Request2 = void 0;
var Response2 = void 0;
var Headers2 = void 0;
var FormData2 = void 0;
var Blob2 = void 0;
var File2 = void 0;
var ReadableStream2 = void 0;
var getMultipartRequestOptions = void 0;
var getDefaultAgent = void 0;
var fileFromPath = void 0;
var isFsReadStream = void 0;
function setShims(shims, options = { auto: false }) {
  if (auto) {
    throw new Error(`you must \`import 'openai/shims/${shims.kind}'\` before importing anything else from openai`);
  }
  if (kind) {
    throw new Error(`can't \`import 'openai/shims/${shims.kind}'\` after \`import 'openai/shims/${kind}'\``);
  }
  auto = options.auto;
  kind = shims.kind;
  fetch2 = shims.fetch;
  Request2 = shims.Request;
  Response2 = shims.Response;
  Headers2 = shims.Headers;
  FormData2 = shims.FormData;
  Blob2 = shims.Blob;
  File2 = shims.File;
  ReadableStream2 = shims.ReadableStream;
  getMultipartRequestOptions = shims.getMultipartRequestOptions;
  getDefaultAgent = shims.getDefaultAgent;
  fileFromPath = shims.fileFromPath;
  isFsReadStream = shims.isFsReadStream;
}
__name(setShims, "setShims");

// node_modules/openai/_shims/web-runtime.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/_shims/MultipartBody.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var MultipartBody = class {
  static {
    __name(this, "MultipartBody");
  }
  constructor(body) {
    this.body = body;
  }
  get [Symbol.toStringTag]() {
    return "MultipartBody";
  }
};

// node_modules/openai/_shims/web-runtime.mjs
function getRuntime({ manuallyImported } = {}) {
  const recommendation = manuallyImported ? `You may need to use polyfills` : `Add one of these imports before your first \`import \u2026 from 'openai'\`:
- \`import 'openai/shims/node'\` (if you're running on Node)
- \`import 'openai/shims/web'\` (otherwise)
`;
  let _fetch, _Request, _Response, _Headers;
  try {
    _fetch = fetch;
    _Request = Request;
    _Response = Response;
    _Headers = Headers;
  } catch (error) {
    throw new Error(`this environment is missing the following Web Fetch API type: ${error.message}. ${recommendation}`);
  }
  return {
    kind: "web",
    fetch: _fetch,
    Request: _Request,
    Response: _Response,
    Headers: _Headers,
    FormData: (
      // @ts-ignore
      typeof FormData !== "undefined" ? FormData : class FormData {
        static {
          __name(this, "FormData");
        }
        // @ts-ignore
        constructor() {
          throw new Error(`file uploads aren't supported in this environment yet as 'FormData' is undefined. ${recommendation}`);
        }
      }
    ),
    Blob: typeof Blob !== "undefined" ? Blob : class Blob {
      static {
        __name(this, "Blob");
      }
      constructor() {
        throw new Error(`file uploads aren't supported in this environment yet as 'Blob' is undefined. ${recommendation}`);
      }
    },
    File: (
      // @ts-ignore
      typeof File !== "undefined" ? File : class File {
        static {
          __name(this, "File");
        }
        // @ts-ignore
        constructor() {
          throw new Error(`file uploads aren't supported in this environment yet as 'File' is undefined. ${recommendation}`);
        }
      }
    ),
    ReadableStream: (
      // @ts-ignore
      typeof ReadableStream !== "undefined" ? ReadableStream : class ReadableStream {
        static {
          __name(this, "ReadableStream");
        }
        // @ts-ignore
        constructor() {
          throw new Error(`streaming isn't supported in this environment yet as 'ReadableStream' is undefined. ${recommendation}`);
        }
      }
    ),
    getMultipartRequestOptions: /* @__PURE__ */ __name(async (form, opts) => ({
      ...opts,
      body: new MultipartBody(form)
    }), "getMultipartRequestOptions"),
    getDefaultAgent: /* @__PURE__ */ __name((url) => void 0, "getDefaultAgent"),
    fileFromPath: /* @__PURE__ */ __name(() => {
      throw new Error("The `fileFromPath` function is only supported in Node. See the README for more details: https://www.github.com/openai/openai-node#file-uploads");
    }, "fileFromPath"),
    isFsReadStream: /* @__PURE__ */ __name((value) => false, "isFsReadStream")
  };
}
__name(getRuntime, "getRuntime");

// node_modules/openai/_shims/index.mjs
var init2 = /* @__PURE__ */ __name(() => {
  if (!kind) setShims(getRuntime(), { auto: true });
}, "init");
init2();

// node_modules/openai/error.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var OpenAIError = class extends Error {
  static {
    __name(this, "OpenAIError");
  }
};
var APIError = class _APIError extends OpenAIError {
  static {
    __name(this, "APIError");
  }
  constructor(status, error, message, headers) {
    super(`${_APIError.makeMessage(status, error, message)}`);
    this.status = status;
    this.headers = headers;
    this.request_id = headers?.["x-request-id"];
    this.error = error;
    const data = error;
    this.code = data?.["code"];
    this.param = data?.["param"];
    this.type = data?.["type"];
  }
  static makeMessage(status, error, message) {
    const msg = error?.message ? typeof error.message === "string" ? error.message : JSON.stringify(error.message) : error ? JSON.stringify(error) : message;
    if (status && msg) {
      return `${status} ${msg}`;
    }
    if (status) {
      return `${status} status code (no body)`;
    }
    if (msg) {
      return msg;
    }
    return "(no status code or body)";
  }
  static generate(status, errorResponse, message, headers) {
    if (!status || !headers) {
      return new APIConnectionError({ message, cause: castToError(errorResponse) });
    }
    const error = errorResponse?.["error"];
    if (status === 400) {
      return new BadRequestError(status, error, message, headers);
    }
    if (status === 401) {
      return new AuthenticationError(status, error, message, headers);
    }
    if (status === 403) {
      return new PermissionDeniedError(status, error, message, headers);
    }
    if (status === 404) {
      return new NotFoundError(status, error, message, headers);
    }
    if (status === 409) {
      return new ConflictError(status, error, message, headers);
    }
    if (status === 422) {
      return new UnprocessableEntityError(status, error, message, headers);
    }
    if (status === 429) {
      return new RateLimitError(status, error, message, headers);
    }
    if (status >= 500) {
      return new InternalServerError(status, error, message, headers);
    }
    return new _APIError(status, error, message, headers);
  }
};
var APIUserAbortError = class extends APIError {
  static {
    __name(this, "APIUserAbortError");
  }
  constructor({ message } = {}) {
    super(void 0, void 0, message || "Request was aborted.", void 0);
  }
};
var APIConnectionError = class extends APIError {
  static {
    __name(this, "APIConnectionError");
  }
  constructor({ message, cause }) {
    super(void 0, void 0, message || "Connection error.", void 0);
    if (cause)
      this.cause = cause;
  }
};
var APIConnectionTimeoutError = class extends APIConnectionError {
  static {
    __name(this, "APIConnectionTimeoutError");
  }
  constructor({ message } = {}) {
    super({ message: message ?? "Request timed out." });
  }
};
var BadRequestError = class extends APIError {
  static {
    __name(this, "BadRequestError");
  }
};
var AuthenticationError = class extends APIError {
  static {
    __name(this, "AuthenticationError");
  }
};
var PermissionDeniedError = class extends APIError {
  static {
    __name(this, "PermissionDeniedError");
  }
};
var NotFoundError = class extends APIError {
  static {
    __name(this, "NotFoundError");
  }
};
var ConflictError = class extends APIError {
  static {
    __name(this, "ConflictError");
  }
};
var UnprocessableEntityError = class extends APIError {
  static {
    __name(this, "UnprocessableEntityError");
  }
};
var RateLimitError = class extends APIError {
  static {
    __name(this, "RateLimitError");
  }
};
var InternalServerError = class extends APIError {
  static {
    __name(this, "InternalServerError");
  }
};
var LengthFinishReasonError = class extends OpenAIError {
  static {
    __name(this, "LengthFinishReasonError");
  }
  constructor() {
    super(`Could not parse response content as the length limit was reached`);
  }
};
var ContentFilterFinishReasonError = class extends OpenAIError {
  static {
    __name(this, "ContentFilterFinishReasonError");
  }
  constructor() {
    super(`Could not parse response content as the request was rejected by the content filter`);
  }
};

// node_modules/openai/internal/decoders/line.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var __classPrivateFieldSet = function(receiver, state, value, kind2, f2) {
  if (kind2 === "m") throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f2) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f2.call(receiver, value) : f2 ? f2.value = value : state.set(receiver, value), value;
};
var __classPrivateFieldGet = function(receiver, state, kind2, f2) {
  if (kind2 === "a" && !f2) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f2 : kind2 === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
};
var _LineDecoder_carriageReturnIndex;
var LineDecoder = class {
  static {
    __name(this, "LineDecoder");
  }
  constructor() {
    _LineDecoder_carriageReturnIndex.set(this, void 0);
    this.buffer = new Uint8Array();
    __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
  }
  decode(chunk) {
    if (chunk == null) {
      return [];
    }
    const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk;
    let newData = new Uint8Array(this.buffer.length + binaryChunk.length);
    newData.set(this.buffer);
    newData.set(binaryChunk, this.buffer.length);
    this.buffer = newData;
    const lines = [];
    let patternIndex;
    while ((patternIndex = findNewlineIndex(this.buffer, __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f"))) != null) {
      if (patternIndex.carriage && __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") == null) {
        __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, patternIndex.index, "f");
        continue;
      }
      if (__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") != null && (patternIndex.index !== __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") + 1 || patternIndex.carriage)) {
        lines.push(this.decodeText(this.buffer.slice(0, __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") - 1)));
        this.buffer = this.buffer.slice(__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f"));
        __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
        continue;
      }
      const endIndex = __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") !== null ? patternIndex.preceding - 1 : patternIndex.preceding;
      const line = this.decodeText(this.buffer.slice(0, endIndex));
      lines.push(line);
      this.buffer = this.buffer.slice(patternIndex.index);
      __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
    }
    return lines;
  }
  decodeText(bytes) {
    if (bytes == null)
      return "";
    if (typeof bytes === "string")
      return bytes;
    if (typeof Buffer !== "undefined") {
      if (bytes instanceof Buffer) {
        return bytes.toString();
      }
      if (bytes instanceof Uint8Array) {
        return Buffer.from(bytes).toString();
      }
      throw new OpenAIError(`Unexpected: received non-Uint8Array (${bytes.constructor.name}) stream chunk in an environment with a global "Buffer" defined, which this library assumes to be Node. Please report this error.`);
    }
    if (typeof TextDecoder !== "undefined") {
      if (bytes instanceof Uint8Array || bytes instanceof ArrayBuffer) {
        this.textDecoder ?? (this.textDecoder = new TextDecoder("utf8"));
        return this.textDecoder.decode(bytes);
      }
      throw new OpenAIError(`Unexpected: received non-Uint8Array/ArrayBuffer (${bytes.constructor.name}) in a web platform. Please report this error.`);
    }
    throw new OpenAIError(`Unexpected: neither Buffer nor TextDecoder are available as globals. Please report this error.`);
  }
  flush() {
    if (!this.buffer.length) {
      return [];
    }
    return this.decode("\n");
  }
};
_LineDecoder_carriageReturnIndex = /* @__PURE__ */ new WeakMap();
LineDecoder.NEWLINE_CHARS = /* @__PURE__ */ new Set(["\n", "\r"]);
LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function findNewlineIndex(buffer, startIndex) {
  const newline = 10;
  const carriage = 13;
  for (let i = startIndex ?? 0; i < buffer.length; i++) {
    if (buffer[i] === newline) {
      return { preceding: i, index: i + 1, carriage: false };
    }
    if (buffer[i] === carriage) {
      return { preceding: i, index: i + 1, carriage: true };
    }
  }
  return null;
}
__name(findNewlineIndex, "findNewlineIndex");
function findDoubleNewlineIndex(buffer) {
  const newline = 10;
  const carriage = 13;
  for (let i = 0; i < buffer.length - 1; i++) {
    if (buffer[i] === newline && buffer[i + 1] === newline) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === carriage) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === newline && i + 3 < buffer.length && buffer[i + 2] === carriage && buffer[i + 3] === newline) {
      return i + 4;
    }
  }
  return -1;
}
__name(findDoubleNewlineIndex, "findDoubleNewlineIndex");

// node_modules/openai/internal/stream-utils.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
function ReadableStreamToAsyncIterable(stream) {
  if (stream[Symbol.asyncIterator])
    return stream;
  const reader = stream.getReader();
  return {
    async next() {
      try {
        const result = await reader.read();
        if (result?.done)
          reader.releaseLock();
        return result;
      } catch (e6) {
        reader.releaseLock();
        throw e6;
      }
    },
    async return() {
      const cancelPromise = reader.cancel();
      reader.releaseLock();
      await cancelPromise;
      return { done: true, value: void 0 };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
__name(ReadableStreamToAsyncIterable, "ReadableStreamToAsyncIterable");

// node_modules/openai/streaming.mjs
var Stream = class _Stream {
  static {
    __name(this, "Stream");
  }
  constructor(iterator, controller) {
    this.iterator = iterator;
    this.controller = controller;
  }
  static fromSSEResponse(response, controller) {
    let consumed = false;
    async function* iterator() {
      if (consumed) {
        throw new Error("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      }
      consumed = true;
      let done = false;
      try {
        for await (const sse of _iterSSEMessages(response, controller)) {
          if (done)
            continue;
          if (sse.data.startsWith("[DONE]")) {
            done = true;
            continue;
          }
          if (sse.event === null || sse.event.startsWith("response.") || sse.event.startsWith("transcript.")) {
            let data;
            try {
              data = JSON.parse(sse.data);
            } catch (e6) {
              console.error(`Could not parse message into JSON:`, sse.data);
              console.error(`From chunk:`, sse.raw);
              throw e6;
            }
            if (data && data.error) {
              throw new APIError(void 0, data.error, void 0, createResponseHeaders(response.headers));
            }
            yield data;
          } else {
            let data;
            try {
              data = JSON.parse(sse.data);
            } catch (e6) {
              console.error(`Could not parse message into JSON:`, sse.data);
              console.error(`From chunk:`, sse.raw);
              throw e6;
            }
            if (sse.event == "error") {
              throw new APIError(void 0, data.error, data.message, void 0);
            }
            yield { event: sse.event, data };
          }
        }
        done = true;
      } catch (e6) {
        if (e6 instanceof Error && e6.name === "AbortError")
          return;
        throw e6;
      } finally {
        if (!done)
          controller.abort();
      }
    }
    __name(iterator, "iterator");
    return new _Stream(iterator, controller);
  }
  /**
   * Generates a Stream from a newline-separated ReadableStream
   * where each item is a JSON value.
   */
  static fromReadableStream(readableStream, controller) {
    let consumed = false;
    async function* iterLines() {
      const lineDecoder = new LineDecoder();
      const iter = ReadableStreamToAsyncIterable(readableStream);
      for await (const chunk of iter) {
        for (const line of lineDecoder.decode(chunk)) {
          yield line;
        }
      }
      for (const line of lineDecoder.flush()) {
        yield line;
      }
    }
    __name(iterLines, "iterLines");
    async function* iterator() {
      if (consumed) {
        throw new Error("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      }
      consumed = true;
      let done = false;
      try {
        for await (const line of iterLines()) {
          if (done)
            continue;
          if (line)
            yield JSON.parse(line);
        }
        done = true;
      } catch (e6) {
        if (e6 instanceof Error && e6.name === "AbortError")
          return;
        throw e6;
      } finally {
        if (!done)
          controller.abort();
      }
    }
    __name(iterator, "iterator");
    return new _Stream(iterator, controller);
  }
  [Symbol.asyncIterator]() {
    return this.iterator();
  }
  /**
   * Splits the stream into two streams which can be
   * independently read from at different speeds.
   */
  tee() {
    const left = [];
    const right = [];
    const iterator = this.iterator();
    const teeIterator = /* @__PURE__ */ __name((queue) => {
      return {
        next: /* @__PURE__ */ __name(() => {
          if (queue.length === 0) {
            const result = iterator.next();
            left.push(result);
            right.push(result);
          }
          return queue.shift();
        }, "next")
      };
    }, "teeIterator");
    return [
      new _Stream(() => teeIterator(left), this.controller),
      new _Stream(() => teeIterator(right), this.controller)
    ];
  }
  /**
   * Converts this stream to a newline-separated ReadableStream of
   * JSON stringified values in the stream
   * which can be turned back into a Stream with `Stream.fromReadableStream()`.
   */
  toReadableStream() {
    const self2 = this;
    let iter;
    const encoder = new TextEncoder();
    return new ReadableStream2({
      async start() {
        iter = self2[Symbol.asyncIterator]();
      },
      async pull(ctrl) {
        try {
          const { value, done } = await iter.next();
          if (done)
            return ctrl.close();
          const bytes = encoder.encode(JSON.stringify(value) + "\n");
          ctrl.enqueue(bytes);
        } catch (err) {
          ctrl.error(err);
        }
      },
      async cancel() {
        await iter.return?.();
      }
    });
  }
};
async function* _iterSSEMessages(response, controller) {
  if (!response.body) {
    controller.abort();
    throw new OpenAIError(`Attempted to iterate over a response with no body`);
  }
  const sseDecoder = new SSEDecoder();
  const lineDecoder = new LineDecoder();
  const iter = ReadableStreamToAsyncIterable(response.body);
  for await (const sseChunk of iterSSEChunks(iter)) {
    for (const line of lineDecoder.decode(sseChunk)) {
      const sse = sseDecoder.decode(line);
      if (sse)
        yield sse;
    }
  }
  for (const line of lineDecoder.flush()) {
    const sse = sseDecoder.decode(line);
    if (sse)
      yield sse;
  }
}
__name(_iterSSEMessages, "_iterSSEMessages");
async function* iterSSEChunks(iterator) {
  let data = new Uint8Array();
  for await (const chunk of iterator) {
    if (chunk == null) {
      continue;
    }
    const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk;
    let newData = new Uint8Array(data.length + binaryChunk.length);
    newData.set(data);
    newData.set(binaryChunk, data.length);
    data = newData;
    let patternIndex;
    while ((patternIndex = findDoubleNewlineIndex(data)) !== -1) {
      yield data.slice(0, patternIndex);
      data = data.slice(patternIndex);
    }
  }
  if (data.length > 0) {
    yield data;
  }
}
__name(iterSSEChunks, "iterSSEChunks");
var SSEDecoder = class {
  static {
    __name(this, "SSEDecoder");
  }
  constructor() {
    this.event = null;
    this.data = [];
    this.chunks = [];
  }
  decode(line) {
    if (line.endsWith("\r")) {
      line = line.substring(0, line.length - 1);
    }
    if (!line) {
      if (!this.event && !this.data.length)
        return null;
      const sse = {
        event: this.event,
        data: this.data.join("\n"),
        raw: this.chunks
      };
      this.event = null;
      this.data = [];
      this.chunks = [];
      return sse;
    }
    this.chunks.push(line);
    if (line.startsWith(":")) {
      return null;
    }
    let [fieldname, _, value] = partition(line, ":");
    if (value.startsWith(" ")) {
      value = value.substring(1);
    }
    if (fieldname === "event") {
      this.event = value;
    } else if (fieldname === "data") {
      this.data.push(value);
    }
    return null;
  }
};
function partition(str2, delimiter) {
  const index = str2.indexOf(delimiter);
  if (index !== -1) {
    return [str2.substring(0, index), delimiter, str2.substring(index + delimiter.length)];
  }
  return [str2, "", ""];
}
__name(partition, "partition");

// node_modules/openai/uploads.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var isResponseLike = /* @__PURE__ */ __name((value) => value != null && typeof value === "object" && typeof value.url === "string" && typeof value.blob === "function", "isResponseLike");
var isFileLike = /* @__PURE__ */ __name((value) => value != null && typeof value === "object" && typeof value.name === "string" && typeof value.lastModified === "number" && isBlobLike(value), "isFileLike");
var isBlobLike = /* @__PURE__ */ __name((value) => value != null && typeof value === "object" && typeof value.size === "number" && typeof value.type === "string" && typeof value.text === "function" && typeof value.slice === "function" && typeof value.arrayBuffer === "function", "isBlobLike");
var isUploadable = /* @__PURE__ */ __name((value) => {
  return isFileLike(value) || isResponseLike(value) || isFsReadStream(value);
}, "isUploadable");
async function toFile(value, name2, options) {
  value = await value;
  if (isFileLike(value)) {
    return value;
  }
  if (isResponseLike(value)) {
    const blob = await value.blob();
    name2 || (name2 = new URL(value.url).pathname.split(/[\\/]/).pop() ?? "unknown_file");
    const data = isBlobLike(blob) ? [await blob.arrayBuffer()] : [blob];
    return new File2(data, name2, options);
  }
  const bits = await getBytes(value);
  name2 || (name2 = getName(value) ?? "unknown_file");
  if (!options?.type) {
    const type = bits[0]?.type;
    if (typeof type === "string") {
      options = { ...options, type };
    }
  }
  return new File2(bits, name2, options);
}
__name(toFile, "toFile");
async function getBytes(value) {
  let parts = [];
  if (typeof value === "string" || ArrayBuffer.isView(value) || // includes Uint8Array, Buffer, etc.
  value instanceof ArrayBuffer) {
    parts.push(value);
  } else if (isBlobLike(value)) {
    parts.push(await value.arrayBuffer());
  } else if (isAsyncIterableIterator(value)) {
    for await (const chunk of value) {
      parts.push(chunk);
    }
  } else {
    throw new Error(`Unexpected data type: ${typeof value}; constructor: ${value?.constructor?.name}; props: ${propsForError(value)}`);
  }
  return parts;
}
__name(getBytes, "getBytes");
function propsForError(value) {
  const props = Object.getOwnPropertyNames(value);
  return `[${props.map((p3) => `"${p3}"`).join(", ")}]`;
}
__name(propsForError, "propsForError");
function getName(value) {
  return getStringFromMaybeBuffer(value.name) || getStringFromMaybeBuffer(value.filename) || // For fs.ReadStream
  getStringFromMaybeBuffer(value.path)?.split(/[\\/]/).pop();
}
__name(getName, "getName");
var getStringFromMaybeBuffer = /* @__PURE__ */ __name((x3) => {
  if (typeof x3 === "string")
    return x3;
  if (typeof Buffer !== "undefined" && x3 instanceof Buffer)
    return String(x3);
  return void 0;
}, "getStringFromMaybeBuffer");
var isAsyncIterableIterator = /* @__PURE__ */ __name((value) => value != null && typeof value === "object" && typeof value[Symbol.asyncIterator] === "function", "isAsyncIterableIterator");
var isMultipartBody = /* @__PURE__ */ __name((body) => body && typeof body === "object" && body.body && body[Symbol.toStringTag] === "MultipartBody", "isMultipartBody");
var multipartFormRequestOptions = /* @__PURE__ */ __name(async (opts) => {
  const form = await createForm(opts.body);
  return getMultipartRequestOptions(form, opts);
}, "multipartFormRequestOptions");
var createForm = /* @__PURE__ */ __name(async (body) => {
  const form = new FormData2();
  await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value)));
  return form;
}, "createForm");
var addFormValue = /* @__PURE__ */ __name(async (form, key, value) => {
  if (value === void 0)
    return;
  if (value == null) {
    throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    form.append(key, String(value));
  } else if (isUploadable(value)) {
    const file = await toFile(value);
    form.append(key, file);
  } else if (Array.isArray(value)) {
    await Promise.all(value.map((entry) => addFormValue(form, key + "[]", entry)));
  } else if (typeof value === "object") {
    await Promise.all(Object.entries(value).map(([name2, prop]) => addFormValue(form, `${key}[${name2}]`, prop)));
  } else {
    throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`);
  }
}, "addFormValue");

// node_modules/openai/core.mjs
var __classPrivateFieldSet2 = function(receiver, state, value, kind2, f2) {
  if (kind2 === "m") throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f2) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f2.call(receiver, value) : f2 ? f2.value = value : state.set(receiver, value), value;
};
var __classPrivateFieldGet2 = function(receiver, state, kind2, f2) {
  if (kind2 === "a" && !f2) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f2 : kind2 === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
};
var _AbstractPage_client;
init2();
async function defaultParseResponse(props) {
  const { response } = props;
  if (props.options.stream) {
    debug3("response", response.status, response.url, response.headers, response.body);
    if (props.options.__streamClass) {
      return props.options.__streamClass.fromSSEResponse(response, props.controller);
    }
    return Stream.fromSSEResponse(response, props.controller);
  }
  if (response.status === 204) {
    return null;
  }
  if (props.options.__binaryResponse) {
    return response;
  }
  const contentType = response.headers.get("content-type");
  const mediaType = contentType?.split(";")[0]?.trim();
  const isJSON = mediaType?.includes("application/json") || mediaType?.endsWith("+json");
  if (isJSON) {
    const json = await response.json();
    debug3("response", response.status, response.url, response.headers, json);
    return _addRequestID(json, response);
  }
  const text = await response.text();
  debug3("response", response.status, response.url, response.headers, text);
  return text;
}
__name(defaultParseResponse, "defaultParseResponse");
function _addRequestID(value, response) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  return Object.defineProperty(value, "_request_id", {
    value: response.headers.get("x-request-id"),
    enumerable: false
  });
}
__name(_addRequestID, "_addRequestID");
var APIPromise = class _APIPromise extends Promise {
  static {
    __name(this, "APIPromise");
  }
  constructor(responsePromise, parseResponse2 = defaultParseResponse) {
    super((resolve) => {
      resolve(null);
    });
    this.responsePromise = responsePromise;
    this.parseResponse = parseResponse2;
  }
  _thenUnwrap(transform) {
    return new _APIPromise(this.responsePromise, async (props) => _addRequestID(transform(await this.parseResponse(props), props), props.response));
  }
  /**
   * Gets the raw `Response` instance instead of parsing the response
   * data.
   *
   * If you want to parse the response body but still get the `Response`
   * instance, you can use {@link withResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` if you can,
   * or add one of these imports before your first `import … from 'openai'`:
   * - `import 'openai/shims/node'` (if you're running on Node)
   * - `import 'openai/shims/web'` (otherwise)
   */
  asResponse() {
    return this.responsePromise.then((p3) => p3.response);
  }
  /**
   * Gets the parsed response data, the raw `Response` instance and the ID of the request,
   * returned via the X-Request-ID header which is useful for debugging requests and reporting
   * issues to OpenAI.
   *
   * If you just want to get the raw `Response` instance without parsing it,
   * you can use {@link asResponse()}.
   *
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` if you can,
   * or add one of these imports before your first `import … from 'openai'`:
   * - `import 'openai/shims/node'` (if you're running on Node)
   * - `import 'openai/shims/web'` (otherwise)
   */
  async withResponse() {
    const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
    return { data, response, request_id: response.headers.get("x-request-id") };
  }
  parse() {
    if (!this.parsedPromise) {
      this.parsedPromise = this.responsePromise.then(this.parseResponse);
    }
    return this.parsedPromise;
  }
  then(onfulfilled, onrejected) {
    return this.parse().then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    return this.parse().catch(onrejected);
  }
  finally(onfinally) {
    return this.parse().finally(onfinally);
  }
};
var APIClient = class {
  static {
    __name(this, "APIClient");
  }
  constructor({
    baseURL,
    maxRetries = 2,
    timeout = 6e5,
    // 10 minutes
    httpAgent,
    fetch: overriddenFetch
  }) {
    this.baseURL = baseURL;
    this.maxRetries = validatePositiveInteger("maxRetries", maxRetries);
    this.timeout = validatePositiveInteger("timeout", timeout);
    this.httpAgent = httpAgent;
    this.fetch = overriddenFetch ?? fetch2;
  }
  authHeaders(opts) {
    return {};
  }
  /**
   * Override this to add your own default headers, for example:
   *
   *  {
   *    ...super.defaultHeaders(),
   *    Authorization: 'Bearer 123',
   *  }
   */
  defaultHeaders(opts) {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": this.getUserAgent(),
      ...getPlatformHeaders(),
      ...this.authHeaders(opts)
    };
  }
  /**
   * Override this to add your own headers validation:
   */
  validateHeaders(headers, customHeaders) {
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${uuid4()}`;
  }
  get(path, opts) {
    return this.methodRequest("get", path, opts);
  }
  post(path, opts) {
    return this.methodRequest("post", path, opts);
  }
  patch(path, opts) {
    return this.methodRequest("patch", path, opts);
  }
  put(path, opts) {
    return this.methodRequest("put", path, opts);
  }
  delete(path, opts) {
    return this.methodRequest("delete", path, opts);
  }
  methodRequest(method, path, opts) {
    return this.request(Promise.resolve(opts).then(async (opts2) => {
      const body = opts2 && isBlobLike(opts2?.body) ? new DataView(await opts2.body.arrayBuffer()) : opts2?.body instanceof DataView ? opts2.body : opts2?.body instanceof ArrayBuffer ? new DataView(opts2.body) : opts2 && ArrayBuffer.isView(opts2?.body) ? new DataView(opts2.body.buffer) : opts2?.body;
      return { method, path, ...opts2, body };
    }));
  }
  getAPIList(path, Page2, opts) {
    return this.requestAPIList(Page2, { method: "get", path, ...opts });
  }
  calculateContentLength(body) {
    if (typeof body === "string") {
      if (typeof Buffer !== "undefined") {
        return Buffer.byteLength(body, "utf8").toString();
      }
      if (typeof TextEncoder !== "undefined") {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(body);
        return encoded.length.toString();
      }
    } else if (ArrayBuffer.isView(body)) {
      return body.byteLength.toString();
    }
    return null;
  }
  buildRequest(inputOptions, { retryCount = 0 } = {}) {
    const options = { ...inputOptions };
    const { method, path, query, headers = {} } = options;
    const body = ArrayBuffer.isView(options.body) || options.__binaryRequest && typeof options.body === "string" ? options.body : isMultipartBody(options.body) ? options.body.body : options.body ? JSON.stringify(options.body, null, 2) : null;
    const contentLength = this.calculateContentLength(body);
    const url = this.buildURL(path, query);
    if ("timeout" in options)
      validatePositiveInteger("timeout", options.timeout);
    options.timeout = options.timeout ?? this.timeout;
    const httpAgent = options.httpAgent ?? this.httpAgent ?? getDefaultAgent(url);
    const minAgentTimeout = options.timeout + 1e3;
    if (typeof httpAgent?.options?.timeout === "number" && minAgentTimeout > (httpAgent.options.timeout ?? 0)) {
      httpAgent.options.timeout = minAgentTimeout;
    }
    if (this.idempotencyHeader && method !== "get") {
      if (!inputOptions.idempotencyKey)
        inputOptions.idempotencyKey = this.defaultIdempotencyKey();
      headers[this.idempotencyHeader] = inputOptions.idempotencyKey;
    }
    const reqHeaders = this.buildHeaders({ options, headers, contentLength, retryCount });
    const req = {
      method,
      ...body && { body },
      headers: reqHeaders,
      ...httpAgent && { agent: httpAgent },
      // @ts-ignore node-fetch uses a custom AbortSignal type that is
      // not compatible with standard web types
      signal: options.signal ?? null
    };
    return { req, url, timeout: options.timeout };
  }
  buildHeaders({ options, headers, contentLength, retryCount }) {
    const reqHeaders = {};
    if (contentLength) {
      reqHeaders["content-length"] = contentLength;
    }
    const defaultHeaders = this.defaultHeaders(options);
    applyHeadersMut(reqHeaders, defaultHeaders);
    applyHeadersMut(reqHeaders, headers);
    if (isMultipartBody(options.body) && kind !== "node") {
      delete reqHeaders["content-type"];
    }
    if (getHeader(defaultHeaders, "x-stainless-retry-count") === void 0 && getHeader(headers, "x-stainless-retry-count") === void 0) {
      reqHeaders["x-stainless-retry-count"] = String(retryCount);
    }
    if (getHeader(defaultHeaders, "x-stainless-timeout") === void 0 && getHeader(headers, "x-stainless-timeout") === void 0 && options.timeout) {
      reqHeaders["x-stainless-timeout"] = String(Math.trunc(options.timeout / 1e3));
    }
    this.validateHeaders(reqHeaders, headers);
    return reqHeaders;
  }
  /**
   * Used as a callback for mutating the given `FinalRequestOptions` object.
   */
  async prepareOptions(options) {
  }
  /**
   * Used as a callback for mutating the given `RequestInit` object.
   *
   * This is useful for cases where you want to add certain headers based off of
   * the request properties, e.g. `method` or `url`.
   */
  async prepareRequest(request, { url, options }) {
  }
  parseHeaders(headers) {
    return !headers ? {} : Symbol.iterator in headers ? Object.fromEntries(Array.from(headers).map((header) => [...header])) : { ...headers };
  }
  makeStatusError(status, error, message, headers) {
    return APIError.generate(status, error, message, headers);
  }
  request(options, remainingRetries = null) {
    return new APIPromise(this.makeRequest(options, remainingRetries));
  }
  async makeRequest(optionsInput, retriesRemaining) {
    const options = await optionsInput;
    const maxRetries = options.maxRetries ?? this.maxRetries;
    if (retriesRemaining == null) {
      retriesRemaining = maxRetries;
    }
    await this.prepareOptions(options);
    const { req, url, timeout } = this.buildRequest(options, { retryCount: maxRetries - retriesRemaining });
    await this.prepareRequest(req, { url, options });
    debug3("request", url, options, req.headers);
    if (options.signal?.aborted) {
      throw new APIUserAbortError();
    }
    const controller = new AbortController();
    const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
    if (response instanceof Error) {
      if (options.signal?.aborted) {
        throw new APIUserAbortError();
      }
      if (retriesRemaining) {
        return this.retryRequest(options, retriesRemaining);
      }
      if (response.name === "AbortError") {
        throw new APIConnectionTimeoutError();
      }
      throw new APIConnectionError({ cause: response });
    }
    const responseHeaders = createResponseHeaders(response.headers);
    if (!response.ok) {
      if (retriesRemaining && this.shouldRetry(response)) {
        const retryMessage2 = `retrying, ${retriesRemaining} attempts remaining`;
        debug3(`response (error; ${retryMessage2})`, response.status, url, responseHeaders);
        return this.retryRequest(options, retriesRemaining, responseHeaders);
      }
      const errText = await response.text().catch((e6) => castToError(e6).message);
      const errJSON = safeJSON(errText);
      const errMessage = errJSON ? void 0 : errText;
      const retryMessage = retriesRemaining ? `(error; no more retries left)` : `(error; not retryable)`;
      debug3(`response (error; ${retryMessage})`, response.status, url, responseHeaders, errMessage);
      const err = this.makeStatusError(response.status, errJSON, errMessage, responseHeaders);
      throw err;
    }
    return { response, options, controller };
  }
  requestAPIList(Page2, options) {
    const request = this.makeRequest(options, null);
    return new PagePromise(this, request, Page2);
  }
  buildURL(path, query) {
    const url = isAbsoluteURL(path) ? new URL(path) : new URL(this.baseURL + (this.baseURL.endsWith("/") && path.startsWith("/") ? path.slice(1) : path));
    const defaultQuery = this.defaultQuery();
    if (!isEmptyObj(defaultQuery)) {
      query = { ...defaultQuery, ...query };
    }
    if (typeof query === "object" && query && !Array.isArray(query)) {
      url.search = this.stringifyQuery(query);
    }
    return url.toString();
  }
  stringifyQuery(query) {
    return Object.entries(query).filter(([_, value]) => typeof value !== "undefined").map(([key, value]) => {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }
      if (value === null) {
        return `${encodeURIComponent(key)}=`;
      }
      throw new OpenAIError(`Cannot stringify type ${typeof value}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
    }).join("&");
  }
  async fetchWithTimeout(url, init3, ms2, controller) {
    const { signal, ...options } = init3 || {};
    if (signal)
      signal.addEventListener("abort", () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms2);
    const fetchOptions = {
      signal: controller.signal,
      ...options
    };
    if (fetchOptions.method) {
      fetchOptions.method = fetchOptions.method.toUpperCase();
    }
    return (
      // use undefined this binding; fetch errors if bound to something else in browser/cloudflare
      this.fetch.call(void 0, url, fetchOptions).finally(() => {
        clearTimeout(timeout);
      })
    );
  }
  shouldRetry(response) {
    const shouldRetryHeader = response.headers.get("x-should-retry");
    if (shouldRetryHeader === "true")
      return true;
    if (shouldRetryHeader === "false")
      return false;
    if (response.status === 408)
      return true;
    if (response.status === 409)
      return true;
    if (response.status === 429)
      return true;
    if (response.status >= 500)
      return true;
    return false;
  }
  async retryRequest(options, retriesRemaining, responseHeaders) {
    let timeoutMillis;
    const retryAfterMillisHeader = responseHeaders?.["retry-after-ms"];
    if (retryAfterMillisHeader) {
      const timeoutMs = parseFloat(retryAfterMillisHeader);
      if (!Number.isNaN(timeoutMs)) {
        timeoutMillis = timeoutMs;
      }
    }
    const retryAfterHeader = responseHeaders?.["retry-after"];
    if (retryAfterHeader && !timeoutMillis) {
      const timeoutSeconds = parseFloat(retryAfterHeader);
      if (!Number.isNaN(timeoutSeconds)) {
        timeoutMillis = timeoutSeconds * 1e3;
      } else {
        timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
      }
    }
    if (!(timeoutMillis && 0 <= timeoutMillis && timeoutMillis < 60 * 1e3)) {
      const maxRetries = options.maxRetries ?? this.maxRetries;
      timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
    }
    await sleep(timeoutMillis);
    return this.makeRequest(options, retriesRemaining - 1);
  }
  calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
    const initialRetryDelay = 0.5;
    const maxRetryDelay = 8;
    const numRetries = maxRetries - retriesRemaining;
    const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
    const jitter = 1 - Math.random() * 0.25;
    return sleepSeconds * jitter * 1e3;
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${VERSION}`;
  }
};
var AbstractPage = class {
  static {
    __name(this, "AbstractPage");
  }
  constructor(client, response, body, options) {
    _AbstractPage_client.set(this, void 0);
    __classPrivateFieldSet2(this, _AbstractPage_client, client, "f");
    this.options = options;
    this.response = response;
    this.body = body;
  }
  hasNextPage() {
    const items = this.getPaginatedItems();
    if (!items.length)
      return false;
    return this.nextPageInfo() != null;
  }
  async getNextPage() {
    const nextInfo = this.nextPageInfo();
    if (!nextInfo) {
      throw new OpenAIError("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    }
    const nextOptions = { ...this.options };
    if ("params" in nextInfo && typeof nextOptions.query === "object") {
      nextOptions.query = { ...nextOptions.query, ...nextInfo.params };
    } else if ("url" in nextInfo) {
      const params = [...Object.entries(nextOptions.query || {}), ...nextInfo.url.searchParams.entries()];
      for (const [key, value] of params) {
        nextInfo.url.searchParams.set(key, value);
      }
      nextOptions.query = void 0;
      nextOptions.path = nextInfo.url.toString();
    }
    return await __classPrivateFieldGet2(this, _AbstractPage_client, "f").requestAPIList(this.constructor, nextOptions);
  }
  async *iterPages() {
    let page = this;
    yield page;
    while (page.hasNextPage()) {
      page = await page.getNextPage();
      yield page;
    }
  }
  async *[(_AbstractPage_client = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const page of this.iterPages()) {
      for (const item of page.getPaginatedItems()) {
        yield item;
      }
    }
  }
};
var PagePromise = class extends APIPromise {
  static {
    __name(this, "PagePromise");
  }
  constructor(client, request, Page2) {
    super(request, async (props) => new Page2(client, props.response, await defaultParseResponse(props), props.options));
  }
  /**
   * Allow auto-paginating iteration on an unawaited list call, eg:
   *
   *    for await (const item of client.items.list()) {
   *      console.log(item)
   *    }
   */
  async *[Symbol.asyncIterator]() {
    const page = await this;
    for await (const item of page) {
      yield item;
    }
  }
};
var createResponseHeaders = /* @__PURE__ */ __name((headers) => {
  return new Proxy(Object.fromEntries(
    // @ts-ignore
    headers.entries()
  ), {
    get(target, name2) {
      const key = name2.toString();
      return target[key.toLowerCase()] || target[key];
    }
  });
}, "createResponseHeaders");
var requestOptionsKeys = {
  method: true,
  path: true,
  query: true,
  body: true,
  headers: true,
  maxRetries: true,
  stream: true,
  timeout: true,
  httpAgent: true,
  signal: true,
  idempotencyKey: true,
  __metadata: true,
  __binaryRequest: true,
  __binaryResponse: true,
  __streamClass: true
};
var isRequestOptions = /* @__PURE__ */ __name((obj) => {
  return typeof obj === "object" && obj !== null && !isEmptyObj(obj) && Object.keys(obj).every((k2) => hasOwn(requestOptionsKeys, k2));
}, "isRequestOptions");
var getPlatformProperties = /* @__PURE__ */ __name(() => {
  if (typeof Deno !== "undefined" && Deno.build != null) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(Deno.build.os),
      "X-Stainless-Arch": normalizeArch(Deno.build.arch),
      "X-Stainless-Runtime": "deno",
      "X-Stainless-Runtime-Version": typeof Deno.version === "string" ? Deno.version : Deno.version?.deno ?? "unknown"
    };
  }
  if (typeof EdgeRuntime !== "undefined") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": `other:${EdgeRuntime}`,
      "X-Stainless-Runtime": "edge",
      "X-Stainless-Runtime-Version": process.version
    };
  }
  if (Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(process.platform),
      "X-Stainless-Arch": normalizeArch(process.arch),
      "X-Stainless-Runtime": "node",
      "X-Stainless-Runtime-Version": process.version
    };
  }
  const browserInfo = getBrowserInfo();
  if (browserInfo) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": "unknown",
      "X-Stainless-Runtime": `browser:${browserInfo.browser}`,
      "X-Stainless-Runtime-Version": browserInfo.version
    };
  }
  return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": VERSION,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
}, "getPlatformProperties");
function getBrowserInfo() {
  if (typeof navigator === "undefined" || !navigator) {
    return null;
  }
  const browserPatterns = [
    { key: "edge", pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
  ];
  for (const { key, pattern } of browserPatterns) {
    const match2 = pattern.exec("Cloudflare-Workers");
    if (match2) {
      const major = match2[1] || 0;
      const minor = match2[2] || 0;
      const patch = match2[3] || 0;
      return { browser: key, version: `${major}.${minor}.${patch}` };
    }
  }
  return null;
}
__name(getBrowserInfo, "getBrowserInfo");
var normalizeArch = /* @__PURE__ */ __name((arch2) => {
  if (arch2 === "x32")
    return "x32";
  if (arch2 === "x86_64" || arch2 === "x64")
    return "x64";
  if (arch2 === "arm")
    return "arm";
  if (arch2 === "aarch64" || arch2 === "arm64")
    return "arm64";
  if (arch2)
    return `other:${arch2}`;
  return "unknown";
}, "normalizeArch");
var normalizePlatform = /* @__PURE__ */ __name((platform2) => {
  platform2 = platform2.toLowerCase();
  if (platform2.includes("ios"))
    return "iOS";
  if (platform2 === "android")
    return "Android";
  if (platform2 === "darwin")
    return "MacOS";
  if (platform2 === "win32")
    return "Windows";
  if (platform2 === "freebsd")
    return "FreeBSD";
  if (platform2 === "openbsd")
    return "OpenBSD";
  if (platform2 === "linux")
    return "Linux";
  if (platform2)
    return `Other:${platform2}`;
  return "Unknown";
}, "normalizePlatform");
var _platformHeaders;
var getPlatformHeaders = /* @__PURE__ */ __name(() => {
  return _platformHeaders ?? (_platformHeaders = getPlatformProperties());
}, "getPlatformHeaders");
var safeJSON = /* @__PURE__ */ __name((text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    return void 0;
  }
}, "safeJSON");
var startsWithSchemeRegexp = /^[a-z][a-z0-9+.-]*:/i;
var isAbsoluteURL = /* @__PURE__ */ __name((url) => {
  return startsWithSchemeRegexp.test(url);
}, "isAbsoluteURL");
var sleep = /* @__PURE__ */ __name((ms2) => new Promise((resolve) => setTimeout(resolve, ms2)), "sleep");
var validatePositiveInteger = /* @__PURE__ */ __name((name2, n) => {
  if (typeof n !== "number" || !Number.isInteger(n)) {
    throw new OpenAIError(`${name2} must be an integer`);
  }
  if (n < 0) {
    throw new OpenAIError(`${name2} must be a positive integer`);
  }
  return n;
}, "validatePositiveInteger");
var castToError = /* @__PURE__ */ __name((err) => {
  if (err instanceof Error)
    return err;
  if (typeof err === "object" && err !== null) {
    try {
      return new Error(JSON.stringify(err));
    } catch {
    }
  }
  return new Error(err);
}, "castToError");
var readEnv = /* @__PURE__ */ __name((env2) => {
  if (typeof process !== "undefined") {
    return process.env?.[env2]?.trim() ?? void 0;
  }
  if (typeof Deno !== "undefined") {
    return Deno.env?.get?.(env2)?.trim();
  }
  return void 0;
}, "readEnv");
function isEmptyObj(obj) {
  if (!obj)
    return true;
  for (const _k in obj)
    return false;
  return true;
}
__name(isEmptyObj, "isEmptyObj");
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
__name(hasOwn, "hasOwn");
function applyHeadersMut(targetHeaders, newHeaders) {
  for (const k2 in newHeaders) {
    if (!hasOwn(newHeaders, k2))
      continue;
    const lowerKey = k2.toLowerCase();
    if (!lowerKey)
      continue;
    const val = newHeaders[k2];
    if (val === null) {
      delete targetHeaders[lowerKey];
    } else if (val !== void 0) {
      targetHeaders[lowerKey] = val;
    }
  }
}
__name(applyHeadersMut, "applyHeadersMut");
var SENSITIVE_HEADERS = /* @__PURE__ */ new Set(["authorization", "api-key"]);
function debug3(action, ...args) {
  if (typeof process !== "undefined" && process?.env?.["DEBUG"] === "true") {
    const modifiedArgs = args.map((arg) => {
      if (!arg) {
        return arg;
      }
      if (arg["headers"]) {
        const modifiedArg2 = { ...arg, headers: { ...arg["headers"] } };
        for (const header in arg["headers"]) {
          if (SENSITIVE_HEADERS.has(header.toLowerCase())) {
            modifiedArg2["headers"][header] = "REDACTED";
          }
        }
        return modifiedArg2;
      }
      let modifiedArg = null;
      for (const header in arg) {
        if (SENSITIVE_HEADERS.has(header.toLowerCase())) {
          modifiedArg ?? (modifiedArg = { ...arg });
          modifiedArg[header] = "REDACTED";
        }
      }
      return modifiedArg ?? arg;
    });
    console.log(`OpenAI:DEBUG:${action}`, ...modifiedArgs);
  }
}
__name(debug3, "debug");
var uuid4 = /* @__PURE__ */ __name(() => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c2) => {
    const r = Math.random() * 16 | 0;
    const v3 = c2 === "x" ? r : r & 3 | 8;
    return v3.toString(16);
  });
}, "uuid4");
var isRunningInBrowser = /* @__PURE__ */ __name(() => {
  return (
    // @ts-ignore
    typeof window !== "undefined" && // @ts-ignore
    typeof window.document !== "undefined" && // @ts-ignore
    typeof navigator !== "undefined"
  );
}, "isRunningInBrowser");
var isHeadersProtocol = /* @__PURE__ */ __name((headers) => {
  return typeof headers?.get === "function";
}, "isHeadersProtocol");
var getHeader = /* @__PURE__ */ __name((headers, header) => {
  const lowerCasedHeader = header.toLowerCase();
  if (isHeadersProtocol(headers)) {
    const intercapsHeader = header[0]?.toUpperCase() + header.substring(1).replace(/([^\w])(\w)/g, (_m2, g1, g22) => g1 + g22.toUpperCase());
    for (const key of [header, lowerCasedHeader, header.toUpperCase(), intercapsHeader]) {
      const value = headers.get(key);
      if (value) {
        return value;
      }
    }
  }
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lowerCasedHeader) {
      if (Array.isArray(value)) {
        if (value.length <= 1)
          return value[0];
        console.warn(`Received ${value.length} entries for the ${header} header, using the first entry.`);
        return value[0];
      }
      return value;
    }
  }
  return void 0;
}, "getHeader");
var toFloat32Array = /* @__PURE__ */ __name((base64Str) => {
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(base64Str, "base64");
    return Array.from(new Float32Array(buf.buffer, buf.byteOffset, buf.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const binaryStr = atob(base64Str);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return Array.from(new Float32Array(bytes.buffer));
  }
}, "toFloat32Array");
function isObj(obj) {
  return obj != null && typeof obj === "object" && !Array.isArray(obj);
}
__name(isObj, "isObj");

// node_modules/openai/pagination.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Page = class extends AbstractPage {
  static {
    __name(this, "Page");
  }
  constructor(client, response, body, options) {
    super(client, response, body, options);
    this.data = body.data || [];
    this.object = body.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  // @deprecated Please use `nextPageInfo()` instead
  /**
   * This page represents a response that isn't actually paginated at the API level
   * so there will never be any next page params.
   */
  nextPageParams() {
    return null;
  }
  nextPageInfo() {
    return null;
  }
};
var CursorPage = class extends AbstractPage {
  static {
    __name(this, "CursorPage");
  }
  constructor(client, response, body, options) {
    super(client, response, body, options);
    this.data = body.data || [];
    this.has_more = body.has_more || false;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    if (this.has_more === false) {
      return false;
    }
    return super.hasNextPage();
  }
  // @deprecated Please use `nextPageInfo()` instead
  nextPageParams() {
    const info = this.nextPageInfo();
    if (!info)
      return null;
    if ("params" in info)
      return info.params;
    const params = Object.fromEntries(info.url.searchParams);
    if (!Object.keys(params).length)
      return null;
    return params;
  }
  nextPageInfo() {
    const data = this.getPaginatedItems();
    if (!data.length) {
      return null;
    }
    const id2 = data[data.length - 1]?.id;
    if (!id2) {
      return null;
    }
    return { params: { after: id2 } };
  }
};

// node_modules/openai/resources/index.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/chat/index.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/chat/chat.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resource.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var APIResource = class {
  static {
    __name(this, "APIResource");
  }
  constructor(client) {
    this._client = client;
  }
};

// node_modules/openai/resources/chat/completions/completions.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/chat/completions/messages.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Messages = class extends APIResource {
  static {
    __name(this, "Messages");
  }
  list(completionId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(completionId, {}, query);
    }
    return this._client.getAPIList(`/chat/completions/${completionId}/messages`, ChatCompletionStoreMessagesPage, { query, ...options });
  }
};

// node_modules/openai/resources/chat/completions/completions.mjs
var Completions = class extends APIResource {
  static {
    __name(this, "Completions");
  }
  constructor() {
    super(...arguments);
    this.messages = new Messages(this._client);
  }
  create(body, options) {
    return this._client.post("/chat/completions", { body, ...options, stream: body.stream ?? false });
  }
  /**
   * Get a stored chat completion. Only Chat Completions that have been created with
   * the `store` parameter set to `true` will be returned.
   *
   * @example
   * ```ts
   * const chatCompletion =
   *   await client.chat.completions.retrieve('completion_id');
   * ```
   */
  retrieve(completionId, options) {
    return this._client.get(`/chat/completions/${completionId}`, options);
  }
  /**
   * Modify a stored chat completion. Only Chat Completions that have been created
   * with the `store` parameter set to `true` can be modified. Currently, the only
   * supported modification is to update the `metadata` field.
   *
   * @example
   * ```ts
   * const chatCompletion = await client.chat.completions.update(
   *   'completion_id',
   *   { metadata: { foo: 'string' } },
   * );
   * ```
   */
  update(completionId, body, options) {
    return this._client.post(`/chat/completions/${completionId}`, { body, ...options });
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/chat/completions", ChatCompletionsPage, { query, ...options });
  }
  /**
   * Delete a stored chat completion. Only Chat Completions that have been created
   * with the `store` parameter set to `true` can be deleted.
   *
   * @example
   * ```ts
   * const chatCompletionDeleted =
   *   await client.chat.completions.del('completion_id');
   * ```
   */
  del(completionId, options) {
    return this._client.delete(`/chat/completions/${completionId}`, options);
  }
};
var ChatCompletionsPage = class extends CursorPage {
  static {
    __name(this, "ChatCompletionsPage");
  }
};
var ChatCompletionStoreMessagesPage = class extends CursorPage {
  static {
    __name(this, "ChatCompletionStoreMessagesPage");
  }
};
Completions.ChatCompletionsPage = ChatCompletionsPage;
Completions.Messages = Messages;

// node_modules/openai/resources/chat/chat.mjs
var Chat = class extends APIResource {
  static {
    __name(this, "Chat");
  }
  constructor() {
    super(...arguments);
    this.completions = new Completions(this._client);
  }
};
Chat.Completions = Completions;
Chat.ChatCompletionsPage = ChatCompletionsPage;

// node_modules/openai/resources/audio/audio.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/audio/speech.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Speech = class extends APIResource {
  static {
    __name(this, "Speech");
  }
  /**
   * Generates audio from the input text.
   *
   * @example
   * ```ts
   * const speech = await client.audio.speech.create({
   *   input: 'input',
   *   model: 'string',
   *   voice: 'ash',
   * });
   *
   * const content = await speech.blob();
   * console.log(content);
   * ```
   */
  create(body, options) {
    return this._client.post("/audio/speech", {
      body,
      ...options,
      headers: { Accept: "application/octet-stream", ...options?.headers },
      __binaryResponse: true
    });
  }
};

// node_modules/openai/resources/audio/transcriptions.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Transcriptions = class extends APIResource {
  static {
    __name(this, "Transcriptions");
  }
  create(body, options) {
    return this._client.post("/audio/transcriptions", multipartFormRequestOptions({
      body,
      ...options,
      stream: body.stream ?? false,
      __metadata: { model: body.model }
    }));
  }
};

// node_modules/openai/resources/audio/translations.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Translations = class extends APIResource {
  static {
    __name(this, "Translations");
  }
  create(body, options) {
    return this._client.post("/audio/translations", multipartFormRequestOptions({ body, ...options, __metadata: { model: body.model } }));
  }
};

// node_modules/openai/resources/audio/audio.mjs
var Audio = class extends APIResource {
  static {
    __name(this, "Audio");
  }
  constructor() {
    super(...arguments);
    this.transcriptions = new Transcriptions(this._client);
    this.translations = new Translations(this._client);
    this.speech = new Speech(this._client);
  }
};
Audio.Transcriptions = Transcriptions;
Audio.Translations = Translations;
Audio.Speech = Speech;

// node_modules/openai/resources/batches.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Batches = class extends APIResource {
  static {
    __name(this, "Batches");
  }
  /**
   * Creates and executes a batch from an uploaded file of requests
   */
  create(body, options) {
    return this._client.post("/batches", { body, ...options });
  }
  /**
   * Retrieves a batch.
   */
  retrieve(batchId, options) {
    return this._client.get(`/batches/${batchId}`, options);
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/batches", BatchesPage, { query, ...options });
  }
  /**
   * Cancels an in-progress batch. The batch will be in status `cancelling` for up to
   * 10 minutes, before changing to `cancelled`, where it will have partial results
   * (if any) available in the output file.
   */
  cancel(batchId, options) {
    return this._client.post(`/batches/${batchId}/cancel`, options);
  }
};
var BatchesPage = class extends CursorPage {
  static {
    __name(this, "BatchesPage");
  }
};
Batches.BatchesPage = BatchesPage;

// node_modules/openai/resources/beta/beta.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/beta/assistants.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/lib/AssistantStream.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/lib/EventStream.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var __classPrivateFieldSet3 = function(receiver, state, value, kind2, f2) {
  if (kind2 === "m") throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f2) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f2.call(receiver, value) : f2 ? f2.value = value : state.set(receiver, value), value;
};
var __classPrivateFieldGet3 = function(receiver, state, kind2, f2) {
  if (kind2 === "a" && !f2) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f2 : kind2 === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
};
var _EventStream_instances;
var _EventStream_connectedPromise;
var _EventStream_resolveConnectedPromise;
var _EventStream_rejectConnectedPromise;
var _EventStream_endPromise;
var _EventStream_resolveEndPromise;
var _EventStream_rejectEndPromise;
var _EventStream_listeners;
var _EventStream_ended;
var _EventStream_errored;
var _EventStream_aborted;
var _EventStream_catchingPromiseCreated;
var _EventStream_handleError;
var EventStream = class {
  static {
    __name(this, "EventStream");
  }
  constructor() {
    _EventStream_instances.add(this);
    this.controller = new AbortController();
    _EventStream_connectedPromise.set(this, void 0);
    _EventStream_resolveConnectedPromise.set(this, () => {
    });
    _EventStream_rejectConnectedPromise.set(this, () => {
    });
    _EventStream_endPromise.set(this, void 0);
    _EventStream_resolveEndPromise.set(this, () => {
    });
    _EventStream_rejectEndPromise.set(this, () => {
    });
    _EventStream_listeners.set(this, {});
    _EventStream_ended.set(this, false);
    _EventStream_errored.set(this, false);
    _EventStream_aborted.set(this, false);
    _EventStream_catchingPromiseCreated.set(this, false);
    __classPrivateFieldSet3(this, _EventStream_connectedPromise, new Promise((resolve, reject) => {
      __classPrivateFieldSet3(this, _EventStream_resolveConnectedPromise, resolve, "f");
      __classPrivateFieldSet3(this, _EventStream_rejectConnectedPromise, reject, "f");
    }), "f");
    __classPrivateFieldSet3(this, _EventStream_endPromise, new Promise((resolve, reject) => {
      __classPrivateFieldSet3(this, _EventStream_resolveEndPromise, resolve, "f");
      __classPrivateFieldSet3(this, _EventStream_rejectEndPromise, reject, "f");
    }), "f");
    __classPrivateFieldGet3(this, _EventStream_connectedPromise, "f").catch(() => {
    });
    __classPrivateFieldGet3(this, _EventStream_endPromise, "f").catch(() => {
    });
  }
  _run(executor) {
    setTimeout(() => {
      executor().then(() => {
        this._emitFinal();
        this._emit("end");
      }, __classPrivateFieldGet3(this, _EventStream_instances, "m", _EventStream_handleError).bind(this));
    }, 0);
  }
  _connected() {
    if (this.ended)
      return;
    __classPrivateFieldGet3(this, _EventStream_resolveConnectedPromise, "f").call(this);
    this._emit("connect");
  }
  get ended() {
    return __classPrivateFieldGet3(this, _EventStream_ended, "f");
  }
  get errored() {
    return __classPrivateFieldGet3(this, _EventStream_errored, "f");
  }
  get aborted() {
    return __classPrivateFieldGet3(this, _EventStream_aborted, "f");
  }
  abort() {
    this.controller.abort();
  }
  /**
   * Adds the listener function to the end of the listeners array for the event.
   * No checks are made to see if the listener has already been added. Multiple calls passing
   * the same combination of event and listener will result in the listener being added, and
   * called, multiple times.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  on(event, listener) {
    const listeners2 = __classPrivateFieldGet3(this, _EventStream_listeners, "f")[event] || (__classPrivateFieldGet3(this, _EventStream_listeners, "f")[event] = []);
    listeners2.push({ listener });
    return this;
  }
  /**
   * Removes the specified listener from the listener array for the event.
   * off() will remove, at most, one instance of a listener from the listener array. If any single
   * listener has been added multiple times to the listener array for the specified event, then
   * off() must be called multiple times to remove each instance.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  off(event, listener) {
    const listeners2 = __classPrivateFieldGet3(this, _EventStream_listeners, "f")[event];
    if (!listeners2)
      return this;
    const index = listeners2.findIndex((l3) => l3.listener === listener);
    if (index >= 0)
      listeners2.splice(index, 1);
    return this;
  }
  /**
   * Adds a one-time listener function for the event. The next time the event is triggered,
   * this listener is removed and then invoked.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  once(event, listener) {
    const listeners2 = __classPrivateFieldGet3(this, _EventStream_listeners, "f")[event] || (__classPrivateFieldGet3(this, _EventStream_listeners, "f")[event] = []);
    listeners2.push({ listener, once: true });
    return this;
  }
  /**
   * This is similar to `.once()`, but returns a Promise that resolves the next time
   * the event is triggered, instead of calling a listener callback.
   * @returns a Promise that resolves the next time given event is triggered,
   * or rejects if an error is emitted.  (If you request the 'error' event,
   * returns a promise that resolves with the error).
   *
   * Example:
   *
   *   const message = await stream.emitted('message') // rejects if the stream errors
   */
  emitted(event) {
    return new Promise((resolve, reject) => {
      __classPrivateFieldSet3(this, _EventStream_catchingPromiseCreated, true, "f");
      if (event !== "error")
        this.once("error", reject);
      this.once(event, resolve);
    });
  }
  async done() {
    __classPrivateFieldSet3(this, _EventStream_catchingPromiseCreated, true, "f");
    await __classPrivateFieldGet3(this, _EventStream_endPromise, "f");
  }
  _emit(event, ...args) {
    if (__classPrivateFieldGet3(this, _EventStream_ended, "f")) {
      return;
    }
    if (event === "end") {
      __classPrivateFieldSet3(this, _EventStream_ended, true, "f");
      __classPrivateFieldGet3(this, _EventStream_resolveEndPromise, "f").call(this);
    }
    const listeners2 = __classPrivateFieldGet3(this, _EventStream_listeners, "f")[event];
    if (listeners2) {
      __classPrivateFieldGet3(this, _EventStream_listeners, "f")[event] = listeners2.filter((l3) => !l3.once);
      listeners2.forEach(({ listener }) => listener(...args));
    }
    if (event === "abort") {
      const error = args[0];
      if (!__classPrivateFieldGet3(this, _EventStream_catchingPromiseCreated, "f") && !listeners2?.length) {
        Promise.reject(error);
      }
      __classPrivateFieldGet3(this, _EventStream_rejectConnectedPromise, "f").call(this, error);
      __classPrivateFieldGet3(this, _EventStream_rejectEndPromise, "f").call(this, error);
      this._emit("end");
      return;
    }
    if (event === "error") {
      const error = args[0];
      if (!__classPrivateFieldGet3(this, _EventStream_catchingPromiseCreated, "f") && !listeners2?.length) {
        Promise.reject(error);
      }
      __classPrivateFieldGet3(this, _EventStream_rejectConnectedPromise, "f").call(this, error);
      __classPrivateFieldGet3(this, _EventStream_rejectEndPromise, "f").call(this, error);
      this._emit("end");
    }
  }
  _emitFinal() {
  }
};
_EventStream_connectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_resolveConnectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_rejectConnectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_endPromise = /* @__PURE__ */ new WeakMap(), _EventStream_resolveEndPromise = /* @__PURE__ */ new WeakMap(), _EventStream_rejectEndPromise = /* @__PURE__ */ new WeakMap(), _EventStream_listeners = /* @__PURE__ */ new WeakMap(), _EventStream_ended = /* @__PURE__ */ new WeakMap(), _EventStream_errored = /* @__PURE__ */ new WeakMap(), _EventStream_aborted = /* @__PURE__ */ new WeakMap(), _EventStream_catchingPromiseCreated = /* @__PURE__ */ new WeakMap(), _EventStream_instances = /* @__PURE__ */ new WeakSet(), _EventStream_handleError = /* @__PURE__ */ __name(function _EventStream_handleError2(error) {
  __classPrivateFieldSet3(this, _EventStream_errored, true, "f");
  if (error instanceof Error && error.name === "AbortError") {
    error = new APIUserAbortError();
  }
  if (error instanceof APIUserAbortError) {
    __classPrivateFieldSet3(this, _EventStream_aborted, true, "f");
    return this._emit("abort", error);
  }
  if (error instanceof OpenAIError) {
    return this._emit("error", error);
  }
  if (error instanceof Error) {
    const openAIError = new OpenAIError(error.message);
    openAIError.cause = error;
    return this._emit("error", openAIError);
  }
  return this._emit("error", new OpenAIError(String(error)));
}, "_EventStream_handleError");

// node_modules/openai/lib/AssistantStream.mjs
var __classPrivateFieldGet4 = function(receiver, state, kind2, f2) {
  if (kind2 === "a" && !f2) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f2 : kind2 === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
};
var __classPrivateFieldSet4 = function(receiver, state, value, kind2, f2) {
  if (kind2 === "m") throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f2) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f2.call(receiver, value) : f2 ? f2.value = value : state.set(receiver, value), value;
};
var _AssistantStream_instances;
var _AssistantStream_events;
var _AssistantStream_runStepSnapshots;
var _AssistantStream_messageSnapshots;
var _AssistantStream_messageSnapshot;
var _AssistantStream_finalRun;
var _AssistantStream_currentContentIndex;
var _AssistantStream_currentContent;
var _AssistantStream_currentToolCallIndex;
var _AssistantStream_currentToolCall;
var _AssistantStream_currentEvent;
var _AssistantStream_currentRunSnapshot;
var _AssistantStream_currentRunStepSnapshot;
var _AssistantStream_addEvent;
var _AssistantStream_endRequest;
var _AssistantStream_handleMessage;
var _AssistantStream_handleRunStep;
var _AssistantStream_handleEvent;
var _AssistantStream_accumulateRunStep;
var _AssistantStream_accumulateMessage;
var _AssistantStream_accumulateContent;
var _AssistantStream_handleRun;
var AssistantStream = class _AssistantStream extends EventStream {
  static {
    __name(this, "AssistantStream");
  }
  constructor() {
    super(...arguments);
    _AssistantStream_instances.add(this);
    _AssistantStream_events.set(this, []);
    _AssistantStream_runStepSnapshots.set(this, {});
    _AssistantStream_messageSnapshots.set(this, {});
    _AssistantStream_messageSnapshot.set(this, void 0);
    _AssistantStream_finalRun.set(this, void 0);
    _AssistantStream_currentContentIndex.set(this, void 0);
    _AssistantStream_currentContent.set(this, void 0);
    _AssistantStream_currentToolCallIndex.set(this, void 0);
    _AssistantStream_currentToolCall.set(this, void 0);
    _AssistantStream_currentEvent.set(this, void 0);
    _AssistantStream_currentRunSnapshot.set(this, void 0);
    _AssistantStream_currentRunStepSnapshot.set(this, void 0);
  }
  [(_AssistantStream_events = /* @__PURE__ */ new WeakMap(), _AssistantStream_runStepSnapshots = /* @__PURE__ */ new WeakMap(), _AssistantStream_messageSnapshots = /* @__PURE__ */ new WeakMap(), _AssistantStream_messageSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_finalRun = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentContentIndex = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentContent = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentToolCallIndex = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentToolCall = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentEvent = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentRunSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentRunStepSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_instances = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
    const pushQueue = [];
    const readQueue = [];
    let done = false;
    this.on("event", (event) => {
      const reader = readQueue.shift();
      if (reader) {
        reader.resolve(event);
      } else {
        pushQueue.push(event);
      }
    });
    this.on("end", () => {
      done = true;
      for (const reader of readQueue) {
        reader.resolve(void 0);
      }
      readQueue.length = 0;
    });
    this.on("abort", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    this.on("error", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    return {
      next: /* @__PURE__ */ __name(async () => {
        if (!pushQueue.length) {
          if (done) {
            return { value: void 0, done: true };
          }
          return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: void 0, done: true });
        }
        const chunk = pushQueue.shift();
        return { value: chunk, done: false };
      }, "next"),
      return: /* @__PURE__ */ __name(async () => {
        this.abort();
        return { value: void 0, done: true };
      }, "return")
    };
  }
  static fromReadableStream(stream) {
    const runner = new _AssistantStream();
    runner._run(() => runner._fromReadableStream(stream));
    return runner;
  }
  async _fromReadableStream(readableStream, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    this._connected();
    const stream = Stream.fromReadableStream(readableStream, this.controller);
    for await (const event of stream) {
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  toReadableStream() {
    const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
    return stream.toReadableStream();
  }
  static createToolAssistantStream(threadId, runId, runs, params, options) {
    const runner = new _AssistantStream();
    runner._run(() => runner._runToolAssistantStream(threadId, runId, runs, params, {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  async _createToolAssistantStream(run, threadId, runId, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    const body = { ...params, stream: true };
    const stream = await run.submitToolOutputs(threadId, runId, body, {
      ...options,
      signal: this.controller.signal
    });
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  static createThreadAssistantStream(params, thread, options) {
    const runner = new _AssistantStream();
    runner._run(() => runner._threadAssistantStream(params, thread, {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  static createAssistantStream(threadId, runs, params, options) {
    const runner = new _AssistantStream();
    runner._run(() => runner._runAssistantStream(threadId, runs, params, {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  currentEvent() {
    return __classPrivateFieldGet4(this, _AssistantStream_currentEvent, "f");
  }
  currentRun() {
    return __classPrivateFieldGet4(this, _AssistantStream_currentRunSnapshot, "f");
  }
  currentMessageSnapshot() {
    return __classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f");
  }
  currentRunStepSnapshot() {
    return __classPrivateFieldGet4(this, _AssistantStream_currentRunStepSnapshot, "f");
  }
  async finalRunSteps() {
    await this.done();
    return Object.values(__classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f"));
  }
  async finalMessages() {
    await this.done();
    return Object.values(__classPrivateFieldGet4(this, _AssistantStream_messageSnapshots, "f"));
  }
  async finalRun() {
    await this.done();
    if (!__classPrivateFieldGet4(this, _AssistantStream_finalRun, "f"))
      throw Error("Final run was not received.");
    return __classPrivateFieldGet4(this, _AssistantStream_finalRun, "f");
  }
  async _createThreadAssistantStream(thread, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    const body = { ...params, stream: true };
    const stream = await thread.createAndRun(body, { ...options, signal: this.controller.signal });
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  async _createAssistantStream(run, threadId, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    const body = { ...params, stream: true };
    const stream = await run.create(threadId, body, { ...options, signal: this.controller.signal });
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  static accumulateDelta(acc, delta) {
    for (const [key, deltaValue] of Object.entries(delta)) {
      if (!acc.hasOwnProperty(key)) {
        acc[key] = deltaValue;
        continue;
      }
      let accValue = acc[key];
      if (accValue === null || accValue === void 0) {
        acc[key] = deltaValue;
        continue;
      }
      if (key === "index" || key === "type") {
        acc[key] = deltaValue;
        continue;
      }
      if (typeof accValue === "string" && typeof deltaValue === "string") {
        accValue += deltaValue;
      } else if (typeof accValue === "number" && typeof deltaValue === "number") {
        accValue += deltaValue;
      } else if (isObj(accValue) && isObj(deltaValue)) {
        accValue = this.accumulateDelta(accValue, deltaValue);
      } else if (Array.isArray(accValue) && Array.isArray(deltaValue)) {
        if (accValue.every((x3) => typeof x3 === "string" || typeof x3 === "number")) {
          accValue.push(...deltaValue);
          continue;
        }
        for (const deltaEntry of deltaValue) {
          if (!isObj(deltaEntry)) {
            throw new Error(`Expected array delta entry to be an object but got: ${deltaEntry}`);
          }
          const index = deltaEntry["index"];
          if (index == null) {
            console.error(deltaEntry);
            throw new Error("Expected array delta entry to have an `index` property");
          }
          if (typeof index !== "number") {
            throw new Error(`Expected array delta entry \`index\` property to be a number but got ${index}`);
          }
          const accEntry = accValue[index];
          if (accEntry == null) {
            accValue.push(deltaEntry);
          } else {
            accValue[index] = this.accumulateDelta(accEntry, deltaEntry);
          }
        }
        continue;
      } else {
        throw Error(`Unhandled record type: ${key}, deltaValue: ${deltaValue}, accValue: ${accValue}`);
      }
      acc[key] = accValue;
    }
    return acc;
  }
  _addRun(run) {
    return run;
  }
  async _threadAssistantStream(params, thread, options) {
    return await this._createThreadAssistantStream(thread, params, options);
  }
  async _runAssistantStream(threadId, runs, params, options) {
    return await this._createAssistantStream(runs, threadId, params, options);
  }
  async _runToolAssistantStream(threadId, runId, runs, params, options) {
    return await this._createToolAssistantStream(runs, threadId, runId, params, options);
  }
};
_AssistantStream_addEvent = /* @__PURE__ */ __name(function _AssistantStream_addEvent2(event) {
  if (this.ended)
    return;
  __classPrivateFieldSet4(this, _AssistantStream_currentEvent, event, "f");
  __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_handleEvent).call(this, event);
  switch (event.event) {
    case "thread.created":
      break;
    case "thread.run.created":
    case "thread.run.queued":
    case "thread.run.in_progress":
    case "thread.run.requires_action":
    case "thread.run.completed":
    case "thread.run.incomplete":
    case "thread.run.failed":
    case "thread.run.cancelling":
    case "thread.run.cancelled":
    case "thread.run.expired":
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_handleRun).call(this, event);
      break;
    case "thread.run.step.created":
    case "thread.run.step.in_progress":
    case "thread.run.step.delta":
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_handleRunStep).call(this, event);
      break;
    case "thread.message.created":
    case "thread.message.in_progress":
    case "thread.message.delta":
    case "thread.message.completed":
    case "thread.message.incomplete":
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_handleMessage).call(this, event);
      break;
    case "error":
      throw new Error("Encountered an error event in event processing - errors should be processed earlier");
    default:
      assertNever(event);
  }
}, "_AssistantStream_addEvent"), _AssistantStream_endRequest = /* @__PURE__ */ __name(function _AssistantStream_endRequest2() {
  if (this.ended) {
    throw new OpenAIError(`stream has ended, this shouldn't happen`);
  }
  if (!__classPrivateFieldGet4(this, _AssistantStream_finalRun, "f"))
    throw Error("Final run has not been received");
  return __classPrivateFieldGet4(this, _AssistantStream_finalRun, "f");
}, "_AssistantStream_endRequest"), _AssistantStream_handleMessage = /* @__PURE__ */ __name(function _AssistantStream_handleMessage2(event) {
  const [accumulatedMessage, newContent] = __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_accumulateMessage).call(this, event, __classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f"));
  __classPrivateFieldSet4(this, _AssistantStream_messageSnapshot, accumulatedMessage, "f");
  __classPrivateFieldGet4(this, _AssistantStream_messageSnapshots, "f")[accumulatedMessage.id] = accumulatedMessage;
  for (const content of newContent) {
    const snapshotContent = accumulatedMessage.content[content.index];
    if (snapshotContent?.type == "text") {
      this._emit("textCreated", snapshotContent.text);
    }
  }
  switch (event.event) {
    case "thread.message.created":
      this._emit("messageCreated", event.data);
      break;
    case "thread.message.in_progress":
      break;
    case "thread.message.delta":
      this._emit("messageDelta", event.data.delta, accumulatedMessage);
      if (event.data.delta.content) {
        for (const content of event.data.delta.content) {
          if (content.type == "text" && content.text) {
            let textDelta = content.text;
            let snapshot = accumulatedMessage.content[content.index];
            if (snapshot && snapshot.type == "text") {
              this._emit("textDelta", textDelta, snapshot.text);
            } else {
              throw Error("The snapshot associated with this text delta is not text or missing");
            }
          }
          if (content.index != __classPrivateFieldGet4(this, _AssistantStream_currentContentIndex, "f")) {
            if (__classPrivateFieldGet4(this, _AssistantStream_currentContent, "f")) {
              switch (__classPrivateFieldGet4(this, _AssistantStream_currentContent, "f").type) {
                case "text":
                  this._emit("textDone", __classPrivateFieldGet4(this, _AssistantStream_currentContent, "f").text, __classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f"));
                  break;
                case "image_file":
                  this._emit("imageFileDone", __classPrivateFieldGet4(this, _AssistantStream_currentContent, "f").image_file, __classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f"));
                  break;
              }
            }
            __classPrivateFieldSet4(this, _AssistantStream_currentContentIndex, content.index, "f");
          }
          __classPrivateFieldSet4(this, _AssistantStream_currentContent, accumulatedMessage.content[content.index], "f");
        }
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (__classPrivateFieldGet4(this, _AssistantStream_currentContentIndex, "f") !== void 0) {
        const currentContent = event.data.content[__classPrivateFieldGet4(this, _AssistantStream_currentContentIndex, "f")];
        if (currentContent) {
          switch (currentContent.type) {
            case "image_file":
              this._emit("imageFileDone", currentContent.image_file, __classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f"));
              break;
            case "text":
              this._emit("textDone", currentContent.text, __classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f"));
              break;
          }
        }
      }
      if (__classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f")) {
        this._emit("messageDone", event.data);
      }
      __classPrivateFieldSet4(this, _AssistantStream_messageSnapshot, void 0, "f");
  }
}, "_AssistantStream_handleMessage"), _AssistantStream_handleRunStep = /* @__PURE__ */ __name(function _AssistantStream_handleRunStep2(event) {
  const accumulatedRunStep = __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_accumulateRunStep).call(this, event);
  __classPrivateFieldSet4(this, _AssistantStream_currentRunStepSnapshot, accumulatedRunStep, "f");
  switch (event.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", event.data);
      break;
    case "thread.run.step.delta":
      const delta = event.data.delta;
      if (delta.step_details && delta.step_details.type == "tool_calls" && delta.step_details.tool_calls && accumulatedRunStep.step_details.type == "tool_calls") {
        for (const toolCall of delta.step_details.tool_calls) {
          if (toolCall.index == __classPrivateFieldGet4(this, _AssistantStream_currentToolCallIndex, "f")) {
            this._emit("toolCallDelta", toolCall, accumulatedRunStep.step_details.tool_calls[toolCall.index]);
          } else {
            if (__classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f")) {
              this._emit("toolCallDone", __classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f"));
            }
            __classPrivateFieldSet4(this, _AssistantStream_currentToolCallIndex, toolCall.index, "f");
            __classPrivateFieldSet4(this, _AssistantStream_currentToolCall, accumulatedRunStep.step_details.tool_calls[toolCall.index], "f");
            if (__classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f"))
              this._emit("toolCallCreated", __classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f"));
          }
        }
      }
      this._emit("runStepDelta", event.data.delta, accumulatedRunStep);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      __classPrivateFieldSet4(this, _AssistantStream_currentRunStepSnapshot, void 0, "f");
      const details = event.data.step_details;
      if (details.type == "tool_calls") {
        if (__classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f")) {
          this._emit("toolCallDone", __classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f"));
          __classPrivateFieldSet4(this, _AssistantStream_currentToolCall, void 0, "f");
        }
      }
      this._emit("runStepDone", event.data, accumulatedRunStep);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, "_AssistantStream_handleRunStep"), _AssistantStream_handleEvent = /* @__PURE__ */ __name(function _AssistantStream_handleEvent2(event) {
  __classPrivateFieldGet4(this, _AssistantStream_events, "f").push(event);
  this._emit("event", event);
}, "_AssistantStream_handleEvent"), _AssistantStream_accumulateRunStep = /* @__PURE__ */ __name(function _AssistantStream_accumulateRunStep2(event) {
  switch (event.event) {
    case "thread.run.step.created":
      __classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = event.data;
      return event.data;
    case "thread.run.step.delta":
      let snapshot = __classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
      if (!snapshot) {
        throw Error("Received a RunStepDelta before creation of a snapshot");
      }
      let data = event.data;
      if (data.delta) {
        const accumulated = AssistantStream.accumulateDelta(snapshot, data.delta);
        __classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = accumulated;
      }
      return __classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      __classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = event.data;
      break;
  }
  if (__classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id])
    return __classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
  throw new Error("No snapshot available");
}, "_AssistantStream_accumulateRunStep"), _AssistantStream_accumulateMessage = /* @__PURE__ */ __name(function _AssistantStream_accumulateMessage2(event, snapshot) {
  let newContent = [];
  switch (event.event) {
    case "thread.message.created":
      return [event.data, newContent];
    case "thread.message.delta":
      if (!snapshot) {
        throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      }
      let data = event.data;
      if (data.delta.content) {
        for (const contentElement of data.delta.content) {
          if (contentElement.index in snapshot.content) {
            let currentContent = snapshot.content[contentElement.index];
            snapshot.content[contentElement.index] = __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_accumulateContent).call(this, contentElement, currentContent);
          } else {
            snapshot.content[contentElement.index] = contentElement;
            newContent.push(contentElement);
          }
        }
      }
      return [snapshot, newContent];
    case "thread.message.in_progress":
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (snapshot) {
        return [snapshot, newContent];
      } else {
        throw Error("Received thread message event with no existing snapshot");
      }
  }
  throw Error("Tried to accumulate a non-message event");
}, "_AssistantStream_accumulateMessage"), _AssistantStream_accumulateContent = /* @__PURE__ */ __name(function _AssistantStream_accumulateContent2(contentElement, currentContent) {
  return AssistantStream.accumulateDelta(currentContent, contentElement);
}, "_AssistantStream_accumulateContent"), _AssistantStream_handleRun = /* @__PURE__ */ __name(function _AssistantStream_handleRun2(event) {
  __classPrivateFieldSet4(this, _AssistantStream_currentRunSnapshot, event.data, "f");
  switch (event.event) {
    case "thread.run.created":
      break;
    case "thread.run.queued":
      break;
    case "thread.run.in_progress":
      break;
    case "thread.run.requires_action":
    case "thread.run.cancelled":
    case "thread.run.failed":
    case "thread.run.completed":
    case "thread.run.expired":
      __classPrivateFieldSet4(this, _AssistantStream_finalRun, event.data, "f");
      if (__classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f")) {
        this._emit("toolCallDone", __classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f"));
        __classPrivateFieldSet4(this, _AssistantStream_currentToolCall, void 0, "f");
      }
      break;
    case "thread.run.cancelling":
      break;
  }
}, "_AssistantStream_handleRun");
function assertNever(_x) {
}
__name(assertNever, "assertNever");

// node_modules/openai/resources/beta/assistants.mjs
var Assistants = class extends APIResource {
  static {
    __name(this, "Assistants");
  }
  /**
   * Create an assistant with a model and instructions.
   *
   * @example
   * ```ts
   * const assistant = await client.beta.assistants.create({
   *   model: 'gpt-4o',
   * });
   * ```
   */
  create(body, options) {
    return this._client.post("/assistants", {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Retrieves an assistant.
   *
   * @example
   * ```ts
   * const assistant = await client.beta.assistants.retrieve(
   *   'assistant_id',
   * );
   * ```
   */
  retrieve(assistantId, options) {
    return this._client.get(`/assistants/${assistantId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Modifies an assistant.
   *
   * @example
   * ```ts
   * const assistant = await client.beta.assistants.update(
   *   'assistant_id',
   * );
   * ```
   */
  update(assistantId, body, options) {
    return this._client.post(`/assistants/${assistantId}`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/assistants", AssistantsPage, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Delete an assistant.
   *
   * @example
   * ```ts
   * const assistantDeleted = await client.beta.assistants.del(
   *   'assistant_id',
   * );
   * ```
   */
  del(assistantId, options) {
    return this._client.delete(`/assistants/${assistantId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
};
var AssistantsPage = class extends CursorPage {
  static {
    __name(this, "AssistantsPage");
  }
};
Assistants.AssistantsPage = AssistantsPage;

// node_modules/openai/resources/beta/chat/chat.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/beta/chat/completions.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/lib/ChatCompletionRunner.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/lib/AbstractChatCompletionRunner.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/lib/RunnableFunction.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
function isRunnableFunctionWithParse(fn2) {
  return typeof fn2.parse === "function";
}
__name(isRunnableFunctionWithParse, "isRunnableFunctionWithParse");

// node_modules/openai/lib/chatCompletionUtils.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var isAssistantMessage = /* @__PURE__ */ __name((message) => {
  return message?.role === "assistant";
}, "isAssistantMessage");
var isFunctionMessage = /* @__PURE__ */ __name((message) => {
  return message?.role === "function";
}, "isFunctionMessage");
var isToolMessage = /* @__PURE__ */ __name((message) => {
  return message?.role === "tool";
}, "isToolMessage");

// node_modules/openai/lib/parser.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
function isAutoParsableResponseFormat(response_format) {
  return response_format?.["$brand"] === "auto-parseable-response-format";
}
__name(isAutoParsableResponseFormat, "isAutoParsableResponseFormat");
function isAutoParsableTool(tool) {
  return tool?.["$brand"] === "auto-parseable-tool";
}
__name(isAutoParsableTool, "isAutoParsableTool");
function maybeParseChatCompletion(completion, params) {
  if (!params || !hasAutoParseableInput(params)) {
    return {
      ...completion,
      choices: completion.choices.map((choice) => ({
        ...choice,
        message: {
          ...choice.message,
          parsed: null,
          ...choice.message.tool_calls ? {
            tool_calls: choice.message.tool_calls
          } : void 0
        }
      }))
    };
  }
  return parseChatCompletion(completion, params);
}
__name(maybeParseChatCompletion, "maybeParseChatCompletion");
function parseChatCompletion(completion, params) {
  const choices = completion.choices.map((choice) => {
    if (choice.finish_reason === "length") {
      throw new LengthFinishReasonError();
    }
    if (choice.finish_reason === "content_filter") {
      throw new ContentFilterFinishReasonError();
    }
    return {
      ...choice,
      message: {
        ...choice.message,
        ...choice.message.tool_calls ? {
          tool_calls: choice.message.tool_calls?.map((toolCall) => parseToolCall(params, toolCall)) ?? void 0
        } : void 0,
        parsed: choice.message.content && !choice.message.refusal ? parseResponseFormat(params, choice.message.content) : null
      }
    };
  });
  return { ...completion, choices };
}
__name(parseChatCompletion, "parseChatCompletion");
function parseResponseFormat(params, content) {
  if (params.response_format?.type !== "json_schema") {
    return null;
  }
  if (params.response_format?.type === "json_schema") {
    if ("$parseRaw" in params.response_format) {
      const response_format = params.response_format;
      return response_format.$parseRaw(content);
    }
    return JSON.parse(content);
  }
  return null;
}
__name(parseResponseFormat, "parseResponseFormat");
function parseToolCall(params, toolCall) {
  const inputTool = params.tools?.find((inputTool2) => inputTool2.function?.name === toolCall.function.name);
  return {
    ...toolCall,
    function: {
      ...toolCall.function,
      parsed_arguments: isAutoParsableTool(inputTool) ? inputTool.$parseRaw(toolCall.function.arguments) : inputTool?.function.strict ? JSON.parse(toolCall.function.arguments) : null
    }
  };
}
__name(parseToolCall, "parseToolCall");
function shouldParseToolCall(params, toolCall) {
  if (!params) {
    return false;
  }
  const inputTool = params.tools?.find((inputTool2) => inputTool2.function?.name === toolCall.function.name);
  return isAutoParsableTool(inputTool) || inputTool?.function.strict || false;
}
__name(shouldParseToolCall, "shouldParseToolCall");
function hasAutoParseableInput(params) {
  if (isAutoParsableResponseFormat(params.response_format)) {
    return true;
  }
  return params.tools?.some((t) => isAutoParsableTool(t) || t.type === "function" && t.function.strict === true) ?? false;
}
__name(hasAutoParseableInput, "hasAutoParseableInput");
function validateInputTools(tools) {
  for (const tool of tools ?? []) {
    if (tool.type !== "function") {
      throw new OpenAIError(`Currently only \`function\` tool types support auto-parsing; Received \`${tool.type}\``);
    }
    if (tool.function.strict !== true) {
      throw new OpenAIError(`The \`${tool.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
    }
  }
}
__name(validateInputTools, "validateInputTools");

// node_modules/openai/lib/AbstractChatCompletionRunner.mjs
var __classPrivateFieldGet5 = function(receiver, state, kind2, f2) {
  if (kind2 === "a" && !f2) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f2 : kind2 === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
};
var _AbstractChatCompletionRunner_instances;
var _AbstractChatCompletionRunner_getFinalContent;
var _AbstractChatCompletionRunner_getFinalMessage;
var _AbstractChatCompletionRunner_getFinalFunctionCall;
var _AbstractChatCompletionRunner_getFinalFunctionCallResult;
var _AbstractChatCompletionRunner_calculateTotalUsage;
var _AbstractChatCompletionRunner_validateParams;
var _AbstractChatCompletionRunner_stringifyFunctionCallResult;
var DEFAULT_MAX_CHAT_COMPLETIONS = 10;
var AbstractChatCompletionRunner = class extends EventStream {
  static {
    __name(this, "AbstractChatCompletionRunner");
  }
  constructor() {
    super(...arguments);
    _AbstractChatCompletionRunner_instances.add(this);
    this._chatCompletions = [];
    this.messages = [];
  }
  _addChatCompletion(chatCompletion) {
    this._chatCompletions.push(chatCompletion);
    this._emit("chatCompletion", chatCompletion);
    const message = chatCompletion.choices[0]?.message;
    if (message)
      this._addMessage(message);
    return chatCompletion;
  }
  _addMessage(message, emit2 = true) {
    if (!("content" in message))
      message.content = null;
    this.messages.push(message);
    if (emit2) {
      this._emit("message", message);
      if ((isFunctionMessage(message) || isToolMessage(message)) && message.content) {
        this._emit("functionCallResult", message.content);
      } else if (isAssistantMessage(message) && message.function_call) {
        this._emit("functionCall", message.function_call);
      } else if (isAssistantMessage(message) && message.tool_calls) {
        for (const tool_call of message.tool_calls) {
          if (tool_call.type === "function") {
            this._emit("functionCall", tool_call.function);
          }
        }
      }
    }
  }
  /**
   * @returns a promise that resolves with the final ChatCompletion, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletion.
   */
  async finalChatCompletion() {
    await this.done();
    const completion = this._chatCompletions[this._chatCompletions.length - 1];
    if (!completion)
      throw new OpenAIError("stream ended without producing a ChatCompletion");
    return completion;
  }
  /**
   * @returns a promise that resolves with the content of the final ChatCompletionMessage, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalContent() {
    await this.done();
    return __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalContent).call(this);
  }
  /**
   * @returns a promise that resolves with the the final assistant ChatCompletionMessage response,
   * or rejects if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalMessage() {
    await this.done();
    return __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this);
  }
  /**
   * @returns a promise that resolves with the content of the final FunctionCall, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalFunctionCall() {
    await this.done();
    return __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionCall).call(this);
  }
  async finalFunctionCallResult() {
    await this.done();
    return __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionCallResult).call(this);
  }
  async totalUsage() {
    await this.done();
    return __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_calculateTotalUsage).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const completion = this._chatCompletions[this._chatCompletions.length - 1];
    if (completion)
      this._emit("finalChatCompletion", completion);
    const finalMessage = __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this);
    if (finalMessage)
      this._emit("finalMessage", finalMessage);
    const finalContent = __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalContent).call(this);
    if (finalContent)
      this._emit("finalContent", finalContent);
    const finalFunctionCall = __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionCall).call(this);
    if (finalFunctionCall)
      this._emit("finalFunctionCall", finalFunctionCall);
    const finalFunctionCallResult = __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionCallResult).call(this);
    if (finalFunctionCallResult != null)
      this._emit("finalFunctionCallResult", finalFunctionCallResult);
    if (this._chatCompletions.some((c2) => c2.usage)) {
      this._emit("totalUsage", __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_calculateTotalUsage).call(this));
    }
  }
  async _createChatCompletion(client, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_validateParams).call(this, params);
    const chatCompletion = await client.chat.completions.create({ ...params, stream: false }, { ...options, signal: this.controller.signal });
    this._connected();
    return this._addChatCompletion(parseChatCompletion(chatCompletion, params));
  }
  async _runChatCompletion(client, params, options) {
    for (const message of params.messages) {
      this._addMessage(message, false);
    }
    return await this._createChatCompletion(client, params, options);
  }
  async _runFunctions(client, params, options) {
    const role = "function";
    const { function_call = "auto", stream, ...restParams } = params;
    const singleFunctionToCall = typeof function_call !== "string" && function_call?.name;
    const { maxChatCompletions = DEFAULT_MAX_CHAT_COMPLETIONS } = options || {};
    const functionsByName = {};
    for (const f2 of params.functions) {
      functionsByName[f2.name || f2.function.name] = f2;
    }
    const functions = params.functions.map((f2) => ({
      name: f2.name || f2.function.name,
      parameters: f2.parameters,
      description: f2.description
    }));
    for (const message of params.messages) {
      this._addMessage(message, false);
    }
    for (let i = 0; i < maxChatCompletions; ++i) {
      const chatCompletion = await this._createChatCompletion(client, {
        ...restParams,
        function_call,
        functions,
        messages: [...this.messages]
      }, options);
      const message = chatCompletion.choices[0]?.message;
      if (!message) {
        throw new OpenAIError(`missing message in ChatCompletion response`);
      }
      if (!message.function_call)
        return;
      const { name: name2, arguments: args } = message.function_call;
      const fn2 = functionsByName[name2];
      if (!fn2) {
        const content2 = `Invalid function_call: ${JSON.stringify(name2)}. Available options are: ${functions.map((f2) => JSON.stringify(f2.name)).join(", ")}. Please try again`;
        this._addMessage({ role, name: name2, content: content2 });
        continue;
      } else if (singleFunctionToCall && singleFunctionToCall !== name2) {
        const content2 = `Invalid function_call: ${JSON.stringify(name2)}. ${JSON.stringify(singleFunctionToCall)} requested. Please try again`;
        this._addMessage({ role, name: name2, content: content2 });
        continue;
      }
      let parsed;
      try {
        parsed = isRunnableFunctionWithParse(fn2) ? await fn2.parse(args) : args;
      } catch (error) {
        this._addMessage({
          role,
          name: name2,
          content: error instanceof Error ? error.message : String(error)
        });
        continue;
      }
      const rawContent = await fn2.function(parsed, this);
      const content = __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_stringifyFunctionCallResult).call(this, rawContent);
      this._addMessage({ role, name: name2, content });
      if (singleFunctionToCall)
        return;
    }
  }
  async _runTools(client, params, options) {
    const role = "tool";
    const { tool_choice = "auto", stream, ...restParams } = params;
    const singleFunctionToCall = typeof tool_choice !== "string" && tool_choice?.function?.name;
    const { maxChatCompletions = DEFAULT_MAX_CHAT_COMPLETIONS } = options || {};
    const inputTools = params.tools.map((tool) => {
      if (isAutoParsableTool(tool)) {
        if (!tool.$callback) {
          throw new OpenAIError("Tool given to `.runTools()` that does not have an associated function");
        }
        return {
          type: "function",
          function: {
            function: tool.$callback,
            name: tool.function.name,
            description: tool.function.description || "",
            parameters: tool.function.parameters,
            parse: tool.$parseRaw,
            strict: true
          }
        };
      }
      return tool;
    });
    const functionsByName = {};
    for (const f2 of inputTools) {
      if (f2.type === "function") {
        functionsByName[f2.function.name || f2.function.function.name] = f2.function;
      }
    }
    const tools = "tools" in params ? inputTools.map((t) => t.type === "function" ? {
      type: "function",
      function: {
        name: t.function.name || t.function.function.name,
        parameters: t.function.parameters,
        description: t.function.description,
        strict: t.function.strict
      }
    } : t) : void 0;
    for (const message of params.messages) {
      this._addMessage(message, false);
    }
    for (let i = 0; i < maxChatCompletions; ++i) {
      const chatCompletion = await this._createChatCompletion(client, {
        ...restParams,
        tool_choice,
        tools,
        messages: [...this.messages]
      }, options);
      const message = chatCompletion.choices[0]?.message;
      if (!message) {
        throw new OpenAIError(`missing message in ChatCompletion response`);
      }
      if (!message.tool_calls?.length) {
        return;
      }
      for (const tool_call of message.tool_calls) {
        if (tool_call.type !== "function")
          continue;
        const tool_call_id = tool_call.id;
        const { name: name2, arguments: args } = tool_call.function;
        const fn2 = functionsByName[name2];
        if (!fn2) {
          const content2 = `Invalid tool_call: ${JSON.stringify(name2)}. Available options are: ${Object.keys(functionsByName).map((name3) => JSON.stringify(name3)).join(", ")}. Please try again`;
          this._addMessage({ role, tool_call_id, content: content2 });
          continue;
        } else if (singleFunctionToCall && singleFunctionToCall !== name2) {
          const content2 = `Invalid tool_call: ${JSON.stringify(name2)}. ${JSON.stringify(singleFunctionToCall)} requested. Please try again`;
          this._addMessage({ role, tool_call_id, content: content2 });
          continue;
        }
        let parsed;
        try {
          parsed = isRunnableFunctionWithParse(fn2) ? await fn2.parse(args) : args;
        } catch (error) {
          const content2 = error instanceof Error ? error.message : String(error);
          this._addMessage({ role, tool_call_id, content: content2 });
          continue;
        }
        const rawContent = await fn2.function(parsed, this);
        const content = __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_stringifyFunctionCallResult).call(this, rawContent);
        this._addMessage({ role, tool_call_id, content });
        if (singleFunctionToCall) {
          return;
        }
      }
    }
    return;
  }
};
_AbstractChatCompletionRunner_instances = /* @__PURE__ */ new WeakSet(), _AbstractChatCompletionRunner_getFinalContent = /* @__PURE__ */ __name(function _AbstractChatCompletionRunner_getFinalContent2() {
  return __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this).content ?? null;
}, "_AbstractChatCompletionRunner_getFinalContent"), _AbstractChatCompletionRunner_getFinalMessage = /* @__PURE__ */ __name(function _AbstractChatCompletionRunner_getFinalMessage2() {
  let i = this.messages.length;
  while (i-- > 0) {
    const message = this.messages[i];
    if (isAssistantMessage(message)) {
      const { function_call, ...rest } = message;
      const ret = {
        ...rest,
        content: message.content ?? null,
        refusal: message.refusal ?? null
      };
      if (function_call) {
        ret.function_call = function_call;
      }
      return ret;
    }
  }
  throw new OpenAIError("stream ended without producing a ChatCompletionMessage with role=assistant");
}, "_AbstractChatCompletionRunner_getFinalMessage"), _AbstractChatCompletionRunner_getFinalFunctionCall = /* @__PURE__ */ __name(function _AbstractChatCompletionRunner_getFinalFunctionCall2() {
  for (let i = this.messages.length - 1; i >= 0; i--) {
    const message = this.messages[i];
    if (isAssistantMessage(message) && message?.function_call) {
      return message.function_call;
    }
    if (isAssistantMessage(message) && message?.tool_calls?.length) {
      return message.tool_calls.at(-1)?.function;
    }
  }
  return;
}, "_AbstractChatCompletionRunner_getFinalFunctionCall"), _AbstractChatCompletionRunner_getFinalFunctionCallResult = /* @__PURE__ */ __name(function _AbstractChatCompletionRunner_getFinalFunctionCallResult2() {
  for (let i = this.messages.length - 1; i >= 0; i--) {
    const message = this.messages[i];
    if (isFunctionMessage(message) && message.content != null) {
      return message.content;
    }
    if (isToolMessage(message) && message.content != null && typeof message.content === "string" && this.messages.some((x3) => x3.role === "assistant" && x3.tool_calls?.some((y3) => y3.type === "function" && y3.id === message.tool_call_id))) {
      return message.content;
    }
  }
  return;
}, "_AbstractChatCompletionRunner_getFinalFunctionCallResult"), _AbstractChatCompletionRunner_calculateTotalUsage = /* @__PURE__ */ __name(function _AbstractChatCompletionRunner_calculateTotalUsage2() {
  const total = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage } of this._chatCompletions) {
    if (usage) {
      total.completion_tokens += usage.completion_tokens;
      total.prompt_tokens += usage.prompt_tokens;
      total.total_tokens += usage.total_tokens;
    }
  }
  return total;
}, "_AbstractChatCompletionRunner_calculateTotalUsage"), _AbstractChatCompletionRunner_validateParams = /* @__PURE__ */ __name(function _AbstractChatCompletionRunner_validateParams2(params) {
  if (params.n != null && params.n > 1) {
    throw new OpenAIError("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
  }
}, "_AbstractChatCompletionRunner_validateParams"), _AbstractChatCompletionRunner_stringifyFunctionCallResult = /* @__PURE__ */ __name(function _AbstractChatCompletionRunner_stringifyFunctionCallResult2(rawContent) {
  return typeof rawContent === "string" ? rawContent : rawContent === void 0 ? "undefined" : JSON.stringify(rawContent);
}, "_AbstractChatCompletionRunner_stringifyFunctionCallResult");

// node_modules/openai/lib/ChatCompletionRunner.mjs
var ChatCompletionRunner = class _ChatCompletionRunner extends AbstractChatCompletionRunner {
  static {
    __name(this, "ChatCompletionRunner");
  }
  /** @deprecated - please use `runTools` instead. */
  static runFunctions(client, params, options) {
    const runner = new _ChatCompletionRunner();
    const opts = {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "runFunctions" }
    };
    runner._run(() => runner._runFunctions(client, params, opts));
    return runner;
  }
  static runTools(client, params, options) {
    const runner = new _ChatCompletionRunner();
    const opts = {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "runTools" }
    };
    runner._run(() => runner._runTools(client, params, opts));
    return runner;
  }
  _addMessage(message, emit2 = true) {
    super._addMessage(message, emit2);
    if (isAssistantMessage(message) && message.content) {
      this._emit("content", message.content);
    }
  }
};

// node_modules/openai/lib/ChatCompletionStreamingRunner.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/lib/ChatCompletionStream.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/_vendor/partial-json-parser/parser.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var STR = 1;
var NUM = 2;
var ARR = 4;
var OBJ = 8;
var NULL = 16;
var BOOL = 32;
var NAN = 64;
var INFINITY = 128;
var MINUS_INFINITY = 256;
var INF = INFINITY | MINUS_INFINITY;
var SPECIAL = NULL | BOOL | INF | NAN;
var ATOM = STR | NUM | SPECIAL;
var COLLECTION = ARR | OBJ;
var ALL = ATOM | COLLECTION;
var Allow = {
  STR,
  NUM,
  ARR,
  OBJ,
  NULL,
  BOOL,
  NAN,
  INFINITY,
  MINUS_INFINITY,
  INF,
  SPECIAL,
  ATOM,
  COLLECTION,
  ALL
};
var PartialJSON = class extends Error {
  static {
    __name(this, "PartialJSON");
  }
};
var MalformedJSON = class extends Error {
  static {
    __name(this, "MalformedJSON");
  }
};
function parseJSON(jsonString, allowPartial = Allow.ALL) {
  if (typeof jsonString !== "string") {
    throw new TypeError(`expecting str, got ${typeof jsonString}`);
  }
  if (!jsonString.trim()) {
    throw new Error(`${jsonString} is empty`);
  }
  return _parseJSON(jsonString.trim(), allowPartial);
}
__name(parseJSON, "parseJSON");
var _parseJSON = /* @__PURE__ */ __name((jsonString, allow) => {
  const length = jsonString.length;
  let index = 0;
  const markPartialJSON = /* @__PURE__ */ __name((msg) => {
    throw new PartialJSON(`${msg} at position ${index}`);
  }, "markPartialJSON");
  const throwMalformedError = /* @__PURE__ */ __name((msg) => {
    throw new MalformedJSON(`${msg} at position ${index}`);
  }, "throwMalformedError");
  const parseAny = /* @__PURE__ */ __name(() => {
    skipBlank();
    if (index >= length)
      markPartialJSON("Unexpected end of input");
    if (jsonString[index] === '"')
      return parseStr();
    if (jsonString[index] === "{")
      return parseObj();
    if (jsonString[index] === "[")
      return parseArr();
    if (jsonString.substring(index, index + 4) === "null" || Allow.NULL & allow && length - index < 4 && "null".startsWith(jsonString.substring(index))) {
      index += 4;
      return null;
    }
    if (jsonString.substring(index, index + 4) === "true" || Allow.BOOL & allow && length - index < 4 && "true".startsWith(jsonString.substring(index))) {
      index += 4;
      return true;
    }
    if (jsonString.substring(index, index + 5) === "false" || Allow.BOOL & allow && length - index < 5 && "false".startsWith(jsonString.substring(index))) {
      index += 5;
      return false;
    }
    if (jsonString.substring(index, index + 8) === "Infinity" || Allow.INFINITY & allow && length - index < 8 && "Infinity".startsWith(jsonString.substring(index))) {
      index += 8;
      return Infinity;
    }
    if (jsonString.substring(index, index + 9) === "-Infinity" || Allow.MINUS_INFINITY & allow && 1 < length - index && length - index < 9 && "-Infinity".startsWith(jsonString.substring(index))) {
      index += 9;
      return -Infinity;
    }
    if (jsonString.substring(index, index + 3) === "NaN" || Allow.NAN & allow && length - index < 3 && "NaN".startsWith(jsonString.substring(index))) {
      index += 3;
      return NaN;
    }
    return parseNum();
  }, "parseAny");
  const parseStr = /* @__PURE__ */ __name(() => {
    const start = index;
    let escape2 = false;
    index++;
    while (index < length && (jsonString[index] !== '"' || escape2 && jsonString[index - 1] === "\\")) {
      escape2 = jsonString[index] === "\\" ? !escape2 : false;
      index++;
    }
    if (jsonString.charAt(index) == '"') {
      try {
        return JSON.parse(jsonString.substring(start, ++index - Number(escape2)));
      } catch (e6) {
        throwMalformedError(String(e6));
      }
    } else if (Allow.STR & allow) {
      try {
        return JSON.parse(jsonString.substring(start, index - Number(escape2)) + '"');
      } catch (e6) {
        return JSON.parse(jsonString.substring(start, jsonString.lastIndexOf("\\")) + '"');
      }
    }
    markPartialJSON("Unterminated string literal");
  }, "parseStr");
  const parseObj = /* @__PURE__ */ __name(() => {
    index++;
    skipBlank();
    const obj = {};
    try {
      while (jsonString[index] !== "}") {
        skipBlank();
        if (index >= length && Allow.OBJ & allow)
          return obj;
        const key = parseStr();
        skipBlank();
        index++;
        try {
          const value = parseAny();
          Object.defineProperty(obj, key, { value, writable: true, enumerable: true, configurable: true });
        } catch (e6) {
          if (Allow.OBJ & allow)
            return obj;
          else
            throw e6;
        }
        skipBlank();
        if (jsonString[index] === ",")
          index++;
      }
    } catch (e6) {
      if (Allow.OBJ & allow)
        return obj;
      else
        markPartialJSON("Expected '}' at end of object");
    }
    index++;
    return obj;
  }, "parseObj");
  const parseArr = /* @__PURE__ */ __name(() => {
    index++;
    const arr = [];
    try {
      while (jsonString[index] !== "]") {
        arr.push(parseAny());
        skipBlank();
        if (jsonString[index] === ",") {
          index++;
        }
      }
    } catch (e6) {
      if (Allow.ARR & allow) {
        return arr;
      }
      markPartialJSON("Expected ']' at end of array");
    }
    index++;
    return arr;
  }, "parseArr");
  const parseNum = /* @__PURE__ */ __name(() => {
    if (index === 0) {
      if (jsonString === "-" && Allow.NUM & allow)
        markPartialJSON("Not sure what '-' is");
      try {
        return JSON.parse(jsonString);
      } catch (e6) {
        if (Allow.NUM & allow) {
          try {
            if ("." === jsonString[jsonString.length - 1])
              return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf(".")));
            return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf("e")));
          } catch (e7) {
          }
        }
        throwMalformedError(String(e6));
      }
    }
    const start = index;
    if (jsonString[index] === "-")
      index++;
    while (jsonString[index] && !",]}".includes(jsonString[index]))
      index++;
    if (index == length && !(Allow.NUM & allow))
      markPartialJSON("Unterminated number literal");
    try {
      return JSON.parse(jsonString.substring(start, index));
    } catch (e6) {
      if (jsonString.substring(start, index) === "-" && Allow.NUM & allow)
        markPartialJSON("Not sure what '-' is");
      try {
        return JSON.parse(jsonString.substring(start, jsonString.lastIndexOf("e")));
      } catch (e7) {
        throwMalformedError(String(e7));
      }
    }
  }, "parseNum");
  const skipBlank = /* @__PURE__ */ __name(() => {
    while (index < length && " \n\r	".includes(jsonString[index])) {
      index++;
    }
  }, "skipBlank");
  return parseAny();
}, "_parseJSON");
var partialParse = /* @__PURE__ */ __name((input) => parseJSON(input, Allow.ALL ^ Allow.NUM), "partialParse");

// node_modules/openai/lib/ChatCompletionStream.mjs
var __classPrivateFieldSet5 = function(receiver, state, value, kind2, f2) {
  if (kind2 === "m") throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f2) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f2.call(receiver, value) : f2 ? f2.value = value : state.set(receiver, value), value;
};
var __classPrivateFieldGet6 = function(receiver, state, kind2, f2) {
  if (kind2 === "a" && !f2) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f2 : kind2 === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
};
var _ChatCompletionStream_instances;
var _ChatCompletionStream_params;
var _ChatCompletionStream_choiceEventStates;
var _ChatCompletionStream_currentChatCompletionSnapshot;
var _ChatCompletionStream_beginRequest;
var _ChatCompletionStream_getChoiceEventState;
var _ChatCompletionStream_addChunk;
var _ChatCompletionStream_emitToolCallDoneEvent;
var _ChatCompletionStream_emitContentDoneEvents;
var _ChatCompletionStream_endRequest;
var _ChatCompletionStream_getAutoParseableResponseFormat;
var _ChatCompletionStream_accumulateChatCompletion;
var ChatCompletionStream = class _ChatCompletionStream extends AbstractChatCompletionRunner {
  static {
    __name(this, "ChatCompletionStream");
  }
  constructor(params) {
    super();
    _ChatCompletionStream_instances.add(this);
    _ChatCompletionStream_params.set(this, void 0);
    _ChatCompletionStream_choiceEventStates.set(this, void 0);
    _ChatCompletionStream_currentChatCompletionSnapshot.set(this, void 0);
    __classPrivateFieldSet5(this, _ChatCompletionStream_params, params, "f");
    __classPrivateFieldSet5(this, _ChatCompletionStream_choiceEventStates, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return __classPrivateFieldGet6(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
  }
  /**
   * Intended for use on the frontend, consuming a stream produced with
   * `.toReadableStream()` on the backend.
   *
   * Note that messages sent to the model do not appear in `.on('message')`
   * in this context.
   */
  static fromReadableStream(stream) {
    const runner = new _ChatCompletionStream(null);
    runner._run(() => runner._fromReadableStream(stream));
    return runner;
  }
  static createChatCompletion(client, params, options) {
    const runner = new _ChatCompletionStream(params);
    runner._run(() => runner._runChatCompletion(client, { ...params, stream: true }, { ...options, headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" } }));
    return runner;
  }
  async _createChatCompletion(client, params, options) {
    super._createChatCompletion;
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_beginRequest).call(this);
    const stream = await client.chat.completions.create({ ...params, stream: true }, { ...options, signal: this.controller.signal });
    this._connected();
    for await (const chunk of stream) {
      __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_addChunk).call(this, chunk);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addChatCompletion(__classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
  }
  async _fromReadableStream(readableStream, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_beginRequest).call(this);
    this._connected();
    const stream = Stream.fromReadableStream(readableStream, this.controller);
    let chatId;
    for await (const chunk of stream) {
      if (chatId && chatId !== chunk.id) {
        this._addChatCompletion(__classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
      }
      __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_addChunk).call(this, chunk);
      chatId = chunk.id;
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addChatCompletion(__classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
  }
  [(_ChatCompletionStream_params = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_choiceEventStates = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_currentChatCompletionSnapshot = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_instances = /* @__PURE__ */ new WeakSet(), _ChatCompletionStream_beginRequest = /* @__PURE__ */ __name(function _ChatCompletionStream_beginRequest2() {
    if (this.ended)
      return;
    __classPrivateFieldSet5(this, _ChatCompletionStream_currentChatCompletionSnapshot, void 0, "f");
  }, "_ChatCompletionStream_beginRequest"), _ChatCompletionStream_getChoiceEventState = /* @__PURE__ */ __name(function _ChatCompletionStream_getChoiceEventState2(choice) {
    let state = __classPrivateFieldGet6(this, _ChatCompletionStream_choiceEventStates, "f")[choice.index];
    if (state) {
      return state;
    }
    state = {
      content_done: false,
      refusal_done: false,
      logprobs_content_done: false,
      logprobs_refusal_done: false,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    };
    __classPrivateFieldGet6(this, _ChatCompletionStream_choiceEventStates, "f")[choice.index] = state;
    return state;
  }, "_ChatCompletionStream_getChoiceEventState"), _ChatCompletionStream_addChunk = /* @__PURE__ */ __name(function _ChatCompletionStream_addChunk2(chunk) {
    if (this.ended)
      return;
    const completion = __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_accumulateChatCompletion).call(this, chunk);
    this._emit("chunk", chunk, completion);
    for (const choice of chunk.choices) {
      const choiceSnapshot = completion.choices[choice.index];
      if (choice.delta.content != null && choiceSnapshot.message?.role === "assistant" && choiceSnapshot.message?.content) {
        this._emit("content", choice.delta.content, choiceSnapshot.message.content);
        this._emit("content.delta", {
          delta: choice.delta.content,
          snapshot: choiceSnapshot.message.content,
          parsed: choiceSnapshot.message.parsed
        });
      }
      if (choice.delta.refusal != null && choiceSnapshot.message?.role === "assistant" && choiceSnapshot.message?.refusal) {
        this._emit("refusal.delta", {
          delta: choice.delta.refusal,
          snapshot: choiceSnapshot.message.refusal
        });
      }
      if (choice.logprobs?.content != null && choiceSnapshot.message?.role === "assistant") {
        this._emit("logprobs.content.delta", {
          content: choice.logprobs?.content,
          snapshot: choiceSnapshot.logprobs?.content ?? []
        });
      }
      if (choice.logprobs?.refusal != null && choiceSnapshot.message?.role === "assistant") {
        this._emit("logprobs.refusal.delta", {
          refusal: choice.logprobs?.refusal,
          snapshot: choiceSnapshot.logprobs?.refusal ?? []
        });
      }
      const state = __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
      if (choiceSnapshot.finish_reason) {
        __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitContentDoneEvents).call(this, choiceSnapshot);
        if (state.current_tool_call_index != null) {
          __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitToolCallDoneEvent).call(this, choiceSnapshot, state.current_tool_call_index);
        }
      }
      for (const toolCall of choice.delta.tool_calls ?? []) {
        if (state.current_tool_call_index !== toolCall.index) {
          __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitContentDoneEvents).call(this, choiceSnapshot);
          if (state.current_tool_call_index != null) {
            __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitToolCallDoneEvent).call(this, choiceSnapshot, state.current_tool_call_index);
          }
        }
        state.current_tool_call_index = toolCall.index;
      }
      for (const toolCallDelta of choice.delta.tool_calls ?? []) {
        const toolCallSnapshot = choiceSnapshot.message.tool_calls?.[toolCallDelta.index];
        if (!toolCallSnapshot?.type) {
          continue;
        }
        if (toolCallSnapshot?.type === "function") {
          this._emit("tool_calls.function.arguments.delta", {
            name: toolCallSnapshot.function?.name,
            index: toolCallDelta.index,
            arguments: toolCallSnapshot.function.arguments,
            parsed_arguments: toolCallSnapshot.function.parsed_arguments,
            arguments_delta: toolCallDelta.function?.arguments ?? ""
          });
        } else {
          assertNever2(toolCallSnapshot?.type);
        }
      }
    }
  }, "_ChatCompletionStream_addChunk"), _ChatCompletionStream_emitToolCallDoneEvent = /* @__PURE__ */ __name(function _ChatCompletionStream_emitToolCallDoneEvent2(choiceSnapshot, toolCallIndex) {
    const state = __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
    if (state.done_tool_calls.has(toolCallIndex)) {
      return;
    }
    const toolCallSnapshot = choiceSnapshot.message.tool_calls?.[toolCallIndex];
    if (!toolCallSnapshot) {
      throw new Error("no tool call snapshot");
    }
    if (!toolCallSnapshot.type) {
      throw new Error("tool call snapshot missing `type`");
    }
    if (toolCallSnapshot.type === "function") {
      const inputTool = __classPrivateFieldGet6(this, _ChatCompletionStream_params, "f")?.tools?.find((tool) => tool.type === "function" && tool.function.name === toolCallSnapshot.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: toolCallSnapshot.function.name,
        index: toolCallIndex,
        arguments: toolCallSnapshot.function.arguments,
        parsed_arguments: isAutoParsableTool(inputTool) ? inputTool.$parseRaw(toolCallSnapshot.function.arguments) : inputTool?.function.strict ? JSON.parse(toolCallSnapshot.function.arguments) : null
      });
    } else {
      assertNever2(toolCallSnapshot.type);
    }
  }, "_ChatCompletionStream_emitToolCallDoneEvent"), _ChatCompletionStream_emitContentDoneEvents = /* @__PURE__ */ __name(function _ChatCompletionStream_emitContentDoneEvents2(choiceSnapshot) {
    const state = __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
    if (choiceSnapshot.message.content && !state.content_done) {
      state.content_done = true;
      const responseFormat = __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getAutoParseableResponseFormat).call(this);
      this._emit("content.done", {
        content: choiceSnapshot.message.content,
        parsed: responseFormat ? responseFormat.$parseRaw(choiceSnapshot.message.content) : null
      });
    }
    if (choiceSnapshot.message.refusal && !state.refusal_done) {
      state.refusal_done = true;
      this._emit("refusal.done", { refusal: choiceSnapshot.message.refusal });
    }
    if (choiceSnapshot.logprobs?.content && !state.logprobs_content_done) {
      state.logprobs_content_done = true;
      this._emit("logprobs.content.done", { content: choiceSnapshot.logprobs.content });
    }
    if (choiceSnapshot.logprobs?.refusal && !state.logprobs_refusal_done) {
      state.logprobs_refusal_done = true;
      this._emit("logprobs.refusal.done", { refusal: choiceSnapshot.logprobs.refusal });
    }
  }, "_ChatCompletionStream_emitContentDoneEvents"), _ChatCompletionStream_endRequest = /* @__PURE__ */ __name(function _ChatCompletionStream_endRequest2() {
    if (this.ended) {
      throw new OpenAIError(`stream has ended, this shouldn't happen`);
    }
    const snapshot = __classPrivateFieldGet6(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
    if (!snapshot) {
      throw new OpenAIError(`request ended without sending any chunks`);
    }
    __classPrivateFieldSet5(this, _ChatCompletionStream_currentChatCompletionSnapshot, void 0, "f");
    __classPrivateFieldSet5(this, _ChatCompletionStream_choiceEventStates, [], "f");
    return finalizeChatCompletion(snapshot, __classPrivateFieldGet6(this, _ChatCompletionStream_params, "f"));
  }, "_ChatCompletionStream_endRequest"), _ChatCompletionStream_getAutoParseableResponseFormat = /* @__PURE__ */ __name(function _ChatCompletionStream_getAutoParseableResponseFormat2() {
    const responseFormat = __classPrivateFieldGet6(this, _ChatCompletionStream_params, "f")?.response_format;
    if (isAutoParsableResponseFormat(responseFormat)) {
      return responseFormat;
    }
    return null;
  }, "_ChatCompletionStream_getAutoParseableResponseFormat"), _ChatCompletionStream_accumulateChatCompletion = /* @__PURE__ */ __name(function _ChatCompletionStream_accumulateChatCompletion2(chunk) {
    var _a3, _b, _c2, _d;
    let snapshot = __classPrivateFieldGet6(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
    const { choices, ...rest } = chunk;
    if (!snapshot) {
      snapshot = __classPrivateFieldSet5(this, _ChatCompletionStream_currentChatCompletionSnapshot, {
        ...rest,
        choices: []
      }, "f");
    } else {
      Object.assign(snapshot, rest);
    }
    for (const { delta, finish_reason, index, logprobs = null, ...other } of chunk.choices) {
      let choice = snapshot.choices[index];
      if (!choice) {
        choice = snapshot.choices[index] = { finish_reason, index, message: {}, logprobs, ...other };
      }
      if (logprobs) {
        if (!choice.logprobs) {
          choice.logprobs = Object.assign({}, logprobs);
        } else {
          const { content: content2, refusal: refusal2, ...rest3 } = logprobs;
          assertIsEmpty(rest3);
          Object.assign(choice.logprobs, rest3);
          if (content2) {
            (_a3 = choice.logprobs).content ?? (_a3.content = []);
            choice.logprobs.content.push(...content2);
          }
          if (refusal2) {
            (_b = choice.logprobs).refusal ?? (_b.refusal = []);
            choice.logprobs.refusal.push(...refusal2);
          }
        }
      }
      if (finish_reason) {
        choice.finish_reason = finish_reason;
        if (__classPrivateFieldGet6(this, _ChatCompletionStream_params, "f") && hasAutoParseableInput(__classPrivateFieldGet6(this, _ChatCompletionStream_params, "f"))) {
          if (finish_reason === "length") {
            throw new LengthFinishReasonError();
          }
          if (finish_reason === "content_filter") {
            throw new ContentFilterFinishReasonError();
          }
        }
      }
      Object.assign(choice, other);
      if (!delta)
        continue;
      const { content, refusal, function_call, role, tool_calls, ...rest2 } = delta;
      assertIsEmpty(rest2);
      Object.assign(choice.message, rest2);
      if (refusal) {
        choice.message.refusal = (choice.message.refusal || "") + refusal;
      }
      if (role)
        choice.message.role = role;
      if (function_call) {
        if (!choice.message.function_call) {
          choice.message.function_call = function_call;
        } else {
          if (function_call.name)
            choice.message.function_call.name = function_call.name;
          if (function_call.arguments) {
            (_c2 = choice.message.function_call).arguments ?? (_c2.arguments = "");
            choice.message.function_call.arguments += function_call.arguments;
          }
        }
      }
      if (content) {
        choice.message.content = (choice.message.content || "") + content;
        if (!choice.message.refusal && __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getAutoParseableResponseFormat).call(this)) {
          choice.message.parsed = partialParse(choice.message.content);
        }
      }
      if (tool_calls) {
        if (!choice.message.tool_calls)
          choice.message.tool_calls = [];
        for (const { index: index2, id: id2, type, function: fn2, ...rest3 } of tool_calls) {
          const tool_call = (_d = choice.message.tool_calls)[index2] ?? (_d[index2] = {});
          Object.assign(tool_call, rest3);
          if (id2)
            tool_call.id = id2;
          if (type)
            tool_call.type = type;
          if (fn2)
            tool_call.function ?? (tool_call.function = { name: fn2.name ?? "", arguments: "" });
          if (fn2?.name)
            tool_call.function.name = fn2.name;
          if (fn2?.arguments) {
            tool_call.function.arguments += fn2.arguments;
            if (shouldParseToolCall(__classPrivateFieldGet6(this, _ChatCompletionStream_params, "f"), tool_call)) {
              tool_call.function.parsed_arguments = partialParse(tool_call.function.arguments);
            }
          }
        }
      }
    }
    return snapshot;
  }, "_ChatCompletionStream_accumulateChatCompletion"), Symbol.asyncIterator)]() {
    const pushQueue = [];
    const readQueue = [];
    let done = false;
    this.on("chunk", (chunk) => {
      const reader = readQueue.shift();
      if (reader) {
        reader.resolve(chunk);
      } else {
        pushQueue.push(chunk);
      }
    });
    this.on("end", () => {
      done = true;
      for (const reader of readQueue) {
        reader.resolve(void 0);
      }
      readQueue.length = 0;
    });
    this.on("abort", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    this.on("error", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    return {
      next: /* @__PURE__ */ __name(async () => {
        if (!pushQueue.length) {
          if (done) {
            return { value: void 0, done: true };
          }
          return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: void 0, done: true });
        }
        const chunk = pushQueue.shift();
        return { value: chunk, done: false };
      }, "next"),
      return: /* @__PURE__ */ __name(async () => {
        this.abort();
        return { value: void 0, done: true };
      }, "return")
    };
  }
  toReadableStream() {
    const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
    return stream.toReadableStream();
  }
};
function finalizeChatCompletion(snapshot, params) {
  const { id: id2, choices, created, model, system_fingerprint, ...rest } = snapshot;
  const completion = {
    ...rest,
    id: id2,
    choices: choices.map(({ message, finish_reason, index, logprobs, ...choiceRest }) => {
      if (!finish_reason) {
        throw new OpenAIError(`missing finish_reason for choice ${index}`);
      }
      const { content = null, function_call, tool_calls, ...messageRest } = message;
      const role = message.role;
      if (!role) {
        throw new OpenAIError(`missing role for choice ${index}`);
      }
      if (function_call) {
        const { arguments: args, name: name2 } = function_call;
        if (args == null) {
          throw new OpenAIError(`missing function_call.arguments for choice ${index}`);
        }
        if (!name2) {
          throw new OpenAIError(`missing function_call.name for choice ${index}`);
        }
        return {
          ...choiceRest,
          message: {
            content,
            function_call: { arguments: args, name: name2 },
            role,
            refusal: message.refusal ?? null
          },
          finish_reason,
          index,
          logprobs
        };
      }
      if (tool_calls) {
        return {
          ...choiceRest,
          index,
          finish_reason,
          logprobs,
          message: {
            ...messageRest,
            role,
            content,
            refusal: message.refusal ?? null,
            tool_calls: tool_calls.map((tool_call, i) => {
              const { function: fn2, type, id: id3, ...toolRest } = tool_call;
              const { arguments: args, name: name2, ...fnRest } = fn2 || {};
              if (id3 == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].id
${str(snapshot)}`);
              }
              if (type == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].type
${str(snapshot)}`);
              }
              if (name2 == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].function.name
${str(snapshot)}`);
              }
              if (args == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].function.arguments
${str(snapshot)}`);
              }
              return { ...toolRest, id: id3, type, function: { ...fnRest, name: name2, arguments: args } };
            })
          }
        };
      }
      return {
        ...choiceRest,
        message: { ...messageRest, content, role, refusal: message.refusal ?? null },
        finish_reason,
        index,
        logprobs
      };
    }),
    created,
    model,
    object: "chat.completion",
    ...system_fingerprint ? { system_fingerprint } : {}
  };
  return maybeParseChatCompletion(completion, params);
}
__name(finalizeChatCompletion, "finalizeChatCompletion");
function str(x3) {
  return JSON.stringify(x3);
}
__name(str, "str");
function assertIsEmpty(obj) {
  return;
}
__name(assertIsEmpty, "assertIsEmpty");
function assertNever2(_x) {
}
__name(assertNever2, "assertNever");

// node_modules/openai/lib/ChatCompletionStreamingRunner.mjs
var ChatCompletionStreamingRunner = class _ChatCompletionStreamingRunner extends ChatCompletionStream {
  static {
    __name(this, "ChatCompletionStreamingRunner");
  }
  static fromReadableStream(stream) {
    const runner = new _ChatCompletionStreamingRunner(null);
    runner._run(() => runner._fromReadableStream(stream));
    return runner;
  }
  /** @deprecated - please use `runTools` instead. */
  static runFunctions(client, params, options) {
    const runner = new _ChatCompletionStreamingRunner(null);
    const opts = {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "runFunctions" }
    };
    runner._run(() => runner._runFunctions(client, params, opts));
    return runner;
  }
  static runTools(client, params, options) {
    const runner = new _ChatCompletionStreamingRunner(
      // @ts-expect-error TODO these types are incompatible
      params
    );
    const opts = {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "runTools" }
    };
    runner._run(() => runner._runTools(client, params, opts));
    return runner;
  }
};

// node_modules/openai/resources/beta/chat/completions.mjs
var Completions2 = class extends APIResource {
  static {
    __name(this, "Completions");
  }
  parse(body, options) {
    validateInputTools(body.tools);
    return this._client.chat.completions.create(body, {
      ...options,
      headers: {
        ...options?.headers,
        "X-Stainless-Helper-Method": "beta.chat.completions.parse"
      }
    })._thenUnwrap((completion) => parseChatCompletion(completion, body));
  }
  runFunctions(body, options) {
    if (body.stream) {
      return ChatCompletionStreamingRunner.runFunctions(this._client, body, options);
    }
    return ChatCompletionRunner.runFunctions(this._client, body, options);
  }
  runTools(body, options) {
    if (body.stream) {
      return ChatCompletionStreamingRunner.runTools(this._client, body, options);
    }
    return ChatCompletionRunner.runTools(this._client, body, options);
  }
  /**
   * Creates a chat completion stream
   */
  stream(body, options) {
    return ChatCompletionStream.createChatCompletion(this._client, body, options);
  }
};

// node_modules/openai/resources/beta/chat/chat.mjs
var Chat2 = class extends APIResource {
  static {
    __name(this, "Chat");
  }
  constructor() {
    super(...arguments);
    this.completions = new Completions2(this._client);
  }
};
(function(Chat3) {
  Chat3.Completions = Completions2;
})(Chat2 || (Chat2 = {}));

// node_modules/openai/resources/beta/realtime/realtime.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/beta/realtime/sessions.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Sessions = class extends APIResource {
  static {
    __name(this, "Sessions");
  }
  /**
   * Create an ephemeral API token for use in client-side applications with the
   * Realtime API. Can be configured with the same session parameters as the
   * `session.update` client event.
   *
   * It responds with a session object, plus a `client_secret` key which contains a
   * usable ephemeral API token that can be used to authenticate browser clients for
   * the Realtime API.
   *
   * @example
   * ```ts
   * const session =
   *   await client.beta.realtime.sessions.create();
   * ```
   */
  create(body, options) {
    return this._client.post("/realtime/sessions", {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
};

// node_modules/openai/resources/beta/realtime/transcription-sessions.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var TranscriptionSessions = class extends APIResource {
  static {
    __name(this, "TranscriptionSessions");
  }
  /**
   * Create an ephemeral API token for use in client-side applications with the
   * Realtime API specifically for realtime transcriptions. Can be configured with
   * the same session parameters as the `transcription_session.update` client event.
   *
   * It responds with a session object, plus a `client_secret` key which contains a
   * usable ephemeral API token that can be used to authenticate browser clients for
   * the Realtime API.
   *
   * @example
   * ```ts
   * const transcriptionSession =
   *   await client.beta.realtime.transcriptionSessions.create();
   * ```
   */
  create(body, options) {
    return this._client.post("/realtime/transcription_sessions", {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
};

// node_modules/openai/resources/beta/realtime/realtime.mjs
var Realtime = class extends APIResource {
  static {
    __name(this, "Realtime");
  }
  constructor() {
    super(...arguments);
    this.sessions = new Sessions(this._client);
    this.transcriptionSessions = new TranscriptionSessions(this._client);
  }
};
Realtime.Sessions = Sessions;
Realtime.TranscriptionSessions = TranscriptionSessions;

// node_modules/openai/resources/beta/threads/threads.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/beta/threads/messages.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Messages2 = class extends APIResource {
  static {
    __name(this, "Messages");
  }
  /**
   * Create a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  create(threadId, body, options) {
    return this._client.post(`/threads/${threadId}/messages`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Retrieve a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(threadId, messageId, options) {
    return this._client.get(`/threads/${threadId}/messages/${messageId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Modifies a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(threadId, messageId, body, options) {
    return this._client.post(`/threads/${threadId}/messages/${messageId}`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  list(threadId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(threadId, {}, query);
    }
    return this._client.getAPIList(`/threads/${threadId}/messages`, MessagesPage, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Deletes a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  del(threadId, messageId, options) {
    return this._client.delete(`/threads/${threadId}/messages/${messageId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
};
var MessagesPage = class extends CursorPage {
  static {
    __name(this, "MessagesPage");
  }
};
Messages2.MessagesPage = MessagesPage;

// node_modules/openai/resources/beta/threads/runs/runs.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/beta/threads/runs/steps.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Steps = class extends APIResource {
  static {
    __name(this, "Steps");
  }
  retrieve(threadId, runId, stepId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.retrieve(threadId, runId, stepId, {}, query);
    }
    return this._client.get(`/threads/${threadId}/runs/${runId}/steps/${stepId}`, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  list(threadId, runId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(threadId, runId, {}, query);
    }
    return this._client.getAPIList(`/threads/${threadId}/runs/${runId}/steps`, RunStepsPage, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
};
var RunStepsPage = class extends CursorPage {
  static {
    __name(this, "RunStepsPage");
  }
};
Steps.RunStepsPage = RunStepsPage;

// node_modules/openai/resources/beta/threads/runs/runs.mjs
var Runs = class extends APIResource {
  static {
    __name(this, "Runs");
  }
  constructor() {
    super(...arguments);
    this.steps = new Steps(this._client);
  }
  create(threadId, params, options) {
    const { include, ...body } = params;
    return this._client.post(`/threads/${threadId}/runs`, {
      query: { include },
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers },
      stream: params.stream ?? false
    });
  }
  /**
   * Retrieves a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(threadId, runId, options) {
    return this._client.get(`/threads/${threadId}/runs/${runId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Modifies a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(threadId, runId, body, options) {
    return this._client.post(`/threads/${threadId}/runs/${runId}`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  list(threadId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(threadId, {}, query);
    }
    return this._client.getAPIList(`/threads/${threadId}/runs`, RunsPage, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Cancels a run that is `in_progress`.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  cancel(threadId, runId, options) {
    return this._client.post(`/threads/${threadId}/runs/${runId}/cancel`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * A helper to create a run an poll for a terminal state. More information on Run
   * lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async createAndPoll(threadId, body, options) {
    const run = await this.create(threadId, body, options);
    return await this.poll(threadId, run.id, options);
  }
  /**
   * Create a Run stream
   *
   * @deprecated use `stream` instead
   */
  createAndStream(threadId, body, options) {
    return AssistantStream.createAssistantStream(threadId, this._client.beta.threads.runs, body, options);
  }
  /**
   * A helper to poll a run status until it reaches a terminal state. More
   * information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async poll(threadId, runId, options) {
    const headers = { ...options?.headers, "X-Stainless-Poll-Helper": "true" };
    if (options?.pollIntervalMs) {
      headers["X-Stainless-Custom-Poll-Interval"] = options.pollIntervalMs.toString();
    }
    while (true) {
      const { data: run, response } = await this.retrieve(threadId, runId, {
        ...options,
        headers: { ...options?.headers, ...headers }
      }).withResponse();
      switch (run.status) {
        //If we are in any sort of intermediate state we poll
        case "queued":
        case "in_progress":
        case "cancelling":
          let sleepInterval = 5e3;
          if (options?.pollIntervalMs) {
            sleepInterval = options.pollIntervalMs;
          } else {
            const headerInterval = response.headers.get("openai-poll-after-ms");
            if (headerInterval) {
              const headerIntervalMs = parseInt(headerInterval);
              if (!isNaN(headerIntervalMs)) {
                sleepInterval = headerIntervalMs;
              }
            }
          }
          await sleep(sleepInterval);
          break;
        //We return the run in any terminal state.
        case "requires_action":
        case "incomplete":
        case "cancelled":
        case "completed":
        case "failed":
        case "expired":
          return run;
      }
    }
  }
  /**
   * Create a Run stream
   */
  stream(threadId, body, options) {
    return AssistantStream.createAssistantStream(threadId, this._client.beta.threads.runs, body, options);
  }
  submitToolOutputs(threadId, runId, body, options) {
    return this._client.post(`/threads/${threadId}/runs/${runId}/submit_tool_outputs`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers },
      stream: body.stream ?? false
    });
  }
  /**
   * A helper to submit a tool output to a run and poll for a terminal run state.
   * More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async submitToolOutputsAndPoll(threadId, runId, body, options) {
    const run = await this.submitToolOutputs(threadId, runId, body, options);
    return await this.poll(threadId, run.id, options);
  }
  /**
   * Submit the tool outputs from a previous run and stream the run to a terminal
   * state. More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  submitToolOutputsStream(threadId, runId, body, options) {
    return AssistantStream.createToolAssistantStream(threadId, runId, this._client.beta.threads.runs, body, options);
  }
};
var RunsPage = class extends CursorPage {
  static {
    __name(this, "RunsPage");
  }
};
Runs.RunsPage = RunsPage;
Runs.Steps = Steps;
Runs.RunStepsPage = RunStepsPage;

// node_modules/openai/resources/beta/threads/threads.mjs
var Threads = class extends APIResource {
  static {
    __name(this, "Threads");
  }
  constructor() {
    super(...arguments);
    this.runs = new Runs(this._client);
    this.messages = new Messages2(this._client);
  }
  create(body = {}, options) {
    if (isRequestOptions(body)) {
      return this.create({}, body);
    }
    return this._client.post("/threads", {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Retrieves a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(threadId, options) {
    return this._client.get(`/threads/${threadId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Modifies a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(threadId, body, options) {
    return this._client.post(`/threads/${threadId}`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Delete a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  del(threadId, options) {
    return this._client.delete(`/threads/${threadId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  createAndRun(body, options) {
    return this._client.post("/threads/runs", {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers },
      stream: body.stream ?? false
    });
  }
  /**
   * A helper to create a thread, start a run and then poll for a terminal state.
   * More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async createAndRunPoll(body, options) {
    const run = await this.createAndRun(body, options);
    return await this.runs.poll(run.thread_id, run.id, options);
  }
  /**
   * Create a thread and stream the run back
   */
  createAndRunStream(body, options) {
    return AssistantStream.createThreadAssistantStream(body, this._client.beta.threads, options);
  }
};
Threads.Runs = Runs;
Threads.RunsPage = RunsPage;
Threads.Messages = Messages2;
Threads.MessagesPage = MessagesPage;

// node_modules/openai/resources/beta/beta.mjs
var Beta = class extends APIResource {
  static {
    __name(this, "Beta");
  }
  constructor() {
    super(...arguments);
    this.realtime = new Realtime(this._client);
    this.chat = new Chat2(this._client);
    this.assistants = new Assistants(this._client);
    this.threads = new Threads(this._client);
  }
};
Beta.Realtime = Realtime;
Beta.Assistants = Assistants;
Beta.AssistantsPage = AssistantsPage;
Beta.Threads = Threads;

// node_modules/openai/resources/completions.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Completions3 = class extends APIResource {
  static {
    __name(this, "Completions");
  }
  create(body, options) {
    return this._client.post("/completions", { body, ...options, stream: body.stream ?? false });
  }
};

// node_modules/openai/resources/containers/containers.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/containers/files/files.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/containers/files/content.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Content = class extends APIResource {
  static {
    __name(this, "Content");
  }
  /**
   * Retrieve Container File Content
   */
  retrieve(containerId, fileId, options) {
    return this._client.get(`/containers/${containerId}/files/${fileId}/content`, {
      ...options,
      headers: { Accept: "application/binary", ...options?.headers },
      __binaryResponse: true
    });
  }
};

// node_modules/openai/resources/containers/files/files.mjs
var Files = class extends APIResource {
  static {
    __name(this, "Files");
  }
  constructor() {
    super(...arguments);
    this.content = new Content(this._client);
  }
  /**
   * Create a Container File
   *
   * You can send either a multipart/form-data request with the raw file content, or
   * a JSON request with a file ID.
   */
  create(containerId, body, options) {
    return this._client.post(`/containers/${containerId}/files`, multipartFormRequestOptions({ body, ...options }));
  }
  /**
   * Retrieve Container File
   */
  retrieve(containerId, fileId, options) {
    return this._client.get(`/containers/${containerId}/files/${fileId}`, options);
  }
  list(containerId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(containerId, {}, query);
    }
    return this._client.getAPIList(`/containers/${containerId}/files`, FileListResponsesPage, {
      query,
      ...options
    });
  }
  /**
   * Delete Container File
   */
  del(containerId, fileId, options) {
    return this._client.delete(`/containers/${containerId}/files/${fileId}`, {
      ...options,
      headers: { Accept: "*/*", ...options?.headers }
    });
  }
};
var FileListResponsesPage = class extends CursorPage {
  static {
    __name(this, "FileListResponsesPage");
  }
};
Files.FileListResponsesPage = FileListResponsesPage;
Files.Content = Content;

// node_modules/openai/resources/containers/containers.mjs
var Containers = class extends APIResource {
  static {
    __name(this, "Containers");
  }
  constructor() {
    super(...arguments);
    this.files = new Files(this._client);
  }
  /**
   * Create Container
   */
  create(body, options) {
    return this._client.post("/containers", { body, ...options });
  }
  /**
   * Retrieve Container
   */
  retrieve(containerId, options) {
    return this._client.get(`/containers/${containerId}`, options);
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/containers", ContainerListResponsesPage, { query, ...options });
  }
  /**
   * Delete Container
   */
  del(containerId, options) {
    return this._client.delete(`/containers/${containerId}`, {
      ...options,
      headers: { Accept: "*/*", ...options?.headers }
    });
  }
};
var ContainerListResponsesPage = class extends CursorPage {
  static {
    __name(this, "ContainerListResponsesPage");
  }
};
Containers.ContainerListResponsesPage = ContainerListResponsesPage;
Containers.Files = Files;
Containers.FileListResponsesPage = FileListResponsesPage;

// node_modules/openai/resources/embeddings.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Embeddings = class extends APIResource {
  static {
    __name(this, "Embeddings");
  }
  /**
   * Creates an embedding vector representing the input text.
   *
   * @example
   * ```ts
   * const createEmbeddingResponse =
   *   await client.embeddings.create({
   *     input: 'The quick brown fox jumped over the lazy dog',
   *     model: 'text-embedding-3-small',
   *   });
   * ```
   */
  create(body, options) {
    const hasUserProvidedEncodingFormat = !!body.encoding_format;
    let encoding_format = hasUserProvidedEncodingFormat ? body.encoding_format : "base64";
    if (hasUserProvidedEncodingFormat) {
      debug3("Request", "User defined encoding_format:", body.encoding_format);
    }
    const response = this._client.post("/embeddings", {
      body: {
        ...body,
        encoding_format
      },
      ...options
    });
    if (hasUserProvidedEncodingFormat) {
      return response;
    }
    debug3("response", "Decoding base64 embeddings to float32 array");
    return response._thenUnwrap((response2) => {
      if (response2 && response2.data) {
        response2.data.forEach((embeddingBase64Obj) => {
          const embeddingBase64Str = embeddingBase64Obj.embedding;
          embeddingBase64Obj.embedding = toFloat32Array(embeddingBase64Str);
        });
      }
      return response2;
    });
  }
};

// node_modules/openai/resources/evals/evals.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/evals/runs/runs.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/evals/runs/output-items.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var OutputItems = class extends APIResource {
  static {
    __name(this, "OutputItems");
  }
  /**
   * Get an evaluation run output item by ID.
   */
  retrieve(evalId, runId, outputItemId, options) {
    return this._client.get(`/evals/${evalId}/runs/${runId}/output_items/${outputItemId}`, options);
  }
  list(evalId, runId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(evalId, runId, {}, query);
    }
    return this._client.getAPIList(`/evals/${evalId}/runs/${runId}/output_items`, OutputItemListResponsesPage, { query, ...options });
  }
};
var OutputItemListResponsesPage = class extends CursorPage {
  static {
    __name(this, "OutputItemListResponsesPage");
  }
};
OutputItems.OutputItemListResponsesPage = OutputItemListResponsesPage;

// node_modules/openai/resources/evals/runs/runs.mjs
var Runs2 = class extends APIResource {
  static {
    __name(this, "Runs");
  }
  constructor() {
    super(...arguments);
    this.outputItems = new OutputItems(this._client);
  }
  /**
   * Kicks off a new run for a given evaluation, specifying the data source, and what
   * model configuration to use to test. The datasource will be validated against the
   * schema specified in the config of the evaluation.
   */
  create(evalId, body, options) {
    return this._client.post(`/evals/${evalId}/runs`, { body, ...options });
  }
  /**
   * Get an evaluation run by ID.
   */
  retrieve(evalId, runId, options) {
    return this._client.get(`/evals/${evalId}/runs/${runId}`, options);
  }
  list(evalId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(evalId, {}, query);
    }
    return this._client.getAPIList(`/evals/${evalId}/runs`, RunListResponsesPage, { query, ...options });
  }
  /**
   * Delete an eval run.
   */
  del(evalId, runId, options) {
    return this._client.delete(`/evals/${evalId}/runs/${runId}`, options);
  }
  /**
   * Cancel an ongoing evaluation run.
   */
  cancel(evalId, runId, options) {
    return this._client.post(`/evals/${evalId}/runs/${runId}`, options);
  }
};
var RunListResponsesPage = class extends CursorPage {
  static {
    __name(this, "RunListResponsesPage");
  }
};
Runs2.RunListResponsesPage = RunListResponsesPage;
Runs2.OutputItems = OutputItems;
Runs2.OutputItemListResponsesPage = OutputItemListResponsesPage;

// node_modules/openai/resources/evals/evals.mjs
var Evals = class extends APIResource {
  static {
    __name(this, "Evals");
  }
  constructor() {
    super(...arguments);
    this.runs = new Runs2(this._client);
  }
  /**
   * Create the structure of an evaluation that can be used to test a model's
   * performance. An evaluation is a set of testing criteria and the config for a
   * data source, which dictates the schema of the data used in the evaluation. After
   * creating an evaluation, you can run it on different models and model parameters.
   * We support several types of graders and datasources. For more information, see
   * the [Evals guide](https://platform.openai.com/docs/guides/evals).
   */
  create(body, options) {
    return this._client.post("/evals", { body, ...options });
  }
  /**
   * Get an evaluation by ID.
   */
  retrieve(evalId, options) {
    return this._client.get(`/evals/${evalId}`, options);
  }
  /**
   * Update certain properties of an evaluation.
   */
  update(evalId, body, options) {
    return this._client.post(`/evals/${evalId}`, { body, ...options });
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/evals", EvalListResponsesPage, { query, ...options });
  }
  /**
   * Delete an evaluation.
   */
  del(evalId, options) {
    return this._client.delete(`/evals/${evalId}`, options);
  }
};
var EvalListResponsesPage = class extends CursorPage {
  static {
    __name(this, "EvalListResponsesPage");
  }
};
Evals.EvalListResponsesPage = EvalListResponsesPage;
Evals.Runs = Runs2;
Evals.RunListResponsesPage = RunListResponsesPage;

// node_modules/openai/resources/files.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Files2 = class extends APIResource {
  static {
    __name(this, "Files");
  }
  /**
   * Upload a file that can be used across various endpoints. Individual files can be
   * up to 512 MB, and the size of all files uploaded by one organization can be up
   * to 100 GB.
   *
   * The Assistants API supports files up to 2 million tokens and of specific file
   * types. See the
   * [Assistants Tools guide](https://platform.openai.com/docs/assistants/tools) for
   * details.
   *
   * The Fine-tuning API only supports `.jsonl` files. The input also has certain
   * required formats for fine-tuning
   * [chat](https://platform.openai.com/docs/api-reference/fine-tuning/chat-input) or
   * [completions](https://platform.openai.com/docs/api-reference/fine-tuning/completions-input)
   * models.
   *
   * The Batch API only supports `.jsonl` files up to 200 MB in size. The input also
   * has a specific required
   * [format](https://platform.openai.com/docs/api-reference/batch/request-input).
   *
   * Please [contact us](https://help.openai.com/) if you need to increase these
   * storage limits.
   */
  create(body, options) {
    return this._client.post("/files", multipartFormRequestOptions({ body, ...options }));
  }
  /**
   * Returns information about a specific file.
   */
  retrieve(fileId, options) {
    return this._client.get(`/files/${fileId}`, options);
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/files", FileObjectsPage, { query, ...options });
  }
  /**
   * Delete a file.
   */
  del(fileId, options) {
    return this._client.delete(`/files/${fileId}`, options);
  }
  /**
   * Returns the contents of the specified file.
   */
  content(fileId, options) {
    return this._client.get(`/files/${fileId}/content`, {
      ...options,
      headers: { Accept: "application/binary", ...options?.headers },
      __binaryResponse: true
    });
  }
  /**
   * Returns the contents of the specified file.
   *
   * @deprecated The `.content()` method should be used instead
   */
  retrieveContent(fileId, options) {
    return this._client.get(`/files/${fileId}/content`, options);
  }
  /**
   * Waits for the given file to be processed, default timeout is 30 mins.
   */
  async waitForProcessing(id2, { pollInterval = 5e3, maxWait = 30 * 60 * 1e3 } = {}) {
    const TERMINAL_STATES = /* @__PURE__ */ new Set(["processed", "error", "deleted"]);
    const start = Date.now();
    let file = await this.retrieve(id2);
    while (!file.status || !TERMINAL_STATES.has(file.status)) {
      await sleep(pollInterval);
      file = await this.retrieve(id2);
      if (Date.now() - start > maxWait) {
        throw new APIConnectionTimeoutError({
          message: `Giving up on waiting for file ${id2} to finish processing after ${maxWait} milliseconds.`
        });
      }
    }
    return file;
  }
};
var FileObjectsPage = class extends CursorPage {
  static {
    __name(this, "FileObjectsPage");
  }
};
Files2.FileObjectsPage = FileObjectsPage;

// node_modules/openai/resources/fine-tuning/fine-tuning.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/fine-tuning/methods.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Methods = class extends APIResource {
  static {
    __name(this, "Methods");
  }
};

// node_modules/openai/resources/fine-tuning/alpha/alpha.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/fine-tuning/alpha/graders.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Graders = class extends APIResource {
  static {
    __name(this, "Graders");
  }
  /**
   * Run a grader.
   *
   * @example
   * ```ts
   * const response = await client.fineTuning.alpha.graders.run({
   *   grader: {
   *     input: 'input',
   *     name: 'name',
   *     operation: 'eq',
   *     reference: 'reference',
   *     type: 'string_check',
   *   },
   *   model_sample: 'model_sample',
   *   reference_answer: 'string',
   * });
   * ```
   */
  run(body, options) {
    return this._client.post("/fine_tuning/alpha/graders/run", { body, ...options });
  }
  /**
   * Validate a grader.
   *
   * @example
   * ```ts
   * const response =
   *   await client.fineTuning.alpha.graders.validate({
   *     grader: {
   *       input: 'input',
   *       name: 'name',
   *       operation: 'eq',
   *       reference: 'reference',
   *       type: 'string_check',
   *     },
   *   });
   * ```
   */
  validate(body, options) {
    return this._client.post("/fine_tuning/alpha/graders/validate", { body, ...options });
  }
};

// node_modules/openai/resources/fine-tuning/alpha/alpha.mjs
var Alpha = class extends APIResource {
  static {
    __name(this, "Alpha");
  }
  constructor() {
    super(...arguments);
    this.graders = new Graders(this._client);
  }
};
Alpha.Graders = Graders;

// node_modules/openai/resources/fine-tuning/checkpoints/checkpoints.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/fine-tuning/checkpoints/permissions.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Permissions = class extends APIResource {
  static {
    __name(this, "Permissions");
  }
  /**
   * **NOTE:** Calling this endpoint requires an [admin API key](../admin-api-keys).
   *
   * This enables organization owners to share fine-tuned models with other projects
   * in their organization.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const permissionCreateResponse of client.fineTuning.checkpoints.permissions.create(
   *   'ft:gpt-4o-mini-2024-07-18:org:weather:B7R9VjQd',
   *   { project_ids: ['string'] },
   * )) {
   *   // ...
   * }
   * ```
   */
  create(fineTunedModelCheckpoint, body, options) {
    return this._client.getAPIList(`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions`, PermissionCreateResponsesPage, { body, method: "post", ...options });
  }
  retrieve(fineTunedModelCheckpoint, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.retrieve(fineTunedModelCheckpoint, {}, query);
    }
    return this._client.get(`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions`, {
      query,
      ...options
    });
  }
  /**
   * **NOTE:** This endpoint requires an [admin API key](../admin-api-keys).
   *
   * Organization owners can use this endpoint to delete a permission for a
   * fine-tuned model checkpoint.
   *
   * @example
   * ```ts
   * const permission =
   *   await client.fineTuning.checkpoints.permissions.del(
   *     'ft:gpt-4o-mini-2024-07-18:org:weather:B7R9VjQd',
   *     'cp_zc4Q7MP6XxulcVzj4MZdwsAB',
   *   );
   * ```
   */
  del(fineTunedModelCheckpoint, permissionId, options) {
    return this._client.delete(`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions/${permissionId}`, options);
  }
};
var PermissionCreateResponsesPage = class extends Page {
  static {
    __name(this, "PermissionCreateResponsesPage");
  }
};
Permissions.PermissionCreateResponsesPage = PermissionCreateResponsesPage;

// node_modules/openai/resources/fine-tuning/checkpoints/checkpoints.mjs
var Checkpoints = class extends APIResource {
  static {
    __name(this, "Checkpoints");
  }
  constructor() {
    super(...arguments);
    this.permissions = new Permissions(this._client);
  }
};
Checkpoints.Permissions = Permissions;
Checkpoints.PermissionCreateResponsesPage = PermissionCreateResponsesPage;

// node_modules/openai/resources/fine-tuning/jobs/jobs.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/fine-tuning/jobs/checkpoints.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Checkpoints2 = class extends APIResource {
  static {
    __name(this, "Checkpoints");
  }
  list(fineTuningJobId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(fineTuningJobId, {}, query);
    }
    return this._client.getAPIList(`/fine_tuning/jobs/${fineTuningJobId}/checkpoints`, FineTuningJobCheckpointsPage, { query, ...options });
  }
};
var FineTuningJobCheckpointsPage = class extends CursorPage {
  static {
    __name(this, "FineTuningJobCheckpointsPage");
  }
};
Checkpoints2.FineTuningJobCheckpointsPage = FineTuningJobCheckpointsPage;

// node_modules/openai/resources/fine-tuning/jobs/jobs.mjs
var Jobs = class extends APIResource {
  static {
    __name(this, "Jobs");
  }
  constructor() {
    super(...arguments);
    this.checkpoints = new Checkpoints2(this._client);
  }
  /**
   * Creates a fine-tuning job which begins the process of creating a new model from
   * a given dataset.
   *
   * Response includes details of the enqueued job including job status and the name
   * of the fine-tuned models once complete.
   *
   * [Learn more about fine-tuning](https://platform.openai.com/docs/guides/fine-tuning)
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.create({
   *   model: 'gpt-4o-mini',
   *   training_file: 'file-abc123',
   * });
   * ```
   */
  create(body, options) {
    return this._client.post("/fine_tuning/jobs", { body, ...options });
  }
  /**
   * Get info about a fine-tuning job.
   *
   * [Learn more about fine-tuning](https://platform.openai.com/docs/guides/fine-tuning)
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.retrieve(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  retrieve(fineTuningJobId, options) {
    return this._client.get(`/fine_tuning/jobs/${fineTuningJobId}`, options);
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/fine_tuning/jobs", FineTuningJobsPage, { query, ...options });
  }
  /**
   * Immediately cancel a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.cancel(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  cancel(fineTuningJobId, options) {
    return this._client.post(`/fine_tuning/jobs/${fineTuningJobId}/cancel`, options);
  }
  listEvents(fineTuningJobId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.listEvents(fineTuningJobId, {}, query);
    }
    return this._client.getAPIList(`/fine_tuning/jobs/${fineTuningJobId}/events`, FineTuningJobEventsPage, {
      query,
      ...options
    });
  }
  /**
   * Pause a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.pause(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  pause(fineTuningJobId, options) {
    return this._client.post(`/fine_tuning/jobs/${fineTuningJobId}/pause`, options);
  }
  /**
   * Resume a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.resume(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  resume(fineTuningJobId, options) {
    return this._client.post(`/fine_tuning/jobs/${fineTuningJobId}/resume`, options);
  }
};
var FineTuningJobsPage = class extends CursorPage {
  static {
    __name(this, "FineTuningJobsPage");
  }
};
var FineTuningJobEventsPage = class extends CursorPage {
  static {
    __name(this, "FineTuningJobEventsPage");
  }
};
Jobs.FineTuningJobsPage = FineTuningJobsPage;
Jobs.FineTuningJobEventsPage = FineTuningJobEventsPage;
Jobs.Checkpoints = Checkpoints2;
Jobs.FineTuningJobCheckpointsPage = FineTuningJobCheckpointsPage;

// node_modules/openai/resources/fine-tuning/fine-tuning.mjs
var FineTuning = class extends APIResource {
  static {
    __name(this, "FineTuning");
  }
  constructor() {
    super(...arguments);
    this.methods = new Methods(this._client);
    this.jobs = new Jobs(this._client);
    this.checkpoints = new Checkpoints(this._client);
    this.alpha = new Alpha(this._client);
  }
};
FineTuning.Methods = Methods;
FineTuning.Jobs = Jobs;
FineTuning.FineTuningJobsPage = FineTuningJobsPage;
FineTuning.FineTuningJobEventsPage = FineTuningJobEventsPage;
FineTuning.Checkpoints = Checkpoints;
FineTuning.Alpha = Alpha;

// node_modules/openai/resources/graders/graders.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/graders/grader-models.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var GraderModels = class extends APIResource {
  static {
    __name(this, "GraderModels");
  }
};

// node_modules/openai/resources/graders/graders.mjs
var Graders2 = class extends APIResource {
  static {
    __name(this, "Graders");
  }
  constructor() {
    super(...arguments);
    this.graderModels = new GraderModels(this._client);
  }
};
Graders2.GraderModels = GraderModels;

// node_modules/openai/resources/images.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Images = class extends APIResource {
  static {
    __name(this, "Images");
  }
  /**
   * Creates a variation of a given image. This endpoint only supports `dall-e-2`.
   *
   * @example
   * ```ts
   * const imagesResponse = await client.images.createVariation({
   *   image: fs.createReadStream('otter.png'),
   * });
   * ```
   */
  createVariation(body, options) {
    return this._client.post("/images/variations", multipartFormRequestOptions({ body, ...options }));
  }
  /**
   * Creates an edited or extended image given one or more source images and a
   * prompt. This endpoint only supports `gpt-image-1` and `dall-e-2`.
   *
   * @example
   * ```ts
   * const imagesResponse = await client.images.edit({
   *   image: fs.createReadStream('path/to/file'),
   *   prompt: 'A cute baby sea otter wearing a beret',
   * });
   * ```
   */
  edit(body, options) {
    return this._client.post("/images/edits", multipartFormRequestOptions({ body, ...options }));
  }
  /**
   * Creates an image given a prompt.
   * [Learn more](https://platform.openai.com/docs/guides/images).
   *
   * @example
   * ```ts
   * const imagesResponse = await client.images.generate({
   *   prompt: 'A cute baby sea otter',
   * });
   * ```
   */
  generate(body, options) {
    return this._client.post("/images/generations", { body, ...options });
  }
};

// node_modules/openai/resources/models.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Models = class extends APIResource {
  static {
    __name(this, "Models");
  }
  /**
   * Retrieves a model instance, providing basic information about the model such as
   * the owner and permissioning.
   */
  retrieve(model, options) {
    return this._client.get(`/models/${model}`, options);
  }
  /**
   * Lists the currently available models, and provides basic information about each
   * one such as the owner and availability.
   */
  list(options) {
    return this._client.getAPIList("/models", ModelsPage, options);
  }
  /**
   * Delete a fine-tuned model. You must have the Owner role in your organization to
   * delete a model.
   */
  del(model, options) {
    return this._client.delete(`/models/${model}`, options);
  }
};
var ModelsPage = class extends Page {
  static {
    __name(this, "ModelsPage");
  }
};
Models.ModelsPage = ModelsPage;

// node_modules/openai/resources/moderations.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Moderations = class extends APIResource {
  static {
    __name(this, "Moderations");
  }
  /**
   * Classifies if text and/or image inputs are potentially harmful. Learn more in
   * the [moderation guide](https://platform.openai.com/docs/guides/moderation).
   */
  create(body, options) {
    return this._client.post("/moderations", { body, ...options });
  }
};

// node_modules/openai/resources/responses/responses.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/lib/ResponsesParser.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
function maybeParseResponse(response, params) {
  if (!params || !hasAutoParseableInput2(params)) {
    return {
      ...response,
      output_parsed: null,
      output: response.output.map((item) => {
        if (item.type === "function_call") {
          return {
            ...item,
            parsed_arguments: null
          };
        }
        if (item.type === "message") {
          return {
            ...item,
            content: item.content.map((content) => ({
              ...content,
              parsed: null
            }))
          };
        } else {
          return item;
        }
      })
    };
  }
  return parseResponse(response, params);
}
__name(maybeParseResponse, "maybeParseResponse");
function parseResponse(response, params) {
  const output = response.output.map((item) => {
    if (item.type === "function_call") {
      return {
        ...item,
        parsed_arguments: parseToolCall2(params, item)
      };
    }
    if (item.type === "message") {
      const content = item.content.map((content2) => {
        if (content2.type === "output_text") {
          return {
            ...content2,
            parsed: parseTextFormat(params, content2.text)
          };
        }
        return content2;
      });
      return {
        ...item,
        content
      };
    }
    return item;
  });
  const parsed = Object.assign({}, response, { output });
  if (!Object.getOwnPropertyDescriptor(response, "output_text")) {
    addOutputText(parsed);
  }
  Object.defineProperty(parsed, "output_parsed", {
    enumerable: true,
    get() {
      for (const output2 of parsed.output) {
        if (output2.type !== "message") {
          continue;
        }
        for (const content of output2.content) {
          if (content.type === "output_text" && content.parsed !== null) {
            return content.parsed;
          }
        }
      }
      return null;
    }
  });
  return parsed;
}
__name(parseResponse, "parseResponse");
function parseTextFormat(params, content) {
  if (params.text?.format?.type !== "json_schema") {
    return null;
  }
  if ("$parseRaw" in params.text?.format) {
    const text_format = params.text?.format;
    return text_format.$parseRaw(content);
  }
  return JSON.parse(content);
}
__name(parseTextFormat, "parseTextFormat");
function hasAutoParseableInput2(params) {
  if (isAutoParsableResponseFormat(params.text?.format)) {
    return true;
  }
  return false;
}
__name(hasAutoParseableInput2, "hasAutoParseableInput");
function isAutoParsableTool2(tool) {
  return tool?.["$brand"] === "auto-parseable-tool";
}
__name(isAutoParsableTool2, "isAutoParsableTool");
function getInputToolByName(input_tools, name2) {
  return input_tools.find((tool) => tool.type === "function" && tool.name === name2);
}
__name(getInputToolByName, "getInputToolByName");
function parseToolCall2(params, toolCall) {
  const inputTool = getInputToolByName(params.tools ?? [], toolCall.name);
  return {
    ...toolCall,
    ...toolCall,
    parsed_arguments: isAutoParsableTool2(inputTool) ? inputTool.$parseRaw(toolCall.arguments) : inputTool?.strict ? JSON.parse(toolCall.arguments) : null
  };
}
__name(parseToolCall2, "parseToolCall");
function addOutputText(rsp) {
  const texts = [];
  for (const output of rsp.output) {
    if (output.type !== "message") {
      continue;
    }
    for (const content of output.content) {
      if (content.type === "output_text") {
        texts.push(content.text);
      }
    }
  }
  rsp.output_text = texts.join("");
}
__name(addOutputText, "addOutputText");

// node_modules/openai/resources/responses/input-items.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var InputItems = class extends APIResource {
  static {
    __name(this, "InputItems");
  }
  list(responseId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(responseId, {}, query);
    }
    return this._client.getAPIList(`/responses/${responseId}/input_items`, ResponseItemsPage, {
      query,
      ...options
    });
  }
};

// node_modules/openai/lib/responses/ResponseStream.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var __classPrivateFieldSet6 = function(receiver, state, value, kind2, f2) {
  if (kind2 === "m") throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f2) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f2.call(receiver, value) : f2 ? f2.value = value : state.set(receiver, value), value;
};
var __classPrivateFieldGet7 = function(receiver, state, kind2, f2) {
  if (kind2 === "a" && !f2) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f2 : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f2 : kind2 === "a" ? f2.call(receiver) : f2 ? f2.value : state.get(receiver);
};
var _ResponseStream_instances;
var _ResponseStream_params;
var _ResponseStream_currentResponseSnapshot;
var _ResponseStream_finalResponse;
var _ResponseStream_beginRequest;
var _ResponseStream_addEvent;
var _ResponseStream_endRequest;
var _ResponseStream_accumulateResponse;
var ResponseStream = class _ResponseStream extends EventStream {
  static {
    __name(this, "ResponseStream");
  }
  constructor(params) {
    super();
    _ResponseStream_instances.add(this);
    _ResponseStream_params.set(this, void 0);
    _ResponseStream_currentResponseSnapshot.set(this, void 0);
    _ResponseStream_finalResponse.set(this, void 0);
    __classPrivateFieldSet6(this, _ResponseStream_params, params, "f");
  }
  static createResponse(client, params, options) {
    const runner = new _ResponseStream(params);
    runner._run(() => runner._createOrRetrieveResponse(client, params, {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  async _createOrRetrieveResponse(client, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet7(this, _ResponseStream_instances, "m", _ResponseStream_beginRequest).call(this);
    let stream;
    let starting_after = null;
    if ("response_id" in params) {
      stream = await client.responses.retrieve(params.response_id, { stream: true }, { ...options, signal: this.controller.signal, stream: true });
      starting_after = params.starting_after ?? null;
    } else {
      stream = await client.responses.create({ ...params, stream: true }, { ...options, signal: this.controller.signal });
    }
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet7(this, _ResponseStream_instances, "m", _ResponseStream_addEvent).call(this, event, starting_after);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return __classPrivateFieldGet7(this, _ResponseStream_instances, "m", _ResponseStream_endRequest).call(this);
  }
  [(_ResponseStream_params = /* @__PURE__ */ new WeakMap(), _ResponseStream_currentResponseSnapshot = /* @__PURE__ */ new WeakMap(), _ResponseStream_finalResponse = /* @__PURE__ */ new WeakMap(), _ResponseStream_instances = /* @__PURE__ */ new WeakSet(), _ResponseStream_beginRequest = /* @__PURE__ */ __name(function _ResponseStream_beginRequest2() {
    if (this.ended)
      return;
    __classPrivateFieldSet6(this, _ResponseStream_currentResponseSnapshot, void 0, "f");
  }, "_ResponseStream_beginRequest"), _ResponseStream_addEvent = /* @__PURE__ */ __name(function _ResponseStream_addEvent2(event, starting_after) {
    if (this.ended)
      return;
    const maybeEmit = /* @__PURE__ */ __name((name2, event2) => {
      if (starting_after == null || event2.sequence_number > starting_after) {
        this._emit(name2, event2);
      }
    }, "maybeEmit");
    const response = __classPrivateFieldGet7(this, _ResponseStream_instances, "m", _ResponseStream_accumulateResponse).call(this, event);
    maybeEmit("event", event);
    switch (event.type) {
      case "response.output_text.delta": {
        const output = response.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "message") {
          const content = output.content[event.content_index];
          if (!content) {
            throw new OpenAIError(`missing content at index ${event.content_index}`);
          }
          if (content.type !== "output_text") {
            throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
          }
          maybeEmit("response.output_text.delta", {
            ...event,
            snapshot: content.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const output = response.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "function_call") {
          maybeEmit("response.function_call_arguments.delta", {
            ...event,
            snapshot: output.arguments
          });
        }
        break;
      }
      default:
        maybeEmit(event.type, event);
        break;
    }
  }, "_ResponseStream_addEvent"), _ResponseStream_endRequest = /* @__PURE__ */ __name(function _ResponseStream_endRequest2() {
    if (this.ended) {
      throw new OpenAIError(`stream has ended, this shouldn't happen`);
    }
    const snapshot = __classPrivateFieldGet7(this, _ResponseStream_currentResponseSnapshot, "f");
    if (!snapshot) {
      throw new OpenAIError(`request ended without sending any events`);
    }
    __classPrivateFieldSet6(this, _ResponseStream_currentResponseSnapshot, void 0, "f");
    const parsedResponse = finalizeResponse(snapshot, __classPrivateFieldGet7(this, _ResponseStream_params, "f"));
    __classPrivateFieldSet6(this, _ResponseStream_finalResponse, parsedResponse, "f");
    return parsedResponse;
  }, "_ResponseStream_endRequest"), _ResponseStream_accumulateResponse = /* @__PURE__ */ __name(function _ResponseStream_accumulateResponse2(event) {
    let snapshot = __classPrivateFieldGet7(this, _ResponseStream_currentResponseSnapshot, "f");
    if (!snapshot) {
      if (event.type !== "response.created") {
        throw new OpenAIError(`When snapshot hasn't been set yet, expected 'response.created' event, got ${event.type}`);
      }
      snapshot = __classPrivateFieldSet6(this, _ResponseStream_currentResponseSnapshot, event.response, "f");
      return snapshot;
    }
    switch (event.type) {
      case "response.output_item.added": {
        snapshot.output.push(event.item);
        break;
      }
      case "response.content_part.added": {
        const output = snapshot.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "message") {
          output.content.push(event.part);
        }
        break;
      }
      case "response.output_text.delta": {
        const output = snapshot.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "message") {
          const content = output.content[event.content_index];
          if (!content) {
            throw new OpenAIError(`missing content at index ${event.content_index}`);
          }
          if (content.type !== "output_text") {
            throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
          }
          content.text += event.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const output = snapshot.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "function_call") {
          output.arguments += event.delta;
        }
        break;
      }
      case "response.completed": {
        __classPrivateFieldSet6(this, _ResponseStream_currentResponseSnapshot, event.response, "f");
        break;
      }
    }
    return snapshot;
  }, "_ResponseStream_accumulateResponse"), Symbol.asyncIterator)]() {
    const pushQueue = [];
    const readQueue = [];
    let done = false;
    this.on("event", (event) => {
      const reader = readQueue.shift();
      if (reader) {
        reader.resolve(event);
      } else {
        pushQueue.push(event);
      }
    });
    this.on("end", () => {
      done = true;
      for (const reader of readQueue) {
        reader.resolve(void 0);
      }
      readQueue.length = 0;
    });
    this.on("abort", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    this.on("error", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    return {
      next: /* @__PURE__ */ __name(async () => {
        if (!pushQueue.length) {
          if (done) {
            return { value: void 0, done: true };
          }
          return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((event2) => event2 ? { value: event2, done: false } : { value: void 0, done: true });
        }
        const event = pushQueue.shift();
        return { value: event, done: false };
      }, "next"),
      return: /* @__PURE__ */ __name(async () => {
        this.abort();
        return { value: void 0, done: true };
      }, "return")
    };
  }
  /**
   * @returns a promise that resolves with the final Response, or rejects
   * if an error occurred or the stream ended prematurely without producing a REsponse.
   */
  async finalResponse() {
    await this.done();
    const response = __classPrivateFieldGet7(this, _ResponseStream_finalResponse, "f");
    if (!response)
      throw new OpenAIError("stream ended without producing a ChatCompletion");
    return response;
  }
};
function finalizeResponse(snapshot, params) {
  return maybeParseResponse(snapshot, params);
}
__name(finalizeResponse, "finalizeResponse");

// node_modules/openai/resources/responses/responses.mjs
var Responses = class extends APIResource {
  static {
    __name(this, "Responses");
  }
  constructor() {
    super(...arguments);
    this.inputItems = new InputItems(this._client);
  }
  create(body, options) {
    return this._client.post("/responses", { body, ...options, stream: body.stream ?? false })._thenUnwrap((rsp) => {
      if ("object" in rsp && rsp.object === "response") {
        addOutputText(rsp);
      }
      return rsp;
    });
  }
  retrieve(responseId, query = {}, options) {
    return this._client.get(`/responses/${responseId}`, {
      query,
      ...options,
      stream: query?.stream ?? false
    });
  }
  /**
   * Deletes a model response with the given ID.
   *
   * @example
   * ```ts
   * await client.responses.del(
   *   'resp_677efb5139a88190b512bc3fef8e535d',
   * );
   * ```
   */
  del(responseId, options) {
    return this._client.delete(`/responses/${responseId}`, {
      ...options,
      headers: { Accept: "*/*", ...options?.headers }
    });
  }
  parse(body, options) {
    return this._client.responses.create(body, options)._thenUnwrap((response) => parseResponse(response, body));
  }
  /**
   * Creates a model response stream
   */
  stream(body, options) {
    return ResponseStream.createResponse(this._client, body, options);
  }
  /**
   * Cancels a model response with the given ID. Only responses created with the
   * `background` parameter set to `true` can be cancelled.
   * [Learn more](https://platform.openai.com/docs/guides/background).
   *
   * @example
   * ```ts
   * await client.responses.cancel(
   *   'resp_677efb5139a88190b512bc3fef8e535d',
   * );
   * ```
   */
  cancel(responseId, options) {
    return this._client.post(`/responses/${responseId}/cancel`, {
      ...options,
      headers: { Accept: "*/*", ...options?.headers }
    });
  }
};
var ResponseItemsPage = class extends CursorPage {
  static {
    __name(this, "ResponseItemsPage");
  }
};
Responses.InputItems = InputItems;

// node_modules/openai/resources/uploads/uploads.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/uploads/parts.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Parts = class extends APIResource {
  static {
    __name(this, "Parts");
  }
  /**
   * Adds a
   * [Part](https://platform.openai.com/docs/api-reference/uploads/part-object) to an
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object) object.
   * A Part represents a chunk of bytes from the file you are trying to upload.
   *
   * Each Part can be at most 64 MB, and you can add Parts until you hit the Upload
   * maximum of 8 GB.
   *
   * It is possible to add multiple Parts in parallel. You can decide the intended
   * order of the Parts when you
   * [complete the Upload](https://platform.openai.com/docs/api-reference/uploads/complete).
   */
  create(uploadId, body, options) {
    return this._client.post(`/uploads/${uploadId}/parts`, multipartFormRequestOptions({ body, ...options }));
  }
};

// node_modules/openai/resources/uploads/uploads.mjs
var Uploads = class extends APIResource {
  static {
    __name(this, "Uploads");
  }
  constructor() {
    super(...arguments);
    this.parts = new Parts(this._client);
  }
  /**
   * Creates an intermediate
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object) object
   * that you can add
   * [Parts](https://platform.openai.com/docs/api-reference/uploads/part-object) to.
   * Currently, an Upload can accept at most 8 GB in total and expires after an hour
   * after you create it.
   *
   * Once you complete the Upload, we will create a
   * [File](https://platform.openai.com/docs/api-reference/files/object) object that
   * contains all the parts you uploaded. This File is usable in the rest of our
   * platform as a regular File object.
   *
   * For certain `purpose` values, the correct `mime_type` must be specified. Please
   * refer to documentation for the
   * [supported MIME types for your use case](https://platform.openai.com/docs/assistants/tools/file-search#supported-files).
   *
   * For guidance on the proper filename extensions for each purpose, please follow
   * the documentation on
   * [creating a File](https://platform.openai.com/docs/api-reference/files/create).
   */
  create(body, options) {
    return this._client.post("/uploads", { body, ...options });
  }
  /**
   * Cancels the Upload. No Parts may be added after an Upload is cancelled.
   */
  cancel(uploadId, options) {
    return this._client.post(`/uploads/${uploadId}/cancel`, options);
  }
  /**
   * Completes the
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object).
   *
   * Within the returned Upload object, there is a nested
   * [File](https://platform.openai.com/docs/api-reference/files/object) object that
   * is ready to use in the rest of the platform.
   *
   * You can specify the order of the Parts by passing in an ordered list of the Part
   * IDs.
   *
   * The number of bytes uploaded upon completion must match the number of bytes
   * initially specified when creating the Upload object. No Parts may be added after
   * an Upload is completed.
   */
  complete(uploadId, body, options) {
    return this._client.post(`/uploads/${uploadId}/complete`, { body, ...options });
  }
};
Uploads.Parts = Parts;

// node_modules/openai/resources/vector-stores/vector-stores.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/resources/vector-stores/file-batches.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();

// node_modules/openai/lib/Util.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var allSettledWithThrow = /* @__PURE__ */ __name(async (promises) => {
  const results = await Promise.allSettled(promises);
  const rejected = results.filter((result) => result.status === "rejected");
  if (rejected.length) {
    for (const result of rejected) {
      console.error(result.reason);
    }
    throw new Error(`${rejected.length} promise(s) failed - see the above errors`);
  }
  const values = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      values.push(result.value);
    }
  }
  return values;
}, "allSettledWithThrow");

// node_modules/openai/resources/vector-stores/files.mjs
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var Files3 = class extends APIResource {
  static {
    __name(this, "Files");
  }
  /**
   * Create a vector store file by attaching a
   * [File](https://platform.openai.com/docs/api-reference/files) to a
   * [vector store](https://platform.openai.com/docs/api-reference/vector-stores/object).
   */
  create(vectorStoreId, body, options) {
    return this._client.post(`/vector_stores/${vectorStoreId}/files`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Retrieves a vector store file.
   */
  retrieve(vectorStoreId, fileId, options) {
    return this._client.get(`/vector_stores/${vectorStoreId}/files/${fileId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Update attributes on a vector store file.
   */
  update(vectorStoreId, fileId, body, options) {
    return this._client.post(`/vector_stores/${vectorStoreId}/files/${fileId}`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  list(vectorStoreId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(vectorStoreId, {}, query);
    }
    return this._client.getAPIList(`/vector_stores/${vectorStoreId}/files`, VectorStoreFilesPage, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Delete a vector store file. This will remove the file from the vector store but
   * the file itself will not be deleted. To delete the file, use the
   * [delete file](https://platform.openai.com/docs/api-reference/files/delete)
   * endpoint.
   */
  del(vectorStoreId, fileId, options) {
    return this._client.delete(`/vector_stores/${vectorStoreId}/files/${fileId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Attach a file to the given vector store and wait for it to be processed.
   */
  async createAndPoll(vectorStoreId, body, options) {
    const file = await this.create(vectorStoreId, body, options);
    return await this.poll(vectorStoreId, file.id, options);
  }
  /**
   * Wait for the vector store file to finish processing.
   *
   * Note: this will return even if the file failed to process, you need to check
   * file.last_error and file.status to handle these cases
   */
  async poll(vectorStoreId, fileId, options) {
    const headers = { ...options?.headers, "X-Stainless-Poll-Helper": "true" };
    if (options?.pollIntervalMs) {
      headers["X-Stainless-Custom-Poll-Interval"] = options.pollIntervalMs.toString();
    }
    while (true) {
      const fileResponse = await this.retrieve(vectorStoreId, fileId, {
        ...options,
        headers
      }).withResponse();
      const file = fileResponse.data;
      switch (file.status) {
        case "in_progress":
          let sleepInterval = 5e3;
          if (options?.pollIntervalMs) {
            sleepInterval = options.pollIntervalMs;
          } else {
            const headerInterval = fileResponse.response.headers.get("openai-poll-after-ms");
            if (headerInterval) {
              const headerIntervalMs = parseInt(headerInterval);
              if (!isNaN(headerIntervalMs)) {
                sleepInterval = headerIntervalMs;
              }
            }
          }
          await sleep(sleepInterval);
          break;
        case "failed":
        case "completed":
          return file;
      }
    }
  }
  /**
   * Upload a file to the `files` API and then attach it to the given vector store.
   *
   * Note the file will be asynchronously processed (you can use the alternative
   * polling helper method to wait for processing to complete).
   */
  async upload(vectorStoreId, file, options) {
    const fileInfo = await this._client.files.create({ file, purpose: "assistants" }, options);
    return this.create(vectorStoreId, { file_id: fileInfo.id }, options);
  }
  /**
   * Add a file to a vector store and poll until processing is complete.
   */
  async uploadAndPoll(vectorStoreId, file, options) {
    const fileInfo = await this.upload(vectorStoreId, file, options);
    return await this.poll(vectorStoreId, fileInfo.id, options);
  }
  /**
   * Retrieve the parsed contents of a vector store file.
   */
  content(vectorStoreId, fileId, options) {
    return this._client.getAPIList(`/vector_stores/${vectorStoreId}/files/${fileId}/content`, FileContentResponsesPage, { ...options, headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers } });
  }
};
var VectorStoreFilesPage = class extends CursorPage {
  static {
    __name(this, "VectorStoreFilesPage");
  }
};
var FileContentResponsesPage = class extends Page {
  static {
    __name(this, "FileContentResponsesPage");
  }
};
Files3.VectorStoreFilesPage = VectorStoreFilesPage;
Files3.FileContentResponsesPage = FileContentResponsesPage;

// node_modules/openai/resources/vector-stores/file-batches.mjs
var FileBatches = class extends APIResource {
  static {
    __name(this, "FileBatches");
  }
  /**
   * Create a vector store file batch.
   */
  create(vectorStoreId, body, options) {
    return this._client.post(`/vector_stores/${vectorStoreId}/file_batches`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Retrieves a vector store file batch.
   */
  retrieve(vectorStoreId, batchId, options) {
    return this._client.get(`/vector_stores/${vectorStoreId}/file_batches/${batchId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Cancel a vector store file batch. This attempts to cancel the processing of
   * files in this batch as soon as possible.
   */
  cancel(vectorStoreId, batchId, options) {
    return this._client.post(`/vector_stores/${vectorStoreId}/file_batches/${batchId}/cancel`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Create a vector store batch and poll until all files have been processed.
   */
  async createAndPoll(vectorStoreId, body, options) {
    const batch = await this.create(vectorStoreId, body);
    return await this.poll(vectorStoreId, batch.id, options);
  }
  listFiles(vectorStoreId, batchId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.listFiles(vectorStoreId, batchId, {}, query);
    }
    return this._client.getAPIList(`/vector_stores/${vectorStoreId}/file_batches/${batchId}/files`, VectorStoreFilesPage, { query, ...options, headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers } });
  }
  /**
   * Wait for the given file batch to be processed.
   *
   * Note: this will return even if one of the files failed to process, you need to
   * check batch.file_counts.failed_count to handle this case.
   */
  async poll(vectorStoreId, batchId, options) {
    const headers = { ...options?.headers, "X-Stainless-Poll-Helper": "true" };
    if (options?.pollIntervalMs) {
      headers["X-Stainless-Custom-Poll-Interval"] = options.pollIntervalMs.toString();
    }
    while (true) {
      const { data: batch, response } = await this.retrieve(vectorStoreId, batchId, {
        ...options,
        headers
      }).withResponse();
      switch (batch.status) {
        case "in_progress":
          let sleepInterval = 5e3;
          if (options?.pollIntervalMs) {
            sleepInterval = options.pollIntervalMs;
          } else {
            const headerInterval = response.headers.get("openai-poll-after-ms");
            if (headerInterval) {
              const headerIntervalMs = parseInt(headerInterval);
              if (!isNaN(headerIntervalMs)) {
                sleepInterval = headerIntervalMs;
              }
            }
          }
          await sleep(sleepInterval);
          break;
        case "failed":
        case "cancelled":
        case "completed":
          return batch;
      }
    }
  }
  /**
   * Uploads the given files concurrently and then creates a vector store file batch.
   *
   * The concurrency limit is configurable using the `maxConcurrency` parameter.
   */
  async uploadAndPoll(vectorStoreId, { files, fileIds = [] }, options) {
    if (files == null || files.length == 0) {
      throw new Error(`No \`files\` provided to process. If you've already uploaded files you should use \`.createAndPoll()\` instead`);
    }
    const configuredConcurrency = options?.maxConcurrency ?? 5;
    const concurrencyLimit = Math.min(configuredConcurrency, files.length);
    const client = this._client;
    const fileIterator = files.values();
    const allFileIds = [...fileIds];
    async function processFiles(iterator) {
      for (let item of iterator) {
        const fileObj = await client.files.create({ file: item, purpose: "assistants" }, options);
        allFileIds.push(fileObj.id);
      }
    }
    __name(processFiles, "processFiles");
    const workers = Array(concurrencyLimit).fill(fileIterator).map(processFiles);
    await allSettledWithThrow(workers);
    return await this.createAndPoll(vectorStoreId, {
      file_ids: allFileIds
    });
  }
};

// node_modules/openai/resources/vector-stores/vector-stores.mjs
var VectorStores = class extends APIResource {
  static {
    __name(this, "VectorStores");
  }
  constructor() {
    super(...arguments);
    this.files = new Files3(this._client);
    this.fileBatches = new FileBatches(this._client);
  }
  /**
   * Create a vector store.
   */
  create(body, options) {
    return this._client.post("/vector_stores", {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Retrieves a vector store.
   */
  retrieve(vectorStoreId, options) {
    return this._client.get(`/vector_stores/${vectorStoreId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Modifies a vector store.
   */
  update(vectorStoreId, body, options) {
    return this._client.post(`/vector_stores/${vectorStoreId}`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/vector_stores", VectorStoresPage, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Delete a vector store.
   */
  del(vectorStoreId, options) {
    return this._client.delete(`/vector_stores/${vectorStoreId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Search a vector store for relevant chunks based on a query and file attributes
   * filter.
   */
  search(vectorStoreId, body, options) {
    return this._client.getAPIList(`/vector_stores/${vectorStoreId}/search`, VectorStoreSearchResponsesPage, {
      body,
      method: "post",
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
};
var VectorStoresPage = class extends CursorPage {
  static {
    __name(this, "VectorStoresPage");
  }
};
var VectorStoreSearchResponsesPage = class extends Page {
  static {
    __name(this, "VectorStoreSearchResponsesPage");
  }
};
VectorStores.VectorStoresPage = VectorStoresPage;
VectorStores.VectorStoreSearchResponsesPage = VectorStoreSearchResponsesPage;
VectorStores.Files = Files3;
VectorStores.VectorStoreFilesPage = VectorStoreFilesPage;
VectorStores.FileContentResponsesPage = FileContentResponsesPage;
VectorStores.FileBatches = FileBatches;

// node_modules/openai/index.mjs
var _a2;
var OpenAI = class extends APIClient {
  static {
    __name(this, "OpenAI");
  }
  /**
   * API Client for interfacing with the OpenAI API.
   *
   * @param {string | undefined} [opts.apiKey=process.env['OPENAI_API_KEY'] ?? undefined]
   * @param {string | null | undefined} [opts.organization=process.env['OPENAI_ORG_ID'] ?? null]
   * @param {string | null | undefined} [opts.project=process.env['OPENAI_PROJECT_ID'] ?? null]
   * @param {string} [opts.baseURL=process.env['OPENAI_BASE_URL'] ?? https://api.openai.com/v1] - Override the default base URL for the API.
   * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {number} [opts.httpAgent] - An HTTP agent used to manage HTTP(s) connections.
   * @param {Core.Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {Core.Headers} opts.defaultHeaders - Default headers to include with every request to the API.
   * @param {Core.DefaultQuery} opts.defaultQuery - Default query parameters to include with every request to the API.
   * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
   */
  constructor({ baseURL = readEnv("OPENAI_BASE_URL"), apiKey = readEnv("OPENAI_API_KEY"), organization = readEnv("OPENAI_ORG_ID") ?? null, project = readEnv("OPENAI_PROJECT_ID") ?? null, ...opts } = {}) {
    if (apiKey === void 0) {
      throw new OpenAIError("The OPENAI_API_KEY environment variable is missing or empty; either provide it, or instantiate the OpenAI client with an apiKey option, like new OpenAI({ apiKey: 'My API Key' }).");
    }
    const options = {
      apiKey,
      organization,
      project,
      ...opts,
      baseURL: baseURL || `https://api.openai.com/v1`
    };
    if (!options.dangerouslyAllowBrowser && isRunningInBrowser()) {
      throw new OpenAIError("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew OpenAI({ apiKey, dangerouslyAllowBrowser: true });\n\nhttps://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety\n");
    }
    super({
      baseURL: options.baseURL,
      timeout: options.timeout ?? 6e5,
      httpAgent: options.httpAgent,
      maxRetries: options.maxRetries,
      fetch: options.fetch
    });
    this.completions = new Completions3(this);
    this.chat = new Chat(this);
    this.embeddings = new Embeddings(this);
    this.files = new Files2(this);
    this.images = new Images(this);
    this.audio = new Audio(this);
    this.moderations = new Moderations(this);
    this.models = new Models(this);
    this.fineTuning = new FineTuning(this);
    this.graders = new Graders2(this);
    this.vectorStores = new VectorStores(this);
    this.beta = new Beta(this);
    this.batches = new Batches(this);
    this.uploads = new Uploads(this);
    this.responses = new Responses(this);
    this.evals = new Evals(this);
    this.containers = new Containers(this);
    this._options = options;
    this.apiKey = apiKey;
    this.organization = organization;
    this.project = project;
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  defaultHeaders(opts) {
    return {
      ...super.defaultHeaders(opts),
      "OpenAI-Organization": this.organization,
      "OpenAI-Project": this.project,
      ...this._options.defaultHeaders
    };
  }
  authHeaders(opts) {
    return { Authorization: `Bearer ${this.apiKey}` };
  }
  stringifyQuery(query) {
    return stringify(query, { arrayFormat: "brackets" });
  }
};
_a2 = OpenAI;
OpenAI.OpenAI = _a2;
OpenAI.DEFAULT_TIMEOUT = 6e5;
OpenAI.OpenAIError = OpenAIError;
OpenAI.APIError = APIError;
OpenAI.APIConnectionError = APIConnectionError;
OpenAI.APIConnectionTimeoutError = APIConnectionTimeoutError;
OpenAI.APIUserAbortError = APIUserAbortError;
OpenAI.NotFoundError = NotFoundError;
OpenAI.ConflictError = ConflictError;
OpenAI.RateLimitError = RateLimitError;
OpenAI.BadRequestError = BadRequestError;
OpenAI.AuthenticationError = AuthenticationError;
OpenAI.InternalServerError = InternalServerError;
OpenAI.PermissionDeniedError = PermissionDeniedError;
OpenAI.UnprocessableEntityError = UnprocessableEntityError;
OpenAI.toFile = toFile;
OpenAI.fileFromPath = fileFromPath;
OpenAI.Completions = Completions3;
OpenAI.Chat = Chat;
OpenAI.ChatCompletionsPage = ChatCompletionsPage;
OpenAI.Embeddings = Embeddings;
OpenAI.Files = Files2;
OpenAI.FileObjectsPage = FileObjectsPage;
OpenAI.Images = Images;
OpenAI.Audio = Audio;
OpenAI.Moderations = Moderations;
OpenAI.Models = Models;
OpenAI.ModelsPage = ModelsPage;
OpenAI.FineTuning = FineTuning;
OpenAI.Graders = Graders2;
OpenAI.VectorStores = VectorStores;
OpenAI.VectorStoresPage = VectorStoresPage;
OpenAI.VectorStoreSearchResponsesPage = VectorStoreSearchResponsesPage;
OpenAI.Beta = Beta;
OpenAI.Batches = Batches;
OpenAI.BatchesPage = BatchesPage;
OpenAI.Uploads = Uploads;
OpenAI.Responses = Responses;
OpenAI.Evals = Evals;
OpenAI.EvalListResponsesPage = EvalListResponsesPage;
OpenAI.Containers = Containers;
OpenAI.ContainerListResponsesPage = ContainerListResponsesPage;
var openai_default = OpenAI;

// src/lib/embedding.ts
var EMBEDDING_DIMENSIONS = 1536;
var OpenAIEmbeddingProvider = class {
  static {
    __name(this, "OpenAIEmbeddingProvider");
  }
  client;
  constructor(apiKey) {
    this.client = new openai_default({ apiKey });
  }
  async embedQuery(text) {
    const response = await this.client.embeddings.create({
      model: "text-embedding-3-small",
      input: text
    });
    const embedding = response.data[0].embedding;
    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`
      );
    }
    return embedding;
  }
};

// src/lib/vector-store.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
async function searchVectors(db, embedding, topK, namespaces) {
  const vectorStr = `[${embedding.join(",")}]`;
  const rows = await db.$queryRawUnsafe(
    `
    SELECT
      id,
      skill_id,
      title,
      text,
      1 - (embedding <=> $1::vector) AS score
    FROM skill_chunks
    WHERE namespace = ANY($2::text[])
    ORDER BY embedding <=> $1::vector
    LIMIT $3
    `,
    vectorStr,
    namespaces,
    topK
  );
  return rows.map((row) => ({
    id: row.id,
    skillId: row.skill_id,
    score: Number(row.score),
    title: row.title,
    text: row.text
  }));
}
__name(searchVectors, "searchVectors");

// src/lib/search.ts
async function searchSkills(db, openaiApiKey, query, limit2) {
  const embedder = new OpenAIEmbeddingProvider(openaiApiKey);
  const embedding = await embedder.embedQuery(query);
  const topK = limit2 * 4;
  const rawResults = await searchVectors(db, embedding, topK, ["public"]);
  if (rawResults.length === 0) return [];
  const skillGroups = /* @__PURE__ */ new Map();
  for (const result of rawResults) {
    const existing = skillGroups.get(result.skillId);
    if (existing === void 0 || result.score > existing) {
      skillGroups.set(result.skillId, result.score);
    }
  }
  const ranked = [...skillGroups.entries()].map(([skillId, bestScore]) => ({ skillId, bestScore })).sort((a2, b3) => b3.bestScore - a2.bestScore).slice(0, limit2);
  const skillIds = ranked.map((r) => r.skillId);
  const skills = await db.skill.findMany({
    where: { id: { in: skillIds } }
  });
  const skillMap = new Map(skills.map((s) => [s.id, s]));
  return ranked.map(({ skillId }) => {
    const skill = skillMap.get(skillId);
    const githubRepo = skill?.githubRepo ?? "";
    const githubPath = skill?.githubPath ?? "";
    const githubUrl = githubRepo ? `https://github.com/${githubRepo}${githubPath ? `/blob/main/${githubPath}` : ""}` : "";
    return {
      skillId,
      slug: skill?.slug ?? "",
      name: skill?.name ?? skillId,
      summary: skill?.summary ?? skill?.description ?? "",
      categories: skill?.categories ?? [],
      capabilities: skill?.capabilities ?? [],
      keywords: skill?.keywords ?? [],
      githubUrl,
      installCommand: deriveInstallCommand(githubRepo, githubPath)
    };
  });
}
__name(searchSkills, "searchSkills");
function deriveInstallCommand(githubRepo, githubPath) {
  if (!githubRepo) return null;
  const isSingleSkill = githubPath === "SKILL.md" || !githubPath;
  if (isSingleSkill) {
    return `npx skills add ${githubRepo} -y`;
  }
  const parts = githubPath.split("/");
  const skillIdx = parts.indexOf("skills");
  const skillName = skillIdx >= 0 && parts.length > skillIdx + 1 ? parts[skillIdx + 1] : void 0;
  if (skillName) {
    return `npx skills add ${githubRepo} --skill ${skillName} -y`;
  }
  return `npx skills add ${githubRepo} -y`;
}
__name(deriveInstallCommand, "deriveInstallCommand");

// src/routes/search.ts
var searchRoute = new Hono2();
searchRoute.use("/search", authMiddleware, rateLimitMiddleware);
searchRoute.post("/search", async (c2) => {
  const body = await c2.req.json();
  const query = body.query?.trim();
  if (!query || query.length === 0) {
    return c2.json({ error: "query is required" }, 400);
  }
  if (query.length > 500) {
    return c2.json({ error: "query must be 500 characters or less" }, 400);
  }
  let limit2 = body.limit ?? 5;
  if (typeof limit2 !== "number" || limit2 < 1 || limit2 > 20) {
    limit2 = 5;
  }
  const db = c2.var.db;
  const userId = c2.var.userId;
  const results = await searchSkills(db, c2.env.OPENAI_API_KEY, query, limit2);
  await db.searchUsage.create({
    data: { userId, query }
  });
  return c2.json({
    results,
    meta: {
      query,
      total: results.length,
      limit: limit2,
      remainingSearches: c2.var.remainingSearches
    }
  });
});

// src/index.ts
var app = new Hono2();
app.use("*", cors());
app.route("/", healthRoute);
app.route("/api/v1", searchRoute);
var src_default = app;

// ../../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e6) {
      console.error("Failed to drain the unused request body.", e6);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
function reduceError(e6) {
  return {
    name: e6?.name,
    message: e6?.message ?? String(e6),
    stack: e6?.stack,
    cause: e6?.cause === void 0 ? void 0 : reduceError(e6.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e6) {
    const error = reduceError(e6);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-PzOQHE/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../node_modules/wrangler/templates/middleware/common.ts
init_modules_watch_stub();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_performance2();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-PzOQHE/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init3) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init3.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init3) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init3.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
/*! Bundled license information:

@prisma/client-runtime-utils/dist/index.mjs:
  (*! Bundled license information:
  
  decimal.js/decimal.mjs:
    (*!
     *  decimal.js v10.5.0
     *  An arbitrary-precision Decimal type for JavaScript.
     *  https://github.com/MikeMcl/decimal.js
     *  Copyright (c) 2025 Michael Mclaughlin <M8ch88l@gmail.com>
     *  MIT Licence
     *)
  *)
*/
//# sourceMappingURL=index.js.map
