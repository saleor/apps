# Testing

The difficulty in testing the Taxes App lies in learning about the tax providers themselves. This document will attempt to outline the various edge-cases you can encounter while interacting with the Taxes App. It will be updated as we learn more about the various tax providers.

## TaxJar

### UI

#### 1. Throws "invalid credentials" error while creating a provider

If you are using the sandbox token, make sure to check the "Sandbox mode" checkbox in the Taxes App UI.

### Calculating taxes

#### 1. Transaction doesn't appear in TaxJar

[It can take up to an hour for TaxJar to process the transaction](https://support.taxjar.com/article/643-why-are-my-transactions-not-appearing-in-taxjar). Please check again after some time.

If that's not the case, make sure you are using the live token, as the sandbox token does not send transactions to TaxJar.

#### 2. Taxes App returns taxes = 0

Here are known reasons for why the Taxes App may returns taxes = 0 while calculating taxes:

1. The sales tax in this state is 0. You can check it [here](https://www.taxjar.com/resources/sales-tax/states).
2. You don't have a nexus in this state. Read up on Nexus [here](https://www.taxjar.com/sales-tax/nexus).
3. The customer address in Saleor is invalid. We validate the "ship from" address, but we can't validate the customer address. If you are using a fake database, the generated addresses may be non-existant. You can find examples of valid addresses [here](https://developers.taxjar.com/demo/).
4. TaxJar does not respond.
5. Taxes App broke.

## Avatax

### UI

#### 1. Taxes App UI throws "invalid credentials" error while creating a provider

If you are using the sandbox token, make sure to check the "Sandbox mode" checkbox in the Taxes App UI.
