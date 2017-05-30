import chalk from "chalk";
import {format} from "util";
import {EventEmitter} from "events";

const NLEOF = /\r?\n$/;

export default class Logger extends EventEmitter {
  static logLevels = [
    "error",
    "warn",
    "info",
    "debug"
  ];

  static parseLogLevel(level, def=-1) {
    if (typeof level === "string") {
      level = Logger.logLevels.indexOf(level.toLowerCase());
    }
    if (typeof level !== "number" || isNaN(level)) level = def;
    return level;
  }

  logLevel = Logger.parseLogLevel(process.env.PAGEDIP_LOGLEVEL, 2);
  color = chalk;
  stream = !process.browser ? process.stderr : {
    write(l) { console.log(l.replace(NLEOF, "")); }
  };

  static isLogger(l) {
    return l instanceof Logger;
  }

  static default(logger, label) {
    if (Logger.isLogger(logger)) {
      return label ? logger.label(label) : logger;
    }

    return new Logger(label);
  }

  constructor(label, opts) {
    super();

    if (typeof label === "object") {
      [opts,label] = [label,null];
    }

    if (opts && typeof opts.write === "function") {
      opts = { stream: opts };
    }

    if (opts == null) opts = {};

    this._label = label;
    if (opts.stream) this.stream = opts.stream;
    if (opts.logLevel) this.setLogLevel(opts.logLevel);
  }

  label(label) {
    return new Logger(label, {
      stream: this.stream,
      logLevel: this.logLevel
    });
  }

  print(...args) {
    const msg = format.apply(null, args);
    this.stream.write(msg + "\n");
    return this;
  }

  setLogLevel(level) {
    this.logLevel = Logger.parseLogLevel(level);
    this.emit("level-change", this.logLevel);
    return this;
  }

  atLogLevel(level) {
    return this.logLevel >= Logger.parseLogLevel(level);
  }

  _log(level, color, msg, args) {
    if (!this.atLogLevel(level)) {
      return this;
    }

    if (msg instanceof Error) {
      if (this.atLogLevel("debug") && msg.stack) {
        msg = msg.stack;
      } else {
        msg = msg.toString ? msg.toString() : msg.message || msg;
      }
    }

    if (typeof msg !== "string") {
      args.unshift(msg);
      msg = "";
    }

    const prefix = color ? chalk[color]("[" + level.toUpperCase() + "]") : "";
    const label = this._label ? chalk.magenta(this._label) : "";
    msg = [prefix,label,msg].filter(Boolean).join(" ");

    return this.print(msg, ...args);
  }

  debug = (msg, ...args) => {
    return this._log("debug", "cyan", msg, args);
  }

  info = (msg, ...args) => {
    return this._log("info", false, msg, args);
  }

  log = (...args) => {
    return this.info(...args);
  }

  warn = (msg, ...args) => {
    return this._log("warn", "yellow", msg, args);
  }

  error = (msg, ...args) => {
    return this._log("error", "red", msg, args);
  }
}
