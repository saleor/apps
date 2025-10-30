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

import { TransactionProcessSessionUseCase } from "./use-case";
import { transactionProcessSessionWebhookDefinition } from "./webhook-definition";

const useCase = new TransactionProcessSessionUseCase({
  paypalConfigRepo,
  paypalOrdersApiFactory: new PayPalOrdersApiFactory(),
});

const logger = createLogger("TRANSACTION_PROCESS_SESSION route");

const handler = transactionProcessSessionWebhookDefinition.createHandler(async (_req: any, ctx: any) => {
  try {
    logger.info("Received transaction process session webhook request");

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
        logger.info("Successfully processed transaction process session webhook request", {
          result: result.transactionResult.result,
        });

        try {
          const appContext = appContextContainer.getContextValue();
          logger.info("About to generate response", {
            hasPaypalEnv: !!appContext.paypalEnv,
            paypalEnv: appContext.paypalEnv,
          });
          return result.getResponse();
        } catch (error: unknown) {
          logger.error("Error generating response", {
            error,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorName: error instanceof Error ? error.name : typeof error,
          });
          throw error;
        }
      },
      (error) => {
        if (error instanceof BaseError) {
          captureException(error);
        }

        logger.error("Failed to process transaction process session webhook request", {
          error: error.message,
        });

        return error.getResponse();
      },
    );
  } catch (error) {
    captureException(error);
    logger.error("Unhandled error in transaction process session webhook", { error });

    const unhandledErrorResponse = new UnhandledErrorResponse(
      appContextContainer.getContextValue(),
      error instanceof Error ? error : new Error(String(error)),
    );

    return unhandledErrorResponse.getResponse();
  }
});

export const POST = compose(
  appContextContainer.wrapRequest,
  withLoggerContext,
  withSpanAttributesAppRouter
)(handler);