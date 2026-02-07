import { MessageEventTypes } from "../event-handlers/message-event-types";

// —— Shared design tokens (used in mj-head and components) ——
const primaryColor = "#0f172a";
const bodyFontSize = "16px";
const lineHeight = "1.5";

// —— Shared MJML head: fonts, breakpoint, default styles ——
const mjHead = `<mj-head>
  <mj-attributes>
    <mj-body background-color="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" font-size="${bodyFontSize}" line-height="${lineHeight}" />
    <mj-text padding="8px 0" font-size="${bodyFontSize}" line-height="${lineHeight}" color="#334155" />
    <mj-button background-color="${primaryColor}" color="white" border-radius="6px" inner-padding="12px 24px" font-size="16px" font-weight="600" />
  </mj-attributes>
  <mj-breakpoint width="480px" />
</mj-head>`;

// —— Reusable content fragments ——

const sectionSpacer = `<mj-section padding="16px 0 0"><mj-column><mj-spacer height="8px" /></mj-column></mj-section>`;

const addressSection = `<mj-section padding="24px 0">
  <mj-column>
    <mj-text font-weight="600" color="#0f172a" padding-bottom="8px">Order details</mj-text>
    <mj-table padding="0" cellpadding="8" cellspacing="0" font-size="14px" color="#475569">
      <thead>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <th style="text-align: left; padding: 8px 12px;">Billing address</th>
          <th style="text-align: left; padding: 8px 12px;">Shipping address</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 12px; vertical-align: top;">
            {{#if order.billingAddress}}
              {{ order.billingAddress.streetAddress1 }}
              {{#if order.billingAddress.streetAddress2}}, {{ order.billingAddress.streetAddress2 }}{{/if}}
              <br />{{ order.billingAddress.postalCode }} {{ order.billingAddress.city }}
            {{else}}
              No billing address
            {{/if}}
          </td>
          <td style="padding: 12px; vertical-align: top;">
            {{#if order.shippingAddress}}
              {{ order.shippingAddress.streetAddress1 }}
              {{#if order.shippingAddress.streetAddress2}}, {{ order.shippingAddress.streetAddress2 }}{{/if}}
              <br />{{ order.shippingAddress.postalCode }} {{ order.shippingAddress.city }}
            {{else}}
              No shipping required
            {{/if}}
          </td>
        </tr>
      </tbody>
    </mj-table>
  </mj-column>
</mj-section>`;

const addressSectionForNotify = `<mj-section padding="24px 0">
  <mj-column>
    <mj-text font-weight="600" color="#0f172a" padding-bottom="8px">Order details</mj-text>
    <mj-table padding="0" cellpadding="8" cellspacing="0" font-size="14px" color="#475569">
      <thead>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <th style="text-align: left; padding: 8px 12px;">Billing address</th>
          <th style="text-align: left; padding: 8px 12px;">Shipping address</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 12px; vertical-align: top;">
            {{#if order.billing_address}}
              {{ order.billing_address.street_address_1 }}
              {{#if order.billing_address.street_address_2}}, {{ order.billing_address.street_address_2 }}{{/if}}
              <br />{{ order.billing_address.postal_code }} {{ order.billing_address.city }}
            {{else}}
              No billing address
            {{/if}}
          </td>
          <td style="padding: 12px; vertical-align: top;">
            {{#if order.shipping_address}}
              {{ order.shipping_address.street_address_1 }}
              {{#if order.shipping_address.street_address_2}}, {{ order.shipping_address.street_address_2 }}{{/if}}
              <br />{{ order.shipping_address.postal_code }} {{ order.shipping_address.city }}
            {{else}}
              No shipping required
            {{/if}}
          </td>
        </tr>
      </tbody>
    </mj-table>
  </mj-column>
</mj-section>`;

