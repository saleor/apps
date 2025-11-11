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
import { setObservabilitySaleorApiUrl } from "@/lib/observability-saleor-api-url";
import { setObservabilitySourceObjectId } from "@/lib/observability-source-object-id";
import { paypalConfigRepo } from "@/modules/paypal/configuration/paypal-config-repo";
import { createSaleorApiUrl } from "@/modules/saleor/saleor-api-url";
import { PayPalClient } from "@/modules/paypal/paypal-client";
import { PayPalPartnerReferralsApi } from "@/modules/paypal/partner-referrals/paypal-partner-referrals-api";
import { createPayPalClientId } from "@/modules/paypal/paypal-client-id";
import { createPayPalClientSecret } from "@/modules/paypal/paypal-client-secret";

import { withRecipientVerification } from "../with-recipient-verification";
import { PaymentGatewayInitializeSessionUseCase } from "./use-case";
import { paymentGatewayInitializeSessionWebhookDefinition } from "./webhook-definition";

const useCase = new PaymentGatewayInitializeSessionUseCase({
  paypalConfigRepo,
  paypalPartnerReferralsApiFactory: (config) => {
    const client = PayPalClient.create({
      clientId: createPayPalClientId(config.clientId),
      clientSecret: createPayPalClientSecret(config.clientSecret),
      partnerMerchantId: config.partnerMerchantId,
      env: config.env as "SANDBOX" | "LIVE",
    });
    return PayPalPartnerReferralsApi.create(client);
  },
});

const logger = createLogger("PAYMENT_GATEWAY_INITIALIZE_SESSION route");

const handler = paymentGatewayInitializeSessionWebhookDefinition.createHandler(
  withRecipientVerification(async (_req, ctx) => {
    try {
      setObservabilitySourceObjectId(ctx.payload.sourceObject);

      logger.info("Received webhook request");

      const saleorApiUrlResult = createSaleorApiUrl(ctx.authData.saleorApiUrl);

      if (saleorApiUrlResult.isErr()) {
        const response = new MalformedRequestResponse(
          appContextContainer.getContextValue(),
          saleorApiUrlResult.error,
        );

        captureException(saleorApiUrlResult.error);

        return response.getResponse();
      }

      setObservabilitySaleorApiUrl(saleorApiUrlResult.value, ctx.payload.version);

      const result = await useCase.execute({
        channelId: ctx.payload.sourceObject.channel.id,
        authData: ctx.authData,
      });

      return result.match(
        (result) => {
          logger.info("Successfully processed webhook request", {
            httpsStatusCode: result.statusCode,
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
  }),
);

export const POST = compose(
  withLoggerContext,
  appContextContainer.wrapRequest,
  withSpanAttributesAppRouter,
)(handler);