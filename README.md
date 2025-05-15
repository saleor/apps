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

### PNPM and corepack

Due to an issue with [outdated signatures in Corepack](https://github.com/nodejs/corepack/issues/612), Corepack should be updated to its latest version first:

```shell
npm install --global corepack@latest
```

After that run to install pnpm with proper version:

```shell
corepack enable pnpm
```

### Turborepo

This repository uses [Turborepo](https://turbo.build/) remote caching. If you are Saleor employee you can leverage it by running following commands in root of this repository:

```shell
pnpm dlx turbo login
pnpm dlx turbo link
```

## ADR

This repository uses [architecture decision records](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) to document architectural decisions. You can find them in the `docs/adr` directory.

To add new ADR follow [the guide](https://github.com/npryce/adr-tools).

## Contributing

We love your contributions and do our best to provide you with mentorship and support. However, please keep in mind that `saleor/apps` monorepo is used by Saleor to host apps in Saleor infrastructure. While the code remains open source, the decisions in this repository are made to enable Saleor to maintain features needed by it's business goals.

If you are looking for an issue to tackle, take a look at issues labeled [`Good first issue`](https://github.com/saleor/apps/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22+) and [`Help wanted`](https://github.com/saleor/apps/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22).

If nothing grabs your attention, check [our roadmap](https://saleor.io/roadmap) or [start a Discord discussion](https://saleor.io/discord) about a feature you'd like to see. Make sure to read our [Contribution Guidelines](http://docs.saleor.io/developer/community/contributing) before opening a PR or issue.

## Deployment

Apps are written in Next.js and are hosted on Vercel by Saleor. Everyone should be able to host the app on Vercel if the app is configured properly. Apps share common code, but some of the functionalities are app-specific. For example, Avatax and Segment apps require DynamoDB to run. Check each app's "env" files to verify what must be provided to deploy.

### Docker

Repository contains [Devcontainers](https://containers.dev/) setup which include Dockerfiles. They are meant for development. At the moment Saleor doesn't provide official production dockerfiles. Feel free to write your own, based on the development ones.

### APLs

Apps follow BYOA (bring your own APL) approach. Minimal set of APLs are implemented in the source code, to avoid maintaining not used dependencies and increasing bundle size. You may want to use other APL client, like Redis. In such case, please ensure your fork does the job. Usually apps contain single file that imports APL from `@saleor/app-sdk`. Your fork can ensure this file contains your own APL setup

### MCP

To help AI agents properly interact with Saleor, you can use the [Model Context Protocol](https://modelcontextprotocol.io/introduction), which can interact with Saleor by understanding the GraphQL schema.

Start by populating `.env` file under `mcp` folder with:

```
MCP_GRAPHQL_ENDPOINT= # Saleor API endpoint (ends with /graphql/)
MCP_GRAPHQL_TOKEN= # local app token (see https://docs.saleor.io/api-usage/authentication#app-authentication for more details)
```

Make sure that you don't use quotes in env variables (as they will be loaded by bash script).

Then follow your editor docs to get started with MCP:

- [VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)
- [Cursor](https://docs.cursor.com/context/model-context-protocol#configuration-locations)
- [JetBrains IDE](https://www.jetbrains.com/help/ai-assistant/configure-an-mcp-server.html)
