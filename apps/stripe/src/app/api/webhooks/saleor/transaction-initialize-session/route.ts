import { ObservabilityAttributes } from "@saleor/apps-otel/src/observability-attributes";
import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { captureException } from "@sentry/nextjs";

import {
  AppIsNotConfiguredResponse,
  BrokenAppResponse,
  MalformedRequestResponse,
  UnhandledErrorResponse,
} from "@/app/api/webhooks/saleor/saleor-webhook-responses";
import { appContextContainer } from "@/lib/app-context";
import { BaseError } from "@/lib/errors";
import { createInstrumentedGraphqlClient } from "@/lib/graphql-client";
import { createLogger } from "@/lib/logger";
import { loggerContext, withLoggerContext } from "@/lib/logger-context";
import { setObservabilitySaleorApiUrl } from "@/lib/observability-saleor-api-url";
import { setObservabilitySourceObjectId } from "@/lib/observability-source-object-id";
import { appConfigRepoImpl } from "@/modules/app-config/repositories/app-config-repo-impl";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { VendorResolver } from "@/modules/saleor/vendor-resolver";
import { StripePaymentIntentsApiFactory } from "@/modules/stripe/stripe-payment-intents-api-factory";
import { transactionRecorder } from "@/modules/transactions-recording/repositories/transaction-recorder-impl";

import { withRecipientVerification } from "../with-recipient-verification";
import { TransactionInitializeSessionUseCase } from "./use-case";
import { TransactionInitializeSessionUseCaseResponsesType } from "./use-case-response";
import { transactionInitializeSessionWebhookDefinition } from "./webhook-definition";

const logger = createLogger("TRANSACTION_INITIALIZE_SESSION route");

const handler = transactionInitializeSessionWebhookDefinition.createHandler(
  withRecipientVerification(async (req, ctx) => {
    try {
      setObservabilitySourceObjectId(ctx.payload.sourceObject);

      loggerContext.set(
        ObservabilityAttributes.TRANSACTION_AMOUNT,
        ctx.payload.action.amount ?? null,
      );

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

      setObservabilitySaleorApiUrl(saleorApiUrlResult.value, ctx.payload.version);

      if (!ctx.schemaVersion) {
        captureException(new Error("No schema version provided"));
        const response = new MalformedRequestResponse(
          appContextContainer.getContextValue(),
          new BaseError("No schema version provided", {
            props: { _internalName: "TransactionInitializeSession.NoSchemaVersion" as const },
          }),
        );

        return response.getResponse();
      }

      // Create GraphQL client and VendorResolver dynamically
      const graphqlClient = createInstrumentedGraphqlClient(ctx.authData);
      const vendorResolver = new VendorResolver(graphqlClient);

      // Extract app URL from request headers
      const protocol = req.headers.get("x-forwarded-proto") || "https";
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
      const appUrl = host ? `${protocol}://${host}` : undefined;

      const useCase = new TransactionInitializeSessionUseCase({
        appConfigRepo: appConfigRepoImpl,
        stripePaymentIntentsApiFactory: new StripePaymentIntentsApiFactory(),
        transactionRecorder: transactionRecorder,
        vendorResolver: vendorResolver,
      });

      const result = await useCase.execute({
        appId: ctx.authData.appId,
        saleorApiUrl: saleorApiUrlResult.value,
        event: ctx.payload,
        appUrl,
        saleorSchemaVersion: ctx.schemaVersion,
      });

      return result.match(
        (result: TransactionInitializeSessionUseCaseResponsesType) => {
          logger.info("Successfully processed webhook request", {
            httpsStatusCode: result.statusCode,
            resolvedEvent: result.transactionResult.result,
            // todo: would be good to print stripeEnv here as well, but it's not available
          });

          return result.getResponse();
        },
        (err: MalformedRequestResponse | AppIsNotConfiguredResponse | BrokenAppResponse) => {
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
  }),
);

export const POST = compose(
  withLoggerContext,
  appContextContainer.wrapRequest,
  withSpanAttributesAppRouter,
)(handler);
