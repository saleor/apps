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

import { PaymentGatewayInitializeSessionUseCase } from "./use-case";
import { paymentGatewayInitializeSessionWebhookDefinition } from "./webhook-definition";

const useCase = new PaymentGatewayInitializeSessionUseCase({
  appConfigRepo: appConfigPersistence,
});

const handler = paymentGatewayInitializeSessionWebhookDefinition.createHandler(async (req, ctx) => {
  try {
    const saleorApiUrlResult = SaleorApiUrl.create({ url: ctx.authData.saleorApiUrl });

    if (saleorApiUrlResult.isErr()) {
      const response = new SaleorApiUrlCreateErrorResponse();

      captureException(saleorApiUrlResult.error);

      return response.getResponse();
    }

    const result = await useCase.execute({
      channelId: ctx.payload.sourceObject.channel.id,
      appId: ctx.authData.appId,
      saleorApiUrl: saleorApiUrlResult.value,
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

export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
