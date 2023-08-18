import { createLogger } from "@saleor/apps-shared";
import { z } from "zod";
import { WebhookProductVariantFragment } from "../../../../generated/graphql";

import { PayloadCmsProviderConfig } from "@/modules/configuration/schemas/payloadcms-provider.schema";
import * as Sentry from "@sentry/nextjs";
import { FieldsMapper } from "../fields-mapper";

import qs from "qs";

type Context = {
  configuration: PayloadCmsProviderConfig.FullShape;
  variant: WebhookProductVariantFragment;
};

export class DatoCMSClient {
  private logger = createLogger({ name: "PayloadCMSClient" });

  private mapVariantToPayloadFields({ configuration, variant }: Context) {
    const fields = FieldsMapper.mapProductVariantToConfigurationFields({
      variant,
      configMapping: configuration.productVariantFieldsMapping,
    });

    // todo check if it workds, especially json type
    return fields;
  }

  getItemBySaleorVariantId({
    collectionName,
    variantID,
    variantIdFieldName,
    apiUrl,
  }: {
    variantIdFieldName: string;
    variantID: string;
    collectionName: string;
    apiUrl: string;
  }) {
    const queryString = qs.stringify(
      {
        where: {
          [variantIdFieldName]: variantID,
        },
      },
      {
        addQueryPrefix: true,
      },
    );

    return fetch(`${apiUrl}/${collectionName}${queryString}`).then((r) => r.json());
  }

  async deleteProductVariant({ configuration, variant }: Context) {
    this.logger.debug("Trying to delete product variant");

    const remoteProducts = await this.getItemBySaleorVariantId({
      variantIdFieldName: configuration.productVariantFieldsMapping.variantId,
      variantID: variant.id,
      collectionName: configuration.collectionName,
      apiUrl: configuration.payloadApiUrl,
    });

    console.log(remoteProducts);

    if (remoteProducts.length > 1) {
      this.logger.warn(
        "More than 1 variant with the same ID found in the CMS. Will remove all of them, but this should not happen if unique field was set",
      );
    }

    if (remoteProducts.length === 0) {
      this.logger.trace("No product found in Datocms, skipping deletion");

      return;
    }

    return Promise.all(
      remoteProducts.map((p) => {
        return this.client.items.rawDestroy(p.id);
      }),
    );
  }

  uploadProductVariant(context: Context) {
    this.logger.debug("Trying to upload product variant");

    return this.client.items.create(this.mapVariantToDatoCMSFields(context));
  }

  async updateProductVariant({ configuration, variant }: Context) {
    const products = await this.getItemBySaleorVariantId({
      variantIdFieldName: configuration.productVariantFieldsMapping.variantId,
      variantID: variant.id,
      contentType: configuration.itemType,
    });

    if (products.length > 1) {
      this.logger.warn(
        "Found more than one product variant with the same ID. Will update all of them, but this should not happen if unique field was set",
        {
          variantID: variant.id,
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
