import { AuthData } from "@saleor/app-sdk/APL";
import { OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";
import { createLogger } from "../../logger";
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
  private authData: AuthData;

  constructor({ config, authData }: { config: AvataxConfig; authData: AuthData }) {
    this.authData = authData;
    this.config = config;
  }

  async calculateTaxes(payload: CalculateTaxesPayload) {
    const adapter = new AvataxCalculateTaxesAdapter({
      config: this.config,
      authData: this.authData,
    });

    const response = await adapter.send(payload);

    return response;
  }

  async confirmOrder(order: OrderConfirmedSubscriptionFragment) {
    const adapter = new AvataxOrderConfirmedAdapter({
      config: this.config,
      authData: this.authData,
    });

    const response = await adapter.send({ order });

    return response;
  }

  async cancelOrder(payload: OrderCancelledPayload) {
    const adapter = new AvataxOrderCancelledAdapter({
      config: this.config,
    });

    await adapter.send(payload);
  }
}
