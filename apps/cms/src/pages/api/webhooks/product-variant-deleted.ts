import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import {
  ProductVariantDeletedWebhookPayloadFragment,
  UntypedWebhookProductVariantFragmentDoc,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { getCmsKeysFromSaleorItem } from "../../../lib/cms/client/metadata";
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

export const ProductVariantDeletedWebhookPayload = gql`
  ${UntypedWebhookProductVariantFragmentDoc}
  fragment ProductVariantDeletedWebhookPayload on ProductVariantDeleted {
    productVariant {
      ...WebhookProductVariant
    }
  }
`;

export const ProductVariantDeletedSubscription = gql`
  ${ProductVariantDeletedWebhookPayload}
  subscription ProductVariantDeleted {
    event {
      ...ProductVariantDeletedWebhookPayload
    }
  }
`;

export const productVariantDeletedWebhook =
  new SaleorAsyncWebhook<ProductVariantDeletedWebhookPayloadFragment>({
    name: "Cms-hub product variant deleted webhook",
    webhookPath: "api/webhooks/product-variant-deleted",
    event: "PRODUCT_VARIANT_DELETED",
    apl: saleorApp.apl,
    query: ProductVariantDeletedSubscription,
  });

export const handler: NextWebhookApiHandler<ProductVariantDeletedWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const { productVariant } = context.payload;

  const logger = pinoLogger.child({
    productVariant,
  });
  logger.debug("Called webhook PRODUCT_VARIANT_DELETED");

  if (!productVariant) {
    return res.status(500).json({
      errors: [
        "No product variant data payload provided. Cannot process product variant syncronisation in CMS providers.",
      ],
    });
  }

  const productVariantCmsKeys = getCmsKeysFromSaleorItem(productVariant);
  const cmsOperations = await createCmsOperations({
    context,
    productVariantChannels: [],
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

export default productVariantDeletedWebhook.createHandler(handler);
