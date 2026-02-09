import { MessageEventTypes } from "../event-handlers/message-event-types";

// —— Design System ——
const colors = {
  primary: "#0f172a", // Slate 900 – headings, buttons
  text: "#334155", // Slate 700 – body text
  muted: "#64748b", // Slate 500 – secondary text
  border: "#e2e8f0", // Slate 200 – dividers
  background: "#f8fafc", // Slate 50 – page background
  surface: "#ffffff", // White – card background
  accent: "#f1f5f9", // Slate 100 – subtle highlights
};

// —— Shared MJML head ——
const mjHead = `<mj-head>
  <mj-attributes>
    <mj-all font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" />
    <mj-body background-color="${colors.background}" />
    <mj-wrapper padding="24px 16px" background-color="${colors.surface}" border-radius="8px" />
    <mj-section padding="0" />
    <mj-column padding="0" />
    <mj-text padding="0" font-size="16px" line-height="1.6" color="${colors.text}" />
    <mj-button background-color="${colors.primary}" color="white" border-radius="6px" font-size="16px" font-weight="600" inner-padding="14px 28px" />
  </mj-attributes>
  <mj-breakpoint width="480px" />
  <mj-style>
    .product-row td { padding: 16px 0; border-bottom: 1px solid ${colors.border}; }
    .product-row:last-child td { border-bottom: none; }
    .totals-row td { padding: 8px 0; }
    .totals-row.total td { padding-top: 12px; border-top: 1px solid ${colors.border}; font-weight: 600; }
    @media only screen and (max-width: 480px) {
      .billing-column { padding-top: 24px !important; }
    }
  </mj-style>
</mj-head>`;

// —— Header with optional logo (for Notify events: account emails) ——
const headerSection = `<mj-section padding="0 0 24px">
  <mj-column>
    {{#if logo_url}}
    <mj-image src="{{logo_url}}" alt="{{site_name}}" width="96px" align="left" padding="0 0 16px" />
    {{else}}
    {{#if site_name}}
    <mj-text font-size="20px" font-weight="700" color="${colors.primary}" padding="0 0 16px">{{site_name}}</mj-text>
    {{/if}}
    {{/if}}
  </mj-column>
</mj-section>`;

// —— Header for Order webhooks (uses branding from app config) ——
const orderHeaderSection = `<mj-section padding="0 0 24px">
  <mj-column>
    {{#if branding.logoUrl}}
    <mj-image src="{{branding.logoUrl}}" alt="{{branding.siteName}}" width="96px" align="left" padding="0 0 16px" />
    {{else}}
    {{#if branding.siteName}}
    <mj-text font-size="20px" font-weight="700" color="${colors.primary}" padding="0 0 16px">{{branding.siteName}}</mj-text>
    {{else}}
    {{#if order.channel.name}}
    <mj-text font-size="20px" font-weight="700" color="${colors.primary}" padding="0 0 16px">{{order.channel.name}}</mj-text>
    {{/if}}
    {{/if}}
    {{/if}}
  </mj-column>
</mj-section>`;

// —— Footer with support info (for Notify events) ——
const footerSection = `<mj-section padding="24px 0 0">
  <mj-column>
    <mj-divider border-color="${colors.border}" border-width="1px" padding="0 0 24px" />
    <mj-text font-size="14px" color="${colors.muted}" align="center">
      Questions? Reply to this email or contact our support team.
    </mj-text>
    {{#if site_name}}
    <mj-text font-size="14px" color="${colors.muted}" align="center" padding-top="8px">
      &copy; {{site_name}}
    </mj-text>
    {{/if}}
    <mj-text font-size="12px" color="${colors.muted}" align="center" padding-top="12px" font-style="italic">
      Powered by Saleor Commerce
    </mj-text>
  </mj-column>
</mj-section>`;

