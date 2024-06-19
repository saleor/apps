import { withOtel } from "@saleor/apps-otel";
import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import {
  ProductVariantUpdatedWebhookPayloadFragment,
  ProductVariantUpdatedWebhookPayloadFragmentDoc,
  WebhookProductVariantFragmentDoc,
} from "../../../../generated/graphql";

import { createWebhookConfigContext } from "@/modules/webhooks-operations/create-webhook-config-context";
import { WebhooksProcessorsDelegator } from "@/modules/webhooks-operations/webhooks-processors-delegator";
import { saleorApp } from "@/saleor-app";
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
 * todo document that fields in Contentful should be unique
 * todo fetch metadata end decode it with payload
 */
const handler: NextWebhookApiHandler<ProductVariantUpdatedWebhookPayloadFragment> = async (
  req,
  res,
  context,
) => {
  const logger = createLogger("ProductVariantUpdatedWebhook", {
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
  }).delegateVariantUpdatedOperations(payload.productVariant);

  logger.info("Webhook processed successfully");

  return res.status(200).end();
};

export default wrapWithLoggerContext(
  withOtel(
    productVariantUpdatedWebhook.createHandler(handler),
    "api/webhooks/product-variant-updated",
  ),
  loggerContext,
);
