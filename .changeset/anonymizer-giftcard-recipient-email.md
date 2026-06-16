---
"saleor-app-anonymizer": patch
---

Fixed the gift card by-email search missing cards sent to a customer. When a gift card is issued with "send to customer", the recipient email is stored only on a gift card event (not on `createdByEmail`/`usedByEmail`), so searching by that email returned nothing. The by-email flow now also matches the email recorded on the card's events, so recipient-only cards are found and erased.
