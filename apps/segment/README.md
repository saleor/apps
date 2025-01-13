<div align="center">
  <h1>Saleor App Twilio Segment</h1>
</div>

<div align="center">
  <a href="https://saleor.io/">🏠 Website</a>
  <span> • </span>
  <a href="https://docs.saleor.io/docs/3.x/">📚 Docs</a>
  <span> • </span>
  <a href="https://saleor.io/blog/">📰 Blog</a>
</div>

## Local development setup

### Prerequisites

- [Node.js](https://nodejs.org) v22+
- [PNPM](https://pnpm.io/) v9+
- An account on [Twilio Segment](https://segment.com/) with configured [source](https://segment.com/docs/partners/sources/).

### Running app in development mode

1. Install the dependencies by running the following command in the shell:

```shell
pnpm install
```

2. Create a file named `.env` and use the contents of the [`.env.example`](./.env.example) file as a reference.

3. Start the development server by running the following command in the shell:

```shell
pnpm dev
```

4. App will be available under `http://localhost:3000`

> [!NOTE]
> To install app in Saleor Cloud, you need to expose your local server to the internet (tunnel). You can use Saleor CLI to do that. See this [guide](https://docs.saleor.io/docs/3.x/developer/extending/apps/developing-with-tunnels) for more details.

6. Install app on the Saleor dashboard.
7. After installation, configure the app as follows:
   - Paste [`writeKey`](https://segment.com/docs/connections/find-writekey/) into app configuration form

### Webhook migration scripts

> [!NOTE]
> This section refers to apps hosted by Saleor or using REST APL. If you self host AvaTax app you need to write your own logic for updating migration scripts.
> See [How to update app webhooks](https://docs.saleor.io/docs/3.x/developer/extending/apps/updating-app-webhooks) for more info.

You need to set `REST_APL_TOKEN` & `REST_APL_ENDPOINT` in our `.env` file first.

Test migration with dry run, operation will not modify any data:

```bash
pnpm migrate:dry-run
```

To start the migration run command:

```bash
pnpm migrate
```
