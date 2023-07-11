import { buildClient, Client } from "@datocms/cma-client-browser";
import { DatocmsProviderConfigType } from "../configuration/schemas/datocms-provider.schema";
import { WebhookProductVariantFragment } from "../../../generated/graphql";

type Context = {
  configuration: DatocmsProviderConfigType;
  variant: WebhookProductVariantFragment;
};

/*
 * todo error handling
 * todo maybe shared operations between clients can be used
 */
export class DatoCMSClientBrowser {
  private client: Client;

  constructor(opts: { apiToken: string }) {
    this.client = buildClient({ apiToken: opts.apiToken });
  }

  uploadProduct({ configuration, variant }: Context) {
    // todo shared mapper between providers
    const fieldsMap = configuration.productVariantFieldsMapping;

    return this.client.items.create({
      item_type: { type: "item_type", id: configuration.itemType },
      // todo rename to variantNAme
      [fieldsMap.name]: variant.name,
      [fieldsMap.productId]: variant.product.id,
      [fieldsMap.productName]: variant.product.name,
      [fieldsMap.productSlug]: variant.product.slug,
      [fieldsMap.variantId]: variant.id,
      [fieldsMap.channels]: JSON.stringify(variant.channelListings),
    });
  }

  async updateProduct({ configuration, variant }: Context) {
    const products = await this.getItemBySaleorVariantId({
      variantFieldName: configuration.productVariantFieldsMapping.variantId, // todo rename to variantName
      variantID: variant.id,
      contentType: configuration.itemType,
    });

    const product = products[0]; // todo throw otherwise

    // todo shared mapper between providers
    const fieldsMap = configuration.productVariantFieldsMapping;

    this.client.items.update(product.id, {
      item_type: { type: "item_type", id: configuration.itemType },
      // todo rename to variantNAme
      [fieldsMap.name]: variant.name,
      [fieldsMap.productId]: variant.product.id,
      [fieldsMap.productName]: variant.product.name,
      [fieldsMap.productSlug]: variant.product.slug,
      [fieldsMap.variantId]: variant.id,
      [fieldsMap.channels]: JSON.stringify(variant.channelListings),
    });
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

  upsertProduct({ configuration, variant }: Context) {
    return this.uploadProduct({ configuration, variant }).catch((err) => {
      const isUniqueIdError = err.response.body.data.find(
        (validation: any) => validation.attributes.details.code === "VALIDATION_UNIQUE"
      ); // todo parse error with zod

      if (isUniqueIdError) {
        return this.updateProduct({ configuration, variant });
      } else {
        throw new Error(err);
      }
    });
  }
}

// todo docs & description - dato must have unique Variant ID field
