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
  <a href="https://docs.saleor.io/docs/3.x/developer/extending/apps/key-concepts">📚 Docs</a>
  <span> • </span>
  <a href="https://saleor.io/blog/">📰 Blog</a>
  <span> • </span>
  <a href="https://twitter.com/getsaleor">🐦 Twitter</a>
</div>

<br />

<div align="center">
  <a href="https://docs.saleor.io/docs/3.x/developer/extending/apps/quickstart/getting-started">Build an app ▶️</a>
</div>

## Overview

This repository serves as a starting point in the exploration of Saleor apps.

> _Saleor apps are separate applications that use GraphQL to talk to the Saleor server and receive webhooks with event notifications from Saleor._
> 
> [docs.saleor.io](https://docs.saleor.io/docs/3.x/developer/extending/apps/key-concepts)

From here, you can visit:

- [🔍 Apps documentation](https://docs.saleor.io/docs/3.x/developer/extending/apps/key-concepts) - to learn more about how you can use apps to extend the capabilities of Saleor.
- [🆕 Quickstart Tutorial](https://docs.saleor.io/docs/3.x/developer/extending/apps/quickstart/getting-started) - to build your first app using [Saleor CLI](https://docs.saleor.io/docs/3.x/cli).
- [🗓️ Roadmap](https://github.com/orgs/saleor/projects/22/views/1) - to see the current progress on the development of official Saleor apps.
- [✍️ GitHub issues](https://github.com/saleor/apps/discussions/categories/integrations-features) - to submit a proposal for creating a new integration or an app.

## Forking

Saleor provides apps out of the box in Saleor Cloud plans, but all apps are open source and can be used
under the [BSD-3 license](./LICENSE). 

Using monorepo with multiple apps may be confusing - you probably need only one app, but repository contains all of them.

You can still fork and be able to track and merge original source code with 2 strategies:

### Delete unused apps

Repository contains apps and shared packages which are imported by apps. Apps never import other apps,
so they can be safely deleted.

You can delete all apps except the one you need. Turborepo setup will automatically run all scripts only on the single package you have left,
but it can be additionally filtered with `turbo run SCRIPT --filer=saleor-app-NAME`

We recommend to keep other files to avoid unnecessary conflict.

If you want to update repository, you can still merge or rebase it with original source code. 
You may face conflicts for apps folders you don't have anymore, but they can be easily discarded during conflict resulotion.
Just delete them again!

### Keep everything

To avoid conflicts to minimum, you can leave other apps and just ignore them. These tips can help you with single app experience:
- Mark other apps folders as "excluded" in your IDE, to avoid indexing these files
- Run your scripts with Turborepo filters, eg. `turbo run SCRIPT --filer=saleor-app-NAME`
- Use pnpm to avoid duplicated packages. Pnpm is installing packages once and links them, which causes minimal performance overhead of node_modules

