import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import {
  ProductVariantUpdatedWebhookPayloadFragment,
  ProductVariantUpdatedWebhookPayloadFragmentDoc,
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
  fragment ProductVariantUpdatedWebhookPayload on ProductVariantUpdated {
    productVariant {
      ...WebhookProductVariant
    }
  }
`;

const Subscription = gql`
  ${ProductVariantUpdatedWebhookPayloadFragmentDoc}
  subscription ProductVariantUpdated {
    event {
      ...ProductVariantUpdatedWebhookPayload
    }
  }
`;

export const productVariantUpdatedWebhook =
  new SaleorAsyncWebhook<ProductVariantUpdatedWebhookPayloadFragment>({
    name: "CMS App - Product Variant Updated",
    webhookPath: "api/webhooks/product-variant-updated",
    event: "PRODUCT_VARIANT_UPDATED",
    apl: saleorApp.apl,
    query: Subscription,
  });

/*
 * todo extract services, delegate to providers
 * todo document that fields in contetnful should be unique
 * todo fetch metadata end decode it with payload
 */
const handler: NextWebhookApiHandler<ProductVariantUpdatedWebhookPayloadFragment> = async (
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

  const appConfig = await new AppConfigMetadataManager(settingsManager).get();

  const providers = appConfig.providers.getProviders();
  const connections = appConfig.connections.getConnections();

  connections.map(async (conn) => {
    const isEnabled = productVariant.channelListings?.find(
      (listing) => listing.channel.slug === conn.channelSlug
    );

    if (!isEnabled) {
      return res.status(200).end();
    }

    if (conn.providerType === "contentful") {
      const contentfulConfig = providers.find((p) => p.id === conn.providerId)!;

      const contentfulCLient = new ContentfulClient({
        accessToken: contentfulConfig.authToken,
        space: contentfulConfig.spaceId,
      });

      await contentfulCLient.upsertProduct({
        configuration: contentfulConfig,
        variant: productVariant,
      });
    }
  });

  return res.status(200).end();
};

export default productVariantUpdatedWebhook.createHandler(handler);

// todo remove connection when provider removed
