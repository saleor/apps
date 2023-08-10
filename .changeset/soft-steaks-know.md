---
"saleor-app-taxes": minor
---

Started the migration from `OrderCreated` to `OrderConfirmed` webhook event. In the new flow, the provider transactions will be created based on the order confirmation (either automatic or manual) event. The value of the `commit` field will be set based on the "isAutocommit" setting in the provider configuration.

The `OrderCreated` and `OrderFulfilled` handlers are deprecated. They will be removed on August 23, along with their corresponding webhooks. For now, both flows (`OrderCreated` -> `OrderFulfilled` and `OrderConfirmed`) are supported.

**Actions needed**:

The only scenario where you, as the user, may need to do something regarding this release is the following:

1. You created an order that still needs to be fulfilled (therefore, the corresponding AvaTax transaction is not committed).
2. You are planning to fulfill the order after August 23 (which is the date when we will complete the migration).

In that case, **remember you will not be able to commit the transaction by fulfilling the order in Saleor**. In the new flow, the transactions are committed in AvaTax while confirming the Saleor order, based on the "isAutocommit" flag. What you have to do is the following:

1. Make sure "isAutocommit" is set to true.
2. Trigger the `OrderConfirmed` event (either by [`orderConfirm` mutation](https://docs.saleor.io/docs/3.x/api-reference/orders/mutations/order-confirm) or in the Dashboard).

The AvaTax transaction created on the `OrderCreated` event should be updated with `commit: true`.
