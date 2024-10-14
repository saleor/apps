---
"@saleor/apps-logger": patch
---

Added new transport `LoggerVercelTransport`. It is currently in experimental stage but it can be used to send logs directly to Vercel log drain. This transport has optional argument of `loggerContext` - if used you need to make sure that function is executed only on the server. If attaching of transport fails we will get Sentry error.

Usage:

```ts
import { logger } from "@saleor/apps-logger";
import { attachLoggerVercelTransport } from "@saleor/apps-logger/node";
import { loggerContext } from "./logger-context";
import pkgJson from './package.json'

attachLoggerVercelTransport(logger, pkgJson.version, loggerContext);
```
