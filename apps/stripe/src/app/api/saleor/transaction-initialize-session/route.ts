import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException } from "@sentry/nextjs";

import { appConfigPersistence } from "@/lib/app-config-persistence";
import { UnknownError } from "@/lib/errors";
import { withLoggerContext } from "@/lib/logger-context";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { StripePaymentIntentsApiFactory } from "@/modules/stripe/stripe-payment-intents-api-factory";

import { InitializeStripeTransactionUseCase } from "./use-case";
import { transactionInitializeSessionWebhookDefinition } from "./webhook-definition";

const useCase = new InitializeStripeTransactionUseCase({
  configPersister: appConfigPersistence,
  stripePaymentIntentsApiFactory: new StripePaymentIntentsApiFactory(),
});

const handler = transactionInitializeSessionWebhookDefinition.createHandler(async (req, ctx) => {
  /*
   * todo create config repo
   * todo: should we pass auth data to execute? likely yes
   */

  const saleorApiUrlResult = SaleorApiUrl.create({ url: ctx.authData.saleorApiUrl });

  if (saleorApiUrlResult.isErr()) {
    // TODO: maybe we should throw here?
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
        case InitializeStripeTransactionUseCase.MissingConfigError:
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
            new UnknownError("Unhandled error in GatewayInitializeSession", {
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

export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
