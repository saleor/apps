import { createLogger } from "@saleor/apps-logger";
import { UserFragment } from "../../../generated/graphql";

const logger = createLogger("avataxCustomerCode");

/*
 * "If you're creating a sales order for a customer that does not yet exist in your system, you can send a dummyCustomerCode as sales orders are not recorded."
 * https://developer.avalara.com/ecommerce-integration-guide/sales-tax-badge/transactions/simple-transactions/
 */
const FALLBACK_CUSTOMER_CODE = "0";

export const avataxCustomerCode = {
  resolve(user: UserFragment | null | undefined): string {
    // see: docs.saleor.io/docs/3.x/developer/app-store/apps/taxes/avatax/overview#customer-code
    const avataxCustomerCode = user?.avataxCustomerCode;

    if (avataxCustomerCode) {
      logger.trace({ avataxCustomerCode }, `Returning customer code found in the user metadata.`);
      return avataxCustomerCode;
    }

    const userId = user?.id;

    if (userId) {
      logger.trace({ userId }, `Returning user id as a customer code.`);
      return userId;
    }

    logger.trace(`Returning fallback customer code.`);
    return FALLBACK_CUSTOMER_CODE;
  },
};
