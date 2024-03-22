---
"app-avatax": patch
---

Add handling for Avatax error that was raised when app was configured incorrectly. For now only invalid zip code handling was added. This error will be logged as "warning" and Sentry will not be triggered. Other, not handled errors will raise Sentry exceptions
