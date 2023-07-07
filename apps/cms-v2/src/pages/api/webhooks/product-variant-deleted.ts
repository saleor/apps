import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import {
  ProductVariantDeletedWebhookPayloadFragment,
  ProductVariantDeletedWebhookPayloadFragmentDoc,
  WebhookProductVariantFragmentDoc,
} from "../../../../generated/graphql";

import { AppConfigMetadataManager } from "@/modules/configuration";
import { createSettingsManager } from "@/modules/configuration/metadata-manager";
import { ContentfulClient } from "@/modules/contentful/contentful-client";
import { saleorApp } from "@/saleor-app";
import { createGraphQLClient } from "@saleor/apps-shared";

export const config = {
  api: {
    bodyParser: false,
  },
};

gql`
  ${WebhookProductVariantFragmentDoc}
  fragment ProductVariantDeletedWebhookPayload on ProductVariantDeleted {
    productVariant {
      ...WebhookProductVariant
    }
  }
`;

const Subscription = gql`
  ${ProductVariantDeletedWebhookPayloadFragmentDoc}
  subscription ProductVariantDeleted {
    event {
      ...ProductVariantDeletedWebhookPayload
    }
  }
`;

export const productVariantDeletedWebhook =
  new SaleorAsyncWebhook<ProductVariantDeletedWebhookPayloadFragment>({
    name: "CMS App - Product Variant Deleted",
    webhookPath: "api/webhooks/product-variant-deleted",
    event: "PRODUCT_VARIANT_DELETED",
    apl: saleorApp.apl,
    query: Subscription,
  });

/*
 * todo extract services, delegate to providers
 * todo document that fields in contetnful should be unique
 * todo fetch metadata end decode it with payload
 */
const handler: NextWebhookApiHandler<ProductVariantDeletedWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const { authData, payload } = context;

  const { productVariant } = payload;

  if (!productVariant) {
    // todo Sentry - should not happen
    return res.status(500).end();
  }

  const configManager = AppConfigMetadataManager.createFromAuthData(authData);
  const appConfig = await configManager.get();

  const providers = appConfig.providers.getProviders();
  const connections = appConfig.connections.getConnections();

  connections.map(async (conn) => {
    if (conn.providerType === "contentful") {
      const contentfulConfig = providers.find((p) => p.id === conn.providerId)!;

      const contentfulCLient = new ContentfulClient({
        accessToken: contentfulConfig.authToken,
        space: contentfulConfig.spaceId,
      });

      console.log("will delete" + productVariant.id);

      await contentfulCLient.deleteProduct({
        configuration: contentfulConfig,
        variant: { id: productVariant.id },
      });
    }
  });

  return res.status(200).end();
};

export default productVariantDeletedWebhook.createHandler(handler);

// todo remove connection when provider removed
