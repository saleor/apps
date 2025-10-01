import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException } from "@sentry/nextjs";

import {
  MalformedRequestResponse,
  UnhandledErrorResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { appContextContainer } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { createLogger } from "@/lib/logger";
import { withLoggerContext } from "@/lib/logger-context";
import { appConfigRepoImpl } from "@/modules/app-config/repositories/app-config-repo-impl";
import { PayPalOrdersApiFactory } from "@/modules/paypal/paypal-orders-api-factory";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";

import { TransactionChargeRequestedUseCase } from "./use-case";
import { transactionChargeRequestedWebhookDefinition } from "./webhook-definition";

const useCase = new TransactionChargeRequestedUseCase({
  appConfigRepo: appConfigRepoImpl,
  paypalOrdersApiFactory: new PayPalOrdersApiFactory(),
});

const logger = createLogger("TRANSACTION_CHARGE_REQUESTED route");

const handler = transactionChargeRequestedWebhookDefinition.createHandler(async (_req: any, ctx: any) => {
  try {
    logger.info("Received webhook request");

    const saleorApiUrlResult = createSaleorApiUrl(ctx.authData.saleorApiUrl);

    if (saleorApiUrlResult.isErr()) {
      captureException(saleorApiUrlResult.error);
      const response = new MalformedRequestResponse(
        appContextContainer.getContextValue(),
        saleorApiUrlResult.error,
      );

      return response.getResponse();
    }

    const result = await useCase.execute({
      appId: ctx.authData.appId,
      saleorApiUrl: saleorApiUrlResult.value,
      event: ctx.payload,
    });

    return result.match(
      (result) => {
        logger.info("Successfully processed webhook request", {
          httpsStatusCode: result.statusCode,
          paypalEnv: result.appContext.paypalEnv,
        });

        return result.getResponse();
      },
      (err) => {
        logger.warn("Failed to process webhook request", {
          httpsStatusCode: err.statusCode,
          reason: err.message,
        });

        return err.getResponse();
      },
    );
  } catch (error) {
    captureException(error);
    logger.error("Unhandled error", { error: error });

    const response = new UnhandledErrorResponse(
      appContextContainer.getContextValue(),
      BaseError.normalize(error),
    );

    return response.getResponse();
  }
});

export const POST = compose(
  withLoggerContext,
  appContextContainer.wrapRequest,
  withSpanAttributesAppRouter,
)(handler);
