import { AuthData } from "@saleor/app-sdk/APL";
import { createLogger } from "../../logger";
import { ClientLogger } from "../logs/client-logger";
import { DeprecatedOrderConfirmedSubscriptionFragment, SaleorOrder } from "../saleor";
import { ProviderWebhookService } from "../taxes/tax-provider-webhook";
import { CalculateTaxesPayload } from "../webhooks/payloads/calculate-taxes-payload";
import { OrderCancelledPayload } from "../webhooks/payloads/order-cancelled-payload";
import { AvataxConfig } from "./avatax-connection-schema";
import { AvataxCalculateTaxesAdapter } from "./calculate-taxes/avatax-calculate-taxes-adapter";
import { AvataxOrderCancelledAdapter } from "./order-cancelled/avatax-order-cancelled-adapter";
import { AvataxOrderConfirmedAdapter } from "./order-confirmed/avatax-order-confirmed-adapter";

export class AvataxWebhookService implements ProviderWebhookService {
  private logger = createLogger("AvataxWebhookService");
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

  async confirmOrder(
    order: DeprecatedOrderConfirmedSubscriptionFragment,
    saleorOrder: SaleorOrder,
  ) {
    const adapter = new AvataxOrderConfirmedAdapter({
      config: this.config,
      clientLogger: this.clientLogger,
      authData: this.authData,
    });

    const response = await adapter.send({ order, saleorOrder });

    return response;
  }

  async cancelOrder(payload: OrderCancelledPayload) {
    const adapter = new AvataxOrderCancelledAdapter({
      config: this.config,
      clientLogger: this.clientLogger,
    });

    await adapter.send(payload);
  }
}
