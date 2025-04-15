import { captureException } from "@sentry/nextjs";
import { Result } from "neverthrow";
import { NextRequest } from "next/server";

import { getAndParseStripeSignatureHeader } from "@/app/api/stripe/webhook/stripe-signature-header";
import { StripeWebhookErrorResponse } from "@/app/api/stripe/webhook/stripe-webhook-response";
import { StripeWebhookUseCase } from "@/app/api/stripe/webhook/use-case";
import { WebhookParams } from "@/app/api/stripe/webhook/webhook-params";
import { appConfigPersistence } from "@/lib/app-config-persistence";
import { BaseError } from "@/lib/errors";
import { createInstrumentedGraphqlClient } from "@/lib/graphql-client";
import { createLogger } from "@/lib/logger";
import { loggerContext, withLoggerContext } from "@/lib/logger-context";
import { saleorApp } from "@/lib/saleor-app";
import { TransactionEventReporter } from "@/modules/saleor/transaction-event-reporter";
import { StripeWebhookSignatureValidator } from "@/modules/stripe/stripe-webhook-signature-validator";
import { transactionRecorder } from "@/modules/transactions-recording/transaction-recorder-impl";

const useCase = new StripeWebhookUseCase({
  appConfigRepo: appConfigPersistence,
  webhookEventVerifyFactory: (stripeClient) =>
    StripeWebhookSignatureValidator.createFromClient(stripeClient),
  apl: saleorApp.apl,
  // todo
  transactionRecorder: transactionRecorder,
  transactionEventReporterFactory(authData) {
    return new TransactionEventReporter({
      graphqlClient: createInstrumentedGraphqlClient(authData),
    });
  },
});

const logger = createLogger("StripeWebhookHandler");

const StripeWebhookHandler = async (request: NextRequest): Promise<Response> => {
  /**
   * Has access to first error value
   * Use https://github.com/supermacro/neverthrow#resultcombinewithallerrors-static-class-method to
   * get access to all errors
   */
  const requiredUrlAttributes = Result.combine([
    getAndParseStripeSignatureHeader(request.headers),
    WebhookParams.createFromWebhookUrl(request.url),
  ]);

  if (requiredUrlAttributes.isErr()) {
    logger.info("Received webhook from Stripe with invalid parameters", {
      error: requiredUrlAttributes.error,
    });

    return new Response(`Invalid request: ${requiredUrlAttributes.error.message}`, {
      status: 400,
    });
  }

  const [stripeSignatureHeader, webhookParams] = requiredUrlAttributes.value;

  /**
   * todo:
   * - move shared attribute keys to some lib, maybe shared monorepo
   * - improve logger context to accept single record
   */
  loggerContext.set("saleorApiUrl", webhookParams.saleorApiUrl);
  loggerContext.set("configurationId", webhookParams.configurationId);

  logger.info("Received webhook from Stripe");

  try {
    const result = await useCase.execute({
      rawBody: await request.text(),
      signatureHeader: stripeSignatureHeader,
      webhookParams,
    });

    /**
     * todo:
     * - attach operations context to Response, so we can print them to logger here
     */
    return result.match(
      (success) => {
        logger.info("Success processing Stripe webhook");

        return success.getResponse();
      },
      (error) => {
        logger.error("Error processing Stripe webhook");

        return error.getResponse();
      },
    );
  } catch (e) {
    logger.error("Unhandled Error processing Stripe webhook UseCase", {
      error: e,
    });

    const panicError = new BaseError("Unhandled Error processing Stripe webhook UseCase", {
      cause: e,
    });

    captureException(panicError);

    return new StripeWebhookErrorResponse(panicError).getResponse();
  }
};

/**
 * todo:
 * - wrap with middleware that will attach OTEL attributes from headers
 * - integration test
 */
export const POST = withLoggerContext(StripeWebhookHandler);
