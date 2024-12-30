# Saleor App Example: Segment integration

> [!TIP]
> Questions or issues? Check our [discord](https://discord.gg/H52JTZAtSH) channel for help.

Note: This repository is an example, which means:

* It's not production ready
* It's not actively maintained by Saleor
* It should be used as a learning resource

### The stack

Segment app is based on App Template - you can check it [here](https://github.com/saleor/saleor-app-template)

### Docs

You can find docs [here](https://docs.saleor.io/developer/app-store/apps/segment)

## How to use this project

### Select your APL

If you want to develop single tenant application - use already configured `FileAPL` for local development.

If you need to support multiple tenants application or you want to deploy your application - use `UpstashAPL`.

To read more about storing auth data, read the [APL documentation](https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md)


### Generated schema and typings

Commands `build` and `dev` would generate schema and typed functions using Saleor's GraphQL endpoint. Commit `generated` folder to your repo as they are necessary for queries and keeping track of the schema changes.

[Learn more](https://www.graphql-code-generator.com/) about GraphQL code generation.

### Learn more about Saleor Apps

[Apps guide](https://docs.saleor.io/docs/3.x/developer/extending/apps/key-concepts)

[Configuring apps in dashboard](https://docs.saleor.io/docs/3.x/dashboard/apps)

