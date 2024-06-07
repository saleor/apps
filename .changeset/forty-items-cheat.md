---
"eslint-config-saleor": patch
---

Add createLogger rule. Right now we don't allow imports from @saleor/apps-logger directly. Use your app logger instead to create logger instance.
