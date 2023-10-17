import { OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";
import { taxProviderUtils } from "../taxes/tax-provider-utils";
import { TaxBadPayloadError } from "../taxes/tax-error";
import { CalculateTaxesPayload } from "../../pages/api/webhooks/checkout-calculate-taxes";

export class AvataxCustomerCodeResolver {
  resolveOrderCustomerCode(order: OrderConfirmedSubscriptionFragment) {
    return taxProviderUtils.resolveStringOrThrow(
      order.user?.id,
      new TaxBadPayloadError("Cannot resolve user id"),
    );
  }

  // During the checkout process, it appears the customer id is not always available. We can use the email address instead.
  resolveCalculateTaxesCustomerCode(payload: CalculateTaxesPayload): string {
    if (payload.taxBase.sourceObject.__typename === "Checkout") {
      return taxProviderUtils.resolveStringOrThrow(
        payload.taxBase.sourceObject.email,
        new TaxBadPayloadError("Cannot resolve email from sourceObject"),
      );
    }

    if (payload.taxBase.sourceObject.__typename === "Order") {
      return taxProviderUtils.resolveStringOrThrow(
        payload.taxBase.sourceObject.userEmail,
        new TaxBadPayloadError("Cannot resolve userEmail from sourceObject"),
      );
    }

    throw new TaxBadPayloadError("Cannot resolve customer code");
  }
}
