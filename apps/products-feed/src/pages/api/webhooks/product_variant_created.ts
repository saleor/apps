import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  ProductVariantCreatedDocument,
  ProductVariantWebhookPayloadFragment,
} from "../../../../generated/graphql";

import { updateCacheForConfigurations } from "../../../modules/metadata-cache/update-cache-for-configurations";
import { saleorApp } from "../../../saleor-app";
import { GraphqlClientFactory } from "../../../lib/create-graphq-client";
import { createLogger } from "@saleor/apps-shared";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const webhookProductVariantCreated =
  new SaleorAsyncWebhook<ProductVariantWebhookPayloadFragment>({
    webhookPath: "api/webhooks/product_variant_created",
    event: "PRODUCT_VARIANT_CREATED",
    apl: saleorApp.apl,
    query: ProductVariantCreatedDocument,
    isActive: true,
  });

const logger = createLogger({
  service: "PRODUCT_VARIANT_CREATED webhook",
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

export default webhookProductVariantCreated.createHandler(handler);