// —— Footer for Order webhooks (uses branding from app config) ——
const orderFooterSection = `<mj-section padding="24px 0 0">
  <mj-column>
    <mj-divider border-color="${colors.border}" border-width="1px" padding="0 0 24px" />
    <mj-text font-size="14px" color="${colors.muted}" align="center">
      Questions? Reply to this email or contact our support team.
    </mj-text>
    {{#if branding.siteName}}
    <mj-text font-size="14px" color="${colors.muted}" align="center" padding-top="8px">
      &copy; {{branding.siteName}}
    </mj-text>
    {{else}}
    {{#if order.channel.name}}
    <mj-text font-size="14px" color="${colors.muted}" align="center" padding-top="8px">
      &copy; {{order.channel.name}}
    </mj-text>
    {{/if}}
    {{/if}}
    <mj-text font-size="12px" color="${colors.muted}" align="center" padding-top="12px" font-style="italic">
      Powered by Saleor Commerce
    </mj-text>
  </mj-column>
</mj-section>`;

// —— Order lines with product thumbnails ——
const orderLinesWithImages = `<mj-section padding="0">
  <mj-column>
    <mj-text font-size="12px" font-weight="600" color="${colors.muted}" letter-spacing="1px" padding="0 0 12px">ORDER SUMMARY</mj-text>
    <mj-table padding="0" cellpadding="0" cellspacing="0">
      {{#each order.lines}}
      <tr class="product-row">
        <td style="width: 64px; padding-right: 16px; vertical-align: top;">
          {{#if this.thumbnail.url}}
          <img src="{{this.thumbnail.url}}" alt="{{this.productName}}" width="64" height="64" style="border-radius: 6px; object-fit: cover;" />
          {{else}}
          <div style="width: 64px; height: 64px; background: ${colors.accent}; border-radius: 6px;"></div>
          {{/if}}
        </td>
        <td style="vertical-align: top; max-width: 280px;">
          <div style="font-weight: 600; color: ${colors.primary}; margin-bottom: 4px;">{{this.productName}}</div>
          {{#if this.variantName}}<div style="font-size: 14px; color: ${colors.muted};">{{this.variantName}}</div>{{/if}}
          <div style="font-size: 14px; color: ${colors.muted};">Qty: {{this.quantity}}</div>
        </td>
        <td style="width: 24px;"></td>
        <td style="text-align: right; vertical-align: top; white-space: nowrap;">
          <div style="font-weight: 600; color: ${colors.primary};">{{this.totalPrice.gross.amount}} {{this.totalPrice.gross.currency}}</div>
        </td>
      </tr>
      {{/each}}
    </mj-table>
  </mj-column>
</mj-section>`;

// —— Order totals ——
const orderTotals = `<mj-section padding="16px 0 0">
  <mj-column>
    <mj-table padding="0" cellpadding="0" cellspacing="0" font-size="14px" color="${colors.text}">
      <tr class="totals-row">
        <td>Subtotal</td>
        <td style="text-align: right;">{{order.subtotal.gross.amount}} {{order.subtotal.gross.currency}}</td>
      </tr>
      <tr class="totals-row">
        <td>Shipping</td>
        <td style="text-align: right;">{{order.shippingPrice.gross.amount}} {{order.shippingPrice.gross.currency}}</td>
      </tr>
      {{#if order.total.tax.amount}}
      <tr class="totals-row">
        <td>Tax</td>
        <td style="text-align: right;">{{order.total.tax.amount}} {{order.total.tax.currency}}</td>
      </tr>
      {{/if}}
      <tr class="totals-row total">
        <td style="color: ${colors.primary};">Total</td>
        <td style="text-align: right; color: ${colors.primary};">{{order.total.gross.amount}} {{order.total.gross.currency}}</td>
      </tr>
    </mj-table>
  </mj-column>
</mj-section>`;

