import { createLogger } from "@saleor/apps-logger";

const logger = createLogger("avataxCustomerCode");

/*
 * "If you're creating a sales order for a customer that does not yet exist in your system, you can send a dummyCustomerCode as sales orders are not recorded."
 * https://developer.avalara.com/ecommerce-integration-guide/sales-tax-badge/transactions/simple-transactions/
 */
const FALLBACK_CUSTOMER_CODE = "0";

type NullableString = string | null | undefined;

// see: docs.saleor.io/docs/3.x/developer/app-store/apps/taxes/avatax/overview#customer-code
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
      logger.info(`Returning customer code found in the ${source} metadata.`);
      return avataxCustomerCode;
    }

    // TODO: Remove legacy customer code handling after clients migrate to customer code on order / checkout
    if (legacyAvataxCustomerCode) {
      logger.info("Returning legacy customer code found in the user metadata.");
      return legacyAvataxCustomerCode;
    }

    if (legacyUserId) {
      logger.info("Returning user id as legacy customer code");
      return legacyUserId;
    }

    logger.info("Returning fallback customer code.");
    return FALLBACK_CUSTOMER_CODE;
  },
};