const orderLinesSection = `<mj-section padding="0 0 24px">
  <mj-column>
    <mj-table padding="0" cellpadding="8" cellspacing="0" font-size="14px" color="#475569">
      <tbody>
        {{#each order.lines }}
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 12px;">{{ this.quantity }} × {{ this.productName }}{{#if this.variantName}} – {{ this.variantName }}{{/if}}</td>
          <td align="right" style="padding: 10px 12px;">{{ this.totalPrice.gross.amount }} {{ this.totalPrice.gross.currency }}</td>
        </tr>
        {{/each}}
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 12px;">Shipping</td>
          <td align="right" style="padding: 10px 12px;">{{ order.shippingPrice.gross.amount }} {{ order.shippingPrice.gross.currency }}</td>
        </tr>
        <tr>
          <td style="padding: 12px; font-weight: 600; color: #0f172a;">Total</td>
          <td align="right" style="padding: 12px; font-weight: 600; color: #0f172a;">{{ order.total.gross.amount }} {{ order.total.gross.currency }}</td>
        </tr>
      </tbody>
    </mj-table>
  </mj-column>
</mj-section>`;

/** Builds a full order email body: greeting + message + address + order lines */
const buildOrderEmailBody = (messageLine: string) =>
  `<mjml>
${mjHead}
  <mj-body>
    <mj-wrapper padding="24px 16px" background-color="#ffffff" border-radius="8px">
      <mj-section padding="0 0 16px">
        <mj-column>
          <mj-text font-size="18px" font-weight="600" color="#0f172a">Hello!</mj-text>
          <mj-text>${messageLine}</mj-text>
        </mj-column>
      </mj-section>
${sectionSpacer}
${addressSection}
${orderLinesSection}
    </mj-wrapper>
  </mj-body>
</mjml>`;

const defaultOrderCreatedMjmlTemplate = buildOrderEmailBody(
  "Order {{ order.number }} has been created.",
);
const defaultOrderFulfilledMjmlTemplate = buildOrderEmailBody(
  "Order {{ order.number }} has been fulfilled.",
);
const defaultOrderConfirmedMjmlTemplate = buildOrderEmailBody(
  "Order {{ order.number }} has been confirmed.",
);
const defaultOrderFullyPaidMjmlTemplate = buildOrderEmailBody(
  "Order {{ order.number }} has been fully paid.",
);
const defaultOrderRefundedMjmlTemplate = buildOrderEmailBody(
  "Order {{ order.number }} has been refunded.",
);
const defaultOrderCancelledMjmlTemplate = buildOrderEmailBody(
  "Order {{ order.number }} has been cancelled.",
);

const defaultInvoiceSentMjmlTemplate = `<mjml>
${mjHead}
  <mj-body>
    <mj-wrapper padding="24px 16px" background-color="#ffffff" border-radius="8px">
      <mj-section padding="0 0 16px">
        <mj-column>
          <mj-text font-size="18px" font-weight="600" color="#0f172a">Hi!</mj-text>
          <mj-text>A new invoice has been created for your order.</mj-text>
          {{#if invoice.url}}
          <mj-button href="{{invoice.url}}" padding-top="16px">Download invoice</mj-button>
          {{/if}}
          {{#if order}}
          <mj-text padding-top="12px" font-size="14px" color="#64748b">Order reference: {{ order.number }}</mj-text>
          {{/if}}
        </mj-column>
      </mj-section>
    </mj-wrapper>
  </mj-body>
</mjml>`;

const defaultGiftCardSentMjmlTemplate = `<mjml>
${mjHead}
  <mj-body>
    <mj-wrapper padding="24px 16px" background-color="#ffffff" border-radius="8px">
      <mj-section padding="0 0 16px">
        <mj-column>
          <mj-text font-size="18px" font-weight="600" color="#0f172a">Here's your gift card</mj-text>
          <mj-text>You've received a gift card. Use the code below at checkout.</mj-text>
          {{#if giftCard}}
          <mj-section padding="16px 0" background-color="#f8fafc" border-radius="6px">
            <mj-column>
              <mj-text font-size="14px" color="#64748b">Code</mj-text>
              <mj-text font-size="20px" font-weight="700" color="#0f172a" letter-spacing="2px">{{ giftCard.displayCode }}</mj-text>
              {{#if giftCard.currentBalance}}
              <mj-text font-size="14px" color="#64748b" padding-top="8px">Balance: {{ giftCard.currentBalance.amount }} {{ giftCard.currentBalance.currency }}</mj-text>
              {{/if}}
              {{#if giftCard.expiryDate}}
              <mj-text font-size="14px" color="#64748b">Valid until: {{ giftCard.expiryDate }}</mj-text>
              {{/if}}
            </mj-column>
          </mj-section>
          {{/if}}
        </mj-column>
      </mj-section>
    </mj-wrapper>
  </mj-body>
</mjml>`;

