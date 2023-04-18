import {
  ProductVariantUpdatedWebhookPayloadFragment,
  WebhookProductVariantFragment,
} from "../../../../generated/graphql";
import {
  BaseResponse,
  CmsClientBatchOperations,
  CmsClientOperations,
  ProductResponseSuccess,
} from "../types";
import { getCmsIdFromSaleorItem } from "./metadata";
import { logger as pinoLogger } from "../../logger";
import { CMSProvider, cmsProviders } from "../providers";
import { ProviderInstanceSchema, providersSchemaSet } from "../config";

export const pingProviderInstance = async (
  providerInstanceSettings: ProviderInstanceSchema
): Promise<BaseResponse> => {
  const logger = pinoLogger.child({ providerInstanceSettings });
  logger.debug("Ping provider instance called");

  const provider = cmsProviders[
    providerInstanceSettings.providerName as CMSProvider
  ] as (typeof cmsProviders)[keyof typeof cmsProviders];

  const validation =
    providersSchemaSet[providerInstanceSettings.providerName as CMSProvider].safeParse(
      providerInstanceSettings
    );

  if (!validation.success) {
    logger.error("The provider instance settings validation failed.", {
      error: validation.error.message,
    });

    return { ok: false };
  }

  const config = validation.data;

  const client = provider.create(config as any); // config without validation = providerInstanceSettings as any
  const pingResult = await client.ping();

  return pingResult;
};

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
  createdCmsIds?: ProductResponseSuccess["data"][];
  deletedCmsIds?: ProductResponseSuccess["data"][];
  error?: string;
}

export const executeCmsClientBatchOperation = async ({
  cmsClient,
  productsVariants,
  verifyIfProductVariantIsAvailableInOtherChannelEnabledForSelectedProviderInstance,
}: {
  cmsClient: CmsClientBatchOperations;
  productsVariants: WebhookProductVariantFragment[];
  /**
   * Lookup function with purposely long name like in Java Spring ORM to verify condition against unintended deletion of product variant from CMS.
   * On purpose passed as an argument, for inversion of control.
   */
  verifyIfProductVariantIsAvailableInOtherChannelEnabledForSelectedProviderInstance: (
    productVariant: WebhookProductVariantFragment
  ) => boolean;
}): Promise<CmsClientBatchOperationResult | undefined> => {
  const logger = pinoLogger.child({ cmsClient });
  logger.debug({ operations: cmsClient.operations }, "Execute CMS client operation called");

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
              .map((item) => (item as ProductResponseSuccess).data) || [],
        };
      } catch (error) {
        logger.error({ error }, "Error creating batch items");

        return {
          error: "Error creating batch items.",
        };
      }
    }
  }

  if (cmsClient.operationType === "deleteBatchProducts") {
    const CMSIdsToRemove = productsVariants.reduce((CMSIdsToRemove, productVariant) => {
      const cmsId = getCmsIdFromSaleorItem(productVariant, cmsClient.cmsProviderInstanceId);

      const productVariantIsAvailableInOtherChannelEnabledForSelectedProviderInstance =
        verifyIfProductVariantIsAvailableInOtherChannelEnabledForSelectedProviderInstance(
          productVariant
        );

      if (cmsId && !productVariantIsAvailableInOtherChannelEnabledForSelectedProviderInstance) {
        return [
          ...CMSIdsToRemove,
          {
            id: cmsId,
            saleorId: productVariant.id,
          },
        ];
      }

      return CMSIdsToRemove;
    }, [] as ProductResponseSuccess["data"][]);

    if (CMSIdsToRemove.length) {
      logger.debug("CMS removing batch items called");

      try {
        await cmsClient.operations.deleteBatchProducts({
          ids: CMSIdsToRemove.map((item) => item.id),
        });

        return {
          deletedCmsIds: CMSIdsToRemove,
        };
      } catch (error) {
        logger.error({ error }, "Error removing batch items");

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
