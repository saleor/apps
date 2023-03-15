import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import {
  ProductVariantCreatedWebhookPayloadFragment,
  UntypedWebhookProductVariantFragmentDoc,
} from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
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

export const ProductVariantCreatedWebhookPayload = gql`
  ${UntypedWebhookProductVariantFragmentDoc}
  fragment ProductVariantCreatedWebhookPayload on ProductVariantCreated {
    productVariant {
      ...WebhookProductVariant
    }
  }
`;

export const ProductVariantCreatedSubscription = gql`
  ${ProductVariantCreatedWebhookPayload}
  subscription ProductVariantCreated {
    event {
      ...ProductVariantCreatedWebhookPayload
    }
  }
`;

export const productVariantCreatedWebhook =
  new SaleorAsyncWebhook<ProductVariantCreatedWebhookPayloadFragment>({
    name: "Cms-hub product variant created webhook",
    webhookPath: "api/webhooks/product-variant-created",
    event: "PRODUCT_VARIANT_CREATED",
    apl: saleorApp.apl,
    query: ProductVariantCreatedSubscription,
  });

export const handler: NextWebhookApiHandler<ProductVariantCreatedWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const { productVariant } = context.payload;

  const logger = pinoLogger.child({
    productVariant,
  });
  logger.debug("Called webhook PRODUCT_VARIANT_CREATED");

  if (!productVariant) {
    return res.status(500).json({
      errors: [
        "No product variant data payload provided. Cannot process product variant syncronisation in CMS providers.",
      ],
    });
  }

  const productVariantChannels = getChannelsSlugsFromSaleorItem(productVariant);
  const cmsOperations = await createCmsOperations({
    context,
    productVariantChannels: productVariantChannels,
    productVariantCmsKeys: [],
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

export default productVariantCreatedWebhook.createHandler(handler);
