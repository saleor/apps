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
  <a href="https://discord.gg/unUfh24R6d">💬 Discord</a>
</div>

<div align="center">
  <a href="https://docs.saleor.io/docs/3.x/developer/extending/apps/quickstart/getting-started">🆕 Apps Quickstart</a>
  <span> • </span>
  <a href="https://github.com/saleor/apps/discussions/categories/integrations-features">✍️ Propose an app</a>
</div>

<br/>
<div align="center">
  
[![Discord Badge](https://dcbadge.vercel.app/api/server/unUfh24R6d)](https://discord.gg/unUfh24R6d)

</div>

## Overview

This repository serves as a starting point in the exploration of Saleor apps.

> _Saleor apps are separate applications that use GraphQL to talk to the Saleor server and receive webhooks with event notifications from Saleor._
>
> [docs.saleor.io](https://docs.saleor.io/docs/3.x/developer/extending/apps/key-concepts)

### Apps list

In the `apps` folder, you will find the following applications:

- [AvaTax](./apps/avatax) - calculates dynamic taxes via AvaTax API.
- [CMS](./apps/cms) - exports products from Saleor to CMS.
- [Klaviyo](./apps/klaviyo) - send Saleor events to Klaviyo, where you can notify the customers.
- [Products feed](./apps/products-feed) - generate products feed XML.
- [Search](./apps/search) - connect Saleor with search engines.
- [Segment](./apps/segment/) - connect Saleor with Twilio Segment.
- [SMTP](./apps/smtp) - email communication with customers.

#### Other official apps

Some of the Saleor apps are available in separate repositories:

- [Stripe](https://github.com/saleor/saleor-app-payment-stripe)

#### Example apps

- [Slack integration app example](https://github.com/saleor/example-slack-app)
- [Taxjar integration app example](https://github.com/saleor/example-app-taxjar)
- [Invoices app example](https://github.com/saleor/example-app-invoices)
- [CRM app example](https://github.com/saleor/example-app-crm)
- [Sendgrid integration app example](https://github.com/saleor/example-app-sendgrid)

## Development

You can find the documentation for saleor/apps on [docs.saleor.io](https://docs.saleor.io/docs/3.x/developer/app-store/development).

## ADR

This repository uses [architecture decision records](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) to document architectural decisions. You can find them in the `docs/adr` directory.

To add new ADR follow [the guide](https://github.com/npryce/adr-tools).
