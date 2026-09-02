# saleor-app-shipping-dummy

## 1.1.1

### Patch Changes

- 40321e5: Apps now identify themselves when they call the Saleor GraphQL API. Before, requests
  went out with the runtime's default `User-Agent`, so it was impossible to tell from
  Saleor's access logs which app produced them. Now every server-side request carries
  `User-Agent: <app-package-name>/<app-version>`, e.g. `saleor-app-avatax/3.1.0`.
- Updated dependencies [40321e5]
  - @saleor/apps-shared@1.16.0

## 1.1.0

### Minor Changes

- 4e0ce63: Added Dummy Shipping App, previously kept in its own repository. It answers Saleor's
  `SHIPPING_LIST_METHODS_FOR_CHECKOUT` and `ORDER_FILTER_SHIPPING_METHODS` sync webhooks with a
  hardcoded set of shipping methods, so an external carrier integration can be exercised end to end
  without signing up for a real carrier. The bundled Bruno collection walks the full checkout flow.
