import { NextWebhookApiHandler, SaleorAsyncWebhook } from "@saleor/app-sdk/handlers/next";
import { gql } from "urql";
import {
  ProductUpdatedWebhookPayloadFragment,
  UntypedWebhookProductFragmentDoc,
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

export const ProductUpdatedWebhookPayload = gql`
  ${UntypedWebhookProductFragmentDoc}
  fragment ProductUpdatedWebhookPayload on ProductUpdated {
    issuingPrincipal {
      ... on App {
        id
      }
    }
    product {
      ...WebhookProduct
    }
  }
`;

export const ProductUpdatedSubscription = gql`
  ${ProductUpdatedWebhookPayload}
  subscription ProductUpdated {
    event {
      ...ProductUpdatedWebhookPayload
    }
  }
`;

export const productUpdatedWebhook = new SaleorAsyncWebhook<ProductUpdatedWebhookPayloadFragment>({
  name: "Cms-hub product updated webhook",
  webhookPath: "api/webhooks/product-updated",
  event: "PRODUCT_UPDATED",
  apl: saleorApp.apl,
  query: ProductUpdatedSubscription,
});

export const handler: NextWebhookApiHandler<ProductUpdatedWebhookPayloadFragment> = async (
  req,
  res,
  context
) => {
  const { product, issuingPrincipal } = context.payload;
  const { saleorApiUrl, token, appId } = context.authData;

  const logger = pinoLogger.child({
    product,
  });
  logger.debug("Called webhook PRODUCT_UPDATED");
  logger.debug({ issuingPrincipal }, "Issuing principal");

  if (isAppWebhookIssuer(issuingPrincipal, appId)) {
    logger.debug("Issuing principal is the same as the app. Skipping webhook processing.");
    return res.status(200).end();
  }

  if (!product) {
    return res.status(500).json({
      errors: [
        "No product product data payload provided. Cannot process product variants syncronisation in CMS providers.",
      ],
    });
  }

  const client = createClient(saleorApiUrl, async () => ({
    token: token,
  }));

  const allCMSErrors: string[] = [];

  product.variants?.forEach(async (variant) => {
    const { variants: _, ...productFields } = product;
    const productVariant = {
      product: productFields,
      ...variant,
    };

    const productVariantChannels = getChannelsSlugsFromSaleorItem(productVariant);
    const productMetadata = await fetchProductVariantMetadata(client, productVariant.id);
    const productVariantCmsKeys = getCmsKeysFromSaleorItem({ metadata: productMetadata });
    const cmsOperations = await createCmsOperations({
      context,
      client,
      productVariantChannels: productVariantChannels,
      productVariantCmsKeys: productVariantCmsKeys,
    });
    // Do not touch product variants which are not created or should be deleted.
    // These operations should and will be performed by PRODUCT_VARIANT_CREATED and PRODUCT_VARIANT_DELETED webhooks.
    // Otherwise we will end up with duplicated product variants in CMS providers! (or failed variant delete operations).
    const cmsUpdateOperations = cmsOperations.filter(
      (operation) => operation.operationType === "updateProduct"
    );

    const {
      cmsProviderInstanceProductVariantIdsToCreate,
      cmsProviderInstanceProductVariantIdsToDelete,
      cmsErrors,
    } = await executeCmsOperations({
      cmsOperations: cmsUpdateOperations,
      productVariant,
    });

    allCMSErrors.push(...cmsErrors);

    await updateMetadata({
      context,
      productVariant,
      cmsProviderInstanceIdsToCreate: cmsProviderInstanceProductVariantIdsToCreate,
      cmsProviderInstanceIdsToDelete: cmsProviderInstanceProductVariantIdsToDelete,
    });
  });

  if (!allCMSErrors.length) {
    return res.status(200).end();
  } else {
    // Due to undesired webhook events deliveries retries on HTTP 500, we need to return 200 status code instead of 500.
    return res.status(200).json({ errors: allCMSErrors });
  }
};

export default productUpdatedWebhook.createHandler(handler);
