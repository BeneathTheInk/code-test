# Logger

This is the Pagedip logging library. This works in both browsers and Node.js and has an API that is similar to console.

```js
const logger = new Logger("my-logger");

// log
logger.debug("Debug message");
logger.info("Info message");
logger.warn("Warning message");
logger.error("Error message");

// log level
logger.setLogLevel("debug");
logger.atLogLevel("debug"); // true
```
