import { NextWebhookApiHandler } from "@saleor/app-sdk/handlers/next";
import { ProductEditedSubscription } from "../../../../../generated/graphql";
import { AlgoliaSearchProvider } from "../../../../lib/algolia/algoliaSearchProvider";
import { createDebug } from "../../../../lib/debug";
import { createClient } from "../../../../lib/graphql";
import { createSettingsManager } from "../../../../lib/metadata";
import { AlgoliaConfigurationFields } from "../../../../lib/algolia/types";

const debug = createDebug("Webhooks handler");

export const handler: NextWebhookApiHandler<ProductEditedSubscription["event"]> = async (
  req,
  res,
  context,
) => {
  const { event, authData } = context;
  debug(
    `New event ${event} (${context.payload?.__typename}) from the ${authData.domain} domain has been received!`,
  );

  const client = createClient(authData.saleorApiUrl, async () =>
    Promise.resolve({ token: authData.token }),
  );

  const settings = createSettingsManager(client);

  const algoliaConfiguration: AlgoliaConfigurationFields = {
    secretKey: (await settings.get("secretKey", authData.domain)) || "",
    appId: (await settings.get("appId", authData.domain)) || "",
    indexNamePrefix: (await settings.get("indexNamePrefix", authData.domain)) || "",
  };

  if (!algoliaConfiguration?.appId) {
    debug("Missing AppID configuration - returning error response");
    return res.status(500).json({
      message: `Missing 'appId'`,
    });
  }
  if (!algoliaConfiguration.secretKey) {
    debug("Missing SecretKey configuration - returning error response");
    return res.status(500).json({
      message: `Missing 'secretKey'`,
    });
  }

  const searchProvider = new AlgoliaSearchProvider({
    appId: algoliaConfiguration.appId,
    apiKey: algoliaConfiguration.secretKey,
    indexNamePrefix: algoliaConfiguration.indexNamePrefix,
  });

  switch (context.payload?.__typename) {
    case "ProductCreated": {
      const { product } = context.payload;
      if (product) {
        await searchProvider.createProduct(product);
      }
      res.status(200).end();
      return;
    }
    case "ProductUpdated": {
      const { product } = context.payload;
      if (product) {
        await searchProvider.updateProduct(product);
      }
      res.status(200).end();
      return;
    }
    case "ProductDeleted": {
      const { product } = context.payload;
      if (product) {
        await searchProvider.deleteProduct(product);
      }
      res.status(200).end();
      return;
    }
    case "ProductVariantCreated": {
      const { productVariant } = context.payload;
      if (productVariant) {
        await searchProvider.createProductVariant(productVariant);
      }
      res.status(200).end();
      return;
    }
    case "ProductVariantUpdated": {
      const { productVariant } = context.payload;
      if (productVariant) {
        await searchProvider.updateProductVariant(productVariant);
      }
      res.status(200).end();
      return;
    }
    case "ProductVariantDeleted": {
      const { productVariant } = context.payload;
      if (productVariant) {
        await searchProvider.deleteProductVariant(productVariant);
      }
      res.status(200).end();
      return;
    }
  }
};
