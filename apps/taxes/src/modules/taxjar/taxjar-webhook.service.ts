import { OrderCreatedSubscriptionFragment, TaxBaseFragment } from "../../../generated/graphql";
import { Logger, createLogger } from "../../lib/logger";
import { TaxJarCalculateTaxesAdapter } from "./calculate-taxes/taxjar-calculate-taxes-adapter";
import { TaxJarClient } from "./taxjar-client";
import { TaxJarConfig } from "./taxjar-connection-schema";
import { TaxJarOrderCreatedAdapter } from "./order-created/taxjar-order-created-adapter";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { AuthData } from "@saleor/app-sdk/APL";

export class TaxJarWebhookService implements ProviderWebhookService {
  client: TaxJarClient;
  private logger: Logger;
  private config: TaxJarConfig;

  constructor(config: TaxJarConfig, private authData: AuthData) {
    const taxJarClient = new TaxJarClient(config);

    this.client = taxJarClient;
    this.config = config;
    this.logger = createLogger({
      name: "TaxJarWebhookService",
    });
  }

  async calculateTaxes(taxBase: TaxBaseFragment) {
    const adapter = new TaxJarCalculateTaxesAdapter(this.config, this.authData);

    const response = await adapter.send({ taxBase });

    return response;
  }

  async createOrder(order: OrderCreatedSubscriptionFragment) {
    const adapter = new TaxJarOrderCreatedAdapter(this.config, this.authData);

    const response = await adapter.send({ order });

    return response;
  }

  // * TaxJar doesn't require any action on order fulfillment
  async fulfillOrder() {
    return { ok: true };
  }
}
