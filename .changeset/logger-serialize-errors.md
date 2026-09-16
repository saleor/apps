---
"@saleor/apps-logger": patch
---

Errors passed to the logger are now written to the logs with their name, message and stack. Before, a log like `logger.warn("Failed", { error })` produced `"error":{}` in Vercel runtime logs, which made failures impossible to diagnose. Now the same log contains the actual error details.
