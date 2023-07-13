import { buildClient, Client, SimpleSchemaTypes, ApiError } from "@datocms/cma-client-node";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";
import { DatocmsProviderConfig } from "../../configuration/schemas/datocms-provider.schema";
import { createLogger } from "@saleor/apps-shared";
import { z } from "zod";

import * as Sentry from "@sentry/nextjs";

type Context = {
  configuration: DatocmsProviderConfig.FullShape;
  variant: WebhookProductVariantFragment;
};

/*
 * todo error handling
 * todo share logic with browser client if possible (inject client)
 */
export class DatoCMSClient {
  private client: Client;
  private logger = createLogger({ name: "DatoCMSClient" });

  constructor(opts: { apiToken: string }) {
    this.client = buildClient({ apiToken: opts.apiToken });
  }

  getContentTypes() {
    this.logger.trace("Trying to get content types");

    return this.client.itemTypes.list(); // todo connect to frontend
  }

  getFieldsForContentType({ itemTypeID }: { itemTypeID: string }) {
    this.logger.trace("Trying to get fields for a content type");

    return this.client.fields.list({ type: "item_type", id: itemTypeID });
  }

  private getItemBySaleorVariantId({
    variantFieldName,
    variantID,
    contentType,
  }: {
    variantFieldName: string;
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
    const fieldsMap = configuration.productVariantFieldsMapping;

    return {
      item_type: { type: "item_type", id: configuration.itemType },
      // todo rename to variantNAme
      [fieldsMap.name]: variant.name,
      [fieldsMap.productId]: variant.product.id,
      [fieldsMap.productName]: variant.product.name,
      [fieldsMap.productSlug]: variant.product.slug,
      [fieldsMap.variantId]: variant.id,
      [fieldsMap.channels]: JSON.stringify(variant.channelListings),
    };
  }

  async deleteProductVariant({ configuration, variant }: Context) {
    this.logger.debug("Trying to delete product variant");

    const remoteProducts = await this.getItemBySaleorVariantId({
      variantFieldName: configuration.productVariantFieldsMapping.variantId, // todo rename to variantName
      variantID: variant.id,
      contentType: configuration.itemType,
    });

    if (remoteProducts.length > 1) {
      this.logger.warn(
        "More than 1 variant with the same ID found in the CMS. Will remove all of them, but this should not happen if unique field was set"
      );
    }

    if (remoteProducts.length === 0) {
      this.logger.trace("No product found in Datocms, skipping deletion");

      return;
    }

    return Promise.all(
      remoteProducts.map((p) => {
        return this.client.items.rawDestroy(p.id);
      })
    );
  }

  uploadProductVariant(context: Context) {
    this.logger.debug("Trying to upload product variant");

    return this.client.items.create(this.mapVariantToDatoCMSFields(context));
  }

  async updateProductVariant({ configuration, variant }: Context) {
    const products = await this.getItemBySaleorVariantId({
      variantFieldName: configuration.productVariantFieldsMapping.variantId, // todo rename to variantName
      variantID: variant.id,
      contentType: configuration.itemType,
    });

    if (products.length > 1) {
      this.logger.warn(
        "Found more than one product variant with the same ID. Will update all of them, but this should not happen if unique field was set",
        {
          variantID: variant.id,
        }
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
          })
        );
      })
    );
  }

  upsertProduct({ configuration, variant }: Context) {
    this.logger.debug("Trying to upsert product variant");

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
        })
      ),
    });

    return this.uploadProductVariant({ configuration, variant }).catch((err: ApiError) => {
      try {
        const errorBody = DatoErrorBody.parse(err.response.body);

        const isUniqueIdError = errorBody.data.find(
          (d) => d.validation.attributes.details.code === "VALIDATION_UNIQUE"
        );

        if (isUniqueIdError) {
          return this.updateProductVariant({ configuration, variant });
        } else {
          throw new Error(JSON.stringify(err.cause));
        }
      } catch (e) {
        Sentry.captureException("Invalid error shape from DatoCMS", (c) => {
          return c.setExtra("error", err);
        });

        throw new Error(err.humanMessage ?? "DatoCMS error - can upload product variant");
      }
    });
  }
}

// todo docs & description - dato must have unique Variant ID field
