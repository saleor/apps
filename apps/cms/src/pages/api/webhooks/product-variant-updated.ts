import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import {
  ProductVariantUpdatedWebhookPayloadFragment,
  UntypedWebhookProductVariantFragmentDoc,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { getCmsKeysFromSaleorItem } from "../../../lib/cms/client/metadata";
import { getChannelsSlugsFromSaleorItem } from "../../../lib/cms/client/channels";
import {
  createCmsOperations,
  executeCmsOperations,
  executeMetadataUpdate,
} from "../../../lib/cms/client";
import { logger as pinoLogger } from "../../../lib/logger";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const ProductVariantUpdatedWebhookPayload = gql`
  ${UntypedWebhookProductVariantFragmentDoc}
  fragment ProductVariantUpdatedWebhookPayload on ProductVariantUpdated {
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
  // * product_updated event triggers on product_created as well 🤷
  const { productVariant } = context.payload;

  const logger = pinoLogger.child({
    productVariant,
  });
  logger.debug("Called webhook PRODUCT_VARIANT_UPDATED");

  if (!productVariant) {
    return res.status(500).json({
      errors: [
        "No product variant data payload provided. Cannot process product variant syncronisation in CMS providers.",
      ],
    });
  }

  const productVariantChannels = getChannelsSlugsFromSaleorItem(productVariant);
  const productVariantCmsKeys = getCmsKeysFromSaleorItem(productVariant);
  const cmsOperations = await createCmsOperations({
    context,
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

  await executeMetadataUpdate({
    context,
    productVariant,
    cmsProviderInstanceIdsToCreate: cmsProviderInstanceProductVariantIdsToCreate,
    cmsProviderInstanceIdsToDelete: cmsProviderInstanceProductVariantIdsToDelete,
  });

  if (!cmsErrors.length) {
    return res.status(200).end();
  } else {
    return res.status(500).json({ errors: cmsErrors });
  }
};

export default productVariantUpdatedWebhook.createHandler(handler);
