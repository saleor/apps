---
"saleor-app-payment-np-atobarai": patch
---

Add comprehensive unit tests for payment method details functionality:

- Add unit tests for `SaleorPaymentMethodDetails` class with snapshot testing to verify correct payment method structure
- Add test coverage for transaction-initialize-session responses with payment method details (both null and non-null cases)
- Add test coverage for transaction-process-session responses with payment method details (both null and non-null cases)
- Convert inline comments to JSDoc format in `SaleorPaymentMethodDetails` class for better documentation
