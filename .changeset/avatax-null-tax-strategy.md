---
"saleor-app-avatax": patch
---

Fixed AvaTax `ORDER_CONFIRMED` webhook failing with a validation error when a channel has no tax calculation strategy configured. Previously the app only accepted `TAX_APP` or `FLAT_RATES` and rejected the payload (returning a 500) when `taxCalculationStrategy` was `null`. Now a `null` strategy is accepted and treated like `FLAT_RATES` — the order is skipped instead of erroring, since the app is not the configured tax calculator for that channel.
