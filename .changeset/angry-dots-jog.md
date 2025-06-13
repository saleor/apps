---
"saleor-app-cms": minor
---

Added bulk processing of uploading products to Strapi CMS. After this change you can use `STRAPI_BATCH_SIZE` to control number to request send in the same batch to Strapi API with `STRAPI_MILIS_DELAY_BETWEEN_BATCHES` controlling how frequent those batches are send to Strapi API.