// —— Address blocks (side by side on desktop, stacked on mobile) ——
const addressBlocksBothColumns = `<mj-section padding="24px 0 0">
  <mj-column>
    <mj-text font-size="12px" font-weight="600" color="${colors.muted}" letter-spacing="1px" padding="0 0 8px">SHIPPING TO</mj-text>
    {{#if order.shippingAddress}}
    <mj-text padding="0" color="${colors.text}">
      {{order.shippingAddress.firstName}} {{order.shippingAddress.lastName}}<br />
      {{#if order.shippingAddress.companyName}}{{order.shippingAddress.companyName}}<br />{{/if}}
      {{order.shippingAddress.streetAddress1}}{{#if order.shippingAddress.streetAddress2}}<br />{{order.shippingAddress.streetAddress2}}{{/if}}<br />
      {{order.shippingAddress.city}}, {{order.shippingAddress.countryArea}} {{order.shippingAddress.postalCode}}<br />
      {{order.shippingAddress.country.country}}
    </mj-text>
    {{else}}
    <mj-text padding="0" color="${colors.muted}">No shipping required</mj-text>
    {{/if}}
  </mj-column>
  <mj-column css-class="billing-column">
    <mj-text font-size="12px" font-weight="600" color="${colors.muted}" letter-spacing="1px" padding="0 0 8px">BILLING TO</mj-text>
    {{#if order.billingAddress}}
    <mj-text padding="0" color="${colors.text}">
      {{order.billingAddress.firstName}} {{order.billingAddress.lastName}}<br />
      {{#if order.billingAddress.companyName}}{{order.billingAddress.companyName}}<br />{{/if}}
      {{order.billingAddress.streetAddress1}}{{#if order.billingAddress.streetAddress2}}<br />{{order.billingAddress.streetAddress2}}{{/if}}<br />
      {{order.billingAddress.city}}, {{order.billingAddress.countryArea}} {{order.billingAddress.postalCode}}<br />
      {{order.billingAddress.country.country}}
    </mj-text>
    {{else}}
    <mj-text padding="0" color="${colors.muted}">No billing address</mj-text>
    {{/if}}
  </mj-column>
</mj-section>`;

// —— Shipping address only (for fulfillment emails) ——
const shippingAddressBlock = `<mj-section padding="24px 0 0">
  <mj-column>
    <mj-text font-size="12px" font-weight="600" color="${colors.muted}" letter-spacing="1px" padding="0 0 8px">SHIPPING TO</mj-text>
    {{#if order.shippingAddress}}
    <mj-text padding="0" color="${colors.text}">
      {{order.shippingAddress.firstName}} {{order.shippingAddress.lastName}}<br />
      {{#if order.shippingAddress.companyName}}{{order.shippingAddress.companyName}}<br />{{/if}}
      {{order.shippingAddress.streetAddress1}}{{#if order.shippingAddress.streetAddress2}}<br />{{order.shippingAddress.streetAddress2}}{{/if}}<br />
      {{order.shippingAddress.city}}, {{order.shippingAddress.countryArea}} {{order.shippingAddress.postalCode}}<br />
      {{order.shippingAddress.country.country}}
    </mj-text>
    {{else}}
    <mj-text padding="0" color="${colors.muted}">No shipping required</mj-text>
    {{/if}}
  </mj-column>
</mj-section>`;

// —— Notify payload address block (snake_case) ——
const shippingAddressBlockNotify = `<mj-section padding="24px 0 0">
  <mj-column>
    <mj-text font-size="12px" font-weight="600" color="${colors.muted}" letter-spacing="1px" padding="0 0 8px">SHIPPING TO</mj-text>
    {{#if order.shipping_address}}
    <mj-text padding="0" color="${colors.text}">
      {{order.shipping_address.first_name}} {{order.shipping_address.last_name}}<br />
      {{order.shipping_address.street_address_1}}{{#if order.shipping_address.street_address_2}}, {{order.shipping_address.street_address_2}}{{/if}}<br />
      {{order.shipping_address.city}}, {{order.shipping_address.country_area}} {{order.shipping_address.postal_code}}<br />
      {{order.shipping_address.country}}
    </mj-text>
    {{else}}
    <mj-text padding="0" color="${colors.muted}">No shipping required</mj-text>
    {{/if}}
  </mj-column>
</mj-section>`;

// —— Order number badge ——
const orderNumberBadge = `<mj-section padding="24px 0 0">
  <mj-column>
    <mj-text font-size="12px" font-weight="600" color="${colors.muted}" letter-spacing="1px" padding="0">ORDER #{{order.number}}</mj-text>
  </mj-column>
</mj-section>`;

/*
 * ============================================================
 * ORDER TEMPLATES
 * ============================================================
 */

const defaultOrderCreatedMjmlTemplate = `<mjml>
${mjHead}
<mj-body>
  <mj-wrapper>
    ${orderHeaderSection}
    <mj-section>
      <mj-column>
        <mj-text font-size="24px" font-weight="700" color="${colors.primary}" padding="0 0 16px">Thank you for your order!</mj-text>
        <mj-text padding="0 0 8px">We've received your order and will begin processing it shortly.</mj-text>
        <mj-text padding="0" color="${colors.muted}">You'll receive another email when your order ships.</mj-text>
      </mj-column>
    </mj-section>
    ${orderNumberBadge}
    <mj-section padding="16px 0"><mj-column><mj-divider border-color="${colors.border}" border-width="1px" padding="0" /></mj-column></mj-section>
    ${orderLinesWithImages}
    ${orderTotals}
    ${addressBlocksBothColumns}
    ${orderFooterSection}
  </mj-wrapper>
</mj-body>
</mjml>`;

