---
"saleor-app-anonymizer": patch
---

Fixed single-customer anonymization. Two issues are addressed:

- Only the first 100 of a customer's orders were fetched and anonymized, so a customer with more than 100 orders kept personal data on the remaining ones. The app now paginates through every page of the customer's orders before anonymizing them.
- A customer who had never placed an order could not be erased at all. The account is now deletable even when it has no orders, so erasure requests for those customers can be fulfilled.
