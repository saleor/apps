import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { ProductVariantUpdated } from "../../../../../generated/graphql";
import { WebhookActivityTogglerService } from "../../../../domain/WebhookActivityToggler.service";
import { createLogger } from "../../../../lib/logger";
import { webhookProductVariantUpdated } from "../../../../webhooks/definitions/product-variant-updated";
import { createWebhookContext } from "../../../../webhooks/webhook-context";
import { withOtel } from "@saleor/apps-otel";

export const config = {
  api: {
    bodyParser: false,
  },
};

const logger = createLogger("webhookProductVariantUpdatedWebhookHandler");

export const handler: NextWebhookApiHandler<ProductVariantUpdated> = async (req, res, context) => {
  const { event, authData } = context;

  logger.debug(
    `New event ${event} (${context.payload?.__typename}) from the ${authData.domain} domain has been received!`,
  );

  const { productVariant } = context.payload;

  if (!productVariant) {
    logger.error("Webhook did not received expected product data in the payload.");
    return res.status(200).end();
  }

  try {
    const { algoliaClient, apiClient } = await createWebhookContext({ authData });

    try {
      await algoliaClient.updateProductVariant(productVariant);

      res.status(200).end();
      return;
    } catch (e) {
      logger.info(e, "Algolia updateProductVariant failed. Webhooks will be disabled");

      const webhooksToggler = new WebhookActivityTogglerService(authData.appId, apiClient);

      logger.trace("Will disable webhooks");

      await webhooksToggler.disableOwnWebhooks(
        context.payload.recipient?.webhooks?.map((w) => w.id),
      );

      logger.trace("Webhooks disabling operation finished");

      return res.status(500).send("Operation failed, webhooks are disabled");
    }
  } catch (e) {
    return res.status(400).json({
      message: (e as Error).message,
    });
  }
};

export default withOtel(
  webhookProductVariantUpdated.createHandler(handler),
  "api/webhooks/saleor/product_variant_updated",
);
