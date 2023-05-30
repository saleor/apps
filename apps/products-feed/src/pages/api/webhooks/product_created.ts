import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { createLogger } from "@saleor/apps-shared";
import { saleorApp } from "../../../saleor-app";
import { updateCacheForConfigurations } from "../../../modules/metadata-cache/update-cache-for-configurations";
import { createClient } from "../../../lib/create-graphq-client";
import {
  ProductCreatedDocument,
  ProductCreated,
  ProductWebhookPayloadFragment,
} from "../../../../generated/graphql";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const webhookProductCreated = new SaleorAsyncWebhook<ProductWebhookPayloadFragment>({
  webhookPath: "api/webhooks/product_created",
  event: "PRODUCT_CREATED",
  apl: saleorApp.apl,
  query: ProductCreatedDocument,
  // todo make it disabled by default
  isActive: true,
});

const logger = createLogger({
  service: "webhook-product_created",
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

export default webhookProductCreated.createHandler(handler);
