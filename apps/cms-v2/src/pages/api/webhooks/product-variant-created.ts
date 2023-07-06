import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import {
  ProductVariantCreatedWebhookPayloadFragment,
  WebhookProductVariantFragmentDoc,
  ProductVariantCreatedWebhookPayloadFragmentDoc,
} from "../../../../generated/graphql";

import { saleorApp } from "@/saleor-app";
import { ContentfulSettingsManager } from "@/modules/contentful/config/contentful-settings-manager";
import { createSettingsManager } from "@/modules/configuration/metadata-manager";
import { createGraphQLClient } from "@saleor/apps-shared";
import { ContentfulClient } from "@/modules/contentful/contentful-client";

export const config = {
  api: {
    bodyParser: false,
  },
};

const Payload = gql`
  ${WebhookProductVariantFragmentDoc}
  fragment ProductVariantCreatedWebhookPayload on ProductVariantCreated {
    productVariant {
      ...WebhookProductVariant
    }
  }
`;

const Subscription = gql`
  ${ProductVariantCreatedWebhookPayloadFragmentDoc}
  subscription ProductVariantCreated {
    event {
      ...ProductVariantCreatedWebhookPayload
    }
  }
`;

export const productVariantCreatedWebhook =
  new SaleorAsyncWebhook<ProductVariantCreatedWebhookPayloadFragment>({
    name: "CMS App - Product Variant Created",
    webhookPath: "api/webhooks/product-variant-created",
    event: "PRODUCT_VARIANT_CREATED",
    apl: saleorApp.apl,
    query: Subscription,
  });

/*
 * todo extract services, delegate to providers
 * todo document that fields in contetnful should be unique
 * todo fetch metadata end decode it with payload
 */
const handler: NextWebhookApiHandler<ProductVariantCreatedWebhookPayloadFragment> = async (
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

  const contentfulSettingsManager = new ContentfulSettingsManager(
    createSettingsManager(
      createGraphQLClient({
        saleorApiUrl: authData.saleorApiUrl,
        token: authData.token,
      }),
      authData.appId
    )
  );

  const config = await contentfulSettingsManager.get();
  const providers = config.getProviders();

  providers.map(async (p) => {
    const contentfulCLient = new ContentfulClient({
      accessToken: p.authToken,
      space: p.spaceId,
    });

    await contentfulCLient.uploadProduct({
      configuration: p,
      variant: productVariant,
    });
  });

  return res.status(200).end();
};

export default productVariantCreatedWebhook.createHandler(handler);
