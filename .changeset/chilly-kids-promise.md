---
"@saleor/apps-logger": patch
---

Added `VercelBuildtimeTransport` which can be used to log information during Vercel build time e.g webhook migrations output. Renamed old `attachLoggerVercelTransport` to `attachLoggerVercelRuntimeTransport`.
