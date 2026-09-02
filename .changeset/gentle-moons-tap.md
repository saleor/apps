---
"saleor-app-cms": patch
---

Fixed error reporting when a CMS provider fails with a non-standard error. Previously such failures were logged as `Error: [object Object]`, hiding the actual reason (for example an expired Strapi token) and causing them to be reported as generic sync failures. Now the original error payload is preserved, so the message is visible and authentication problems are correctly reported as auth errors.
