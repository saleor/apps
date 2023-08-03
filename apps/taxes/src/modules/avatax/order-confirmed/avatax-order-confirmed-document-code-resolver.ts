import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";

export class AvataxOrderConfirmedDocumentCodeResolver {
  resolve(order: OrderConfirmedSubscriptionFragment): string {
    /*
     * The value for "code" can be provided in the metadata.
     * Read more: https://developer.avalara.com/erp-integration-guide/sales-tax-badge/transactions/cert-document-codes/
     */
    return order.avataxDocumentCode ?? order.id;
  }
}
