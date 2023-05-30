import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { createLogger } from "@saleor/apps-shared";
import {
  ProductVariantUpdatedDocument,
  ProductVariantWebhookPayloadFragment,
} from "../../../../generated/graphql";

import { GraphqlClientFactory } from "../../../lib/create-graphq-client";
import { updateCacheForConfigurations } from "../../../modules/metadata-cache/update-cache-for-configurations";
import { saleorApp } from "../../../saleor-app";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const webhookProductVariantUpdated =
  new SaleorAsyncWebhook<ProductVariantWebhookPayloadFragment>({
    webhookPath: "api/webhooks/product_variant_updated",
    event: "PRODUCT_VARIANT_UPDATED",
    apl: saleorApp.apl,
    query: ProductVariantUpdatedDocument,
    isActive: true,
  });

const logger = createLogger({
  service: "webhookProductVariantUpdatedWebhookHandler",
});

export const handler: NextWebhookApiHandler<ProductVariantWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const { event, authData, payload } = context;

  const client = GraphqlClientFactory.fromAuthData(authData);

  const channelsSlugs = [
    payload.channel,
    ...(payload.channelListings?.map((cl) => cl.channel.slug) ?? []),
  ].filter((c) => c) as string[];

  if (channelsSlugs.length === 0) {
    res.status(200).end();
    return;
  }

  await updateCacheForConfigurations({
    channelsSlugs,
    client,
    saleorApiUrl: authData.saleorApiUrl,
  });

  res.status(200).end();
  return;
};

export default webhookProductVariantUpdated.createHandler(handler);
