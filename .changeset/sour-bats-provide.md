---
"saleor-app-taxes": patch
---

Fixed the issue when the app threw errors when unable to resolve user email. Now, if the email is not available in `order.user.email` and `order.userEmail`, the app will fall back to empty string.
