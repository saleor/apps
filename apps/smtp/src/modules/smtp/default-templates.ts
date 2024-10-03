import { minify } from "htmlfy";

import { MessageEventTypes } from "../event-handlers/message-event-types";

const addressSection = `<mj-section>
  <mj-column>
    <mj-table>
      <thead>
        <tr>
          <th>
            Billing address
          </th>
          <th>
            Shipping address
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            {{#if order.billingAddress}}
              {{ order.billingAddress.streetAddress1 }}
            {{else}}
              No billing address
            {{/if}}
          </td>
          <td>
            {{#if order.shippingAddress}}
              {{ order.shippingAddress.streetAddress1}}
            {{else}}
              No shipping required
            {{/if}}
          </td>
        </tr>
      </tbody>
    </mj-table>
  </mj-column>
</mj-section>
`;

const addressSectionForNotify = `<mj-section>
  <mj-column>
    <mj-table>
      <thead>
        <tr>
          <th>
            Billing address
          </th>
          <th>
            Shipping address
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            {{#if order.billing_address}}
              {{ order.billing_address.street_address_1 }}
            {{else}}
              No billing address
            {{/if}}
          </td>
          <td>
            {{#if order.shipping_address}}
              {{ order.shipping_address.street_address_1}}
            {{else}}
              No shipping required
            {{/if}}
          </td>
        </tr>
      </tbody>
    </mj-table>
  </mj-column>
</mj-section>
`;

const orderLinesSection = `<mj-section>
  <mj-column>
    <mj-table>
      <tbody>
        {{#each order.lines }}
          <tr>
            <td>
              {{ this.quantity }} x {{ this.productName }} - {{ this.variantName }}
            </td>
            <td align="right">
              {{ this.totalPrice.gross.amount }} {{ this.totalPrice.gross.currency }}
            </td>
          </tr>
        {{/each}}
        <tr>
          <td>
          </td>
          <td align="right">
            Shipping: {{ order.shippingPrice.gross.amount }} {{ order.shippingPrice.gross.currency }}
          </td>
        </tr>
        <tr>
          <td>
          </td>
          <td align="right">
            Total: {{ order.total.gross.amount }} {{ order.total.gross.currency }}
          </td>
        </tr>
      </tbody>
    </mj-table>
  </mj-column>
</mj-section>
`;

const defaultOrderCreatedMjmlTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
          Hello!
        </mj-text>
        <mj-text>
          Order {{ order.number }} has been created.
        </mj-text>
      </mj-column>
    </mj-section>
    ${addressSection}
    ${orderLinesSection}
  </mj-body>
</mjml>`;

const defaultOrderFulfilledMjmlTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
          Hello!
        </mj-text>
        <mj-text>
          Order {{ order.number }} has been fulfilled.
        </mj-text>
      </mj-column>
    </mj-section>
    ${addressSection}
    ${orderLinesSection}
  </mj-body>
</mjml>`;

const defaultOrderConfirmedMjmlTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
        Hello!
        </mj-text>
        <mj-text>
          Order {{ order.number}} has been confirmed.
        </mj-text>
      </mj-column>
    </mj-section>
    ${addressSection}
    ${orderLinesSection}
    </mj-body>
</mjml>`;

const defaultOrderFullyPaidMjmlTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
          Hello!
        </mj-text>
        <mj-text>
          Order {{ order.number }} has been fully paid.
        </mj-text>
      </mj-column>
    </mj-section>
    ${addressSection}
    ${orderLinesSection}  
  </mj-body>
</mjml>`;

const defaultOrderRefundedMjmlTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
          Hello!
        </mj-text>
        <mj-text>
          Order {{ order.number }} has been refunded.
        </mj-text>
      </mj-column>
    </mj-section>
    ${addressSection}
    ${orderLinesSection}  
  </mj-body>
</mjml>`;

const defaultOrderCancelledMjmlTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
            Hello!
        </mj-text>
        <mj-text>
          Order {{ order.number }} has been cancelled.
        </mj-text>
      </mj-column>
    </mj-section>
    ${addressSection}
    ${orderLinesSection}
  </mj-body>
</mjml>`;

const defaultInvoiceSentMjmlTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
          Hi!
        </mj-text>
        <mj-text>
          New invoice has been created
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

// TODO: Improve the template
const defaultGiftCardSentMjmlTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
          Hi!
        </mj-text>
        <mj-text>
          Heres your gift card
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

const defaultAccountConfirmationMjmlTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
          Hi {{user.first_name}}!
        </mj-text>
        <mj-text>
          Your account has been created. Please follow the link to activate it: 
        </mj-text>
        <mj-button href="{{confirm_url}}"  background-color="black" color="white" padding-top="50px" inner-padding="20px" width="70%">
            Activate the account 
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

const defaultAccountPasswordResetMjmlTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
          Hi {{user.first_name}}!
        </mj-text>
        <mj-text>
          Password reset has been requested. Please follow the link to proceed: 
        </mj-text>
        <mj-button href="{{reset_url}}"  background-color="black" color="white" padding-top="50px" inner-padding="20px" width="70%">
            Reset the password 
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

const defaultAccountChangeEmailRequestMjmlTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
          Hi {{user.first_name}}!
        </mj-text>
        <mj-text>
          Email address change has been requested. If you want to confirm changing the email address to {{new_email}}, please follow the link: 
        </mj-text>
        <mj-button href="{{redirect_url}}"  background-color="black" color="white" padding-top="50px" inner-padding="20px" width="70%">
            Change the email
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

const defaultAccountChangeEmailConfirmationMjmlTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
          Hi {{user.first_name}}!
        </mj-text>
        <mj-text>
          Email address change has been confirmed.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

const defaultAccountDeleteMjmlTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
          Hi {{user.first_name}}!
        </mj-text>
        <mj-text>
          Account deletion has been requested. If you want to confirm, please follow the link: 
        </mj-text>
        <mj-button href="{{redirect_url}}"  background-color="black" color="white" padding-top="50px" inner-padding="20px" width="70%">
            Delete the account
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

const defaultOrderFulfillmentUpdatedMjmlTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
            Hello!
        </mj-text>
        <mj-text>
          Fulfillment for the order {{ order.number }} has been updated.
        </mj-text>
        {{#if fulfillment.tracking_number }}
          <mj-text>
            Tracking number: {{ fulfillment.tracking_number }}
          </mj-text>
        {{/if}}
      </mj-column>
    </mj-section>
    ${addressSectionForNotify}
  </mj-body>
</mjml>`;

export const defaultMjmlTemplates: Record<MessageEventTypes, string> = {
  ACCOUNT_CHANGE_EMAIL_CONFIRM: minify(defaultAccountChangeEmailConfirmationMjmlTemplate),
  ACCOUNT_CHANGE_EMAIL_REQUEST: minify(defaultAccountChangeEmailRequestMjmlTemplate),
  ACCOUNT_CONFIRMATION: minify(defaultAccountConfirmationMjmlTemplate),
  ACCOUNT_DELETE: minify(defaultAccountDeleteMjmlTemplate),
  ACCOUNT_PASSWORD_RESET: minify(defaultAccountPasswordResetMjmlTemplate),
  GIFT_CARD_SENT: minify(defaultGiftCardSentMjmlTemplate),
  INVOICE_SENT: minify(defaultInvoiceSentMjmlTemplate),
  ORDER_CANCELLED: minify(defaultOrderCancelledMjmlTemplate),
  ORDER_CONFIRMED: minify(defaultOrderConfirmedMjmlTemplate),
  ORDER_CREATED: minify(defaultOrderCreatedMjmlTemplate),
  ORDER_FULFILLED: minify(defaultOrderFulfilledMjmlTemplate),
  ORDER_FULFILLMENT_UPDATE: minify(defaultOrderFulfillmentUpdatedMjmlTemplate),
  ORDER_FULLY_PAID: minify(defaultOrderFullyPaidMjmlTemplate),
  ORDER_REFUNDED: minify(defaultOrderRefundedMjmlTemplate),
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
