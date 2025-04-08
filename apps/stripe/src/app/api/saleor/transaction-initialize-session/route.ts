import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException } from "@sentry/nextjs";

import { appConfigPersistence } from "@/lib/app-config-persistence";
import { BaseError, UnknownError } from "@/lib/errors";
import { withLoggerContext } from "@/lib/logger-context";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripePaymentIntentsApiFactory } from "@/modules/stripe/stripe-payment-intents-api-factory";

import { TransactionInitializeSessionUseCase } from "./use-case";
import { transactionInitializeSessionWebhookDefinition } from "./webhook-definition";

const useCase = new TransactionInitializeSessionUseCase({
  configPersister: appConfigPersistence,
  stripePaymentIntentsApiFactory: new StripePaymentIntentsApiFactory(),
});

const handler = transactionInitializeSessionWebhookDefinition.createHandler(async (req, ctx) => {
  const saleorApiUrlResult = SaleorApiUrl.create({ url: ctx.authData.saleorApiUrl });

  if (saleorApiUrlResult.isErr()) {
    captureException(
      new BaseError("Invalid Saleor API URL", {
        cause: saleorApiUrlResult.error,
      }),
    );

    return Response.json(
      {
        message: "Invalid Saleor API URL",
      },
      {
        status: 400,
      },
    );
  }

  const result = await useCase.execute({
    channelId: ctx.payload.sourceObject.channel.id,
    appId: ctx.authData.appId,
    saleorApiUrl: saleorApiUrlResult.value,
    event: ctx.payload,
  });

  return result.match(
    (result) => {
      return Response.json(result, { status: 200 });
    },
    (err) => {
      switch (err["constructor"]) {
        case TransactionInitializeSessionUseCase.MissingConfigError:
          return Response.json(
            {
              // todo what should be the response here?
              message: "App is not configured",
            },
            {
              status: 400,
            },
          );

        default: {
          captureException(
            new UnknownError("Unhandled error in TransactionInitializeSession", {
              cause: err,
            }),
          );

          return Response.json(
            {
              message: "Unhandled error",
            },
            {
              status: 500,
            },
          );
        }
      }
    },
  );
});

// TODO: write integration test for this route
export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
