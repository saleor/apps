---
"saleor-app-payment-np-atobarai": minor
---

Add support for payment method details in transaction events. The NP Atobarai app now includes payment method information when reporting transaction events to Saleor. This feature is available for Saleor 3.22+ and includes:

- New `SaleorPaymentMethodDetails` class for formatting NP Atobarai payment method data to Saleor format
- Payment method details included in transaction-initialize-session webhook responses
- Payment method details included in transaction-process-session webhook responses
- Comprehensive unit test coverage with snapshot testing to ensure correct payment method structure
