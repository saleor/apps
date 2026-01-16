---
"saleor-app-avatax": patch
---

Fixed how AWS sdk is initialized by explicitly passing credentials. This is caused by Vercel issue, which started to implicitly override some of our credentials by injecting their own.
