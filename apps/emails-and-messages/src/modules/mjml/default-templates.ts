import { MessageEventTypes } from "../event-handlers/message-event-types";

const addressSection = `
    <mj-section>
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

const orderLinesSection = `
  <mj-section>
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

const defaultOrderCreatedMjmlTemplate = `
<mjml>
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

const defaultOrderFulfilledMjmlTemplate = `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
          Hello!
        </mj-text>
        <mj-text>
          Order {{ order.number}} has been fulfilled.
        </mj-text>
      </mj-column>
    </mj-section>
    ${addressSection}
    ${orderLinesSection}
  </mj-body>
</mjml>`;

const defaultOrderConfirmedMjmlTemplate = `
<mjml>
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

const defaultOrderFullyPaidMjmlTemplate = `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
          Hello!
        </mj-text>
        <mj-text>
          Order {{ order.number}} has been fully paid.
        </mj-text>
      </mj-column>
    </mj-section>
    ${addressSection}
    ${orderLinesSection}  
  </mj-body>
</mjml>`;

const defaultOrderCancelledMjmlTemplate = `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="16px">
            Hello!
        </mj-text>
        <mj-text>
          Order {{ order.number}} has been cancelled.
        </mj-text>
      </mj-column>
    </mj-section>
    ${addressSection}
    ${orderLinesSection}
  </mj-body>
</mjml>`;

const defaultInvoiceSentMjmlTemplate = `
<mjml>
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

export const defaultMjmlTemplates: Record<MessageEventTypes, string> = {
  ORDER_CREATED: defaultOrderCreatedMjmlTemplate,
  ORDER_FULFILLED: defaultOrderFulfilledMjmlTemplate,
  ORDER_CONFIRMED: defaultOrderConfirmedMjmlTemplate,
  ORDER_FULLY_PAID: defaultOrderFullyPaidMjmlTemplate,
  ORDER_CANCELLED: defaultOrderCancelledMjmlTemplate,
  INVOICE_SENT: defaultInvoiceSentMjmlTemplate,
};

export const defaultMjmlSubjectTemplates: Record<MessageEventTypes, string> = {
  ORDER_CREATED: "Order {{ order.number }} has been created",
  ORDER_FULFILLED: "Order {{ order.number }} has been fulfilled",
  ORDER_CONFIRMED: "Order {{ order.number }} has been confirmed",
  ORDER_FULLY_PAID: "Order {{ order.number }} has been fully paid",
  ORDER_CANCELLED: "Order {{ order.number }} has been cancelled",
  INVOICE_SENT: "New invoice has been created",
};
