---
"saleor-app-data-importer": minor
"saleor-app-products-feed": minor
"saleor-app-monitoring": minor
"saleor-app-invoices": minor
"saleor-app-klaviyo": minor
"saleor-app-search": minor
"saleor-app-slack": minor
---

Breaking change for app maintainers: VercelAPL can no longer be set for the app since it's deprecated and will be removed in app-sdk 0.30.0. As a replacement, we recommend using Upstash APL or implementing your own. 
Read more about APLs: https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md
