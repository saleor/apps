import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  ProductUpdatedDocument,
  ProductWebhookPayloadFragment,
} from "../../../../generated/graphql";

import { updateCacheForConfigurations } from "../../../modules/metadata-cache/update-cache-for-configurations";
import { saleorApp } from "../../../saleor-app";
import { createLogger } from "@saleor/apps-shared";
import { createClient, GraphqlClientFactory } from "../../../lib/create-graphq-client";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const webhookProductUpdated = new SaleorAsyncWebhook<ProductWebhookPayloadFragment>({
  webhookPath: "api/webhooks/product_updated",
  event: "PRODUCT_UPDATED",
  apl: saleorApp.apl,
  query: ProductUpdatedDocument,

  isActive: true,
});

const logger = createLogger({
  service: "webhookProductUpdatedWebhookHandler",
});

export const handler: NextWebhookApiHandler<ProductWebhookPayloadFragment> = async (
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

export default webhookProductUpdated.createHandler(handler);
