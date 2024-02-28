import { AuthData } from "@saleor/app-sdk/APL";
import { OrderConfirmedSubscriptionFragment } from "../../../generated/graphql";
import { OrderCancelledPayload } from "../../pages/api/webhooks/order-cancelled";
import { IAvataxService } from "../taxes/tax-provider-webhook";
import { AvataxConfig } from "./avatax-connection-schema";
import { AvataxCalculateTaxesAdapter } from "./calculate-taxes/avatax-calculate-taxes-adapter";
import { ClientLogger } from "../logs/client-logger";
import { AvataxOrderCancelledAdapter } from "./order-cancelled/avatax-order-cancelled-adapter";
import { AvataxOrderConfirmedAdapter } from "./order-confirmed/avatax-order-confirmed-adapter";
import { createLogger } from "../../logger";
import { CalculateTaxesPayload } from "../webhooks/calculate-taxes-payload";

export class AvataxService implements IAvataxService {
  private logger = createLogger("AvataxWebhookService");
  private clientLogger: ClientLogger;

  constructor({ clientLogger }: { clientLogger: ClientLogger }) {
    this.clientLogger = clientLogger;
  }

  async calculateTaxes({
    payload,
    config,
    authData,
  }: {
    payload: CalculateTaxesPayload;
    config: AvataxConfig;
    authData: AuthData;
  }) {
    const adapter = new AvataxCalculateTaxesAdapter({
      clientLogger: this.clientLogger,
    });

    const response = await adapter.send({ payload, config, authData });

    return response;
  }

  async confirmOrder({
    authData,
    payload,
    config,
  }: {
    payload: OrderConfirmedSubscriptionFragment;
    config: AvataxConfig;
    authData: AuthData;
  }) {
    const adapter = new AvataxOrderConfirmedAdapter({
      clientLogger: this.clientLogger,
    });

    const response = await adapter.send({
      config,
      authData,
      payload: {
        order: payload,
      },
    });

    return response;
  }

  async cancelOrder({
    config,
    authData,
    payload,
  }: {
    payload: OrderCancelledPayload;
    config: AvataxConfig;
    authData: AuthData;
  }) {
    const adapter = new AvataxOrderCancelledAdapter({
      clientLogger: this.clientLogger,
    });

    await adapter.send({ payload, config, authData });
  }
}
