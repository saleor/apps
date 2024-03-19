---
"app-avatax": patch
---

Changed maximum timeout on Avatax client calls to 15s (from default 20 minutes). This will allow graceful webhook error handling, instead Saleor or Vercel timeouts
