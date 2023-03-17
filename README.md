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
</div>

<div align="center">
  <a href="https://docs.saleor.io/docs/3.x/developer/extending/apps/quickstart/getting-started">🆕 Apps Quickstart</a>
  <span> • </span>
  <a href="https://github.com/orgs/saleor/projects/22/views/1">🗓️ Roadmap</a>
  <span> • </span>
  <a href="https://github.com/saleor/apps/discussions/categories/integrations-features">✍️ Propose an app</a>
</div>

## Overview

This repository serves as a starting point in the exploration of Saleor apps.

> _Saleor apps are separate applications that use GraphQL to talk to the Saleor server and receive webhooks with event notifications from Saleor._
>
> [docs.saleor.io](https://docs.saleor.io/docs/3.x/developer/extending/apps/key-concepts)

### Apps list

In the `apps` folder, you will find the following applications:

- [data-importer](./apps/data-importer) - import data from CSV to Saleor.
- [invoices](./apps/invoices) - generate invoice PDF for each order.
- [klaviyo](./apps/klaviyo) - send Saleor events to Klaviyo, where you can notify the customers.
- [emails-and-messages](./apps/emails-and-messages) - notifications and email communication with customers.
- [search](./apps/search) - connect Saleor with search engines.
- [slack](./apps/slack) - get notifications on Slack channel from Saleor events.
- [taxes](https://docs.saleor.io/docs/3.x/developer/app-store/apps/taxes) - calculate order and checkout taxes using external services.
- [cms](./apps/cms) - exports products from Saleor to CMS.

## Development

### Setup

Make sure you have installed `pnpm`:

```bash
npm install -g pnpm
```

Install all dependencies:

```bash
pnpm install
```

Start the apps` dev servers:

```bash
pnpm dev
```

> The apps' ports will be displayed in the terminal output.
>
> You can find the required env vars for each app in `apps/NAME/.env.example` file.

To start an individual app, run:

```bash
pnpm dev --filter=saleor-app-X
```

where X is the app's name (matching saleor/X).

### Build

To build all apps, run:

```bash
pnpm build
```

### Documentation

- [Forking](/docs/forking.md)
