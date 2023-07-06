import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import {
  ProductVariantDeletedWebhookPayloadFragmentDoc,
  WebhookProductVariantFragmentDoc,
  ProductVariantDeletedWebhookPayloadFragment,
} from "../../../../generated/graphql";

import { saleorApp } from "@/saleor-app";
import { ContentfulSettingsManager } from "@/modules/contentful/config/contentful-settings-manager";
import { createSettingsManager } from "@/modules/configuration/metadata-manager";
import { createGraphQLClient } from "@saleor/apps-shared";
import { ContentfulClient } from "@/modules/contentful/contentful-client";
import { ChannelProviderConnectionSettingsManager } from "@/modules/channel-provider-connection/config/channel-provider-connection-settings-manager";

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

  const settingsManager = createSettingsManager(
    createGraphQLClient({
      saleorApiUrl: authData.saleorApiUrl,
      token: authData.token,
    }),
    authData.appId
  );

  const contentfulSettingsManager = new ContentfulSettingsManager(settingsManager);

  const config = await contentfulSettingsManager.get();
  const providers = config.getProviders();

  const connections = await (
    await new ChannelProviderConnectionSettingsManager(settingsManager).get()
  ).getConnections();

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
