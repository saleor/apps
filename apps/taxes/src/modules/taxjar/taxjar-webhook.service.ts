import { AuthData } from "@saleor/app-sdk/APL";
import {
  OrderCancelledEventSubscriptionFragment,
  OrderConfirmedSubscriptionFragment,
} from "../../../generated/graphql";
import { CalculateTaxesPayload } from "../../pages/api/webhooks/checkout-calculate-taxes";
import { TransactionRefundRequestedPayload } from "../../pages/api/webhooks/transaction-refund-requested";
import { ClientLogger } from "../logs/client-logger";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { TaxJarCalculateTaxesAdapter } from "./calculate-taxes/taxjar-calculate-taxes-adapter";
import { TaxJarOrderConfirmedAdapter } from "./order-confirmed/taxjar-order-confirmed-adapter";
import { TaxJarClient } from "./taxjar-client";
import { TaxJarConfig } from "./taxjar-connection-schema";

export class TaxJarWebhookService implements ProviderWebhookService {
  client: TaxJarClient;
  private config: TaxJarConfig;
  private clientLogger: ClientLogger;
  private authData: AuthData;

  constructor({
    clientLogger,
    config,
    authData,
  }: {
    clientLogger: ClientLogger;
    config: TaxJarConfig;
    authData: AuthData;
  }) {
    const taxJarClient = new TaxJarClient(config);

    this.client = taxJarClient;
    this.config = config;
    this.authData = authData;
    this.clientLogger = clientLogger;
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
    // todo: implement
    this.logger.debug("cancelOrder not implemented for TaxJar");
  }

  async refundTransaction(payload: TransactionRefundRequestedPayload) {
    // todo: implement
    this.logger.debug("refundOrder not implemented for TaxJar");
  }
}