/** Account emails: greeting + message + optional CTA button */
const buildAccountEmailBody = (
  message: string,
  buttonConfig?: { href: string; label: string },
) => `<mjml>
${mjHead}
  <mj-body>
    <mj-wrapper padding="24px 16px" background-color="#ffffff" border-radius="8px">
      <mj-section padding="0 0 16px">
        <mj-column>
          <mj-text font-size="18px" font-weight="600" color="#0f172a">Hi {{user.first_name}}!</mj-text>
          <mj-text>${message}</mj-text>
          ${
            buttonConfig
              ? `<mj-button href="${buttonConfig.href}" padding-top="20px">${buttonConfig.label}</mj-button>`
              : ""
          }
        </mj-column>
      </mj-section>
    </mj-wrapper>
  </mj-body>
</mjml>`;

const defaultAccountConfirmationMjmlTemplate = buildAccountEmailBody(
  "Your account has been created. Click the button below to activate it.",
  { href: "{{confirm_url}}", label: "Activate account" },
);
const defaultAccountPasswordResetMjmlTemplate = buildAccountEmailBody(
  "We received a request to reset your password. Click the button below to set a new one.",
  { href: "{{reset_url}}", label: "Reset password" },
);
const defaultAccountChangeEmailRequestMjmlTemplate = buildAccountEmailBody(
  "You requested to change your email to {{new_email}}. Click the button below to confirm.",
  { href: "{{redirect_url}}", label: "Confirm email change" },
);
const defaultAccountChangeEmailConfirmationMjmlTemplate = buildAccountEmailBody(
  "Your email address has been updated successfully.",
);
const defaultAccountDeleteMjmlTemplate = buildAccountEmailBody(
  "Account deletion has been requested. If you want to proceed, click the button below.",
  { href: "{{delete_url}}", label: "Delete account" },
);

const defaultOrderFulfillmentUpdatedMjmlTemplate = `<mjml>
${mjHead}
  <mj-body>
    <mj-wrapper padding="24px 16px" background-color="#ffffff" border-radius="8px">
      <mj-section padding="0 0 16px">
        <mj-column>
          <mj-text font-size="18px" font-weight="600" color="#0f172a">Hello!</mj-text>
          <mj-text>Fulfillment for order {{ order.number }} has been updated.</mj-text>
          {{#if fulfillment.tracking_number}}
          <mj-text padding-top="12px">Tracking number: <strong>{{ fulfillment.tracking_number }}</strong></mj-text>
          {{/if}}
        </mj-column>
      </mj-section>
${sectionSpacer}
${addressSectionForNotify}
    </mj-wrapper>
  </mj-body>
</mjml>`;

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
  ACCOUNT_CHANGE_EMAIL_CONFIRM: "Email change confirmation",
  ACCOUNT_CHANGE_EMAIL_REQUEST: "Email change request",
  ACCOUNT_CONFIRMATION: "Account activation",
  ACCOUNT_DELETE: "Account deletion",
  ACCOUNT_PASSWORD_RESET: "Password reset request",
  GIFT_CARD_SENT: "Gift card",
  INVOICE_SENT: "New invoice has been created",
  ORDER_CANCELLED: "Order {{ order.number }} has been cancelled",
  ORDER_CONFIRMED: "Order {{ order.number }} has been confirmed",
  ORDER_CREATED: "Order {{ order.number }} has been created",
  ORDER_FULFILLED: "Order {{ order.number }} has been fulfilled",
  ORDER_FULFILLMENT_UPDATE: "Fulfillment for order {{ order.number }} has been updated",
  ORDER_FULLY_PAID: "Order {{ order.number }} has been fully paid",
  ORDER_REFUNDED: "Order {{ order.number }} has been refunded",
};
