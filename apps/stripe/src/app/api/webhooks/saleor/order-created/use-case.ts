import { err, ok, type Result } from "neverthrow";

import { type OrderCreatedEventFragment } from "@/generated/graphql";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { type AppConfigRepo } from "@/modules/app-config/repositories/app-config-repo";
import { type SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import {
  getSaleorOrderStripeDescription,
  getSaleorOrderStripeMetadata,
} from "@/modules/stripe/saleor-order-stripe-metadata";
import {
  createStripePaymentIntentId,
  type StripePaymentIntentId,
} from "@/modules/stripe/stripe-payment-intent-id";
import { type IStripePaymentIntentsApiFactory } from "@/modules/stripe/types";

export const OrderCreatedUseCaseError = {
  ConfigFetchError: BaseError.subclass("OrderCreatedUseCase.ConfigFetchError", {
    props: { _internalName: "OrderCreatedUseCase.ConfigFetchError" as const },
  }),
  PaymentIntentUpdateError: BaseError.subclass("OrderCreatedUseCase.PaymentIntentUpdateError", {
    props: { _internalName: "OrderCreatedUseCase.PaymentIntentUpdateError" as const },
  }),
};

type OrderCreatedUseCaseError = InstanceType<
  (typeof OrderCreatedUseCaseError)[keyof typeof OrderCreatedUseCaseError]
>;

/**
 * Payment intents created during checkout don't know the order yet. When checkout is completed,
 * Saleor moves its transactions to the order, so this is the first moment the order number
 * can be written to the payment intents.
 */
export class OrderCreatedUseCase {
  private logger = createLogger("OrderCreatedUseCase");
  private appConfigRepo: AppConfigRepo;
  private stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;

  constructor(deps: {
    appConfigRepo: AppConfigRepo;
    stripePaymentIntentsApiFactory: IStripePaymentIntentsApiFactory;
  }) {
    this.appConfigRepo = deps.appConfigRepo;
    this.stripePaymentIntentsApiFactory = deps.stripePaymentIntentsApiFactory;
  }

  async execute(args: {
    appId: string;
    saleorApiUrl: SaleorApiUrl;
    event: OrderCreatedEventFragment;
  }): Promise<
    Result<{ updatedPaymentIntentIds: StripePaymentIntentId[] }, OrderCreatedUseCaseError>
  > {
    const { appId, saleorApiUrl, event } = args;
    const order = event.order;

    // Order.transactions isn't filtered per app - other payment apps' transactions are there too
    const paymentIntentIds = (order?.transactions ?? [])
      .filter((t) => t.createdBy && "id" in t.createdBy && t.createdBy.id === appId)
      .filter((t) => t.pspReference.startsWith("pi_"))
      .map((t) => createStripePaymentIntentId(t.pspReference));

    if (!order || paymentIntentIds.length === 0) {
      return ok({ updatedPaymentIntentIds: [] });
    }

    const configResult = await this.appConfigRepo.getStripeConfig({
      channelId: order.channel.id,
      appId,
      saleorApiUrl,
    });

    if (configResult.isErr()) {
      return err(
        new OrderCreatedUseCaseError.ConfigFetchError("Failed to get configuration", {
          cause: configResult.error,
        }),
      );
    }

    if (!configResult.value) {
      this.logger.warn("Config for channel not found, skipping payment intents update", {
        channelId: order.channel.id,
      });

      return ok({ updatedPaymentIntentIds: [] });
    }

    const stripePaymentIntentsApi = this.stripePaymentIntentsApiFactory.create({
      key: configResult.value.restrictedKey,
    });

    const metadata = getSaleorOrderStripeMetadata({ order });
    const description = getSaleorOrderStripeDescription(order);

    for (const id of paymentIntentIds) {
      const updateResult = await stripePaymentIntentsApi.updatePaymentIntent({
        id,
        metadata,
        description,
      });

      if (updateResult.isErr()) {
        return err(
          new OrderCreatedUseCaseError.PaymentIntentUpdateError(
            `Failed to update payment intent ${id}`,
            { cause: updateResult.error },
          ),
        );
      }
    }

    return ok({ updatedPaymentIntentIds: paymentIntentIds });
  }
}
