import { withOtel } from "@saleor/apps-otel";
import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import {
  ProductUpdatedWebhookPayloadFragment,
  ProductUpdatedWebhookPayloadFragmentDoc,
  WebhookProductFragmentDoc,
} from "../../../../generated/graphql";

import { saleorApp } from "@/saleor-app";
import { createWebhookConfigContext } from "@/modules/webhooks-operations/create-webhook-config-context";
import { WebhooksProcessorsDelegator } from "@/modules/webhooks-operations/webhooks-processors-delegator";
import { loggerContext } from "../../../logger-context";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";

import * as Sentry from "@sentry/nextjs";
import { createLogger } from "@/logger";

export const config = {
  api: {
    bodyParser: false,
  },
};

gql`
  ${WebhookProductFragmentDoc}
  fragment ProductUpdatedWebhookPayload on ProductUpdated {
    product {
      ...WebhookProduct
    }
  }
`;

const Subscription = gql`
  ${ProductUpdatedWebhookPayloadFragmentDoc}
  subscription ProductUpdated {
    event {
      ...ProductUpdatedWebhookPayload
    }
  }
`;

export const productUpdatedWebhook = new SaleorAsyncWebhook<ProductUpdatedWebhookPayloadFragment>({
  name: "CMS App - Product Updated",
  webhookPath: "api/webhooks/product-updated",
  event: "PRODUCT_UPDATED",
  apl: saleorApp.apl,
  query: Subscription,
});

const handler: NextWebhookApiHandler<ProductUpdatedWebhookPayloadFragment> = async (
  req,
  res,
  context,
) => {
  const logger = createLogger("ProductUpdatedWebhook", {
    saleorApiUrl: context.authData.saleorApiUrl,
  });

  const { authData, payload } = context;

  if (!payload.product) {
    logger.warn("Product not found in payload");
    Sentry.captureException("Product not found in payload");

    return res.status(500).end();
  }

  logger.info("Webhook called", {
    productId: payload.product.id,
    variantsLength: payload.product.variants?.length,
    productName: payload.product.name,
    channelsIds: payload.product.channelListings?.map((c) => c.channel.id) || [],
  });

  const configContext = await createWebhookConfigContext({ authData });

  await new WebhooksProcessorsDelegator({
    context: configContext,
  }).delegateProductUpdatedOperations(payload.product);

  logger.info("Webhook processed successfully");

  return res.status(200).end();
};

export default wrapWithLoggerContext(
  withOtel(productUpdatedWebhook.createHandler(handler), "/api/webhooks/product-updated"),
  loggerContext,
);
