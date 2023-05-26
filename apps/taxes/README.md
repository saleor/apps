# Saleor App Taxes Hub

![Hero image](https://user-images.githubusercontent.com/249912/71523206-4e45f800-28c8-11ea-84ba-345a9bfc998a.png)

Hub for configuring taxes in Saleor using different providers

## Overview

_Taxes_ is a Saleor app that allows delegating tax calculations to external tax providers. Here are the currently available providers:

- [TaxJar](https://www.taxjar.com/)
- [Avatax](https://www.avalara.com/us/en/products/calculations.html)
- [Avatax Excise](https://developer.avalara.com/excise/) [_coming soon_]
- [Stripe Tax](https://stripe.com/tax) [_coming soon_]

Taxes App offers flexibility in how you calculate taxes. You can have one provider for all your channels or use different providers for each channel. You can even create multiple configurations of the same provider (f.e. if you have a different account for testing).

:::caution

To successfully configure the Taxes App, you must have an account with one of the supported tax providers.

:::

## Configuration

### Channels

For a channel to appear on the _Channels_ list, you must first select **"use tax app"** as its tax calculation method. You can do that on the _Tax Configuration_ page (_Configuration_ → _Taxes_).

In the _Taxes_ page, select the channel and change the value of _Select the method of tax calculation_ to "_Use tax app_". Then save it and come back to the Taxes App.

### Providers

In the _Providers_ tab, you can manage your tax provider instances. Each tax provider instance is a different set of credentials for a specific tax provider.

Here are the required fields for each provider:

#### TaxJar

- Instance name - a name for the instance. It will be used to identify the instance across all the views.
- API Key - [the API key](https://developers.taxjar.com/api/reference/#authentication) for the TaxJar account.
- Sandbox - a flag that indicates whether the instance should use [the sandbox environment or the production environment](https://developers.taxjar.com/api/reference/#sandbox-environment).

#### Avatax

- Instance name - a name for the instance. It will be used to identify the instance across all the views.
- Sandbox - a flag that indicates whether the instance should use [the sandbox environment or the production environment](https://developer.avalara.com/erp-integration-guide/sales-tax-badge/authentication-in-avatax/sandbox-vs-production/).
- Autocommit - a flag that indicates whether the instance should [automatically commit the transactions](https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit/).
- Username - the username for the Avatax account. You will generate it in the Avalara dashboard (_Settings_ → _License and API keys_ → _License key_).
- Password - the password for the Avatax account. You will generate it in the Avalara dashboard (_Settings_ → _License and API keys_ → _License key_).
- Company code - the [company code](https://developer.avalara.com/ecommerce-integration-guide/sales-tax-badge/transactions/simple-transactions/company-codes/) for the Avatax account.

## Development

To run the Taxes App locally:

1. Follow the [_Setup_ section in the _Development_ article](developer/app-store/development.mdx#setup).
2. Go to the app directory.
3. Copy the `.env.example` file to `.env`.The `.env` should contain the following variables:

:::info

Taxes is a Next.js application. If you want to learn more about setting environment variables in Next.js, head over to the [documentation](https://nextjs.org/docs/basic-features/environment-variables).

:::

`SECRET_KEY` (_optional_)

A randomly generated key for the encryption of [Settings Manager](https://github.com/saleor/saleor-app-sdk/blob/main/docs/settings-manager.md).

Although it is not required in the development, we recommend to set it. If not set, a random key will be generated on each app start.

`APL` (_optional_)

Name of the chosen implementation of the [Authentication Persistence Layer](https://github.com/saleor/saleor-app-sdk/blob/main/docs/apl.md).

When no value is provided, `FileAPL` is used by default. See `saleor-app.ts` in the app directory to see supported APLs.

`APP_LOG_LEVEL` (_optional_)

Logging level based on which the app will decide on what messages to log.

The possible values are: `trace`, `debug`, `info`, `warn`, `error`, `fatal`, `silent`. The default value is `silent` which means no logs will be printed.

You can read more about our logger in [its documentation](https://getpino.io/#/docs/api?id=loggerlevel-string-gettersetter).

`ALLOWED_DOMAIN_PATTERN` (_optional_)

A regex pattern that prohibits the app from being installed on a Saleor instance that does not match the pattern. If not set, all installations will be allowed.
