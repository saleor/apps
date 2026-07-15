---
"saleor-app-smtp": patch
---

Fixed saving an email event configuration with an invalid template (e.g. a Handlebars helper called with the wrong argument type) returning a generic "Internal server error". These template problems are now reported as validation errors, so the UI shows the actual reason (for example "expected the first argument to be a number") instead of an unexpected server error. As a side effect, invalid-template attempts are no longer reported as application errors in monitoring.
