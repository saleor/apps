---
"app-avatax": patch
---

App now properly extracts tax rate amount (float number, like 0.23) from Avatax response and attaches it to webhook response. If field doesn't exist in Avatax, it falls back to 0 (like it was before)
