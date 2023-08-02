import { AuthData } from "@saleor/app-sdk/APL";
import {
  OrderCancelledEventSubscriptionFragment,
  OrderConfirmedSubscriptionFragment,
<<<<<<< HEAD
  OrderCreatedSubscriptionFragment,
=======
>>>>>>> d92b62e6 (refactor: :truck: order_created -> order_confirmed)
  TaxBaseFragment,
} from "../../../generated/graphql";
import { Logger, createLogger } from "../../lib/logger";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { TaxJarCalculateTaxesAdapter } from "./calculate-taxes/taxjar-calculate-taxes-adapter";
import { TaxJarOrderConfirmedAdapter } from "./order-confirmed/taxjar-order-confirmed-adapter";
import { TaxJarOrderCreatedAdapter } from "./order-created/taxjar-order-created-adapter";
import { TaxJarClient } from "./taxjar-client";
import { TaxJarConfig } from "./taxjar-connection-schema";
<<<<<<< HEAD
=======
import { TaxJarOrderConfirmedAdapter } from "./order-confirmed/taxjar-order-confirmed-adapter";
import { CreateOrderResponse, ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { AuthData } from "@saleor/app-sdk/APL";
>>>>>>> d92b62e6 (refactor: :truck: order_created -> order_confirmed)

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

  async confirmOrder(order: OrderConfirmedSubscriptionFragment) {
    const adapter = new TaxJarOrderConfirmedAdapter(this.config, this.authData);

    const response = await adapter.send({ order });

    return response;
  }

  /**
   * @deprecated This method is deprecated and will be removed in the future.
   */
  async createOrder(payload: OrderCreatedSubscriptionFragment) {
    const adapter = new TaxJarOrderCreatedAdapter(this.config, this.authData);

    const response = await adapter.send({ order: payload });

    return response;
  }

  /**
   * @deprecated This method is deprecated and will be removed in the future.
   */
  async fulfillOrder() {
    return { ok: true };
  }

  async cancelOrder(payload: OrderCancelledEventSubscriptionFragment) {
    // TaxJar isn't implemented yet
  }
}
