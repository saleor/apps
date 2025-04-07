import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException } from "@sentry/nextjs";

import { InitializeStripeSessionUseCase } from "@/app/api/saleor/gateway-initialize/use-case";
import { paymentGatewayInitializeSessionWebhookDefinition } from "@/app/api/saleor/gateway-initialize/webhook-definition";
import { appConfigPersistence } from "@/lib/app-config-persistence";
import { withLoggerContext } from "@/lib/logger-context";
import { SaleorApiUrl } from "@/modules/saleor/saleor-api-url";

const useCase = new InitializeStripeSessionUseCase({
  configPersistor: appConfigPersistence,
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
        case InitializeStripeSessionUseCase.MissingConfigError:
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
