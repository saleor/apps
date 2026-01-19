import { Result, ok, err } from "neverthrow";
import { createLogger } from "@/lib/logger";
import { createGraphQLClient } from "@/lib/graphql-client";
import { TransactionEventReportDocument, TransactionEventTypeEnum } from "@/generated/graphql";
import { getPool } from "@/lib/database";

const logger = createLogger("PayPalWebhookEventReporter");

/**
 * PayPal webhook resource types
 */
export interface PayPalCaptureResource {
  id: string;
  status: string;
  amount?: {
    currency_code: string;
    value: string;
  };
  custom_id?: string;
  invoice_id?: string;
  seller_receivable_breakdown?: {
    gross_amount?: { currency_code: string; value: string };
    paypal_fee?: { currency_code: string; value: string };
    net_amount?: { currency_code: string; value: string };
    platform_fees?: Array<{ amount: { currency_code: string; value: string } }>;
  };
  links?: Array<{ href: string; rel: string; method: string }>;
}

export interface PayPalRefundResource {
  id: string;
  status: string;
  amount?: {
    currency_code: string;
    value: string;
  };
  custom_id?: string;
  invoice_id?: string;
  links?: Array<{ href: string; rel: string; method: string }>;
}

export interface PayPalAuthorizationResource {
  id: string;
  status: string;
  amount?: {
    currency_code: string;
    value: string;
  };
  custom_id?: string;
  invoice_id?: string;
  links?: Array<{ href: string; rel: string; method: string }>;
}

export interface PayPalMerchantResource {
  merchant_id?: string;
  partner_merchant_id?: string;
  tracking_id?: string;
}

export interface PayPalVettingResource {
  merchant_id?: string;
  tracking_id?: string;
  product?: {
    name?: string;
    vetting_status?: string;
  };
}

/**
 * Metadata stored in PayPal's custom_id field
 */
export interface SaleorMetadata {
  saleor_transaction_id: string;
  saleor_source_id: string;
  saleor_source_type: string;
  saleor_channel_id: string;
}

/**
 * Parse custom_id field to extract Saleor metadata
 */
function parseSaleorMetadata(customId: string | undefined): SaleorMetadata | null {
  if (!customId) {
    return null;
  }

  try {
    const parsed = JSON.parse(customId);
    if (parsed.saleor_transaction_id) {
      return parsed as SaleorMetadata;
    }
    return null;
  } catch {
    logger.warn("Failed to parse custom_id as JSON", { customId });
    return null;
  }
}

/**
 * Get Saleor API URL for a merchant by their PayPal merchant ID
 */
async function getSaleorApiUrlByMerchantId(merchantId: string): Promise<string | null> {
  try {
    const pool = getPool();
    const result = await pool.query(
      `SELECT saleor_api_url FROM paypal_merchant_onboarding WHERE paypal_merchant_id = $1 LIMIT 1`,
      [merchantId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].saleor_api_url;
  } catch (error) {
    logger.error("Failed to get Saleor API URL by merchant ID", {
      merchantId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Report a transaction event to Saleor
 */
export async function reportTransactionEventToSaleor(args: {
  saleorApiUrl: string;
  saleorToken: string;
  transactionId: string;
  type: TransactionEventTypeEnum;
  amount: string;
  pspReference: string;
  message: string;
  externalUrl?: string;
  availableActions?: Array<"CHARGE" | "REFUND" | "CANCEL">;
}): Promise<Result<{ alreadyProcessed: boolean }, Error>> {
  const client = createGraphQLClient(args.saleorApiUrl, args.saleorToken);

  logger.info("Reporting transaction event to Saleor", {
    transactionId: args.transactionId,
    type: args.type,
    amount: args.amount,
    pspReference: args.pspReference,
  });

  try {
    const result = await client
      .mutation(TransactionEventReportDocument, {
        transactionId: args.transactionId,
        type: args.type,
        amount: args.amount,
        pspReference: args.pspReference,
        message: args.message,
        time: new Date().toISOString(),
        externalUrl: args.externalUrl,
        availableActions: args.availableActions,
      })
      .toPromise();

    if (result.error) {
      logger.error("GraphQL error reporting transaction event", {
        error: result.error.message,
        transactionId: args.transactionId,
      });
      return err(new Error(`GraphQL error: ${result.error.message}`));
    }

    const data = result.data?.transactionEventReport;

    if (!data) {
      return err(new Error("No data returned from transactionEventReport"));
    }

    if (data.errors && data.errors.length > 0) {
      const errorMessages = data.errors.map((e: { message?: string | null }) => e.message).join(", ");
      logger.error("Transaction event report errors", {
        errors: data.errors,
        transactionId: args.transactionId,
      });
      return err(new Error(`Transaction event report errors: ${errorMessages}`));
    }

    logger.info("Successfully reported transaction event to Saleor", {
      transactionId: args.transactionId,
      type: args.type,
      alreadyProcessed: data.alreadyProcessed,
      eventId: data.transactionEvent?.id,
    });

    return ok({ alreadyProcessed: data.alreadyProcessed ?? false });
  } catch (error) {
    logger.error("Exception reporting transaction event to Saleor", {
      error: error instanceof Error ? error.message : String(error),
      transactionId: args.transactionId,
    });
    return err(error instanceof Error ? error : new Error("Failed to report transaction event"));
  }
}

/**
 * Get PayPal external URL for a capture/refund
 */
function getPayPalExternalUrl(resourceId: string, env: "SANDBOX" | "LIVE"): string {
  const baseUrl = env === "SANDBOX"
    ? "https://www.sandbox.paypal.com"
    : "https://www.paypal.com";
  return `${baseUrl}/activity/payment/${resourceId}`;
}

export {
  parseSaleorMetadata,
  getSaleorApiUrlByMerchantId,
  getPayPalExternalUrl,
};
