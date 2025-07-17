import { createSaleorApiUrl } from "@saleor/apps-domain/saleor-api-url";
import { withSpanAttributesAppRouter } from "@saleor/apps-otel/src/with-span-attributes";
import { compose } from "@saleor/apps-shared/compose";
import { BaseError } from "@saleor/errors";
import { captureException } from "@sentry/nextjs";
import { ok } from "neverthrow";

import { createLogger } from "@/lib/logger";
import { withLoggerContext } from "@/lib/logger-context";
import { setObservabilitySaleorApiUrl } from "@/lib/observability-saleor-api-url";
import { setObservabilitySourceObjectId } from "@/lib/observability-source-object-id";
import { AppChannelConfig } from "@/modules/app-config/app-config";
import { createAtobaraiMerchantCode } from "@/modules/atobarai/atobarai-merchant-code";
import { createAtobaraiSpCode } from "@/modules/atobarai/atobarai-sp-code";
import { createAtobaraiTerminalId } from "@/modules/atobarai/atobarai-terminal-id";

import { UnhandledErrorResponse } from "../saleor-webhook-responses";
import { withRecipientVerification } from "../with-recipient-verification";
import { PaymentGatewayInitializeSessionUseCase } from "./use-case";
import { paymentGatewayInitializeSessionWebhookDefinition } from "./webhook-definition";

const useCase = new PaymentGatewayInitializeSessionUseCase({
  // TODO: Replace with actual implementation of AppConfigRepo
  appConfigRepo: {
    getChannelConfig: () => {
      return Promise.resolve(
        ok(
          AppChannelConfig.create({
            name: "Config 1",
            id: "111",
            merchantCode: createAtobaraiMerchantCode("merchant-code-1"),
            shippingCompanyCode: "5000",
            skuAsName: true,
            spCode: createAtobaraiSpCode("sp1"),
            useSandbox: true,
            terminalId: createAtobaraiTerminalId("id"),
          })._unsafeUnwrap(),
        ),
      );
    },
  },
});

const logger = createLogger("PaymentGatewayInitializeSession route");

const handler = paymentGatewayInitializeSessionWebhookDefinition.createHandler(
  withRecipientVerification(async (_req, ctx) => {
    try {
      setObservabilitySourceObjectId(ctx.payload.sourceObject);

      logger.info("Received webhook request");

      const saleorApiUrl = createSaleorApiUrl(ctx.authData.saleorApiUrl);

      setObservabilitySaleorApiUrl(saleorApiUrl, ctx.payload.version);

      const result = await useCase.execute({
        event: ctx.payload,
        appId: ctx.authData.appId,
        saleorApiUrl,
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

      const response = new UnhandledErrorResponse(BaseError.normalize(error));

      return response.getResponse();
    }
  }),
);

export const POST = compose(withLoggerContext, withSpanAttributesAppRouter)(handler);
