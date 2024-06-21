---
"smtp": patch
---

Changed how MJML compiler is imported in the app. Not it uses legacy require() instead of import. Previous syntax broke the app
