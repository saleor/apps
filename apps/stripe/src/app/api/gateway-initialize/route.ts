import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";

import { InitializeStripeSessionUseCase } from "@/app/api/gateway-initialize/use-case";
import { paymentGatewayInitializeSessionWebhookDefinition } from "@/app/api/gateway-initialize/webhook-definition";
import { withLoggerContext } from "@/lib/logger-context";

const useCase = new InitializeStripeSessionUseCase();

const handler = paymentGatewayInitializeSessionWebhookDefinition.createHandler(async () => {
  /*
   * todo create config repo
   * todo: should we pass auth data to execute? likely yes
   */

  const result = await useCase.execute();

  return result.match(
    (result) => {
      return Response.json(result);
    },
    () => {
      // todo map errors to http

      return Response.json(
        {
          message: "Error",
        },
        {
          status: 500, // todo
        },
      );
    },
  );
});

export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
