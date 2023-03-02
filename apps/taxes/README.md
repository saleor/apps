![Saleor App Taxes Hub](https://user-images.githubusercontent.com/249912/71523206-4e45f800-28c8-11ea-84ba-345a9bfc998a.png)

<div align="center">
  <h1>Saleor App Taxes Hub</h1>
</div>

<div align="center">
  <p>Hub for configuring taxes in Saleor using different providers.</p>
</div>

<div align="center">
  <a href="https://saleor.io/">🏠 Website</a>
  <span> • </span>
  <a href="https://docs.saleor.io/docs/3.x/">📚 Docs</a>
  <span> • </span>
  <a href="https://saleor.io/blog/">📰 Blog</a>
  <span> • </span>
  <a href="https://twitter.com/getsaleor">🐦 Twitter</a>
</div>

<div align="center">
  <a href="https://githubbox.com/saleor/saleor-app-template">🔎 Explore Code</a>
</div>

## About

### What is Saleor App Taxes Hub

Taxes App is a hub for configuring taxes in Saleor using different providers.

Integrates with:

- Avatax
- TaxJar

## Development

1. Install the app.
2. Go to _Configuration_ -> _Taxes_. In the "Select the method of tax calculation" select "Use tax app". Save.
3. To trigger the webhook, go to _Orders_, create a draft order with customer, products, shipping address, shipping method. The taxes will recalculate on each address change.
