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
  <a href="https://docs.saleor.io/">📚 Docs</a>
  <span> • </span>
  <a href="https://saleor.io/blog/">📰 Blog</a>
  <span> • </span>
  <a href="https://twitter.com/getsaleor">🐦 Twitter</a>
  <span> • </span>
  <a href="https://saleor.io/discord">💬 Discord</a>
</div>

<div align="center">
  <a href="https://docs.saleor.io/developer/extending/apps/quickstart">🆕 Apps Quickstart</a>
  <span> • </span>
  <a href="https://github.com/saleor/apps/discussions/categories/integrations-features">✍️ Propose an app</a>
</div>

<br/>

## Overview

This repository serves as a starting point in the exploration of Saleor apps.

> _Saleor apps are separate applications that use GraphQL to talk to the Saleor server and receive webhooks with event notifications from Saleor._
>
> [docs.saleor.io](https://docs.saleor.io/developer/extending/apps/overview)

### Apps list

In the `apps` folder, you will find the following applications:

- [AvaTax](./apps/avatax) - calculates dynamic taxes via AvaTax API.
- [CMS](./apps/cms) - exports products from Saleor to CMS.
- [Klaviyo](./apps/klaviyo) - send Saleor events to Klaviyo, where you can notify customers.
- [Products feed](./apps/products-feed) - generates product feed XML.
- [Search](./apps/search) - connects Saleor with search engines.
- [Segment](./apps/segment/) - connects Saleor with Twilio Segment.
- [SMTP](./apps/smtp) - enables email communication with customers.
- [Stripe](./apps/stripe/) - connects Saleor with Stripe.
- [NP Atobarai](./apps/np-atobarai/) - connects Saleor with NP Atobarai (Japanese: NP 後払い).

#### Example apps

- [Slack integration app example](https://github.com/saleor/examples/tree/main/example-app-slack)
- [Taxjar integration app example](https://github.com/saleor/examples/tree/main/example-app-taxjar)
- [Invoices app example](https://github.com/saleor/examples/tree/main/example-app-invoices)
- [CRM app example](https://github.com/saleor/examples/tree/main/example-app-crm)
- [Sendgrid integration app example](https://github.com/saleor/examples/tree/main/example-app-sendgrid)

## Development

You can find the documentation for saleor/apps on [docs.saleor.io](https://docs.saleor.io/developer/extending/apps/local-app-development).

### PNPM and corepack

Due to an issue with [outdated signatures in Corepack](https://github.com/nodejs/corepack/issues/612), Corepack should be updated to its latest version first:

```shell
npm install --global corepack@latest
```

After that, run this command to install pnpm with the proper version:

```shell
corepack enable pnpm
```

### Turborepo

This repository uses [Turborepo](https://turbo.build/) remote caching. If you are a Saleor employee, you can leverage it by running the following commands in the root of this repository:

```shell
pnpm dlx turbo login
pnpm dlx turbo link
```

## ADR

This repository uses [architecture decision records](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) to document architectural decisions. You can find them in the `adr` directory.

To add a new ADR, follow [the guide](https://github.com/npryce/adr-tools).

## Contributing

We love your contributions and do our best to provide you with mentorship and support. However, please keep in mind that the `saleor/apps` monorepo is used by Saleor to host apps in Saleor infrastructure. While the code remains open source, the decisions in this repository are made to enable Saleor to maintain features needed by its business goals.

If you are looking for an issue to tackle, take a look at issues labeled [`Good first issue`](https://github.com/saleor/apps/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22+) and [`Help wanted`](https://github.com/saleor/apps/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22).

If nothing grabs your attention, check [our roadmap](https://saleor.io/roadmap) or [start a Discord discussion](https://saleor.io/discord) about a feature you'd like to see. Make sure to read our [Contribution Guidelines](http://docs.saleor.io/developer/community/contributing) before opening a PR or issue.

## Forking 

You can fork this repository to modify and self-host one of the apps. Keep in mind that this is a monorepo, which adds two additional steps to the process:
- When forking, all the apps are forked, even if you need only one.
- There are shared dependencies between apps, stored in the `packages/` folder. Even if you need only one app, you still need at least some packages.

You can try two techniques to fork the repository:
1. You can fork everything and keep everything. When you back-merge changes, unused apps will be updated without any issues. You need to ensure you run scripts from the context of the app you are interested in, e.g., `cd apps/avatax && pnpm dev`. Your tooling should be configured to ignore other apps for better performance.
2. You can fork everything and remove the apps you don't need. It will reduce the number of files in your fork, but you may need to modify some scripts to ensure they work properly (e.g., if some root scripts expect multiple apps, they may fail).


## Deployment

Apps are written in Next.js and are hosted on Vercel by Saleor. Everyone should be able to host an app on Vercel if the app is configured properly. Apps share common code, but some of the functionalities are app-specific. For example, AvaTax and Segment apps require DynamoDB to run. Check each app's "env" files to verify what must be provided to deploy.

### Docker

The repository contains [Devcontainers](https://containers.dev/) setup which includes Dockerfiles. They are meant for development. At the moment, Saleor doesn't provide official production Dockerfiles. Feel free to write your own, based on the development ones.

### APLs

Apps follow the BYOA (bring your own APL) approach. A minimal set of APLs are implemented in the source code, to avoid maintaining unused dependencies and increasing bundle size. You may want to use another APL client, like Redis. In such a case, please ensure your fork does the job. Usually apps contain a single file that imports APL from `@saleor/app-sdk`. Your fork can ensure this file contains your own APL setup.

### MCP

To help AI agents properly interact with Saleor, you can use the [Model Context Protocol](https://modelcontextprotocol.io/introduction), which can interact with Saleor by understanding the GraphQL schema.

Start by populating the `.env` file under the `mcp` folder with:

```
MCP_GRAPHQL_ENDPOINT= # Saleor API endpoint (ends with /graphql/)
MCP_GRAPHQL_TOKEN= # local app token (see https://docs.saleor.io/api-usage/authentication#app-authentication for more details)
```

Make sure that you don't use quotes in env variables (as they will be loaded by the bash script).

Then follow your editor's docs to get started with MCP:

- [VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)
- [Cursor](https://docs.cursor.com/context/model-context-protocol#configuration-locations)
- [JetBrains IDE](https://www.jetbrains.com/help/ai-assistant/configure-an-mcp-server.html)
