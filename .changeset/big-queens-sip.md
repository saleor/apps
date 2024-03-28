---
"@saleor/apps-logger": patch
"@saleor/apps-shared": patch
"app-avatax": patch
"cms-v2": patch
"app-taxjar": patch
---

Combine `APP_LOG_LEVEL` variable for `pino` & `tslog` libraries. After this change `APP_LOG_LEVEL` will take string which is one of `silent | trace | debug | info | warn | error | fatal`.
