import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import { ProductVariantCreatedWebhookPayloadFragment } from "../../../../generated/graphql";
import { saleorApp } from "../../../../saleor-app";
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

export const ProductVariantCreatedWebhookPayload = gql`
  fragment ProductVariantCreatedWebhookPayload on ProductVariantCreated {
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

  console.log("PRODUCT_VARIANT_CREATED", productVariant);

  const productVariantChannels = productVariant?.channelListings?.map((cl) => cl.channel.slug);
  const cmsOperations = await createCmsOperations({
    context,
    channelsToUpdate: productVariantChannels,
    cmsKeysToUpdate: [],
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

export default productVariantCreatedWebhook.createHandler(handler);