const defaultOrderConfirmedMjmlTemplate = `<mjml>
${mjHead}
<mj-body>
  <mj-wrapper>
    ${orderHeaderSection}
    <mj-section>
      <mj-column>
        <mj-text font-size="24px" font-weight="700" color="${colors.primary}" padding="0 0 16px">Your order is confirmed!</mj-text>
        <mj-text padding="0 0 8px">Great news – we've confirmed your order and it's being prepared.</mj-text>
        <mj-text padding="0" color="${colors.muted}">We'll notify you when it's on its way.</mj-text>
      </mj-column>
    </mj-section>
    ${orderNumberBadge}
    <mj-section padding="16px 0"><mj-column><mj-divider border-color="${colors.border}" border-width="1px" padding="0" /></mj-column></mj-section>
    ${orderLinesWithImages}
    ${orderTotals}
    ${addressBlocksBothColumns}
    ${orderFooterSection}
  </mj-wrapper>
</mj-body>
</mjml>`;

const defaultOrderFulfilledMjmlTemplate = `<mjml>
${mjHead}
<mj-body>
  <mj-wrapper>
    ${orderHeaderSection}
    <mj-section>
      <mj-column>
        <mj-text font-size="24px" font-weight="700" color="${colors.primary}" padding="0 0 16px">Your order is on its way!</mj-text>
        <mj-text padding="0 0 8px">We've shipped your order and it's headed your way.</mj-text>
        {{#if order.shippingMethodName}}
        <mj-text padding="0" color="${colors.muted}">Shipped via {{order.shippingMethodName}}</mj-text>
        {{/if}}
      </mj-column>
    </mj-section>
    {{#if order.redirectUrl}}
    <mj-section padding="16px 0 0">
      <mj-column>
        <mj-button href="{{order.redirectUrl}}">Track your order</mj-button>
      </mj-column>
    </mj-section>
    {{/if}}
    ${orderNumberBadge}
    <mj-section padding="16px 0"><mj-column><mj-divider border-color="${colors.border}" border-width="1px" padding="0" /></mj-column></mj-section>
    ${orderLinesWithImages}
    ${orderTotals}
    ${shippingAddressBlock}
    ${orderFooterSection}
  </mj-wrapper>
</mj-body>
</mjml>`;

const defaultOrderFullyPaidMjmlTemplate = `<mjml>
${mjHead}
<mj-body>
  <mj-wrapper>
    ${orderHeaderSection}
    <mj-section>
      <mj-column>
        <mj-text font-size="24px" font-weight="700" color="${colors.primary}" padding="0 0 16px">Payment received!</mj-text>
        <mj-text padding="0 0 8px">We've received your payment in full. Thank you!</mj-text>
        <mj-text padding="0" color="${colors.muted}">Your order will be processed and shipped soon.</mj-text>
      </mj-column>
    </mj-section>
    ${orderNumberBadge}
    <mj-section padding="16px 0"><mj-column><mj-divider border-color="${colors.border}" border-width="1px" padding="0" /></mj-column></mj-section>
    ${orderLinesWithImages}
    ${orderTotals}
    ${addressBlocksBothColumns}
    ${orderFooterSection}
  </mj-wrapper>
</mj-body>
</mjml>`;

const defaultOrderCancelledMjmlTemplate = `<mjml>
${mjHead}
<mj-body>
  <mj-wrapper>
    ${orderHeaderSection}
    <mj-section>
      <mj-column>
        <mj-text font-size="24px" font-weight="700" color="${colors.primary}" padding="0 0 16px">Order cancelled</mj-text>
        <mj-text padding="0 0 8px">Your order has been cancelled as requested.</mj-text>
        <mj-text padding="0" color="${colors.muted}">If you have any questions or didn't request this cancellation, please contact us.</mj-text>
      </mj-column>
    </mj-section>
    ${orderNumberBadge}
    <mj-section padding="16px 0"><mj-column><mj-divider border-color="${colors.border}" border-width="1px" padding="0" /></mj-column></mj-section>
    ${orderLinesWithImages}
    ${orderTotals}
    ${orderFooterSection}
  </mj-wrapper>
</mj-body>
</mjml>`;

