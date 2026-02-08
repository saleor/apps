# SMTP Email Templates

## Overview

The SMTP app uses **MJML** for responsive HTML and **Handlebars** for dynamic content.

- Templates stored in `src/modules/smtp/default-templates.ts`
- Compilation: Handlebars → MJML → HTML → plain text

## Testing emails locally

Build all default templates to static HTML:

```bash
pnpm --filter saleor-app-smtp test-email-build
```

Output: `apps/smtp/email-previews/` (gitignored)

Open `email-previews/index.html` in a browser to preview all templates.

## Template structure

### Shared components

- `headSection` - fonts, colors, breakpoint
- `headerSection` / `orderHeaderSection` - logo or site name
- `footerSection` / `orderFooterSection` - support contact, copyright
- `addressSection` - billing/shipping address display
- `orderLinesSection` - order line items with images and prices

### Event types

| Category | Events |
|----------|--------|
| Order | ORDER_CREATED, ORDER_CONFIRMED, ORDER_FULFILLED, ORDER_FULLY_PAID, ORDER_CANCELLED, ORDER_REFUNDED |
| Invoice | INVOICE_SENT |
| Account | ACCOUNT_CONFIRMATION, ACCOUNT_PASSWORD_RESET, ACCOUNT_CHANGE_EMAIL_REQUEST, ACCOUNT_CHANGE_EMAIL_CONFIRM, ACCOUNT_DELETE |
| Gift Card | GIFT_CARD_SENT |
| Fulfillment | FULFILLMENT_UPDATE (uses Notify payload with snake_case) |

### Payload differences

- **Webhook payloads** (order events): camelCase (`order.billingAddress`, `order.shippingAddress`)
- **Notify payloads** (account events, fulfillment): snake_case (`billing_address`, `shipping_address`)

## Branding

Order emails support branding via SMTP configuration:

- `brandingSiteName` - displayed in header/footer
- `brandingLogoUrl` - logo image (replaces site name text)

Falls back to `order.channel.name` if not configured.
