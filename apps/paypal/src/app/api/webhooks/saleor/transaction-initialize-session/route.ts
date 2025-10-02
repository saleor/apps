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
import { paypalConfigRepo } from "@/modules/paypal/configuration/paypal-config-repo";
import { PayPalOrdersApiFactory } from "@/modules/paypal/paypal-orders-api-factory";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";

import { TransactionInitializeSessionUseCase } from "./use-case";
import { transactionInitializeSessionWebhookDefinition } from "./webhook-definition";

const useCase = new TransactionInitializeSessionUseCase({
  paypalConfigRepo,
  paypalOrdersApiFactory: new PayPalOrdersApiFactory(),
});

const logger = createLogger("TRANSACTION_INITIALIZE_SESSION route");

const handler = transactionInitializeSessionWebhookDefinition.createHandler(async (_req: any, ctx: any) => {
  try {
    logger.info("Received transaction initialize session webhook request");

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
      authData: ctx.authData,
      event: ctx.payload,
    });

    return result.match(
      (result) => {
        logger.info("Successfully processed transaction initialize session webhook request", {
          result: result.transactionResult.result,
        });

        return result.getResponse();
      },
      (error) => {
        if (error instanceof BaseError) {
          captureException(error);
        }

        logger.error("Failed to process transaction initialize session webhook request", {
          error: error.message,
        });

        return error.getResponse();
      },
    );
  } catch (error) {
    captureException(error);
    logger.error("Unhandled error in transaction initialize session webhook", { error });

    const unhandledErrorResponse = new UnhandledErrorResponse(
      appContextContainer.getContextValue(),
      error instanceof Error ? error : new Error(String(error)),
    );

    return unhandledErrorResponse.getResponse();
  }
});

export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);