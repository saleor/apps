import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException } from "@sentry/nextjs";

import { createLogger } from "@/lib/logger";
import { withLoggerContext } from "@/lib/logger-context";
import { setObservabilitySaleorApiUrl } from "@/lib/observability-saleor-api-url";
import { setObservabilitySourceObjectId } from "@/lib/observability-source-object-id";
import { appConfigRepoImpl } from "@/modules/app-config/repositories/app-config-repo-impl";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripePaymentIntentsApiFactory } from "@/modules/stripe/stripe-payment-intents-api-factory";

import { withRecipientVerification } from "../with-recipient-verification";
import { OrderCreatedUseCase } from "./use-case";
import { orderCreatedWebhookDefinition } from "./webhook-definition";

const useCase = new OrderCreatedUseCase({
  appConfigRepo: appConfigRepoImpl,
  stripePaymentIntentsApiFactory: new StripePaymentIntentsApiFactory(),
});

const logger = createLogger("ORDER_CREATED route");

const handler = orderCreatedWebhookDefinition.createHandler(
  withRecipientVerification(async (_req, ctx) => {
    try {
      setObservabilitySourceObjectId({
        __typename: "Order",
        id: ctx.payload.order?.id ?? null,
      });

      const saleorApiUrlResult = createSaleorApiUrl(ctx.authData.saleorApiUrl);

      if (saleorApiUrlResult.isErr()) {
        captureException(saleorApiUrlResult.error);

        return Response.json({ message: "Malformed request" }, { status: 400 });
      }

      setObservabilitySaleorApiUrl(saleorApiUrlResult.value, ctx.payload.version);

      const result = await useCase.execute({
        appId: ctx.authData.appId,
        saleorApiUrl: saleorApiUrlResult.value,
        event: ctx.payload,
      });

      return result.match(
        ({ updatedPaymentIntentIds }) => {
          logger.info("Processed webhook request", { updatedPaymentIntentIds });

          return Response.json({ message: "OK" }, { status: 200 });
        },
        // Non-2xx makes Saleor retry, the update can be safely repeated
        (error) => {
          logger.warn("Failed to update payment intents with order data", { error });

          return Response.json({ message: error.message }, { status: 500 });
        },
      );
    } catch (error) {
      captureException(error);
      logger.error("Unhandled error", { error });

      return Response.json({ message: "Unhandled error" }, { status: 500 });
    }
  }),
);

export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
