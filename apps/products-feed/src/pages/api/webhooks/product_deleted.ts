import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import {
  ProductDeletedDocument,
  ProductWebhookPayloadFragment,
} from "../../../../generated/graphql";

import { updateCacheForConfigurations } from "../../../modules/metadata-cache/update-cache-for-configurations";
import { saleorApp } from "../../../saleor-app";
import { createLogger } from "@saleor/apps-shared";
import { createClient } from "../../../lib/create-graphq-client";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const webhookProductDeleted = new SaleorAsyncWebhook<ProductWebhookPayloadFragment>({
  webhookPath: "api/webhooks/product_deleted",
  event: "PRODUCT_DELETED",
  apl: saleorApp.apl,
  query: ProductDeletedDocument,
  isActive: true,
});

const logger = createLogger({
  service: "webhook_product_deleted",
});

export const handler: NextWebhookApiHandler<ProductWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const { event, authData, payload } = context;

  const client = createClient(authData.saleorApiUrl, async () =>
    Promise.resolve({ token: authData.token })
  );

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

export default webhookProductDeleted.createHandler(handler);
