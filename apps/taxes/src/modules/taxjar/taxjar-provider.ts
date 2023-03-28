import pino from "pino";
import { TaxBaseFragment } from "../../../generated/graphql";
import { createLogger } from "../../lib/logger";
import { ChannelConfig } from "../channels-configuration/channels-config";
import { TaxProvider } from "../taxes/tax-provider";
import { taxJarCalculate } from "./taxjar-calculate";
import { TaxJarClient } from "./taxjar-client";
import { TaxJarConfig } from "./taxjar-config";

export class TaxJarProvider implements TaxProvider {
  client: TaxJarClient;
  readonly name = "taxjar";
  private logger: pino.Logger;

  constructor(config: TaxJarConfig) {
    const avataxClient = new TaxJarClient(config);

    this.client = avataxClient;
    this.logger = createLogger({
      service: "TaxJarProvider",
    });
  }

  async calculate(payload: TaxBaseFragment, channel: ChannelConfig) {
    this.logger.debug({ payload, channel }, "TaxJar calculate called with:");
    const linesWithDiscount = taxJarCalculate.prepareLinesWithDiscountPayload(
      payload.lines,
      payload.discounts
    );
    const linesWithChargeTaxes = linesWithDiscount.filter((line) => line.chargeTaxes === true);
    const taxParams = taxJarCalculate.preparePayload(payload, channel, linesWithDiscount);
    const fetchedTaxes = await this.client.fetchTaxesForOrder(taxParams);
    this.logger.debug({ fetchedTaxes }, "TaxJar createOrderTransaction response");

    return taxJarCalculate.prepareResponse(
      payload,
      fetchedTaxes,
      linesWithChargeTaxes,
      linesWithDiscount
    );
  }
}