const defaultOrderRefundedMjmlTemplate = `<mjml>
${mjHead}
<mj-body>
  <mj-wrapper>
    ${orderHeaderSection}
    <mj-section>
      <mj-column>
        <mj-text font-size="24px" font-weight="700" color="${colors.primary}" padding="0 0 16px">Refund processed</mj-text>
        <mj-text padding="0 0 8px">We've processed a refund for your order.</mj-text>
        <mj-text padding="0" color="${colors.muted}">The refund should appear in your account within 5-10 business days, depending on your payment method.</mj-text>
      </mj-column>
    </mj-section>
    ${orderNumberBadge}
    <mj-section padding="16px 0"><mj-column><mj-divider border-color="${colors.border}" border-width="1px" padding="0" /></mj-column></mj-section>
    ${orderLinesWithImages}
    ${orderTotals}
    ${orderFooterSection}
  </mj-wrapper>
</mj-body>
</mjml>`;

const defaultOrderFulfillmentUpdatedMjmlTemplate = `<mjml>
${mjHead}
<mj-body>
  <mj-wrapper>
    ${headerSection}
    <mj-section>
      <mj-column>
        <mj-text font-size="24px" font-weight="700" color="${colors.primary}" padding="0 0 16px">Shipping update</mj-text>
        <mj-text padding="0 0 8px">There's an update on your shipment for order #{{order.number}}.</mj-text>
        {{#if fulfillment.tracking_number}}
        <mj-text padding="8px 0 0">
          <strong>Tracking number:</strong> {{fulfillment.tracking_number}}
        </mj-text>
        {{/if}}
      </mj-column>
    </mj-section>
    ${shippingAddressBlockNotify}
    ${footerSection}
  </mj-wrapper>
</mj-body>
</mjml>`;

/*
 * ============================================================
 * INVOICE TEMPLATE
 * ============================================================
 */

const defaultInvoiceSentMjmlTemplate = `<mjml>
${mjHead}
<mj-body>
  <mj-wrapper>
    ${orderHeaderSection}
    <mj-section>
      <mj-column>
        <mj-text font-size="24px" font-weight="700" color="${colors.primary}" padding="0 0 16px">Your invoice is ready</mj-text>
        <mj-text padding="0 0 8px">A new invoice has been created for your order{{#if order}} #{{order.number}}{{/if}}.</mj-text>
        <mj-text padding="0" color="${colors.muted}">Click below to download your invoice.</mj-text>
      </mj-column>
    </mj-section>
    {{#if invoice.url}}
    <mj-section padding="24px 0 0">
      <mj-column>
        <mj-button href="{{invoice.url}}">Download invoice</mj-button>
      </mj-column>
    </mj-section>
    {{/if}}
    ${orderFooterSection}
  </mj-wrapper>
</mj-body>
</mjml>`;

/*
 * ============================================================
 * GIFT CARD TEMPLATE
 * ============================================================
 */

const defaultGiftCardSentMjmlTemplate = `<mjml>
${mjHead}
<mj-body>
  <mj-wrapper>
    ${headerSection}
    <mj-section>
      <mj-column>
        <mj-text font-size="24px" font-weight="700" color="${colors.primary}" padding="0 0 16px">You've received a gift card!</mj-text>
        <mj-text padding="0">Someone special sent you a gift card. Use the code below at checkout to redeem it.</mj-text>
      </mj-column>
    </mj-section>
    {{#if giftCard}}
    <mj-section padding="24px 0 0">
      <mj-column background-color="${colors.accent}" border-radius="8px" padding="24px">
        <mj-text font-size="12px" font-weight="600" color="${colors.muted}" letter-spacing="1px" padding="0 0 8px">YOUR GIFT CARD CODE</mj-text>
        <mj-text font-size="28px" font-weight="700" color="${colors.primary}" letter-spacing="2px" padding="0 0 16px">{{giftCard.displayCode}}</mj-text>
        {{#if giftCard.currentBalance}}
        <mj-text font-size="18px" font-weight="600" color="${colors.primary}" padding="0 0 4px">
          {{giftCard.currentBalance.amount}} {{giftCard.currentBalance.currency}}
        </mj-text>
        <mj-text font-size="14px" color="${colors.muted}" padding="0">Available balance</mj-text>
        {{/if}}
        {{#if giftCard.expiryDate}}
        <mj-text font-size="14px" color="${colors.muted}" padding="16px 0 0">Valid until {{giftCard.expiryDate}}</mj-text>
        {{/if}}
      </mj-column>
    </mj-section>
    {{/if}}
    ${footerSection}
  </mj-wrapper>
</mj-body>
</mjml>`;

