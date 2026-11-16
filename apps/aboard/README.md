# Saleor Aboard

A Dashboard app for previewing and importing product catalogs from Google Merchant RSS XML,
WooCommerce CSV, and Aboard Product CSV v1.

## Development

From the monorepo root:

```sh
pnpm install
pnpm --filter saleor-app-aboard dev
```

Expose the development server through a tunnel and install `/api/manifest` in Saleor Dashboard.
No database, app token, encryption key, or registration endpoint is required. The optional URL
and browser error-reporting settings are documented in `.env.example`.

## Imports

Choose a file or an HTTPS feed URL, preview it, and import the reviewed catalog. Parsing and
Saleor mutations run in the browser using the current Dashboard session and its permissions.
The user needs `MANAGE_PRODUCTS`, `MANAGE_CHANNELS`, and `MANAGE_PRODUCT_TYPES_AND_ATTRIBUTES`.
Aboard requests catalog-management permissions so its Dashboard session token can import products, channels, product types, and attributes. It registers no webhooks and receives no stored app token.

Keep the tab open until the import completes. Files, previews, and results are held only in
memory: there are no saved connections, import history, cookies, or browser storage. Imports
are not background jobs and cannot resume after closing the tab. A new preview can be imported
again; products already identified by the importer are skipped.

Feed URLs must allow cross-origin browser access. If downloading fails, download the feed
outside Aboard and upload the XML file. Shopify Admin API connections are not supported.

Limits: 10 MB for XML, 5 MB for CSV, 1,000 products and 5,000 variants per import. WooCommerce
CSV uses the 10.8.1 export format; select the source currency and decimal separator. The Product
CSV schema and an example download are available in the UI.

The importer creates or reuses channels, categories, product types, and attributes in Saleor.
Saleor external references identify imported products and variants. CSV identity is derived
from file contents; importing a changed CSV is a new source. Aboard does not maintain a source
registry or update existing products.

## Structure

- `src/modules/aboard/connectors/`: browser-compatible parsers and catalog mapping
- `src/modules/aboard/import-catalog.ts`: Saleor catalog mutations
- `src/modules/aboard/use-catalog-import-controller.ts`: transient preview and import state
- `src/modules/aboard/components/`: import UI
- `src/pages/api/manifest.ts`: installation metadata, the only server endpoint

## Checks

```sh
pnpm --filter saleor-app-aboard check-types
pnpm --filter saleor-app-aboard exec vitest run
pnpm --filter saleor-app-aboard build
```
