import test from "tape";
import Logger from "../src/index";
import {Writable} from "stream";
import stripAnsi from "strip-ansi";

function testStream() {
  let memory;
  let onPrint;

  const stream = new Writable({
    write(chunk, enc, cb) {
      const buf = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk, enc);
      memory = stripAnsi(buf.toString("utf-8"));
      if (onPrint) onPrint(memory);
      onPrint = null;
      cb();
    }
  });

  return {
    stream,
    onPrint(fn) {
      onPrint = fn;
    },
    last() {
      return memory;
    }
  };
}

test("prints log", (t) => {
  t.plan(1);

  const {stream,onPrint} = testStream();
  const logger = new Logger(stream);

  onPrint((l) => t.equals(l, "foobar\n", "printed"));
  logger.print("foobar");
});

test("log level debug", (t) => {
  t.plan(4);

  const {stream,onPrint} = testStream();
  const logger = new Logger(stream);
  logger.setLogLevel("debug");

  onPrint((l) => t.equals(l, "[DEBUG] foobar\n", "debug"));
  logger.debug("foobar");

  onPrint((l) => t.equals(l, "foobar\n", "info"));
  logger.info("foobar");

  onPrint((l) => t.equals(l, "[WARN] foobar\n", "warn"));
  logger.warn("foobar");

  onPrint((l) => t.equals(l, "[ERROR] foobar\n", "error"));
  logger.error("foobar");
});

test("log level info", (t) => {
  t.plan(3);

  const {stream,onPrint} = testStream();
  const logger = new Logger(stream);
  logger.setLogLevel("info");

  onPrint(() => t.fail("debug"));
  logger.debug("foobar");

  onPrint((l) => t.equals(l, "foobar\n", "info"));
  logger.info("foobar");

  onPrint((l) => t.equals(l, "[WARN] foobar\n", "warn"));
  logger.warn("foobar");

  onPrint((l) => t.equals(l, "[ERROR] foobar\n", "error"));
  logger.error("foobar");
});

test("log level warn", (t) => {
  t.plan(2);

  const {stream,onPrint} = testStream();
  const logger = new Logger(stream);
  logger.setLogLevel("warn");

  onPrint(() => t.fail("debug"));
  logger.debug("foobar");

  onPrint(() => t.fail("info"));
  logger.info("foobar");

  onPrint((l) => t.equals(l, "[WARN] foobar\n", "warn"));
  logger.warn("foobar");

  onPrint((l) => t.equals(l, "[ERROR] foobar\n", "error"));
  logger.error("foobar");
});

test("log level error", (t) => {
  t.plan(1);

  const {stream,onPrint} = testStream();
  const logger = new Logger(stream);
  logger.setLogLevel("error");

  onPrint(() => t.fail("debug"));
  logger.debug("foobar");

  onPrint(() => t.fail("info"));
  logger.info("foobar");

  onPrint(() => t.fail("warn"));
  logger.warn("foobar");

  onPrint((l) => t.equals(l, "[ERROR] foobar\n", "error"));
  logger.error("foobar");
});

test("log level silent", (t) => {
  t.plan(0);

  const {stream,onPrint} = testStream();
  const logger = new Logger(stream);
  logger.setLogLevel("silent");

  onPrint(() => t.fail("debug"));
  logger.debug("foobar");

  onPrint(() => t.fail("info"));
  logger.info("foobar");

  onPrint(() => t.fail("warn"));
  logger.warn("foobar");

  onPrint(() => t.fail("error"));
  logger.error("foobar");

  t.end();
});