/*
 * ============================================================
 * ACCOUNT TEMPLATES
 * ============================================================
 */

const defaultAccountConfirmationMjmlTemplate = `<mjml>
${mjHead}
<mj-body>
  <mj-wrapper>
    ${headerSection}
    <mj-section>
      <mj-column>
        <mj-text font-size="24px" font-weight="700" color="${colors.primary}" padding="0 0 16px">Activate your account</mj-text>
        <mj-text padding="0 0 8px">Hi{{#if user.first_name}} {{user.first_name}}{{/if}}! Thanks for signing up.</mj-text>
        <mj-text padding="0">Click the button below to activate your account and get started.</mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="24px 0 0">
      <mj-column>
        <mj-button href="{{confirm_url}}">Activate account</mj-button>
      </mj-column>
    </mj-section>
    <mj-section padding="16px 0 0">
      <mj-column>
        <mj-text font-size="14px" color="${colors.muted}">If you didn't create an account, you can safely ignore this email.</mj-text>
      </mj-column>
    </mj-section>
    ${footerSection}
  </mj-wrapper>
</mj-body>
</mjml>`;

const defaultAccountPasswordResetMjmlTemplate = `<mjml>
${mjHead}
<mj-body>
  <mj-wrapper>
    ${headerSection}
    <mj-section>
      <mj-column>
        <mj-text font-size="24px" font-weight="700" color="${colors.primary}" padding="0 0 16px">Reset your password</mj-text>
        <mj-text padding="0 0 8px">Hi{{#if user.first_name}} {{user.first_name}}{{/if}}! We received a request to reset your password.</mj-text>
        <mj-text padding="0">Click the button below to create a new password.</mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="24px 0 0">
      <mj-column>
        <mj-button href="{{reset_url}}">Reset password</mj-button>
      </mj-column>
    </mj-section>
    <mj-section padding="16px 0 0">
      <mj-column>
        <mj-text font-size="14px" color="${colors.muted}">If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.</mj-text>
      </mj-column>
    </mj-section>
    ${footerSection}
  </mj-wrapper>
</mj-body>
</mjml>`;

const defaultAccountChangeEmailRequestMjmlTemplate = `<mjml>
${mjHead}
<mj-body>
  <mj-wrapper>
    ${headerSection}
    <mj-section>
      <mj-column>
        <mj-text font-size="24px" font-weight="700" color="${colors.primary}" padding="0 0 16px">Confirm your new email</mj-text>
        <mj-text padding="0 0 8px">Hi{{#if user.first_name}} {{user.first_name}}{{/if}}! You requested to change your email address to <strong>{{new_email}}</strong>.</mj-text>
        <mj-text padding="0">Click the button below to confirm this change.</mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="24px 0 0">
      <mj-column>
        <mj-button href="{{redirect_url}}">Confirm email change</mj-button>
      </mj-column>
    </mj-section>
    <mj-section padding="16px 0 0">
      <mj-column>
        <mj-text font-size="14px" color="${colors.muted}">If you didn't request this change, please ignore this email or contact support.</mj-text>
      </mj-column>
    </mj-section>
    ${footerSection}
  </mj-wrapper>
</mj-body>
</mjml>`;

