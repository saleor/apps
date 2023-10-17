---
"saleor-app-taxes": minor
---

Fixed the issue with the app throwing errors when no customer code was resolved. Now, it falls back to "0" which is the recommended dummy value for when it's impossible to identify a customer (e.g. in an anonymous checkout).
