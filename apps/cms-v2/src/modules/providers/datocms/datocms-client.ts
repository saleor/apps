import { buildClient, Client, SimpleSchemaTypes, ApiError } from "@datocms/cma-client-browser";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";
import { createLogger } from "@/logger";
import { z } from "zod";

import * as Sentry from "@sentry/nextjs";
import { DatocmsProviderConfig } from "@/modules/configuration/schemas/datocms-provider.schema";
import { FieldsMapper } from "../fields-mapper";
import { log } from "console";

type Context = {
  configuration: DatocmsProviderConfig.FullShape;
  variant: WebhookProductVariantFragment;
};

/*
 * todo error handling
 */
export class DatoCMSClient {
  private client: Client;

  constructor(opts: { apiToken: string }) {
    this.client = buildClient({ apiToken: opts.apiToken });
  }

  getContentTypes() {
    return this.client.itemTypes.list();
  }

  getFieldsForContentType({ itemTypeID }: { itemTypeID: string }) {
    return this.client.fields.list({ type: "item_type", id: itemTypeID });
  }

  private getItemBySaleorVariantId({
    variantIdFieldName: variantFieldName,
    variantID,
    contentType,
  }: {
    variantIdFieldName: string;
    variantID: string;
    contentType: string;
  }) {
    return this.client.items.list({
      filter: {
        type: contentType,
        fields: {
          [variantFieldName]: {
            eq: variantID,
          },
        },
      },
    });
  }

  private mapVariantToDatoCMSFields({
    configuration,
    variant,
  }: Context): SimpleSchemaTypes.ItemCreateSchema {
    const fields = FieldsMapper.mapProductVariantToConfigurationFields({
      variant,
      configMapping: configuration.productVariantFieldsMapping,
    });

    /**
     * Dato requires JSON to be stringified first so overwrite this single fields
     */
    fields[configuration.productVariantFieldsMapping.channels] = JSON.stringify(
      variant.channelListings,
    );

    return {
      item_type: { type: "item_type", id: configuration.itemType },
      ...fields,
    };
  }

  async deleteProductVariant({ configuration, variant }: Context) {
    const logger = createLogger("DatoCMSClient.deleteProductVariant", {
      variantId: variant.id,
      productId: variant.product.id,
      configId: configuration.id,
    });

    logger.debug("Calling delete product variant");

    const remoteProducts = await this.getItemBySaleorVariantId({
      variantIdFieldName: configuration.productVariantFieldsMapping.variantId,
      variantID: variant.id,
      contentType: configuration.itemType,
    });

    if (remoteProducts.length > 1) {
      logger.debug(
        "More than 1 variant with the same ID found in the CMS. Will remove all of them, but this should not happen if unique field was set",
        {
          remoteProducts: remoteProducts.map((p) => p.id),
        },
      );
    }

    if (remoteProducts.length === 0) {
      logger.info("No product found in Datocms, skipping deletion");

      return;
    }

    logger.debug("Deleting product variant", { remoteProducts: remoteProducts.map((p) => p.id) });

    return Promise.all(
      remoteProducts.map((p) => {
        return this.client.items.rawDestroy(p.id);
      }),
    );
  }

  async uploadProductVariant(context: Context) {
    const logger = createLogger("DatoCMSClient.uploadProductVariant", {
      variantId: context.variant.id,
      productId: context.variant.product.id,
      fieldMappping: context.configuration.productVariantFieldsMapping,
      configId: context.configuration.id,
    });

    logger.debug("Calling upload product variant");

    const result = await this.client.items.create(this.mapVariantToDatoCMSFields(context));

    logger.info("Uploaded product variant", { datoID: result.id });

    return result;
  }

  async updateProductVariant({ configuration, variant }: Context) {
    const logger = createLogger("DatoCMSClient.updateProductVariant", {
      variantId: variant.id,
      productId: variant.product.id,
      configId: configuration.id,
    });

    logger.debug("Calling update product variant");

    const products = await this.getItemBySaleorVariantId({
      variantIdFieldName: configuration.productVariantFieldsMapping.variantId,
      variantID: variant.id,
      contentType: configuration.itemType,
    });

    if (products.length > 1) {
      logger.warn(
        "Found more than one product variant with the same ID. Will update all of them, but this should not happen if unique field was set",
        {
          productsIds: products.map((p) => p.id),
          variantID: variant.id,
        },
      );
    }

    return Promise.all(
      products.map((product) => {
        return this.client.items.update(
          product.id,
          this.mapVariantToDatoCMSFields({
            configuration,
            variant,
          }),
        );
      }),
    );
  }

  upsertProduct({ configuration, variant }: Context) {
    const logger = createLogger("DatoCMSClient.upsertProduct", {
      variantId: variant.id,
      productId: variant.product.id,
      configId: configuration.id,
    });

    logger.debug("Calling upsert product variant");

    const DatoErrorBody = z.object({
      data: z.array(
        z.object({
          validation: z.object({
            attributes: z.object({
              details: z.object({
                code: z.string(),
              }),
            }),
          }),
        }),
      ),
    });

    return this.uploadProductVariant({ configuration, variant }).catch((err: ApiError) => {
      try {
        const errorBody = DatoErrorBody.parse(err.response.body);

        const isUniqueIdError = errorBody.data.find(
          (d) => d.validation.attributes.details.code === "VALIDATION_UNIQUE",
        );

        if (isUniqueIdError) {
          logger.info("Found unique id error, will update the product", {
            error: isUniqueIdError,
            variantId: variant.product.id,
          });
          return this.updateProductVariant({ configuration, variant });
        } else {
          throw new Error(JSON.stringify(err.cause));
        }
      } catch (e) {
        logger.error("Invalid error shape from DatoCMS", { error: err });
        Sentry.captureException("Invalid error shape from DatoCMS", (c) => {
          return c.setExtra("error", err);
        });

        throw new Error(err.humanMessage ?? "DatoCMS error - can upload product variant");
      }
    });
  }
}
