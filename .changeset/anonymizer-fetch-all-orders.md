---
"saleor-app-anonymizer": patch
---

Fixed single-customer anonymization to process all of a customer's orders. Before, only the first 100 orders were fetched and anonymized, so a customer with more than 100 orders kept personal data on the remaining ones. The app now paginates through every page of the customer's orders before anonymizing them.
