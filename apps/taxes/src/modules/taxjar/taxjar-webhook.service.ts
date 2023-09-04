import { AuthData } from "@saleor/app-sdk/APL";
import {
  OrderCancelledEventSubscriptionFragment,
  OrderConfirmedSubscriptionFragment,
} from "../../../generated/graphql";
import { Logger, createLogger } from "../../lib/logger";
import { CalculateTaxesPayload } from "../../pages/api/webhooks/checkout-calculate-taxes";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { TaxJarCalculateTaxesAdapter } from "./calculate-taxes/taxjar-calculate-taxes-adapter";
import { TaxJarClientLogger, createTaxJarClientLogger } from "./logs/taxjar-client-logger";
import { TaxJarOrderConfirmedAdapter } from "./order-confirmed/taxjar-order-confirmed-adapter";
import { TaxJarClient } from "./taxjar-client";
import { TaxJarConfig } from "./taxjar-connection-schema";

export class TaxJarWebhookService implements ProviderWebhookService {
  client: TaxJarClient;
  private logger: Logger;
  private config: TaxJarConfig;
  private clientLogger: TaxJarClientLogger;
  private authData: AuthData;

  constructor({
    configurationId,
    config,
    authData,
  }: {
    configurationId: string;
    config: TaxJarConfig;
    authData: AuthData;
  }) {
    const taxJarClient = new TaxJarClient(config);

    this.client = taxJarClient;
    this.config = config;
    this.authData = authData;

    this.clientLogger = createTaxJarClientLogger({
      authData,
      configurationId,
    });
    this.logger = createLogger({
      name: "TaxJarWebhookService",
    });
  }

  async calculateTaxes(payload: CalculateTaxesPayload) {
    const adapter = new TaxJarCalculateTaxesAdapter({
      config: this.config,
      authData: this.authData,
      clientLogger: this.clientLogger,
    });

    const response = await adapter.send(payload);

    return response;
  }

  async confirmOrder(order: OrderConfirmedSubscriptionFragment) {
    const adapter = new TaxJarOrderConfirmedAdapter({
      config: this.config,
      authData: this.authData,
      clientLogger: this.clientLogger,
    });

    const response = await adapter.send({ order });

    return response;
  }

  async cancelOrder(payload: OrderCancelledEventSubscriptionFragment) {
    // TaxJar isn't implemented yet
  }
}
