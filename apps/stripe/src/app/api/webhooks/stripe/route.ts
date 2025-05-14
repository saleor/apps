import { trace } from "@opentelemetry/api";
import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { captureException } from "@sentry/nextjs";
import { Result } from "neverthrow";
import { NextRequest } from "next/server";

import { BaseError } from "@/lib/errors";
import { createInstrumentedGraphqlClient } from "@/lib/graphql-client";
import { createLogger } from "@/lib/logger";
import { loggerContext, withLoggerContext } from "@/lib/logger-context";
import { saleorApp } from "@/lib/saleor-app";
import { appConfigRepoImpl } from "@/modules/app-config/repositories/app-config-repo-impl";
import { TransactionEventReporter } from "@/modules/saleor/transaction-event-reporter";
import { StripeWebhookManager } from "@/modules/stripe/stripe-webhook-manager";
import { StripeWebhookSignatureValidator } from "@/modules/stripe/stripe-webhook-signature-validator";
import { transactionRecorder } from "@/modules/transactions-recording/repositories/transaction-recorder-impl";

import { getAndParseStripeSignatureHeader } from "./stripe-signature-header";
import { StripeWebhookErrorResponse } from "./stripe-webhook-response";
import { StripeWebhookUseCase } from "./use-case";
import { WebhookParams } from "./webhook-params";

const useCase = new StripeWebhookUseCase({
  appConfigRepo: appConfigRepoImpl,
  webhookEventVerifyFactory: (stripeClient) =>
    StripeWebhookSignatureValidator.createFromClient(stripeClient),
  apl: saleorApp.apl,
  transactionRecorder: transactionRecorder,
  transactionEventReporterFactory(authData) {
    return new TransactionEventReporter({
      graphqlClient: createInstrumentedGraphqlClient(authData),
    });
  },
  webhookManager: new StripeWebhookManager(),
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
  loggerContext.set(ObservabilityAttributes.SALEOR_API_URL, webhookParams.saleorApiUrl);
  loggerContext.set(ObservabilityAttributes.CONFIGURATION_ID, webhookParams.configurationId);

  trace
    .getActiveSpan()
    ?.setAttribute(ObservabilityAttributes.SALEOR_API_URL, webhookParams.saleorApiUrl);

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
        logger.error("Error processing Stripe webhook", {
          error: error,
        });

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
 * - integration test
 */
export const POST = withLoggerContext(StripeWebhookHandler);
