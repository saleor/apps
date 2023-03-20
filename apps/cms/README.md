![CMS](https://user-images.githubusercontent.com/249912/71523206-4e45f800-28c8-11ea-84ba-345a9bfc998a.png)

<div align="center">
  <h1>CMS</h1>
</div>

# Overview

## What is it?

CMS Hub is a Saleor app that exports products from Saleor to several popular CMSes.

Here is a list of currently supported CMSes and their configuration guides:

- [Strapi](docs/strapi.md)
- [Contentful](docs/contentful.md)
- [DatoCMS](docs/datocms.md)

## How does it work?

1. `cms` listens to Saleor product variant events through [webhooks](https://docs.saleor.io/docs/3.x/developer/extending/apps/asynchronous-webhooks).
2. When an event is triggered, we extract the product data and pass it to the CMS Client.
3. CMS Client checks what CMS you picked, transforms the data to the format the CMS expects, and sends it over.

### Mapping fields

Currently, the CMS Hub does not support mapping Saleor fields to your CMS fields. Your product model should have the following fields:

- strings fields: `saleor_id`, `name`, `product_id`, `product_name`, `product_slug`,
- JSON fileds: `channels`.

### Known issues

CMS Hub updates product variants in CMS providers on create, update or delete product variant webook events. They are triggered on product variant channel listing added or updated, but they currently don't trigger on deleting channel listing due to the [core issue #12247](https://github.com/saleor/saleor/issues/12247). To make it working on deleting channel listing, you can additionally modify other product variant field e.g. `name`, so webhook handlers receive the updated channel listings as well.

## How to use it?

1. Install the application in your Dashboard and open it.
2. Go to Providers.
3. Add CMS provider instance with proper configuration.
4. Go to Channels.
5. Turn on provider instances for desired channels.
6. Go to Products in Dashboard.
7. Add, edit or remove product variant to see it is added, updated or removed in configured CMS provider accordingly.

## How can I contribute?

See [CONTRIBUTING.md](./CONTRIBUTING.md).
