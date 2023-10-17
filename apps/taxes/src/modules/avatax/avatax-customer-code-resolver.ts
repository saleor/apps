import { OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";
import { CalculateTaxesPayload } from "../../pages/api/webhooks/checkout-calculate-taxes";

export class AvataxCustomerCodeResolver {
  /*
   * "If you're creating a sales order for a customer that does not yet exist in your system, you can send a dummyCustomerCode as sales orders are not recorded."
   * https://developer.avalara.com/ecommerce-integration-guide/sales-tax-badge/transactions/simple-transactions/
   */
  private fallbackCustomerCode = "0";

  resolveOrderCustomerCode(order: OrderConfirmedSubscriptionFragment) {
    return order.user?.id ?? this.fallbackCustomerCode;
  }

  resolveCalculateTaxesCustomerCode(payload: CalculateTaxesPayload): string {
    return payload.taxBase.sourceObject.user?.id ?? this.fallbackCustomerCode;
  }
}
