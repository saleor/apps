import { NextJsWebhookHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import { captureException } from "@sentry/nextjs";
import { gql } from "urql";

import { createLogger } from "@/logger";
import { createWebhookConfigContext } from "@/modules/webhooks-operations/create-webhook-config-context";
import { WebhooksProcessorsDelegator } from "@/modules/webhooks-operations/webhooks-processors-delegator";
import { saleorApp } from "@/saleor-app";

import {
  ProductUpdatedWebhookPayloadFragment,
  ProductUpdatedWebhookPayloadFragmentDoc,
  WebhookProductFragmentDoc,
} from "../../../../generated/graphql";
import { loggerContext } from "../../../logger-context";

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

const handler: NextJsWebhookHandler<ProductUpdatedWebhookPayloadFragment> = async (
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
    captureException("Product not found in payload");

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
  withSpanAttributes(productUpdatedWebhook.createHandler(handler)),
  loggerContext,
);
