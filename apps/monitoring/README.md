# Saleor Monitoring app

❗️NOTE: This is Alpha version of the app.❗️

## Local development

### Start Monitoring backend

Run:

```shell
docker-compose up
```

It is beneficial to run this command in a separate terminal tab to observe backend logs easily.

By default, backend will run at `localhost:5001` with:

- Manifest at `/manifest`
- Graphql Playground at `/graphql`
- OpenApi viewer at `/docs`

### Develop frontend:

Installing dependencies with:

```shell
pnpm i
```

Running dev server

```shell
pnpm dev
```

The frontend app will run at `localhost:3000`.
By default, it acts as a proxy and redirects all unhandled requests to the backend (configured by `MONITORING_APP_API_URL` env).
This way, all frontend and backend endpoints are accessible at `http://localhost:3000`

### Test with Saleor

Expose `http://localhost:3000` using a tunnel and use `https://your.tunnel/manifest` manifest URL to install `Monitoring` app

### Graphql Playground

To use Graphql Playground, `Monitoring` app needs to be installed in Saleor, and HTTP headers must be set:

```json
{
  "authorization-bearer": "token",
  "saleor-api-url": "https://my-env.saleor.cloud/graphql/"
}
```

### Testing DataDog integration

Set `MOCK_DATADOG_CLIENT` env to `True`

Use these credentials sets to test DataDog integration:

Working credentials:

```json
{
  "site": "US1",
  "apiKey": "156e22d50c4e8b6816e1fd4794d3fd8c"
}
```

Credentials that validate but generate an error while sending events

```json
{
  "site": "EU1",
  "apiKey": "156e22d50c4e8b6816e1fd4794d3fd8c"
}
```
