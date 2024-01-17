import { AuthData } from "@saleor/app-sdk/APL";
import { OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";
import { CalculateTaxesPayload } from "../../pages/api/webhooks/checkout-calculate-taxes";
import { OrderCancelledPayload } from "../../pages/api/webhooks/order-cancelled";
import { OrderFullyRefundedPayload } from "../../pages/api/webhooks/order-fully-refunded";
import { ClientLogger } from "../logs/client-logger";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { AvataxConfig } from "./avatax-connection-schema";
import { AvataxCalculateTaxesAdapter } from "./calculate-taxes/avatax-calculate-taxes-adapter";
import { AvataxOrderCancelledAdapter } from "./order-cancelled/avatax-order-cancelled-adapter";
import { AvataxOrderConfirmedAdapter } from "./order-confirmed/avatax-order-confirmed-adapter";
import { AvataxOrderFullyRefundedAdapter } from "./order-fully-refunded/avatax-order-fully-refunded-adapter";

export class AvataxWebhookService implements ProviderWebhookService {
  private config: AvataxConfig;
  private clientLogger: ClientLogger;
  private authData: AuthData;

  constructor({
    config,
    authData,
    clientLogger,
  }: {
    config: AvataxConfig;
    authData: AuthData;
    clientLogger: ClientLogger;
  }) {
    this.authData = authData;
    this.config = config;
    this.clientLogger = clientLogger;
  }

  async calculateTaxes(payload: CalculateTaxesPayload) {
    const adapter = new AvataxCalculateTaxesAdapter({
      config: this.config,
      clientLogger: this.clientLogger,
      authData: this.authData,
    });

    const response = await adapter.send(payload);

    return response;
  }

  async confirmOrder(order: OrderConfirmedSubscriptionFragment) {
    const adapter = new AvataxOrderConfirmedAdapter({
      config: this.config,
      clientLogger: this.clientLogger,
      authData: this.authData,
    });

    const response = await adapter.send({ order });

    return response;
  }

  async cancelOrder(payload: OrderCancelledPayload) {
    const adapter = new AvataxOrderCancelledAdapter({
      config: this.config,
      clientLogger: this.clientLogger,
    });

    await adapter.send(payload);
  }

  async refundTransaction(payload: OrderFullyRefundedPayload) {
    const adapter = new AvataxOrderFullyRefundedAdapter(this.config);

    return adapter.send(payload);
  }
}
