<div align="center">
<img width="150" alt="saleor-app-template" src="https://github.com/saleor/dummy-payment-app/blob/main/public/logo.png?raw=true">
</div>

<div align="center">
  <h1>Dummy Payment App</h1>
</div>

<div align="center">
  <p>Bare-bones app for testing Saleor's <a href="https://docs.saleor.io/docs/developer/payments#payment-app">Transactions API</a></p>
</div>

<div align="center">
  <a href="https://saleor.io/">Website</a>
  <span> | </span>
  <a href="https://docs.saleor.io/docs/3.x/">Docs</a>
</div>

> [!TIP]
> Questions or issues? Check our [discord](https://discord.gg/H52JTZAtSH) channel for help.

### What is Dummy Payment App?

The Dummy Payment App allows you to test Saleor's payment and checkout features without needing to set up a real payment provider. You can create orders, process payments, issue refunds, and more, all within the Saleor Dashboard.

### App features

- Create new checkouts and orders from the Saleor Dashboard:

![Dummy Payment App has UI in Saleor dashboard for creating new orders from checkouts with Transactions](docs/1_checkout.jpeg)

- Process payments and update transaction statuses:

![Dummy Payment App has UI in Saleor dashboard for updating Transactions](docs/2_event_reporter.jpeg)

> [!TIP]
> Each Transaction has `externalUrl` that links to this page from Order details page in Saleor Dashboard:

- Issue refunds, process charges and cancellations for Transactions

### How does it work?

The Dummy Payment App supports the following webhooks to enable payment flows:

The app implements webhooks to process payments initiated from your storefront:

- `PAYMENT_GATEWAY_INITIALIZE_SESSION`
- `TRANSACTION_INITIALIZE_SESSION`
- `TRANSACTION_PROCESS_SESSION`

It also implements webhooks to allow updating the status of Transactions from the Saleor Dashboard, similar to how a real third-party payment provider would:

- `TRANSACTION_REFUND_REQUESTED`
- `TRANSACTION_CHARGE_REQUESTED`
- `TRANSACTION_CANCELATION_REQUESTED`

### Running the Dummy Payment App

To run the Dummy Payment App locally, follow these steps:

1. **Install dependencies**

This project uses [pnpm](https://pnpm.io/) as the package manager. If you don't have it installed, you can enable it with corepack:

```sh
npm install --global corepack@latest
corepack enable pnpm
pnpm install
```

2. **(Optional) Set up environment variables for custom URLs**

By default, no environment variables are required. However, if you are developing locally with Docker or using tunnels, you may want to customize the app's URLs. Copy the example environment file if you want to override defaults:

```sh
cp .env.example .env
```

Check [Saleor Docs about local app development](https://docs.saleor.io/developer/extending/apps/local-app-development) for more details

3. **Run the app locally**

Start the development server:

```sh
pnpm dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### How to use the app?

After installing the app in Saleor, visit the app's Dashboard.

There you can create a [Checkout](https://docs.saleor.io/developer/checkout/overview), a set shipping method on that checkout.
After that step is completed you can initialize a Transaction using [`transactionInitialize`](https://docs.saleor.io/api-reference/payments/mutations/transaction-initialize) mutation. App's response to that mutation can be modified using provided input.

The checkout process in app looks like this:

1. Select channel where you want to create the Checkout
2. Click "Create checkout" to create Checkout in Saleor in your selected channel
3. Click "Set delivery" to set delivery method on that checkout
4. Set response you want the app to return for [`TRANSACTION_INITIALIZE_SESSION`](https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction#initialize-transaction-session)
5. Click "Initialize transaction"
6. Wait until response is returned and click "Complete checkout" to send [`checkoutComplete`](https://docs.saleor.io/api-reference/checkout/mutations/checkout-complete) mutation

### Using app with custom storefront

Dummy Payment App provides a built-in storefront for creating Transactions in Saleor. If you want to test your own storefront before integrating a real payment provider or you prefer to make requests manually here is a description of all available Transaction mutations in Saleor supported by app.

#### Modifying response via `data` field

When you send [`transactionInitialize`](https://docs.saleor.io/api-reference/payments/mutations/transaction-initialize) or [`transactionProcess`](https://docs.saleor.io/api-reference/payments/mutations/transaction-process) mutations to Saleor, you can include a `data` field in your mutation variables. This `data` field is passed through to the Dummy Payment App's webhooks. The app uses the content of this `data` field to determine how it should respond.

For this app, the crucial parts of the `data` field you send are:

- `data.event.type`: Specifies the desired outcome of the transaction (e.g., `CHARGE_SUCCESS`, `AUTHORIZATION_FAILURE`). This directly controls the `result` field in the app's response. See [`TransactionEventTypeEnum`](https://docs.saleor.io/api-reference/payments/enums/transaction-event-type-enum) for all possible values.
- `data.event.includePspReference`: A boolean indicating whether the app should generate and return a `pspReference` in its response or if it should return `undefined`.

#### 1. [`transactionInitialize`](https://docs.saleor.io/api-reference/payments/mutations/transaction-initialize) Mutation

Use the [`transactionInitialize`](https://docs.saleor.io/api-reference/payments/mutations/transaction-initialize) mutation to start a new transaction. It can be created on either Checkout or Order objects.

##### GraphQL Mutation

```graphql
mutation TransactionInitialize(
  $id: ID! # Checkout or Order ID
  $action: TransactionFlowStrategyEnum # Override channel default action - e.g., CHARGE, AUTHORIZATION
  $amount: PositiveDecimal # Override default amount (totalBalance)
  $data: JSON! # Data object to control app behavior - required
) {
  transactionInitialize(id: $id, action: $action, amount: $amount, data: $data) {
    transactionEvent {
      pspReference # Populated based on your data.event.includePspReference
      amount {
        amount
        currency
      }
      type # Reflects your data.event.type
    }
    data # The JSON response from this app's webhook (see "App's Webhook Response Structure" below)
    errors {
      field
      message
      code
    }
  }
}
```

##### Example Variables for `transactionInitialize`

Here's how you'd structure the variables, focus on the `data` field which is required by the app:

```json
{
  "id": "Q2hlY2tvdXQ6YWY3MDJkMGQtMzM0NC00NjMxLTlkNmEtMDk4Yzk1ODhlNmMy",
  "action": "CHARGE",
  "amount": 54.24,
  "data": {
    "event": {
      "type": "CHARGE_SUCCESS", // See below for all possible types
      "includePspReference": true // true or false
    }
  }
}
```

When the app receives the `TRANSACTION_INITIALIZE_SESSION` webhook triggered by this mutation:

- If `data.event.includePspReference` from your mutation is `true`, the app's response will contain a `pspReference` (a v7 UUID). Otherwise, `pspReference` will be `undefined` (or `null`).
- The `data.event.type` you send (e.g., `"CHARGE_SUCCESS"`) will become the `result` in the app's JSON response.
- The `actions` array in the app's response (e.g., `["REFUND", "CANCEL"]`) is also determined by the `data.event.type`.

##### Available types

App accepts following types in `data.event.type` (these are taken from the possible responses the app can send to Saleor from the [`TRANSACTION_INITIALIZE_SESSION`](https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction#response) webhook, see [Saleor docs](https://docs.saleor.io/developer/extending/webhooks/synchronous-events/transaction#response) for details):

- `CHARGE_REQUEST`
- `CHARGE_ACTION_REQUIRED`
- `CHARGE_FAILURE`
- `CHARGE_SUCCESS`
- `AUTHORIZATION_REQUEST`
- `AUTHORIZATION_ACTION_REQUIRED`
- `AUTHORIZATION_FAILURE`
- `AUTHORIZATION_SUCCESS`

#### 2. [`transactionProcess`](https://docs.saleor.io/api-reference/payments/mutations/transaction-process) Mutation

This mutation is used for subsequent steps in a transaction flow, such as handling 3D Secure authentication or other additional actions required by a payment provider. It is used after payment app returns `CHARGE_ACTION_REQUIRED` or `AUTHORIZATION_ACTION_REQUIRED` event types.

##### GraphQL Mutation

```graphql
mutation TransactionProcess(
  $id: ID! # Transaction ID from the previous step
  $data: JSON! # Data object to control app behavior - required
) {
  transactionProcess(id: $id, data: $data) {
    transaction {
      id
      actions
    }
    transactionEvent {
      message
      type # Reflects your data.event.type
    }
    data # The JSON response from this app's webhook (see "App's Webhook Response Structure" below)
    errors {
      field
      code
      message
    }
  }
}
```

##### Example Variables for `transactionProcess`

```json
{
  "id": "VHJhbnNhY3Rpb25JdGVtOjRhODMxNThkLTU0NTAtNDU2Mi04MDE5LTAzYzY4NjMyZjA1Mg==",
  "data": {
    "event": {
      "type": "CHARGE_SUCCESS",
      "includePspReference": true
    }
  }
}
```

When the app receives the `TRANSACTION_PROCESS_SESSION` webhook:

- The app handles the `data` field (specifically `data.event.type` and `data.event.includePspReference`) similarly to `transactionInitialize` to shape its response. The `result` and `pspReference` in the app's output will be based on these values.

#### App's webhook response structure

When the Dummy Payment App's webhooks are called (triggered by [`transactionInitialize`](https://docs.saleor.io/api-reference/payments/mutations/transaction-initialize) or [`transactionProcess`](https://docs.saleor.io/api-reference/payments/mutations/transaction-process) mutations), the `data` field within Saleor's GraphQL mutation response (i.e., `transactionInitialize.data` or `transactionProcess.data`) will be structured by this app as follows:

##### On Successful Processing (based on your input `data`):

```json
{
  "pspReference": "xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx",
  "result": "CHARGE_SUCCESS",
  "message": "Great success!",
  "actions": ["REFUND", "CANCEL"],
  "amount": null,
  "externalUrl": "https://your-app-deployment-url.com/app/transactions/<transaction_id>"
}
```

##### On Validation Error (if `data` sent to webhook is malformed):

If the `data` field you provide in the mutation doesn't match the app's expected schema (defined in `src/modules/validation/sync-transaction.ts`), the app will return an error structure within the `data` field of the mutation response:

```json
{
  "pspReference": "xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx",
  "result": "CHARGE_FAILURE",
  "message": "Zod validation error message details...",
  "amount": 54.24,
  "actions": [],
  "data": {
    "exception": true
  }
}
```

### Learn more

#### Docs

- [**Apps guide**](https://docs.saleor.io/docs/developer/extending/apps/overview) - learn more how to build your own Saleor app
- [**Transactions API**](https://docs.saleor.io/docs/developer/payments) - learn how to use Transactions API in your store
- [**Payment App webhooks**](https://docs.saleor.io/docs/developer/extending/webhooks/synchronous-events/transaction) - learn how to build your own Payment App

#### Examples

- [**Stripe Payment App**](https://github.com/saleor/saleor-app-payment-stripe)
- [**Stripe Example Storefront**](https://github.com/saleor/example-nextjs-stripe)

## Development

You can find docs about App development in the [Saleor documentation](https://docs.saleor.io/developer/extending/apps/developing-apps/app-examples).

## Support

Please open GitHub issues if you find any problem with this app. PRs are welcome too 😄

You can find help with Saleor in these places:

- [GitHub Discussions](https://github.com/saleor/saleor/discussions)
- [Saleor Discord](https://discord.gg/H52JTZAtSH)

## Credits

- App logo: [Lucide](https://lucide.dev/license)

## PCI DSS compliance

This application is exempted from PCI DSS requirements due to not allowing users to input any credit card number.
