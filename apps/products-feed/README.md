<div style="text-align: center">
  <img width="150" alt="" src="./public/logo.png">
</div>

<div style="text-align: center">
  <h1>Saleor App Products feed</h1>

  <p>Product Feed app allows generating an XML file with products and their details. The file can be used as a feed source for Google Merchant Center.</p>
</div>

<div style="text-align: center">
  <a target="_blank" rel="noopener noreferrer" href="https://docs.saleor.io/developer/app-store/apps/product-feed">Docs</a>
<br><br>
</div>

### How to use this project

#### Requirements

- [node v22](https://nodejs.org)
- [pnpm](https://pnpm.io/)
- [ngrok](https://ngrok.com/)
- Saleor Cloud account (free!) or local instance
- AWS S3 bucket (if you want to store your XML file in S3 bucket)

#### Running app locally in development containers

> [!IMPORTANT]
> You can use devcontainer Dockerfile and docker-compose.yaml directly - but remember to run `pnpm install` manually

The easiest way of running Saleor for local development is to use [development containers](https://containers.dev/).
If you have Visual Studio Code follow their [guide](https://code.visualstudio.com/docs/devcontainers/containers#_quick-start-open-an-existing-folder-in-a-container) on how to open existing folder in container.

Development container only creates container, you still need to start the server.

Development container will have port opened:

1. `3000` - were app dev server will listen to requests

#### Running app in development mode

1. Install the dependencies by running the following command in the shell:

```shell
pnpm install
```

2. Create a file named `.env` and use the contents of the [`.env.example`](./.env.example) file as a reference.

3. Start the development server by running the following command in the shell:

```shell
pnpm dev
```

4. The Products feed app will be available under `http://localhost:3000`

5. Tunnel the app by running:

```shell
ngrok http localhost:3000
```

> [!NOTE]
> See [How to tunnel an app](https://docs.saleor.io/developer/extending/apps/developing-with-tunnels) for more info.

6. Go to Dashboard, open `Apps` tab and click `Install external app`, provide your tunnel URL with the path for the manifest file. For example `${YOUR_TUNNEL_URL}/api/manifest`

### Configuration

[Here](./docs/configuration.md) you can find doc how configure the app

### Generated schema and typings

Commands `build` and `dev` would generate schema and typed functions using Saleor's GraphQL endpoint. Commit `generated` folder to your repo as they are necessary for queries and keeping track of the schema changes.

[Learn more](https://www.graphql-code-generator.com/) about GraphQL code generation.

### Storing registration data - APL

During the registration process, Saleor API passes the auth token to the app. With this token, the app can query Saleor API with privileged access (depending on permissions requested during installation).
To store this data, the app-template uses a different [APL interface](https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/apl).

The choice of the APL is done using `APL` environment variable. If the value is not set, FileAPL is used. Available choices:

- `file`: no additional setup is required. Good choice for local development. Can't be used for multi tenant-apps or be deployed (not intended for production)
- `upstash`: use [Upstash](https://upstash.com/) Redis as storage method. Free account required. Can be used for development and production and supports multi-tenancy. Requires `UPSTASH_URL` and `UPSTASH_TOKEN` environment variables to be set

If you want to use your own database, you can implement your own APL. [Check the documentation to read more.](https://docs.saleor.io/developer/extending/apps/developing-apps/app-sdk/apl)

### Learn more about Saleor Apps

[Apps guide](https://docs.saleor.io/docs/3.x/developer/extending/apps/key-concepts)

[Configuring apps in dashboard](https://docs.saleor.io/docs/3.x/dashboard/apps)

## OTEL

Visit `@saleor/apps-otel` [README](../../packages/otel/README.md) to learn how to run app with OTEL locally.
