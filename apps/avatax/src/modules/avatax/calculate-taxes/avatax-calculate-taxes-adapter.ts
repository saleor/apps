import { createLogger } from "../../../logger";
import { CalculateTaxesResponse } from "../../taxes/tax-provider-webhook";
import { AvataxClient, CreateTransactionArgs } from "../avatax-client";
import { extractTransactionRedactedLogProperties } from "../extract-transaction-redacted-log-properties";
import { AvataxCalculateTaxesResponseTransformer } from "./avatax-calculate-taxes-response-transformer";

export type AvataxCalculateTaxesTarget = CreateTransactionArgs;
export type AvataxCalculateTaxesResponse = CalculateTaxesResponse;

export function suspiciousLineCalculationCheck(line: {
  total_gross_amount: number;
  total_net_amount: number;
  tax_rate: number;
}) {
  const tax = line.total_gross_amount - line.total_net_amount;
  const rate = line.tax_rate;
  const lineIsZero = line.total_net_amount === 0 || line.total_gross_amount === 0;

  if (tax === 0 && rate !== 0 && !lineIsZero) {
    return true;
  }

  return false;
}

export class AvataxCalculateTaxesAdapter {
  private logger = createLogger("AvataxCalculateTaxesAdapter");

  constructor(
    private avataxClient: AvataxClient,
    private avataxCalculateTaxesResponseTransformer: AvataxCalculateTaxesResponseTransformer,
  ) {}

  async send(avataxModel: AvataxCalculateTaxesTarget): Promise<AvataxCalculateTaxesResponse> {
    this.logger.debug("Transforming the Saleor payload for calculating taxes with AvaTax...");

    this.logger.info(
      "Calling AvaTax createTransaction with transformed payload for calculate taxes event",
      {
        ...extractTransactionRedactedLogProperties(avataxModel.model),
      },
    );

    const createTransactionResult = await this.avataxClient.createTransaction(avataxModel);

    if (createTransactionResult.isErr()) {
      throw createTransactionResult.error;
    }

    const transaction = createTransactionResult.value;

    this.logger.info("AvaTax createTransaction successfully responded", {
      taxCalculationSummary: transaction.summary,
      addresses: transaction.addresses,
    });

    const transformedResponse = this.avataxCalculateTaxesResponseTransformer.transform(transaction);

    transformedResponse.lines.forEach((l) => {
      const isSuspiciousLine = suspiciousLineCalculationCheck(l);

      if (isSuspiciousLine) {
        this.logger.warn("Non-zero line has zero tax, but rate is not zero", {
          taxCalculationSummary: transaction.summary,
        });
      }
    });

    this.logger.debug("Transformed AvaTax createTransaction response");

    return transformedResponse;
  }
}
