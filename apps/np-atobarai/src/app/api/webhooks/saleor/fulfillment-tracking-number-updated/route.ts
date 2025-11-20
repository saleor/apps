import { createSaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { BaseError } from "@saleor/errors";
import { captureException } from "@sentry/nextjs";
import { Client } from "urql";

import { createInstrumentedGraphqlClient } from "@/lib/graphql-client";
import { createLogger } from "@/lib/logger";
import { withLoggerContext } from "@/lib/logger-context";
import { setObservabilitySaleorApiUrl } from "@/lib/observability-saleor-api-url";
import { setObservabilitySourceObjectId } from "@/lib/observability-source-object-id";
import { appConfigRepo } from "@/modules/app-config/repo/app-config-repo";
import { AtobaraiApiClientFactory } from "@/modules/atobarai/api/atobarai-api-client-factory";
import { OrderNoteService } from "@/modules/saleor/order-note-service";
import { transactionRecordRepo } from "@/modules/transactions-recording/transaction-record-repo";

import { UnhandledErrorResponse } from "../saleor-webhook-responses";
import { withRecipientVerification } from "../with-recipient-verification";
import { FulfillmentTrackingNumberUpdatedUseCase } from "./use-case";
import { fulfillmentTrackingNumberUpdatedWebhookDefinition } from "./webhook-definition";

const logger = createLogger("FulfillmentTrackingNumberUpdated route");

const useCase = new FulfillmentTrackingNumberUpdatedUseCase({
  appConfigRepo: appConfigRepo,
  atobaraiApiClientFactory: new AtobaraiApiClientFactory(),
  transactionRecordRepo: transactionRecordRepo,
  orderNoteServiceFactory(graphqlClient: Client) {
    return new OrderNoteService({
      graphqlClient,
    });
  },
});

const handler = fulfillmentTrackingNumberUpdatedWebhookDefinition.createHandler(
  withRecipientVerification(async (_req, ctx) => {
    try {
      if (ctx.payload.order?.id) {
        setObservabilitySourceObjectId({ __typename: "Order", id: ctx.payload.order.id });
      }

      const saleorApiUrl = createSaleorApiUrl(ctx.authData.saleorApiUrl);

      setObservabilitySaleorApiUrl(saleorApiUrl, ctx.payload.version);

      logger.info("Received webhook request");

      const result = await useCase.execute({
        event: ctx.payload,
        appId: ctx.authData.appId,
        saleorApiUrl,
        graphqlClient: createInstrumentedGraphqlClient({
          saleorApiUrl,
          token: ctx.authData.token,
        }),
      });

      return result.match(
        (result) => {
          logger.info("Successfully processed webhook request", {
            httpsStatusCode: result.statusCode,
          });

          return result.getResponse();
        },
        (err) => {
          logger.warn("Failed to process webhook request: " + err.message, {
            httpsStatusCode: err.statusCode,
            reason: err.message,
          });

          return err.getResponse();
        },
      );
    } catch (error) {
      captureException(error);
      logger.error("Unhandled error", { error: error });

      const response = new UnhandledErrorResponse(BaseError.normalize(error));

      return response.getResponse();
    }
  }),
);

export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
