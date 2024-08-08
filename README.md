![Saleor Apps](https://user-images.githubusercontent.com/44495184/208925145-78c5022c-1a6c-4f2c-8f4f-7500e7afcaf0.png)

<div align="center">
  <h1>Saleor Apps</h1>
</div>

<div align="center">
  <p>The central space for Saleor Apps, Integrations and Marketplace.
</div>

<div align="center">
  <a href="https://saleor.io/">🏠 Website</a>
  <span> • </span>
  <a href="https://docs.saleor.io/docs/3.x">📚 Docs</a>
  <span> • </span>
  <a href="https://saleor.io/blog/">📰 Blog</a>
  <span> • </span>
  <a href="https://twitter.com/getsaleor">🐦 Twitter</a>
  <span> • </span>
  <a href="https://discord.gg/H52JTZAtSH">💬 Discord</a>
</div>

<div align="center">
  <a href="https://docs.saleor.io/docs/3.x/developer/extending/apps/quickstart/getting-started">🆕 Apps Quickstart</a>
  <span> • </span>
  <a href="https://github.com/saleor/apps/discussions/categories/integrations-features">✍️ Propose an app</a>
</div>

<br/>
<div align="center">
  
[![Discord Badge](https://dcbadge.vercel.app/api/server/H52JTZAtSH)](https://discord.gg/H52JTZAtSH)

</div>

## Overview

This repository serves as a starting point in the exploration of Saleor apps.

> _Saleor apps are separate applications that use GraphQL to talk to the Saleor server and receive webhooks with event notifications from Saleor._
>
> [docs.saleor.io](https://docs.saleor.io/docs/3.x/developer/extending/apps/key-concepts)

### Apps list

In the `apps` folder, you will find the following applications:

- [avatax](./apps/avatax) - calculates dynamic taxes via AvaTax API
- [cms](./apps/cms-v2) - exports products from Saleor to CMS.
- [data-importer](./apps/data-importer) - import data from CSV to Saleor.
- [klaviyo](./apps/klaviyo) - send Saleor events to Klaviyo, where you can notify the customers.
- [products-feed](./apps/products-feed) - generate products feed XML
- [search](./apps/search) - connect Saleor with search engines.
- [smtp](./apps/smtp) - email communication with customers

#### Other official apps

Some of the Saleor apps are available in separate repositories:

- [Stripe](https://github.com/saleor/saleor-app-payment-stripe)

#### Example apps

- [Slack integration app example](https://github.com/saleor/example-slack-app)
- [Taxjar integration app example](https://github.com/saleor/example-app-taxjar)
- [Invoices app example](https://github.com/saleor/example-app-invoices)
- [CRM app example](https://github.com/saleor/example-app-crm)
- [Segment app example](https://github.com/saleor/example-app-segment)
- [Sendgrid integration app example](https://github.com/saleor/example-app-sendgrid)

## Development

You can find the documentation for saleor/apps on [docs.saleor.io](https://docs.saleor.io/docs/3.x/developer/app-store/development).
