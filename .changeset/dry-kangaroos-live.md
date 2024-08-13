---
"app-avatax": patch
---

Added fallback behavior for Tax Code Matcher: scenario when AvaTax fail to respond with available tax classes.

### Before:
When AvaTax failed to respond, app left Tax Code Matcher page and settings couldn't been set

### After
App ignores missing response from AvaTax and sets empty autocomplete results. Values can be entered manually and will not be validated