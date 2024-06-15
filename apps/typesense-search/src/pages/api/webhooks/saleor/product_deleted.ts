import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { ProductDeleted } from "../../../../../generated/graphql";
import { WebhookActivityTogglerService } from "../../../../domain/WebhookActivityToggler.service";
import { createLogger } from "../../../../lib/logger";
import { webhookProductDeleted } from "../../../../webhooks/definitions/product-deleted";
import { createWebhookContext } from "../../../../webhooks/webhook-context";
import { withOtel } from "@saleor/apps-otel";
import { TypesenseErrorParser } from "../../../../lib/typesense/typesense-error-parser";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("webhookProductDeletedWebhookHandler");

export const handler: NextWebhookApiHandler<ProductDeleted> = async (req, res, context) => {
  const { event, authData } = context;

  logger.debug(
    `New event ${event} (${context.payload?.__typename}) from the ${authData.domain} domain has been received!`,
  );

  const { product } = context.payload;

  if (!product) {
    logger.error("Webhook did not received expected product data in the payload.");
    return res.status(200).end();
  }

  try {
    const { typesenseClient, apiClient } = await createWebhookContext({ authData });

    try {
      await typesenseClient.deleteProduct(product);

      res.status(200).end();
      return;
    } catch (e) {
      logger.info("Typesense deleteProduct failed.", { error: e });

      if (TypesenseErrorParser.isAuthError(e)) {
        logger.info("Detect Auth error from Typesense. Webhooks will be disabled", { error: e });

        const webhooksToggler = new WebhookActivityTogglerService(authData.appId, apiClient);

        logger.trace("Will disable webhooks");

        await webhooksToggler.disableOwnWebhooks(
          context.payload.recipient?.webhooks?.map((w) => w.id),
        );

        logger.trace("Webhooks disabling operation finished");
      }

      return res.status(500).send("Operation failed due to error");
    }
  } catch (e) {
    return res.status(400).json({
      message: (e as Error).message,
    });
  }
};

export default withOtel(
  webhookProductDeleted.createHandler(handler),
  "api/webhooks/saleor/product_deleted",
);
