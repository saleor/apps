import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException } from "@sentry/nextjs";

import { InitializeStripeSessionUseCase } from "@/app/api/saleor/payment-gateway-initialize-session/use-case";
import { paymentGatewayInitializeSessionWebhookDefinition } from "@/app/api/saleor/payment-gateway-initialize-session/webhook-definition";
import { appConfigPersistence } from "@/lib/app-config-persistence";
import { UseCaseGetConfigError, UseCaseMissingConfigError } from "@/lib/errors";
import { withLoggerContext } from "@/lib/logger-context";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

const useCase = new InitializeStripeSessionUseCase({
  appConfigRepo: appConfigPersistence,
});

const handler = paymentGatewayInitializeSessionWebhookDefinition.createHandler(async (req, ctx) => {
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
  });

  return result.match(
    (result) => {
      return Response.json(result);
    },
    (err) => {
      switch (err["constructor"]) {
        case UseCaseMissingConfigError:
        case UseCaseGetConfigError:
          return Response.json(
            {
              message: err.httpMessage,
            },
            {
              status: err.httpStatusCode,
            },
          );

        default: {
          captureException(
            new Error("Unhandled error in GatewayInitializeSession", {
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
