import { WebhookProductVariantFragment } from "../../../generated/graphql";
import { ProvidersConfig } from "../configuration";

export class FieldsMapper {
  static mapProductVariantToConfigurationFields({
    configMapping,
    variant,
  }: {
    variant: WebhookProductVariantFragment;
    configMapping: ProvidersConfig.AnyFullShape["productVariantFieldsMapping"];
  }) {
    const { channels, variantName, productId, productName, productSlug, variantId } = configMapping;

    return {
      [variantName]: variant.name,
      [productId]: variant.product.id,
      [productName]: variant.product.name,
      [productSlug]: variant.product.slug,
      [variantId]: variant.id,
      [channels]: variant.channelListings,
    };
  }
}
