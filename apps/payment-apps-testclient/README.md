# Payment apps testclient

> [!TIP]
> Questions or issues? Check our [discord](https://discord.gg/H52JTZAtSH) channel for help.

Example storefront for testing Saleor payment apps. Create or open a checkout,
configure its addresses and delivery method, then select Adyen, Stripe, Square
Online, or Square Terminal. All providers use the same checkout setup; their
payment workflows branch at gateway selection.

## Preparing a checkout

Fetch products from a Saleor environment and channel. The cart selects two distinct
products by default, with quantities two and one when stock allows. Channels with
one suitable product still work. The selection uses priced, available variants,
including products without a default variant. Set a variant quantity to zero to
remove it, edit quantities to exercise different totals, and use product search
or **Load more products** to find other items. Saleor validates current stock and
prices when the checkout is created.

For a prepared checkout, enter its ID and choose **Open checkout**. This works
without fetching products and is useful for discounts, pickup, or other scenarios
set up outside the test client.

## Provider workflows

- **Adyen:** the existing drop-in and transaction processing flow.
- **Stripe:** the existing Payment Element and payment status flow.
- **Square Online:** Web Payments SDK methods, gift cards and partial payments,
  and optional customer login for saving, listing, deleting, and paying with saved
  cards. Login happens after selecting Square.
- **Square Terminal:** staff attribution, device/location selection, status polling,
  cancellation, and recovery after refresh. This choice appears only when the
  server has Terminal configuration; it is not advertised by Saleor as an online
  gateway.

The unified test client is public. It calls the Square apps through their public
protocols and has no source dependency on their private implementations.

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

## Validation

From the monorepo root:

```shell
pnpm --filter saleor-payment-apps-testclient check-types && pnpm --filter saleor-payment-apps-testclient test:ci
pnpm lint apps/payment-apps-testclient
pnpm --filter saleor-payment-apps-testclient generate
pnpm --filter saleor-payment-apps-testclient test:e2e:install
pnpm --filter saleor-payment-apps-testclient test:e2e
```

Browser tests run a production build against simulated Saleor/Terminal services.
They cover cart setup, gateway selection, Terminal signing, cancellation, and
recovery. They do not exercise live provider accounts or physical Terminal hardware.
Square payment summaries wait for Saleor payment coverage before enabling checkout
completion; the existing Adyen and Stripe summaries retain their behavior.
