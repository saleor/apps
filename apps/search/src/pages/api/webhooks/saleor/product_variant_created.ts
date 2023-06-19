import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  ProductVariantCreated,
  ProductVariantCreatedDocument,
} from "../../../../../generated/graphql";
import { saleorApp } from "../../../../../saleor-app";
import { AlgoliaSearchProvider } from "../../../../lib/algolia/algoliaSearchProvider";
import { getAlgoliaConfiguration } from "../../../../lib/algolia/getAlgoliaConfiguration";
import { createDebug } from "../../../../lib/debug";
import { createLogger } from "../../../../lib/logger";
import { WebhookActivityTogglerService } from "../../../../domain/WebhookActivityToggler.service";
import { createGraphQLClient } from "@saleor/apps-shared";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const webhookProductVariantCreated = new SaleorAsyncWebhook<ProductVariantCreated>({
  webhookPath: "api/webhooks/saleor/product_variant_created",
  event: "PRODUCT_VARIANT_CREATED",
  apl: saleorApp.apl,
  query: ProductVariantCreatedDocument,
  /**
   * Webhook is disabled by default. Will be enabled by the app when configuration succeeds
   */
  isActive: false,
});

const logger = createLogger({
  service: "webhookProductVariantCreatedWebhookHandler",
});

export const handler: NextWebhookApiHandler<ProductVariantCreated> = async (req, res, context) => {
  const { event, authData } = context;

  logger.debug(
    `New event ${event} (${context.payload?.__typename}) from the ${authData.domain} domain has been received!`
  );

  const { settings, errors } = await getAlgoliaConfiguration({ authData });

  if (errors?.length || !settings) {
    logger.warn("Aborting due to lack of settings");
    logger.debug(errors);
    return res.status(400).json({
      message: errors[0].message,
    });
  }

  const searchProvider = new AlgoliaSearchProvider({
    appId: settings.appId,
    apiKey: settings.secretKey,
    indexNamePrefix: settings.indexNamePrefix,
  });

  const { productVariant } = context.payload;

  if (productVariant) {
    try {
      await searchProvider.createProductVariant(productVariant);
    } catch (e) {
      logger.info(e, "Algolia createProductVariant failed. Webhooks will be disabled");

      const webhooksToggler = new WebhookActivityTogglerService(
        authData.appId,
        createGraphQLClient({ saleorApiUrl: authData.saleorApiUrl, token: authData.token })
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

export default webhookProductVariantCreated.createHandler(handler);
