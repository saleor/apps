<div align="center">
  <h1>Saleor App Payment Stripe</h1>
</div>

<div align="center">
  <a href="https://saleor.io/">🏠 Website</a>
  <span> • </span>
  <a href="https://docs.saleor.io/developer/app-store/apps/stripe/overview">📚 Docs</a>
  <span> • </span>
  <a href="https://saleor.io/blog/">📰 Blog</a>
</div>

## Local development setup

### Prerequisites

- [Node.js](https://nodejs.org) v22+
- [PNPM](https://pnpm.io/) v10+

### Running app locally in development containers

> [!IMPORTANT]
> You can use devcontainer Dockerfile and docker-compose.yaml directly - but remember to run `pnpm install` manually

The easiest way of running Saleor for local development is to use [development containers](https://containers.dev/).
If you have Visual Studio Code follow their [guide](https://code.visualstudio.com/docs/devcontainers/containers#_quick-start-open-an-existing-folder-in-a-container) on how to open existing folder in container.

Development container only creates container, you still need to start the server.

Development container will have two ports opened:

1. `3000` - were app dev server will listen to requests

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

### Integration tests

To run integration tests:

1. Create `.env` file inside `__tests__/integration` based on `__tests__/integration/.env.test`
2. Run tests:

```shell
pnpm run test:integration
```

Tests are using mocking Saleor and using local DynamoDB in Docker but are calling real Stripe API.

### E2E tests

To run e2e tests:

1. Add env variables to `.env` in root of this folder:

```
E2E_BASE_URL= # Test client url that will be used by e2e to pay with Stripe
E2E_SALEOR_API_URL= # Saleor API url that tests will run against
E2E_CHARGE_CHANNEL_SLUG= # Slug of channel that has transactionFlow: CHARGE set
E2E_AUTHORIZATION_CHANNEL_SLUG= # Slug of channel that has transactionFlow: AUTHORIZATION set
```

2. Run tests:

```shell
pnpm run test:e2e
```

Tests are using Stripe staging app that is already installed on Saleor environments.
