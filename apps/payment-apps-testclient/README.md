# Payment apps testclient

> [!TIP]
> Questions or issues? Check our [discord](https://discord.gg/H52JTZAtSH) channel for help.

Example storefront for testing Saleor payment apps. It allows to create & complete checkout while paying with [Adyen app](https://github.com/saleor/saleor-app-payment-adyen) drop-in or [Stripe app](../stripe) Payment Element.

## How to get started

Install the dependencies from the monorepo root:

```shell
pnpm install
```

Create `.env.local` file in this directory with:

```
NEXT_PUBLIC_INITIAL_ENV_URL= # url of your env (must end with /graphql/)
NEXT_PUBLIC_INITIAL_CHANNEL_SLUG= # in the most cases it will be default-channel
NEXT_PUBLIC_LOG_LEVEL= # one of info, warn or error. Defaults to info
NEXT_PUBLIC_INITIAL_CHECKOUT_COUNTRY_CODE= # one of PL, US, SE - defaults to US
```

Run dev server (port 3001) via:

```shell
pnpm --filter saleor-payment-apps-testclient dev
```

After changing GraphQL documents, regenerate gql.tada types with `pnpm generate`. The schema is the monorepo root `schema.graphql`.

## Recommended VSCode settings

Create `settings.json` under `.vscode` folder with:

```json
{
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "editor.quickSuggestions": {
    "strings": "on"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "workbench.editor.customLabels.patterns": {
    "**/app/**/page.tsx": "${dirname} - page.tsx",
    "**/app/**/layout.tsx": "${dirname} - layout.tsx",
    "**/app/**/error.tsx": "${dirname} - error.tsx",
    "**/app/**/loading.tsx": "${dirname} - loading.tsx"
  }
}
```

## Using with other environments

Make sure you added deployment URL to `allowed client hosts` in Adyen app configuration & Adyen Dashboard

Check table below with possible URL paths and how you can supply your own data:

| Path                                                                                | Location                                             |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `/env/<ENV_URL>/checkout/<CHECKOUT_ID>/`                                            | Details of checkout (shipping & billing sections)    |
| `/env/<ENV_URL>/checkout/<CHECKOUT_ID>/payment-gateway/`                            | Allows you to select payment gateway                 |
| `/env/<ENV_URL>/checkout/<CHECKOUT_ID>/payment-gateway/<GATEWAY_ID>/`               | Renders Adyen drop-in component                      |
| `/env/<ENV_URL>/checkout/<CHECKOUT_ID>/payment-gateway/<GATEWAY_ID>/summary`        | Shows checkout summary and allows to create an order |
| `/env/<ENV_URL>/checkout/<CHECKOUT_ID>/payment-gateway/stripe/<GATEWAY_ID>/`        | Renders Stripe Payment Element                       |
| `/env/<ENV_URL>/checkout/<CHECKOUT_ID>/payment-gateway/stripe/<GATEWAY_ID>/summary` | Shows Stripe payment status and checkout summary     |

Variables used in table:

- `ENV_URL` is encoded url to your environment (must end with `/graphql/`)
- `CHECKOUT_ID` is id of checkout you want to use
- `GATEWAY_ID` is id of payment app e.g. `app.saleor.adyen` or `saleor.app.payment.stripe`
