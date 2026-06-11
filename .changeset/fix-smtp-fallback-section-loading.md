---
"saleor-app-smtp": patch
---

Fixed the "Fallback behavior" section on the configuration page being stuck in a loading state for apps installed before the fallback setting was introduced. Previously, configurations saved without the fallback setting caused the section to show a skeleton loader forever. Now the section loads correctly, with the fallback disabled by default.
