import pino from "pino";
import { TaxBaseFragment } from "../../../generated/graphql";
import { createLogger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { taxJarCalculate } from "./taxjar-calculate";
import { TaxJarClient } from "./taxjar-client";
import { TaxJarConfig } from "./taxjar-config";

export class TaxJarWebhookService implements ProviderWebhookService {
  client: TaxJarClient;
  private logger: pino.Logger;

  constructor(config: TaxJarConfig) {
    const avataxClient = new TaxJarClient(config);

    this.client = avataxClient;
    this.logger = createLogger({
      service: "TaxJarProvider",
    });
  }

  async calculateTaxes(payload: TaxBaseFragment, channel: ChannelConfig) {
    this.logger.debug({ payload, channel }, "TaxJar calculate called with:");
    const linesWithDiscount = taxJarCalculate.prepareLinesWithDiscountPayload(
      payload.lines,
      payload.discounts
    );
    const linesWithChargeTaxes = linesWithDiscount.filter((line) => line.chargeTaxes === true);
    const taxParams = taxJarCalculate.preparePayload(payload, channel, linesWithDiscount);
    const fetchedTaxes = await this.client.fetchTaxForOrder(taxParams);
    this.logger.debug({ fetchedTaxes }, "TaxJar createOrderTransaction response");

    return taxJarCalculate.prepareResponse(
      payload,
      fetchedTaxes,
      linesWithChargeTaxes,
      linesWithDiscount
    );
  }

  async createOrder() {
    throw new Error("Method not implemented.");
  }
}
