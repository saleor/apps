---
"saleor-app-products-feed": minor
---

The feed no longer contains products that are not publicly available. Before, every product assigned to the channel was sent to Google Merchant Center, including drafts, products hidden from listings and products not yet available for purchase - which meant Google crawled links to pages your shoppers cannot open. Now, products that are unpublished, hidden from listings or unavailable for purchase in the given channel are skipped.
