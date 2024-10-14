---
"@saleor/apps-logger": patch
---

Adds missing information to `LoggerVercelTransport`:

* deployment environment
* commit-sha
* service name & version

Also if attaching of transport fails we will get Sentry error.
