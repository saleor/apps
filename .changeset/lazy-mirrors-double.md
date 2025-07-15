---
"saleor-app-smtp": patch
---

Fix how we handle SMTP errors in SMTP app. After this change email sender won't be responsible for re-throwing errors. Instead use-case will catch errors and properly report them.
