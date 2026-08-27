---
"saleor-app-search": patch
---

Fixed `inStock` being indexed as `false` for almost every product in Algolia when records were updated by webhooks.

Before: Saleor resolves stock availability per channel, but webhook payloads carry no channel context, so the app always read a quantity of 0 and wrote `inStock: false`. Because each webhook replaces the whole Algolia record, any product edit - including a "back in stock" event - overwrote the correct value. The only way to get correct data was to re-run a full index import, until the next webhook arrived.

After: the app fetches stock availability for each channel the variant is listed in, and writes the correct `inStock` value into each channel's index. Variants with inventory tracking turned off are now indexed as in stock, instead of out of stock.
