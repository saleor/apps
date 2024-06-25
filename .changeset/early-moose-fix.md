---
"smtp": patch
---

Fixed error with webhooks timing out. Now root UseCase operation is wrapped with try/catch block, so if unhandled error occurs, response will be returned. Previously response was hanging until lambda was terminated.
