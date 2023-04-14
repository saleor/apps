import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import {
  ProductVariantUpdatedWebhookPayloadFragment,
  UntypedWebhookProductVariantFragmentDoc,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { getCmsKeysFromSaleorItem } from "../../../lib/cms/client/metadata";
import { getChannelsSlugsFromSaleorItem } from "../../../lib/cms/client/channels";
import { createCmsOperations, executeCmsOperations, updateMetadata } from "../../../lib/cms/client";
import { logger as pinoLogger } from "../../../lib/logger";
import { createClient } from "../../../lib/graphql";
import { fetchProductVariantMetadata } from "../../../lib/metadata";
import { isAppWebhookIssuer } from "./_utils";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const ProductVariantUpdatedWebhookPayload = gql`
  ${UntypedWebhookProductVariantFragmentDoc}
  fragment ProductVariantUpdatedWebhookPayload on ProductVariantUpdated {
    issuingPrincipal {
      ... on App {
        id
      }
    }
    productVariant {
      ...WebhookProductVariant
    }
  }
`;

export const ProductVariantUpdatedSubscription = gql`
  ${ProductVariantUpdatedWebhookPayload}
  subscription ProductVariantUpdated {
    event {
      ...ProductVariantUpdatedWebhookPayload
    }
  }
`;

export const productVariantUpdatedWebhook =
  new SaleorAsyncWebhook<ProductVariantUpdatedWebhookPayloadFragment>({
    name: "Cms-hub product variant updated webhook",
    webhookPath: "api/webhooks/product-variant-updated",
    event: "PRODUCT_VARIANT_UPDATED",
    apl: saleorApp.apl,
    query: ProductVariantUpdatedSubscription,
  });

export const handler: NextWebhookApiHandler<ProductVariantUpdatedWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const { productVariant, issuingPrincipal } = context.payload;
  const { saleorApiUrl, token, appId } = context.authData;

  const logger = pinoLogger.child({
    productVariant,
  });
  logger.debug("Called webhook PRODUCT_VARIANT_UPDATED");
  logger.debug({ issuingPrincipal }, "Issuing principal");

  if (isAppWebhookIssuer(issuingPrincipal, appId)) {
    logger.debug("Issuing principal is the same as the app. Skipping webhook processing.");
    return res.status(200).end();
  }

  if (!productVariant) {
    return res.status(500).json({
      errors: [
        "No product variant data payload provided. Cannot process product variant syncronisation in CMS providers.",
      ],
    });
  }

  const client = createClient(saleorApiUrl, async () => ({
    token: token,
  }));

  const productVariantChannels = getChannelsSlugsFromSaleorItem(productVariant);
  const productVariantMetadata = await fetchProductVariantMetadata(client, productVariant.id);
  const productVariantCmsKeys = getCmsKeysFromSaleorItem({ metadata: productVariantMetadata });
  const cmsOperations = await createCmsOperations({
    context,
    client,
    productVariantChannels: productVariantChannels,
    productVariantCmsKeys: productVariantCmsKeys,
  });

  const {
    cmsProviderInstanceProductVariantIdsToCreate,
    cmsProviderInstanceProductVariantIdsToDelete,
    cmsErrors,
  } = await executeCmsOperations({
    cmsOperations,
    productVariant,
  });

  await updateMetadata({
    context,
    productVariant,
    cmsProviderInstanceIdsToCreate: cmsProviderInstanceProductVariantIdsToCreate,
    cmsProviderInstanceIdsToDelete: cmsProviderInstanceProductVariantIdsToDelete,
  });

  if (!cmsErrors.length) {
    return res.status(200).end();
  } else {
    // Due to undesired webhook events deliveries retries on HTTP 500, we need to return 200 status code instead of 500.
    return res.status(200).json({ errors: cmsErrors });
  }
};

export default productVariantUpdatedWebhook.createHandler(handler);
