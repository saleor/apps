---
"saleor-app-smtp": minor
---

The `ORDER_CREATED` email template payload now exposes the order's transactions, including payment method details (e.g. card brand and last digits, or gift card), charged amount and authorized amount. This lets you show which payment method(s) were used in your email templates, including split payments. The example templates were updated to demonstrate rendering this data.

Note: this requires Saleor 3.22 or newer (the minimum required version was bumped from 3.21), because transaction payment method details were added in Saleor 3.22.
