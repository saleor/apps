# Saleor App CRM

_CRM_ is a Saleor App that allows providing customer data to external services. Here are the currently available providers:

- [Mailchimp](http://mailchimp.com/)
- [Twilio Segment](https://segment.com/) [_coming soon_]
- [RudderStack](https://www.rudderstack.com/) [_coming soon_]

There are two main features CRM App provides:

- Initial indexing of existing Saleor customers and sending them to the provider contact list
- Synchronizing new customers between Saleor and the provider

>**Warning**
>
> To successfully configure the CRM App, you must:
> - Have a Mailchimp account
> - Have a Saleor user with `MANAGE_APPS` permission


## Installation

The App can be installed from [Saleor App Store](https://docs.saleor.io/docs/3.x/developer/app-store/overview). To install the App, you must have `MANAGE_USERS` and `MANAGE_APPS` [permissions](https://docs.saleor.io/docs/3.x/developer/permissions#app-permissions).

## Configuration

The App is configured per provider. You can configure multiple providers - the App will work with at least one provider set up.

### Mailchimp

#### Authorization

The app uses Mailchimp OAuth flow, meaning it will ask you to log in with Mailchimp and connect the App with your Saleor account. You can always disconnect the App from the Mailchimp dashboard.

After successful authorization, the App will store a token used to connect with a Mailchimp API.

You can disconnect your Mailchimp account and "forget" the token from App/Saleor from the App configuration screen. The token will be removed and you will have to connect with Mailchimp again to continue using it.

To permanently disconnect the App, you have to visit the Mailchimp dashboard.

#### Customer creation webhook

The App allows sending a new or updated customers to Mailchimp via a dedicated Saleor webhook. By default, this feature is disabled.
When you enable it, you have to select what Mailchimp [audience list](https://mailchimp.com/developer/marketing/api/lists/) contact should be synchronized to (likely you have only one).

The App will set a customer in Mailchimp when a Saleor customer is created (`CUSTOMER_CREATED` event) or updated (`CUSTOMER_UPDATED` event).

#### Customers bulk sync

If you install the App and already have previously created customers, you would likely want to perform an initial indexing of customers and send them to the provider.

You can do that from the App.

> **Warning**
>
> Customer synchronization **works on the frontend side**, which means the App **must remain open** during this operation.
In large shops this operation can take a few seconds.

#### Mailchimp tags and fields mapping

The contacts created by the App will have the "Non-subscribed" status (`transactional` in the API).

#### Built-in fields

The App will automatically map the customer email (mandatory), first (`FNAME`) and last (`LNAME`) names (optional).

#### Tags

Your campaigns likely rely on segments based on custom fields and tags. For example, only customer who agreed on marketing emails,
should receive specific campaigns.

One way to model this with Saleor is using [PrivateMetadata](https://docs.saleor.io/docs/3.x/developer/metadata) for each customer.

CRM App has built-in Metadata mapping, allowing you to push tags values to Metadata field and the App will handle the rest.

The App will parse Metadata items with the `mailchimp_tags` key and extract tags that will be added to each contact.
These tags can be used to create segments and bulk-modify customers in Mailchimp.

Tags must be an **array of strings**, for example: `["tag 1", "tag 2"]`.

An example query that can be implemented in the storefront after the user agrees to the marketing campaigns:

```graphql
mutation SetMailchimpTags($customerID: ID!) {
  updatePrivateMetadata(
    id: $customerID
    input: {
      key: "mailchimp_tags"
      value: "[\"general_marketing\", \"new_products_updates\"]"
    }
  ) {
    errors {
      message
    }
  }
}
```

## Development

To run the CRM App locally:

1. Follow the [_Setup_ section in the _Development_ article](https://docs.saleor.io/docs/3.x/developer/app-store/development#setup).
2. Go to the app directory.
3. Copy the `.env.example` file to `.env`.


> **Note**
>
> CRM is a Next.js application. If you want to learn more about setting environment variables in Next.js, head over to the [documentation](https://nextjs.org/docs/basic-features/environment-variables).


`MAILCHIMP_CLIENT_ID` and `MAILCHIMP_CLIENT_SECRET` can be obtained in Mailchimp Dashboard when new OAuth integration is created.

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


