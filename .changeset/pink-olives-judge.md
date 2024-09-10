---
"app-avatax": minor
---

Implemented new discount strategy - for SHIPPING and SUBTOTAL values

Now, App will do following logic:
- For line items that represent products, we use [automatic distribution](https://developer.avalara.com/erp-integration-guide/sales-tax-badge/transactions/discounts-and-overrides/discounting-a-transaction/), so App will not modify amounts, but will mark lines as "discounted: true" and generate "discount" field that will sum all relevant discounts
- For shipping line item, app will use [price reduction](https://developer.avalara.com/erp-integration-guide/sales-tax-badge/transactions/discounts-and-overrides/discounting-a-transaction/), meaning shipping line will *not* be marked as discounted, but the discount will be subtracted from the amount of the shipping line.

See updated docs [here](https://docs.saleor.io/developer/app-store/apps/avatax/configuration#discounts)