import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { ProductDeleted, ProductDeletedDocument } from "../../../../../generated/graphql";
import { saleorApp } from "../../../../../saleor-app";
import { AlgoliaSearchProvider } from "../../../../lib/algolia/algoliaSearchProvider";
import { getAlgoliaConfiguration } from "../../../../lib/algolia/getAlgoliaConfiguration";
import { createDebug } from "../../../../lib/debug";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const webhookProductDeleted = new SaleorAsyncWebhook<ProductDeleted>({
  webhookPath: "api/webhooks/saleor/product_deleted",
  event: "PRODUCT_DELETED",
  apl: saleorApp.apl,
  query: ProductDeletedDocument,
});

export const handler: NextWebhookApiHandler<ProductDeleted> = async (req, res, context) => {
  const debug = createDebug(`Webhook handler - ${webhookProductDeleted.event}`);

  const { event, authData } = context;

  debug(
    `New event ${event} (${context.payload?.__typename}) from the ${authData.domain} domain has been received!`
  );

  const { settings, errors } = await getAlgoliaConfiguration({ authData });

  if (errors?.length || !settings) {
    debug("Aborting due to lack of settings");
    debug(errors);
    return res.status(400).json({
      message: errors[0].message,
    });
  }

  const searchProvider = new AlgoliaSearchProvider({
    appId: settings.appId,
    apiKey: settings.secretKey,
    indexNamePrefix: settings.indexNamePrefix,
  });

  const { product } = context.payload;

  if (product) {
    await searchProvider.deleteProduct(product);
  }
  res.status(200).end();
  return;
};

export default webhookProductDeleted.createHandler(handler);
