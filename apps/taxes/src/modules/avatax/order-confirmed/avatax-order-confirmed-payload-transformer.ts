import { DocumentType } from "avatax/lib/enums/DocumentType";
import { OrderConfirmedSubscriptionFragment } from "../../../../generated/graphql";
import { discountUtils } from "../../taxes/discount-utils";

import { AvataxClient, CreateTransactionArgs } from "../avatax-client";
import { AvataxConfig, defaultAvataxConfig } from "../avatax-connection-schema";

import { avataxData } from "../avatax-data-resolver";
import { AvataxEntityTypeMatcher } from "../avatax-entity-type-matcher";
import { AvataxTaxCodeMatches } from "../tax-code/avatax-tax-code-match-repository";
import { resolveAvataxAddress } from "./avatax-address-resolver";
import { transformAvataxOrderConfirmedPayloadLines } from "./avatax-order-confirmed-payload-lines-transformer";

import { z } from "zod";
import { createLogger } from "../../../logger";

export function resolveAvataxCalculationDate(
  avataxTaxCalculationDate: string | null | undefined,
  orderCreatedDate: string,
): Date {
  const logger = createLogger("AvataxCalculationDateResolver");

  if (!avataxTaxCalculationDate) {
    logger.info("No tax calculation date provided. Falling back to order created date.");
    return new Date(orderCreatedDate);
  }

  // UTC datetime string, e.g. "2021-08-31T13:00:00.000Z"
  const taxCalculationParse = z.string().datetime().safeParse(avataxTaxCalculationDate);

  if (taxCalculationParse.success) {
    // The user is able to pass other tax calculation date than the order creation date.
    logger.info("Valid UTC tax calculation date found in metadata. Using it for tax calculation.");
    return new Date(taxCalculationParse.data);
  } else {
    logger.warn(
      `The tax calculation date ${avataxTaxCalculationDate} is not a valid UTC datetime. Falling back to order created date.`,
    );

    return new Date(orderCreatedDate);
  }
}

export async function transformAvataxOrderConfirmedPayload(
  order: OrderConfirmedSubscriptionFragment,
  avataxConfig: AvataxConfig,
  matches: AvataxTaxCodeMatches,
): Promise<CreateTransactionArgs> {
  const matchDocumentType = (config: AvataxConfig): DocumentType => {
    if (!config.isDocumentRecordingEnabled) {
      // isDocumentRecordingEnabled = false changes all the DocTypes within your AvaTax requests to SalesOrder. This will stop any transaction from being recorded within AvaTax.
      return DocumentType.SalesOrder;
    }

    return DocumentType.SalesInvoice;
  };

  const resolveAvataxCalculationDate = (
    avataxTaxCalculationDate: string | null | undefined,
    orderCreatedDate: string,
  ): Date => {
    const logger = createLogger("AvataxCalculationDateResolver");

    if (!avataxTaxCalculationDate) {
      logger.info("No tax calculation date provided. Falling back to order created date.");
      return new Date(orderCreatedDate);
    }

    // UTC datetime string, e.g. "2021-08-31T13:00:00.000Z"
    const taxCalculationParse = z.string().datetime().safeParse(avataxTaxCalculationDate);

    if (taxCalculationParse.success) {
      logger.info(
        "Valid UTC tax calculation date found in metadata. Using it for tax calculation.",
      );
      return new Date(taxCalculationParse.data);
    } else {
      logger.warn(
        `The tax calculation date ${avataxTaxCalculationDate} is not a valid UTC datetime. Falling back to order created date.`,
      );

      return new Date(orderCreatedDate);
    }
  };

  const avataxClient = new AvataxClient(avataxConfig);

  const entityTypeMatcher = new AvataxEntityTypeMatcher({ client: avataxClient });

  const entityUseCode = await entityTypeMatcher.match(order.avataxEntityCode);
  const date = resolveAvataxCalculationDate(order.avataxTaxCalculationDate, order.created);
  const code = avataxData.documentCode.resolve({
    avataxDocumentCode: order.avataxDocumentCode,
    orderId: order.id,
  });
  const customerCode = avataxData.customerCode.resolveFromOrder(order);

  const addresses = resolveAvataxAddress({
    from: avataxConfig.address,
    to: order.shippingAddress!,
  });

  return {
    model: {
      code,
      type: matchDocumentType(avataxConfig),
      entityUseCode,
      customerCode,
      companyCode: avataxConfig.companyCode ?? defaultAvataxConfig.companyCode,
      // * commit: If true, the transaction will be committed immediately after it is created. See: https://developer.avalara.com/communications/dev-guide_rest_v2/commit-uncommit
      commit: avataxConfig.isAutocommit,
      addresses,
      currencyCode: order.total.currency,
      // we can fall back to empty string because email is not a required field
      email: order.user?.email ?? order.userEmail ?? "",
      lines: transformAvataxOrderConfirmedPayloadLines(order, avataxConfig, matches),
      date,
      discount: discountUtils.sumDiscounts(
        order.discounts.map((discount) => discount.amount.amount),
      ),
    },
  };
}
