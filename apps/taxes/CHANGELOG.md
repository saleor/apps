# saleor-app-taxes

## 1.0.2

### Patch Changes

- 56a4dbb: Extracts the tax providers into individual services. Fixes the issue with updating configs with obfuscated values.
- b46a9f3: Fix the create provider error. Add explicit return types to configuration services. Move obfuscating logic to routers and public services.

## 1.0.1

### Patch Changes

- 5151858: Removed the draft implementation of the SaleorSyncWebhook. Replaced it with SaleorSyncWebhook class from app-sdk and bumped it to 0.34.1.