const defaultAccountChangeEmailConfirmationMjmlTemplate = `<mjml>
${mjHead}
<mj-body>
  <mj-wrapper>
    ${headerSection}
    <mj-section>
      <mj-column>
        <mj-text font-size="24px" font-weight="700" color="${colors.primary}" padding="0 0 16px">Email updated</mj-text>
        <mj-text padding="0 0 8px">Hi{{#if user.first_name}} {{user.first_name}}{{/if}}! Your email address has been successfully updated.</mj-text>
        {{#if new_email}}
        <mj-text padding="0">Your new email is <strong>{{new_email}}</strong>.</mj-text>
        {{/if}}
      </mj-column>
    </mj-section>
    <mj-section padding="16px 0 0">
      <mj-column>
        <mj-text font-size="14px" color="${colors.muted}">If you didn't make this change, please contact support immediately.</mj-text>
      </mj-column>
    </mj-section>
    ${footerSection}
  </mj-wrapper>
</mj-body>
</mjml>`;

const defaultAccountDeleteMjmlTemplate = `<mjml>
${mjHead}
<mj-body>
  <mj-wrapper>
    ${headerSection}
    <mj-section>
      <mj-column>
        <mj-text font-size="24px" font-weight="700" color="${colors.primary}" padding="0 0 16px">Delete your account</mj-text>
        <mj-text padding="0 0 8px">Hi{{#if user.first_name}} {{user.first_name}}{{/if}}, we received a request to delete your account.</mj-text>
        <mj-text padding="0">If you want to proceed, click the button below. This action cannot be undone.</mj-text>
      </mj-column>
    </mj-section>
    <mj-section padding="24px 0 0">
      <mj-column>
        <mj-button href="{{delete_url}}" background-color="#dc2626">Delete my account</mj-button>
      </mj-column>
    </mj-section>
    <mj-section padding="16px 0 0">
      <mj-column>
        <mj-text font-size="14px" color="${colors.muted}">If you didn't request this, you can safely ignore this email. Your account will remain active.</mj-text>
      </mj-column>
    </mj-section>
    ${footerSection}
  </mj-wrapper>
</mj-body>
</mjml>`;

/*
 * ============================================================
 * EXPORTS
 * ============================================================
 */

export const defaultMjmlTemplates: Record<MessageEventTypes, string> = {
  ACCOUNT_CHANGE_EMAIL_CONFIRM: defaultAccountChangeEmailConfirmationMjmlTemplate,
  ACCOUNT_CHANGE_EMAIL_REQUEST: defaultAccountChangeEmailRequestMjmlTemplate,
  ACCOUNT_CONFIRMATION: defaultAccountConfirmationMjmlTemplate,
  ACCOUNT_DELETE: defaultAccountDeleteMjmlTemplate,
  ACCOUNT_PASSWORD_RESET: defaultAccountPasswordResetMjmlTemplate,
  GIFT_CARD_SENT: defaultGiftCardSentMjmlTemplate,
  INVOICE_SENT: defaultInvoiceSentMjmlTemplate,
  ORDER_CANCELLED: defaultOrderCancelledMjmlTemplate,
  ORDER_CONFIRMED: defaultOrderConfirmedMjmlTemplate,
  ORDER_CREATED: defaultOrderCreatedMjmlTemplate,
  ORDER_FULFILLED: defaultOrderFulfilledMjmlTemplate,
  ORDER_FULFILLMENT_UPDATE: defaultOrderFulfillmentUpdatedMjmlTemplate,
  ORDER_FULLY_PAID: defaultOrderFullyPaidMjmlTemplate,
  ORDER_REFUNDED: defaultOrderRefundedMjmlTemplate,
};

export const defaultMjmlSubjectTemplates: Record<MessageEventTypes, string> = {
  ACCOUNT_CHANGE_EMAIL_CONFIRM: "Your email has been updated",
  ACCOUNT_CHANGE_EMAIL_REQUEST: "Confirm your new email address",
  ACCOUNT_CONFIRMATION: "Activate your account",
  ACCOUNT_DELETE: "Confirm account deletion",
  ACCOUNT_PASSWORD_RESET: "Reset your password",
  GIFT_CARD_SENT: "You've received a gift card!",
  INVOICE_SENT: "Your invoice is ready",
  ORDER_CANCELLED: "Your order has been cancelled",
  ORDER_CONFIRMED: "Your order is confirmed!",
  ORDER_CREATED: "Thanks for your order!",
  ORDER_FULFILLED: "Your order is on its way!",
  ORDER_FULFILLMENT_UPDATE: "Shipping update for your order",
  ORDER_FULLY_PAID: "Payment received – thank you!",
  ORDER_REFUNDED: "Your refund has been processed",
};
