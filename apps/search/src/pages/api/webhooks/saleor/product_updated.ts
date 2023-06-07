import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { ProductUpdated, ProductUpdatedDocument } from "../../../../../generated/graphql";
import { saleorApp } from "../../../../../saleor-app";
import { AlgoliaSearchProvider } from "../../../../lib/algolia/algoliaSearchProvider";
import { getAlgoliaConfiguration } from "../../../../lib/algolia/getAlgoliaConfiguration";
import { WebhookActivityTogglerService } from "../../../../domain/WebhookActivityToggler.service";
import { createClient } from "../../../../lib/graphql";
import { createLogger } from "../../../../lib/logger";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const webhookProductUpdated = new SaleorAsyncWebhook<ProductUpdated>({
  webhookPath: "api/webhooks/saleor/product_updated",
  event: "PRODUCT_UPDATED",
  apl: saleorApp.apl,
  query: ProductUpdatedDocument,
  /**
   * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
   */
  isActive: false,
});

const logger = createLogger({
  service: "webhookProductUpdatedWebhookHandler",
});

export const handler: NextWebhookApiHandler<ProductUpdated> = async (req, res, context) => {
  const { event, authData } = context;

  logger.debug(
    `New event ${event} (${context.payload?.__typename}) from the ${authData.domain} domain has been received!`
  );

  const { settings, errors } = await getAlgoliaConfiguration({ authData });

  if (errors?.length || !settings) {
    logger.warn("Aborting due to lack of settings");
    logger.debug(errors);

    const error = (errors && errors[0] && errors[0].message) ?? "Unknown error";

    return res.status(400).json({
      message: error,
    });
  }

  const searchProvider = new AlgoliaSearchProvider({
    appId: settings.appId,
    apiKey: settings.secretKey,
    indexNamePrefix: settings.indexNamePrefix ?? undefined,
  });

  const { product } = context.payload;

  if (product) {
    try {
      await searchProvider.updateProduct(product);
    } catch (e) {
      logger.info(e, "Algolia updateProduct failed. Webhooks will be disabled");

      const webhooksToggler = new WebhookActivityTogglerService(
        authData.appId,
        createClient(authData.saleorApiUrl, async () => ({ token: authData.token }))
      );

      logger.trace("Will disable webhooks");

      await webhooksToggler.disableOwnWebhooks(
        context.payload.recipient?.webhooks?.map((w) => w.id)
      );

      logger.trace("Webhooks disabling operation finished");

      return res.status(500).send("Operation failed, webhooks are disabled");
    }
  }

  res.status(200).end();
  return;
};

export default webhookProductUpdated.createHandler(handler);
