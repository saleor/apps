import {
  ProductVariantUpdatedWebhookPayloadFragment,
  WebhookProductVariantFragment,
} from "../../../../generated/graphql";
import { CmsClientBatchOperations, CmsClientOperations, ProductResponseSuccess } from "../types";
import { getCmsIdFromSaleorItem } from "./metadata";
import { logger as pinoLogger } from "../../logger";

interface CmsClientOperationResult {
  createdCmsId?: string;
  deletedCmsId?: string;
  error?: string;
}

const executeCmsClientOperation = async ({
  cmsClient,
  productVariant,
}: {
  cmsClient: CmsClientOperations;
  productVariant: WebhookProductVariantFragment;
}): Promise<CmsClientOperationResult | undefined> => {
  const logger = pinoLogger.child({ cmsClient });
  logger.debug("Execute CMS client operation called");

  const cmsId = getCmsIdFromSaleorItem(productVariant, cmsClient.cmsProviderInstanceId);

  if (cmsId && cmsClient.operationType === "deleteProduct") {
    logger.debug("CMS deleting item called", { cmsId });

    try {
      await cmsClient.operations.deleteProduct({
        id: cmsId,
      });
      return {
        deletedCmsId: cmsId,
      };
    } catch (error) {
      logger.error("Error deleting item", { error });

      return {
        error: "Error deleting item.",
      };
    }
  } else if (cmsId && cmsClient.operationType === "updateProduct") {
    logger.debug("CMS updating item called", { cmsId });

    try {
      await cmsClient.operations.updateProduct({
        // todo: change params of product methods because of below:
        // * In some CMSes, cmsId may be productId. Perhaps it's better to just pass everything as one big object
        // * and decide on the id on the provider level.
        id: cmsId,
        input: {
          saleorId: productVariant.id,
          sku: productVariant.sku,
          name: productVariant.name,
          image: productVariant.product.media?.[0]?.url ?? "",
          productId: productVariant.product.id,
          productName: productVariant.product.name,
          productSlug: productVariant.product.slug,
          channels: productVariant.channelListings?.map((cl) => cl.channel.slug) || [],
        },
      });
    } catch (error) {
      logger.error("Error updating item", { error });

      return {
        error: "Error updating item.",
      };
    }
  } else if (!cmsId && cmsClient.operationType === "createProduct") {
    logger.debug("CMS creating item called");

    try {
      const createProductResponse = await cmsClient.operations.createProduct({
        input: {
          saleorId: productVariant.id,
          sku: productVariant.sku,
          name: productVariant.name,
          image: productVariant.product.media?.[0]?.url ?? "",
          productId: productVariant.product.id,
          productName: productVariant.product.name,
          productSlug: productVariant.product.slug,
          channels: productVariant.channelListings?.map((cl) => cl.channel.slug) || [],
        },
      });

      if (createProductResponse?.ok) {
        return {
          createdCmsId: createProductResponse.data.id,
        };
      } else {
        return {
          error: createProductResponse?.error,
        };
      }
    } catch (error) {
      logger.error("Error creating item", { error });

      return {
        error: "Error creating item.",
      };
    }
  }
};

interface CmsClientBatchOperationResult {
  createdCmsIds?: string[];
  deletedCmsIds?: string[];
  error?: string;
}

export const executeCmsClientBatchOperation = async ({
  cmsClient,
  productsVariants,
}: {
  cmsClient: CmsClientBatchOperations;
  productsVariants: WebhookProductVariantFragment[];
}): Promise<CmsClientBatchOperationResult | undefined> => {
  const logger = pinoLogger.child({ cmsClient });
  logger.debug("Execute CMS client operation called");
  logger.debug({ operations: cmsClient.operations });

  if (cmsClient.operationType === "createBatchProducts") {
    const productsVariansToCreate = productsVariants.reduce<WebhookProductVariantFragment[]>(
      (productsVariansToCreate, productVariant) => {
        const cmsId = getCmsIdFromSaleorItem(productVariant, cmsClient.cmsProviderInstanceId);

        if (!cmsId) {
          return [...productsVariansToCreate, productVariant];
        }

        return productsVariansToCreate;
      },
      [] as WebhookProductVariantFragment[]
    );

    if (productsVariansToCreate.length) {
      logger.debug("CMS creating batch items called");

      try {
        const createBatchProductsResponse = await cmsClient.operations.createBatchProducts({
          input: productsVariansToCreate.map((productVariant) => ({
            saleorId: productVariant.id,
            sku: productVariant.sku,
            name: productVariant.name,
            image: productVariant.product.media?.[0]?.url ?? "",
            productId: productVariant.product.id,
            productName: productVariant.product.name,
            productSlug: productVariant.product.slug,
            channels: productVariant.channelListings?.map((cl) => cl.channel.slug) || [],
          })),
        });

        return {
          createdCmsIds:
            createBatchProductsResponse
              ?.filter((item) => item.ok && "data" in item)
              .map((item) => (item as ProductResponseSuccess).data.id) || [],
        };
      } catch (error) {
        logger.error("Error creating batch items");
        logger.error({ error });

        return {
          error: "Error creating batch items.",
        };
      }
    }
  }

  if (cmsClient.operationType === "deleteBatchProducts") {
    const CMSIdsToRemove = productsVariants.reduce((CMSIdsToRemove, productVariant) => {
      const cmsId = getCmsIdFromSaleorItem(productVariant, cmsClient.cmsProviderInstanceId);

      const hasOther = true; // verifyIfHasOtherCMSIds(productVariant, cmsClient.cmsProviderInstanceId);

      if (cmsId && !hasOther) {
        return [...CMSIdsToRemove, cmsId];
      }

      return CMSIdsToRemove;
    }, [] as string[]);

    if (CMSIdsToRemove.length) {
      logger.debug("CMS removing batch items called");

      try {
        const deleteBatchProductsResponse = await cmsClient.operations.deleteBatchProducts({
          ids: CMSIdsToRemove,
        });

        return {
          deletedCmsIds:
            deleteBatchProductsResponse
              ?.filter((item) => item.ok && "data" in item)
              .map((item) => (item as ProductResponseSuccess).data.id) || [],
        };
      } catch (error) {
        logger.error("Error removing batch items");
        logger.error({ error });

        return {
          error: "Error removing batch items.",
        };
      }
    }
  }
};

export const executeCmsOperations = async ({
  cmsOperations,
  productVariant,
}: {
  cmsOperations: CmsClientOperations[];
  productVariant: Exclude<
    ProductVariantUpdatedWebhookPayloadFragment["productVariant"],
    undefined | null
  >;
}) => {
  const cmsProviderInstanceProductVariantIdsToCreate: Record<string, string> = {};
  const cmsProviderInstanceProductVariantIdsToDelete: Record<string, string> = {};
  const cmsErrors: string[] = [];

  await Promise.all(
    cmsOperations.map(async (cmsClient) => {
      const { createdCmsId, deletedCmsId, error } =
        (await executeCmsClientOperation({
          cmsClient,
          productVariant,
        })) || {};

      if (createdCmsId) {
        cmsProviderInstanceProductVariantIdsToCreate[cmsClient.cmsProviderInstanceId] =
          createdCmsId;
      }
      if (deletedCmsId) {
        cmsProviderInstanceProductVariantIdsToDelete[cmsClient.cmsProviderInstanceId] =
          deletedCmsId;
      }
      if (error) {
        cmsErrors.push(error);
      }
    })
  );

  return {
    cmsProviderInstanceProductVariantIdsToCreate,
    cmsProviderInstanceProductVariantIdsToDelete,
    cmsErrors,
  };
};
