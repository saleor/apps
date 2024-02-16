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

### Bruno

[Bruno](https://docs.usebruno.com/) is an open source tool for exploring and testing APIs. It's similar to Postman or Insomnia.

This app has a collection of requests to Saleor that go through fetching a product from channel, creating a checkout, adding shipping method and completing checkout (channel must have `allowUnpaidOrders` setting set to true)

To set up Bruno, go to the `bruno` directory and run

```bash
pnpm i
```

After that, you have to prepare an environment for Bruno. Environments are a set of variables that are used in requests.

The app has an example environment for `master.staging` in `environments/staging.bru`. You can copy it to bootstrap your own environment.
