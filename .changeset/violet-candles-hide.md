---
"@saleor/apps-logger": minor
---

Renamed exported `logger` to `rootLogger` so we avoid collision of names when using `logger` in monorepo. Also `createLogger` function has been removed in favour of app defining it in their codebase.
