import { buildClient, Client } from "@datocms/cma-client-node";
import { DatocmsProviderConfigType } from "../configuration/schemas/datocms-provider.schema";
import { WebhookProductVariantFragment } from "../../../generated/graphql";

export class DatoCMSClient {
  private client: Client;

  constructor(opts: { apiToken: string }) {
    this.client = buildClient({ apiToken: opts.apiToken });
  }

  getContentTypes() {
    return this.client.itemTypes.list(); // todo connect to frontend
  }

  uploadProduct({
    configuration,
    variant,
  }: {
    configuration: DatocmsProviderConfigType;
    variant: WebhookProductVariantFragment;
  }) {
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
}

// todo docs & description - dato must have unique Variant ID field
