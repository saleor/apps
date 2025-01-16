---
"products-feed": patch
"klaviyo": patch
"segment": patch
"app-avatax": patch
"cms-v2": patch
"search": patch
"smtp": patch
---

Removed regex escape for `ALLOWED_DOMAINS_URL` env variable from register handler. It isn't user input and escaping regex was causing problem with apps installation.
