import { buildClient, Client } from "@datocms/cma-client-node";
import { DatocmsProviderConfigType } from "../configuration/schemas/datocms-provider.schema";
import { WebhookProductVariantFragment } from "../../../generated/graphql";

type Context = {
  configuration: DatocmsProviderConfigType;
  variant: WebhookProductVariantFragment;
};

// todo error handling
export class DatoCMSClient {
  private client: Client;

  constructor(opts: { apiToken: string }) {
    this.client = buildClient({ apiToken: opts.apiToken });
  }

  getContentTypes() {
    return this.client.itemTypes.list(); // todo connect to frontend
  }

  getFieldsForContentType({ itemTypeID }: { itemTypeID: string }) {
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

  async deleteProduct({ configuration, variant }: Context) {
    const product = await this.getItemBySaleorVariantId({
      variantFieldName: configuration.productVariantFieldsMapping.variantId, // todo rename to variantName
      variantID: variant.id,
      contentType: configuration.itemType,
    });

    if (product.length > 1) {
      // todo sentry, should be one
    }

    this.client.items.rawDestroy(product[0].id);
  }

  uploadProduct({ configuration, variant }: Context) {
    // todo shared mapper between providers
    const fieldsMap = configuration.productVariantFieldsMapping;

    this.client.items.create({
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
}

// todo docs & description - dato must have unique Variant ID field
