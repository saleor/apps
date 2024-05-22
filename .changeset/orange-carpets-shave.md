---
"app-avatax": patch
---

Improve handling of errors from AvaTax API. Right now there is `AvataxErrorsParser` responsible for parsing errors from AvaTax into our internal ones. We also have `AvataxErrorToTrpcErrorMapper` which maps internal Avatax error into TRPC one.
