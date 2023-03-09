import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { ProductVariantUpdatedWebhookPayloadFragment } from "../../../../generated/graphql";
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

export const ProductVariantUpdatedWebhookPayload = gql`
  fragment ProductVariantUpdatedWebhookPayload on ProductVariantUpdated {
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

  console.log("PRODUCT_VARIANT_UPDATED", productVariant);

  const productVariantChannels = productVariant?.channelListings?.map((cl) => cl.channel.slug);
  const productVariantCMSKeys = getCmsKeysFromSaleorItem(productVariant);
  const cmsOperations = await createCmsOperations({
    context,
    channelsToUpdate: productVariantChannels,
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

export default productVariantUpdatedWebhook.createHandler(handler);
