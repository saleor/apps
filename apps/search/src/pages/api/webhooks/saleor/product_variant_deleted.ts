import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  ProductVariantDeleted,
  ProductVariantDeletedDocument,
} from "../../../../../generated/graphql";
import { saleorApp } from "../../../../../saleor-app";
import { AlgoliaSearchProvider } from "../../../../lib/algolia/algoliaSearchProvider";
import { getAlgoliaConfiguration } from "../../../../lib/algolia/getAlgoliaConfiguration";
import { createDebug } from "../../../../lib/debug";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const webhookProductVariantDeleted = new SaleorAsyncWebhook<ProductVariantDeleted>({
  webhookPath: "api/webhooks/saleor/product_variant_deleted",
  event: "PRODUCT_VARIANT_DELETED",
  apl: saleorApp.apl,
  query: ProductVariantDeletedDocument,
});

export const handler: NextWebhookApiHandler<ProductVariantDeleted> = async (req, res, context) => {
  const debug = createDebug(`Webhook handler - ${webhookProductVariantDeleted.event}`);

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

  const { productVariant } = context.payload;

  if (productVariant) {
    await searchProvider.deleteProductVariant(productVariant);
  }
  res.status(200).end();
  return;
};

export default webhookProductVariantDeleted.createHandler(handler);
