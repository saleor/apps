![Saleor AvaTax App](https://user-images.githubusercontent.com/249912/71523206-4e45f800-28c8-11ea-84ba-345a9bfc998a.png)

<div align="center">
  <h1>Saleor App AvaTax</h1>
</div>

<div align="center">
  <p>Connect your dynamic taxes calculation to AvaTax API.</p>
</div>

<div align="center">
  <a href="https://saleor.io/">🏠 Website</a>
  <span> • </span>
  <a href="https://docs.saleor.io/docs/3.x/">📚 Docs</a>
  <span> • </span>
  <a href="https://saleor.io/blog/">📰 Blog</a>
  <span> • </span>
  <a href="https://twitter.com/getsaleor">🐦 Twitter</a>
</div>

## Documentation

Visit [AvaTax App documentation](https://docs.saleor.io/docs/3.x/developer/app-store/apps/avatax/overview) to learn how to configure and develop the app locally.

### DynamoDB

DynamoDB is used to store Client-side logs. To develop this feature locally:

1. Run `docker compose up` for local DynamoDB instance
2. Run `bash scripts/setup-dynamodb.sh` to describe DynamoDB table

Ensure following env variables are set

```dotenv
FF_ENABLE_EXPERIMENTAL_LOGS=true
DYNAMODB_LOGS_ITEM_TTL_IN_DAYS=30
DYNAMODB_LOGS_TABLE_NAME=avatax-client-logs # must match scripts/setup-dynamodb.sh
```

Alternatively, you can connect to AWS-based DynamoDB:

1. Create table in your AWS, based on parameters in `scripts/setup-dynamodb.sh`
2. Set AWS-specific [env variables](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-environment.html)

If `FF_ENABLE_EXPERIMENTAL_LOGS` is not set, you don't have to provide anything - feature will be disabled

## Testing

### E2E tests

Our E2E tests are using [PactumJS](https://pactumjs.github.io/) for making requests to Saleor instance and a separate [Vitest workspace](https://vitest.dev/guide/workspace.html) for running tests.

Before running tests, you have to set up `.env` file with `TEST_SALEOR_API_URL` that points to your Saleor instance with installed AvaTax app. For reference, you can use `.env.example` file:

```bash
cp .env.example .env
```

You should also add `E2E_USER_NAME` and `E2E_USER_PASSWORD` which are credentials for a staff user that has permissions of `MANAGE_ORDERS`.

You also have to generate GraphQL files using `graphql-codegen`:

```bash
pnpm run generate
```

#### Running tests

After you complete the setup, run the tests with:

```bash
pnpm run e2e
```

#### Saleor instance requirements

Our tests include default data that is used for our specific Saleor instance. It includes IDs of products, channels, vouchers, etc. You can find them in `e2e/data/maps` and `e2e/data/templates`.

If you want to create a new instance from scratch, you have to create a fork of this repository and create following configuration in your Saleor:

- **Channels**
  - Create USA channel with `USD` currency and `United States` as country, the channel should have `orderSettings`: `allowUnpaidOrders: true`, `automaticallyConfirmAllNewOrders: true`
- **Warehouse**: create new warehouse or use existing ones and set-up shipping methods for your new channel
- **Tax classes**: create each tax class for test case used in our tests (see `e2e/data/maps/product.json`)
- **Products**
  - Create or use existing products (from default [saleor-platform](https://github.com/saleor/saleor-platform) seed data) and assign them tax class and make them available in USA channel
- **Tax configuration**: Set USA channel tax configuration ot `tax app` and `pricesEnteredWithTax: false`
- **App**: Install AvaTax app and configure it with your account, assign shipping address in USA, and set up tax classes for products

### Bruno

[Bruno](https://docs.usebruno.com/) is an open source tool for exploring and testing APIs. It's similar to Postman or Insomnia.

This app has a collection of requests to Saleor that go through fetching a product from channel, creating a checkout, adding shipping method and completing checkout (channel must have `allowUnpaidOrders` setting set to `true`). You also need to set `enableAccountConfirmationByEmail` to `false` in your shop site settings.

To set up Bruno, go to the `bruno` directory and run

```bash
pnpm install --ignore-workspace
```

After that, you have to prepare an environment for Bruno. Environments are a set of variables that are used in requests.

To use your own storefront user create `.env` file inside `bruno` folder with:

```
SALEOR_API_URL=

STOREFRONT_USER_EMAIL=
STOREFRONT_USER_PASSWORD=
STOREFRONT_USER_NAME=

STAFF_USER_EMAIL=
STAFF_USER_PASSWORD=

CHANNEL_SLUG=
PROMO_CODE=
```

The app has an example environment for `localhost` in `environments/localhost.bru`. You can copy it to bootstrap your own environment e.g `cloud.bru` (which will be ignored by git).

### Webhook migration scripts

> [!NOTE]
> This section refers to apps hosted by Saleor or using REST APL. If you self host AvaTax app you need to write your own logic for updating migration scripts.
> See [How to update app webhooks](https://docs.saleor.io/docs/3.x/developer/extending/apps/updating-app-webhooks) for more info.

You need to set `REST_APL_TOKEN` & `REST_APL_ENDPOINT` in our `.env` file first. Set `DANGEROUS_ENABLE_MIGRATION_CONSOLE_LOGGER` to see migration results in your shell.

Test migration with dry run, operation will not modify any data:

```bash
pnpm migrate:dry-run
```

To start the migration run command:

```bash
pnpm migrate
```

### Running the app in docker

To run the app in docker, you need to build the image first (run this command in the root directory of the monorepo):

```shell
docker build --tag saleor-app-avatax-docker --file Dockerfile.avatax.dev .
```

Then you can run the image (run this command in the root directory of the monorepo):

```shell
docker run -p 3000:3000 --env-file apps/avatax/.env saleor-app-avatax-docker
```
