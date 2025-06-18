import { createLogger } from "../../logger";

const logger = createLogger("avataxCustomerCode");

/*
 * "If you're creating a sales order for a customer that does not yet exist in your system, you can send a dummyCustomerCode as sales orders are not recorded."
 * https://developer.avalara.com/ecommerce-integration-guide/sales-tax-badge/transactions/simple-transactions/
 */
const FALLBACK_CUSTOMER_CODE = "0";

type NullableString = string | null | undefined;

// see: https://docs.saleor.io/developer/app-store/apps/avatax/configuration#customer-code
export const avataxCustomerCode = {
  resolve({
    avataxCustomerCode,
    legacyAvataxCustomerCode,
    legacyUserId,
    source,
  }: {
    avataxCustomerCode: NullableString;
    /**
     * @deprecated use `avataxCustomerCode` from order or checkout metadata instead
     */
    legacyAvataxCustomerCode: NullableString;
    /**
     * @deprecated use `avataxCustomerCode` from order or checkout metadata instead
     */
    legacyUserId: NullableString;
    source: "Order" | "Checkout";
  }): string {
    if (avataxCustomerCode) {
      logger.debug(`Returning customer code found in the ${source} metadata.`);

      return avataxCustomerCode;
    }

    // TODO: Remove legacy customer code handling after clients migrate to customer code on order / checkout
    if (legacyAvataxCustomerCode) {
      logger.debug("Returning legacy customer code found in the user metadata.");

      return legacyAvataxCustomerCode;
    }

    if (legacyUserId) {
      logger.debug("Returning user id as legacy customer code");

      return legacyUserId;
    }

    logger.debug("Returning fallback customer code.");

    return FALLBACK_CUSTOMER_CODE;
  },
};
