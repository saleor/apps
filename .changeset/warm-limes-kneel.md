---
"saleor-app-segment": patch
---

Added Problems API integration to report configuration and tracking issues to the Saleor Dashboard. Previously, when the Segment app was misconfigured (missing write key, invalid credentials, or failed webhook activation), events were silently dropped with no visible indication. Now these issues are surfaced as problems in the Dashboard so they can be identified and resolved quickly.
