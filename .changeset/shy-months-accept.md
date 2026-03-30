---
"saleor-app-payment-np-atobarai": patch
---

Fixed fulfillment webhook failing for orders with "ghost" transactions. Previously, the app rejected any order with more than one Saleor transaction. Now it filters transactions by status, keeping only those with CHARGE_SUCCESS or AUTHORIZATION_SUCCESS events, and proceeds if exactly one completed transaction exists. Added order notes when fulfillment reporting is skipped due to missing or multiple completed transactions.
