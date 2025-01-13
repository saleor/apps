---
"products-feed": patch
"klaviyo": patch
"app-avatax": patch
"cms-v2": patch
"search": patch
"smtp": patch
---

Escape ALLOWED_DOMAIN_PATTERN regex. It ensures that regex constructed from env variable is sanitized and can't be used to Denial of Service attack.
