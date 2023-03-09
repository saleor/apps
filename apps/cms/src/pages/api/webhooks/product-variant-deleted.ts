import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { ProductVariantDeletedWebhookPayloadFragment } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
import { getCmsKeysFromSaleorItem } from "../../../lib/cms/client-utils/metadata";
import {
  createCmsOperations,
  executeCmsOperations,
  executeMetadataUpdate,
} from "../../../lib/cms/client";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const ProductVariantDeletedWebhookPayload = gql`
  fragment ProductVariantDeletedWebhookPayload on ProductVariantDeleted {
    productVariant {
      id
      name
      sku
      product {
        id
        name
        slug
        media {
          url
        }
        channelListings {
          id
          channel {
            id
            slug
          }
          isPublished
        }
      }
      channelListings {
        id
        channel {
          id
          slug
        }
        price {
          amount
          currency
        }
      }
      metadata {
        key
        value
      }
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

  console.log("PRODUCT_VARIANT_DELETED", productVariant);

  const productVariantCMSKeys = getCmsKeysFromSaleorItem(productVariant);
  const cmsOperations = await createCmsOperations({
    context,
    channelsToUpdate: [],
    cmsKeysToUpdate: productVariantCMSKeys,
  });

  if (productVariant) {
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
  }
};

export default productVariantDeletedWebhook.createHandler(handler);
