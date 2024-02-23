import { AddressesModel } from "avatax/lib/models/AddressesModel";
import {
  AddressFragment,
  OrderConfirmedSubscriptionFragment,
  OrderLineFragment,
} from "../../../generated/graphql";
import { CalculateTaxesPayload } from "../../pages/api/webhooks/checkout-calculate-taxes";
import { AvataxConfig } from "./avatax-connection-schema";
import { avataxAddressFactory } from "./address-factory";
import { taxProviderUtils } from "../taxes/tax-provider-utils";
import { CriticalError } from "../../error";

const FALLBACK_CUSTOMER_CODE = "0";

function resolveFromOrder(order: OrderConfirmedSubscriptionFragment) {
  return order.user?.id ?? FALLBACK_CUSTOMER_CODE;
}

function resolveFromCalculateTaxes(payload: CalculateTaxesPayload): string {
  return payload.taxBase.sourceObject.user?.id ?? FALLBACK_CUSTOMER_CODE;
}

const customerCode = {
  resolveFromOrder,
  resolveFromCalculateTaxes,
};

function resolveAvataxDocumentCode({
  avataxDocumentCode,
  orderId,
}: {
  avataxDocumentCode: string | null | undefined;
  orderId: string | undefined;
}): string {
  /*
   * The value for "code" can be provided in the metadata.
   * Read more: https://developer.avalara.com/erp-integration-guide/sales-tax-badge/transactions/cert-document-codes/
   * The returned document code must be idempotent (same document code for the same order).
   */
  const code = avataxDocumentCode ?? orderId;

  if (!code) {
    throw new Error("Order id or document code must be provided");
  }

  /*
   * The requirement from AvaTax API is that document code is a string that must be between 1 and 20 characters long.
   */
  return code.slice(0, 20);
}

const documentCode = {
  resolve: resolveAvataxDocumentCode,
};

function resolveAvataxAddress({
  from,
  to,
}: {
  from: AvataxConfig["address"];
  to: AddressFragment | undefined | null;
}): AddressesModel {
  return {
    shipFrom: avataxAddressFactory.fromChannelAddress(from),
    shipTo: avataxAddressFactory.fromSaleorAddress(
      taxProviderUtils.resolveOptionalOrThrowUnexpectedError(
        to,
        new CriticalError("Missing shipTo address"),
      ),
    ),
  };
}

const address = {
  resolve: resolveAvataxAddress,
};

export const avataxData = {
  customerCode,
  documentCode,
  address,
};
