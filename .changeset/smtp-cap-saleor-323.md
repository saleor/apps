---
"saleor-app-smtp": patch
---

Now the SMTP app declares compatibility with Saleor 3.22 and 3.23 only. Before, it advertised support for every 3.x version, so it could be installed on Saleor 3.24, where it is not supported. Installing on 3.24 or newer is now rejected with a clear version mismatch message. On Saleor 3.24 and newer, use the Customer Emails app instead.
