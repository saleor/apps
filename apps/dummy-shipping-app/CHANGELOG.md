# saleor-app-shipping-dummy

## 1.1.0

### Minor Changes

- 4e0ce63: Added Dummy Shipping App, previously kept in its own repository. It answers Saleor's
  `SHIPPING_LIST_METHODS_FOR_CHECKOUT` and `ORDER_FILTER_SHIPPING_METHODS` sync webhooks with a
  hardcoded set of shipping methods, so an external carrier integration can be exercised end to end
  without signing up for a real carrier. The bundled Bruno collection walks the full checkout flow.
