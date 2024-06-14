import { withOtel } from "@saleor/apps-otel";
import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import {
  ProductVariantCreatedWebhookPayloadFragment,
  ProductVariantCreatedWebhookPayloadFragmentDoc,
  WebhookProductVariantFragmentDoc,
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
 * todo document that fields in Contentful should be unique
 * todo fetch metadata end decode it with payload
 */
const handler: NextWebhookApiHandler<ProductVariantCreatedWebhookPayloadFragment> = async (
  req,
  res,
  context,
) => {
  const logger = createLogger("ProductVariantCreatedWebhook", {
    saleorApiUrl: context.authData.saleorApiUrl,
  });

  const { authData, payload } = context;

  if (!payload.productVariant) {
    logger.warn("Product variant not found in payload");
    Sentry.captureException("ProductVariant not found in payload");

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
  }).delegateVariantCreatedOperations(payload.productVariant);

  logger.info("Webhook processed successfully");

  return res.status(200).end();
};

export default wrapWithLoggerContext(
  withOtel(
    productVariantCreatedWebhook.createHandler(handler),
    "/api/webhooks/product-variant-created",
  ),
  loggerContext,
);
