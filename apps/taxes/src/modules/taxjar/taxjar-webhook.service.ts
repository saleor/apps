import pino from "pino";
import { TaxBaseFragment } from "../../../generated/graphql";
import { createLogger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { TaxJarClient } from "./taxjar-client";
import { TaxJarConfig } from "./taxjar-config";
import { taxJarTransform } from "./taxjar-transform";

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
    this.logger.debug({ payload, channel }, "calculateTaxes called with:");
    const linesWithDiscount = taxJarTransform.prepareLinesWithDiscountPayload(
      payload.lines,
      payload.discounts
    );
    const linesWithChargeTaxes = linesWithDiscount.filter((line) => line.chargeTaxes === true);
    const taxParams = taxJarTransform.preparePayload(payload, channel, linesWithDiscount);
    const fetchedTaxes = await this.client.fetchTaxForOrder(taxParams);
    this.logger.debug({ fetchedTaxes }, "fetchTaxForOrder response");

    return taxJarTransform.prepareCalculateTaxesResponse(
      payload,
      fetchedTaxes,
      linesWithChargeTaxes,
      linesWithDiscount
    );
  }

  async createOrder(payload: TaxBaseFragment, channel: ChannelConfig) {
    const params = taxJarTransform.prepareCreateOrderParams(payload, channel);
    const result = await this.client.createOrder(params);

    this.logger.debug({ createOrder: result }, "createOrder response");

    return { ok: true };
  }
}
