import { SaleorSyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  CalculateTaxesEventFragment,
  UntypedCalculateTaxesDocument,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { WebhookResponse } from "../../../modules/app/webhook-response";
import {
  ActiveConnectionServiceErrors,
  ActiveConnectionServiceErrorsUnion,
  getActiveConnectionService,
} from "../../../modules/taxes/get-active-connection-service";
import { TaxIncompleteWebhookPayloadError } from "../../../modules/taxes/tax-error";
import { withOtel } from "@saleor/apps-otel";
import { createLogger } from "../../../logger";
import { err, ok } from "neverthrow";
import * as Sentry from "@sentry/nextjs";
import { Simulate } from "react-dom/test-utils";
import error = Simulate.error;
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export type CalculateTaxesPayload = Extract<
  CalculateTaxesEventFragment,
  { __typename: "CalculateTaxes" }
>;

function verifyCalculateTaxesPayload(payload: CalculateTaxesPayload) {
  if (!payload.taxBase.lines.length) {
    return err(new TaxIncompleteWebhookPayloadError("No lines found in taxBase"));
  }

  if (!payload.taxBase.address) {
    return err(new TaxIncompleteWebhookPayloadError("No address found in taxBase"));
  }

  return ok(payload);
}

export const checkoutCalculateTaxesSyncWebhook = new SaleorSyncWebhook<CalculateTaxesPayload>({
  name: "CheckoutCalculateTaxes",
  apl: saleorApp.apl,
  event: "CHECKOUT_CALCULATE_TAXES",
  query: UntypedCalculateTaxesDocument,
  webhookPath: "/api/webhooks/checkout-calculate-taxes",
});

const activeConnectionServiceErrorsStrategy = (
  req: NextApiRequest,
  res: NextApiResponse,
): Record<keyof typeof ActiveConnectionServiceErrors, Function> => ({
  BrokenConfigurationError: (err) =>
    res
      .status(400)
      .send("App is not configured properly. Please verify configuration or reinstall the app"),
  MissingMetadataError: () => {},
  MissingChannelSlugError: () => {},
  WrongChannelError: () => {},
  ProviderNotAssignedToChannelError: () => {},
});

export default withOtel(
  checkoutCalculateTaxesSyncWebhook.createHandler(async (req, res, ctx) => {
    const logger = createLogger("checkoutCalculateTaxesSyncWebhook");
    const { payload } = ctx;
    const webhookResponse = new WebhookResponse(res);

    logger.info("Handler for CHECKOUT_CALCULATE_TAXES webhook called");

    try {
      const payloadVerificationResult = verifyCalculateTaxesPayload(payload);

      payloadVerificationResult
        .mapErr((error) => {
          logger.error(`[${error.name}] ${error.message}`);
          // todo Sentry

          return webhookResponse.error(error);
        })
        .map(() => {
          logger.debug("Payload validated Successfully");
        });

      const appMetadata = payload.recipient?.privateMetadata ?? [];
      const channelSlug = payload.taxBase.channel.slug;
      const activeConnectionServiceResult = getActiveConnectionService(
        channelSlug,
        appMetadata,
        ctx.authData,
      );

      if (activeConnectionServiceResult.isErr()) {
        const err = activeConnectionServiceResult.error; // todo error type

        logger.debug(`Error in taxes calculation occured: ${err}`, { error: err });

        const errorStrategy = activeConnectionServiceErrorsStrategy(req, res)[err.name];

        if (errorStrategy) {
          return errorStrategy(err);
        } else {
          Sentry.captureException(err);
          logger.fatal(`UNHANDLED: ${error.name}`, {
            error: error,
          });

          return res.status(500).send("Error calculating taxes");
        }
      } else {
        logger.info("Found active connection service. Calculating taxes...");
        const calculatedTaxes = await activeConnectionServiceResult.value.calculateTaxes(payload);

        logger.info("Taxes calculated", { calculatedTaxes });
        return webhookResponse.success(ctx.buildResponse(calculatedTaxes));
      }
    } catch (error) {
      return webhookResponse.error(error);
    }
  }),
  "/api/webhooks/checkout-calculate-taxes",
);
