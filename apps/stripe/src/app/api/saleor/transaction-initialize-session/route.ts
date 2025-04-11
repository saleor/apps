import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException } from "@sentry/nextjs";

import { appConfigPersistence } from "@/lib/app-config-persistence";
import { withLoggerContext } from "@/lib/logger-context";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import {
  SaleorApiUrlCreateErrorResponse,
  UnhandledErrorResponse,
} from "@/modules/saleor/saleor-webhook-responses";
import { StripePaymentIntentsApiFactory } from "@/modules/stripe/stripe-payment-intents-api-factory";

import { TransactionInitializeSessionUseCase } from "./use-case";
import { transactionInitializeSessionWebhookDefinition } from "./webhook-definition";

const useCase = new TransactionInitializeSessionUseCase({
  appConfigRepo: appConfigPersistence,
  stripePaymentIntentsApiFactory: new StripePaymentIntentsApiFactory(),
});

const handler = transactionInitializeSessionWebhookDefinition.createHandler(async (req, ctx) => {
  try {
    const saleorApiUrlResult = SaleorApiUrl.create({ url: ctx.authData.saleorApiUrl });

    if (saleorApiUrlResult.isErr()) {
      captureException(saleorApiUrlResult.error);
      const response = new SaleorApiUrlCreateErrorResponse();

      return response.getResponse();
    }

    const result = await useCase.execute({
      channelId: ctx.payload.sourceObject.channel.id,
      appId: ctx.authData.appId,
      saleorApiUrl: saleorApiUrlResult.value,
      event: ctx.payload,
    });

    return result.match(
      (result) => {
        return result.getResponse();
      },
      (err) => {
        return err.getResponse();
      },
    );
  } catch (error) {
    captureException(error);
    const response = new UnhandledErrorResponse();

    return response.getResponse();
  }
});

// TODO: write integration test for this route
export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
