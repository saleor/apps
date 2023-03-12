import { ProductVariantUpdatedWebhookPayloadFragment } from "../../../../generated/graphql";
import { CmsClientOperations } from "../types";
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
  productVariant: Exclude<
    ProductVariantUpdatedWebhookPayloadFragment["productVariant"],
    undefined | null
  >;
}): Promise<CmsClientOperationResult | undefined> => {
  const logger = pinoLogger.child({ cmsClient });
  logger.debug("Execute CMS client operation called");

  const cmsId = getCmsIdFromSaleorItem(productVariant, cmsClient.cmsProviderInstanceId);

  if (cmsId && cmsClient.operationType === "deleteProduct") {
    logger.debug("CMS deleting item called");
    logger.debug(cmsId);

    try {
      await cmsClient.operations.deleteProduct({
        id: cmsId,
      });
      return {
        deletedCmsId: cmsId,
      };
    } catch (error) {
      logger.error("Error deleting item");
      logger.error(error);

      return {
        error: "Error deleting item.",
      };
    }
  } else if (cmsId && cmsClient.operationType === "updateProduct") {
    logger.debug("CMS updating item called");
    logger.debug(cmsId);

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
      logger.error("Error updating item");
      logger.error(error);

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
      logger.error("Error creating item");
      logger.error(error);

      return {
        error: "Error creating item.",
      };
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
