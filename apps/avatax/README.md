![Saleor Avatax App](https://user-images.githubusercontent.com/249912/71523206-4e45f800-28c8-11ea-84ba-345a9bfc998a.png)

<div align="center">
  <h1>Saleor App Avatax</h1>
</div>

<div align="center">
  <p>Connect your dynamic taxes calculation to Avatax API.</p>
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

Visit [Taxes App documentation](https://docs.saleor.io/docs/3.x/developer/app-store/apps/taxes/overview) to learn how to configure and develop the app locally.

## Testing

### E2E tests

Our E2E tests are using [PactumJS](https://pactumjs.github.io/) for making requests to Saleor instance and a separate [Vitest workspace](https://vitest.dev/guide/workspace.html) for running tests.

Before running tests, you have to set up `.env` file with `TEST_SALEOR_API_URL` that points to your Saleor instance with installed AvaTax app. For reference, you can use `.env.example` file:

```bash
cp .env.example .env
```

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

This app has a collection of requests to Saleor that go through fetching a product from channel, creating a checkout, adding shipping method and completing checkout (channel must have `allowUnpaidOrders` setting set to true)

To set up Bruno, go to the `bruno` directory and run

```bash
pnpm i
```

After that, you have to prepare an environment for Bruno. Environments are a set of variables that are used in requests.

The app has an example environment for `localhost` in `environments/localhost.bru`. You can copy it to bootstrap your own environment.
