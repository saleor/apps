import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withSpanAttributes } from "@saleor/apps-otel/src/with-span-attributes";
import * as Sentry from "@sentry/nextjs";
import { gql } from "urql";

import { createLogger } from "@/logger";
import { createWebhookConfigContext } from "@/modules/webhooks-operations/create-webhook-config-context";
import { WebhooksProcessorsDelegator } from "@/modules/webhooks-operations/webhooks-processors-delegator";
import { saleorApp } from "@/saleor-app";

import {
  ProductVariantDeletedWebhookPayloadFragment,
  ProductVariantDeletedWebhookPayloadFragmentDoc,
  WebhookProductVariantFragmentDoc,
} from "../../../../generated/graphql";
import { loggerContext } from "../../../logger-context";

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
 * TODO: document that fields in Contentful should be unique
 * TODO: fetch metadata end decode it with payload, so we spare one call
 */
const handler: NextWebhookApiHandler<ProductVariantDeletedWebhookPayloadFragment> = async (
  req,
  res,
  context,
) => {
  const logger = createLogger("ProductVariantDeletedWebhook", {
    saleorApiUrl: context.authData.saleorApiUrl,
  });

  const { authData, payload } = context;

  if (!payload.productVariant) {
    logger.warn("Product variant not found in payload");
    Sentry.captureException("Product variant not found in payload");

    return res.status(500).end();
  }

  logger.info("Webhook called", {
    variantId: payload.productVariant.id,
    variantName: payload.productVariant.name,
    channelsIds: payload.productVariant.channelListings?.map((c) => c.channel.id) || [],
    productId: payload.productVariant.product.id,
  });

  const configContext = await createWebhookConfigContext({ authData });

  await new WebhooksProcessorsDelegator({
    context: configContext,
  }).delegateVariantDeletedOperations(payload.productVariant);

  logger.info("Webhook processed successfully");

  return res.status(200).end();
};

export default wrapWithLoggerContext(
  withSpanAttributes(productVariantDeletedWebhook.createHandler(handler)),
  loggerContext,
);
