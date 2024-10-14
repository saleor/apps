---
"@saleor/apps-logger": patch
---

Added new transport `LoggerVercelTransport`. It is currently in experimental stage but it can be used to send logs directly to Vercel log drain. This transport has optional argument of `loggerContext` - if used you need to make sure that function is executed only on the server.

Usage:

```ts
import { logger } from "@saleor/apps-logger";
import { attachLoggerVercelTransport } from "@saleor/apps-logger/node";
import { loggerContext } from "./logger-context";

attachLoggerVercelTransport(logger, loggerContext);
```
