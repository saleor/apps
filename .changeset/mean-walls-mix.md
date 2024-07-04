---
"app-avatax": patch
---

Add support for AvataxStringLengthError to order calculate taxes webhook. When app gets this error from AvaTax it will return 400 with description of the issue.
