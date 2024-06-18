import { buildClient, Client, SimpleSchemaTypes, ApiError } from "@datocms/cma-client-browser";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";
import { createLogger } from "@/logger";
import { z } from "zod";

import * as Sentry from "@sentry/nextjs";
import { DatocmsProviderConfig } from "@/modules/configuration/schemas/datocms-provider.schema";
import { FieldsMapper } from "../fields-mapper";

type Context = {
  configuration: DatocmsProviderConfig.FullShape;
  variant: WebhookProductVariantFragment;
};

/*
 * todo error handling
 */
export class DatoCMSClient {
  private client: Client;
  private logger = createLogger("DatoCMSClient");

  constructor(opts: { apiToken: string }) {
    this.client = buildClient({ apiToken: opts.apiToken });
  }

  getContentTypes() {
    this.logger.trace("Trying to get content types");

    return this.client.itemTypes.list();
  }

  getFieldsForContentType({ itemTypeID }: { itemTypeID: string }) {
    this.logger.trace("Trying to get fields for a content type");

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
    this.logger.trace("Trying to fetch item by Saleor variant ID", { variantID: variantID });

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
    this.logger.debug("deleteProductVariant called", {
      configId: configuration.id,
    });

    const remoteProducts = await this.getItemBySaleorVariantId({
      variantIdFieldName: configuration.productVariantFieldsMapping.variantId,
      variantID: variant.id,
      contentType: configuration.itemType,
    });

    if (remoteProducts.length > 1) {
      this.logger.warn(
        "More than 1 variant with the same ID found in the CMS. Will remove all of them, but this should not happen if unique field was set",
        {
          remoteProductsIds: remoteProducts.map((p) => p.id),
        },
      );
    }

    if (remoteProducts.length === 0) {
      this.logger.info("No product found in Datocms, skipping deletion");

      return;
    }

    this.logger.debug("Deleting product variant", {
      remoteProductsIds: remoteProducts.map((p) => p.id),
    });

    return Promise.all(
      remoteProducts.map((p) => {
        return this.client.items.rawDestroy(p.id);
      }),
    );
  }

  uploadProductVariant(context: Context) {
    this.logger.debug("uploadProductVariant called", {
      fieldMappping: context.configuration.productVariantFieldsMapping,
      configId: context.configuration.id,
    });

    return this.client.items.create(this.mapVariantToDatoCMSFields(context));
  }

  async updateProductVariant({ configuration, variant }: Context) {
    this.logger.debug("updateProductVariant called", {
      configId: configuration.id,
    });

    const products = await this.getItemBySaleorVariantId({
      variantIdFieldName: configuration.productVariantFieldsMapping.variantId,
      variantID: variant.id,
      contentType: configuration.itemType,
    });

    if (products.length > 1) {
      this.logger.warn(
        "Found more than one product variant with the same ID. Will update all of them, but this should not happen if unique field was set",
        {
          variantId: variant.id,
          productsIds: products.map((p) => p.id),
        },
      );
    }

    return Promise.all(
      products.map((product) => {
        this.logger.trace("Trying to update variant", { datoID: product.id });

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
    this.logger.debug("upsertProduct called", {
      configId: configuration.id,
    });

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
          this.logger.info("Found unique id error, will update the product", {
            error: isUniqueIdError,
            variantId: variant.product.id,
          });
          return this.updateProductVariant({ configuration, variant });
        } else {
          throw new Error(JSON.stringify(err.cause));
        }
      } catch (e) {
        this.logger.error("Invalid error shape from DatoCMS", { error: err });
        Sentry.captureException("Invalid error shape from DatoCMS", (c) => {
          return c.setExtra("error", err);
        });

        throw new Error(err.humanMessage ?? "DatoCMS error - can upload product variant");
      }
    });
  }
}
