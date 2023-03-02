import { TaxBaseFragment } from "../../../../../generated/graphql";
import { logger } from "../../../../lib/logger";
import {
  ChannelConfig,
  defaultChannelConfig,
} from "../../../channels-configuration/channels-config";
import { TaxProvider } from "../../tax-provider";
import { taxJarCalculate } from "./taxjar-calculate";
import { TaxJarClient } from "./taxjar-client";
import { defaultTaxJarConfig, TaxJarConfig } from "./taxjar-config";

export class TaxJarProvider implements TaxProvider {
  readonly name = "taxjar";
  config = defaultTaxJarConfig;
  channel = defaultChannelConfig;
  client: TaxJarClient;

  constructor(config: TaxJarConfig) {
    const avataxClient = new TaxJarClient(config);

    this.config = config;
    this.client = avataxClient;
  }

  async calculate(payload: TaxBaseFragment, channel: ChannelConfig) {
    logger.info("TaxJar calculate");
    const linesWithDiscount = taxJarCalculate.prepareLinesWithDiscountPayload(
      payload.lines,
      payload.discounts
    );
    const linesWithChargeTaxes = linesWithDiscount.filter((line) => line.chargeTaxes === true);
    const taxParams = taxJarCalculate.preparePayload(payload, channel, linesWithDiscount);
    logger.info(taxParams, "Payload used for TaxJar fetchTaxesForOrder");
    const fetchedTaxes = await this.client.fetchTaxesForOrder(taxParams);
    logger.info({ fetchedTaxes }, "TaxJar createOrderTransaction response");

    return taxJarCalculate.prepareResponse(
      payload,
      fetchedTaxes,
      linesWithChargeTaxes,
      linesWithDiscount
    );
  }
}
