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
> To install app in Saleor Cloud, you need to expose your local server to the internet (tunnel). You can use Saleor CLI to do that. See this [guide](https://docs.saleor.io/developer/extending/apps/developing-with-tunnels) for more details.

6. Install app on the Saleor dashboard.

### Integration tests

To run integration tests:

1. Create a file named `.env.test` and use the contents of the [`.env.test.example`](./.env.test.example) file as a reference.
2. Change values of `INTEGRATION_*` variables
3. Run tests:

```shell
pnpm run test:integration
```

Tests are using mocking Saleor and using local DynamoDB in Docker but are calling real Stripe API.

### E2E tests

To run e2e tests:

1. Create a file named `.env.test` and use the contents of the [`.env.test.example`](./.env.test.example) file as a reference.
2. Change values of `E2E_*` variables
3. Run tests:

```shell
pnpm run test:e2e
```

Tests are using Stripe staging app that is already installed on Saleor environments.

## Supported Payment Methods

The Stripe app supports the following payment methods:

- **Card payments** - Credit and debit cards
- **PayPal** - PayPal digital wallet
- **Klarna** - Buy now, pay later
- **Apple Pay** - Apple's digital wallet
- **Google Pay** - Google's digital wallet
- **iDEAL** - Direct bank transfers (Netherlands)

### iDEAL Configuration

iDEAL payments are supported for merchants in the Netherlands. To enable iDEAL:

1. Ensure your Stripe account is configured for iDEAL payments
2. iDEAL payments support both immediate charges and authorizations
3. Customers will be redirected to their bank for authentication
4. The capture method is controlled at the PaymentIntent level, not in payment method options
