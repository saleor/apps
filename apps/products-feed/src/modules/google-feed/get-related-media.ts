import { GoogleFeedProductVariantFragment, ProductMediaType } from "../../../generated/graphql";

type Media = {
  id: string;
  url: string;
  type: ProductMediaType;
};

interface getRelatedMediaArgs {
  productVariantId: string;
  productMedia: Media[];
  variantMediaMap: Record<string, Media[]>;
}

/*
 * Filters media related to the product variant and returns:
 * - thumbnailUrl: Product thumbnail (since Saleor has no dedicated field to the variant thumbnail)
 * - additionalImages: Url list of photos assigned to particular variant and product photos not associated with any other variant
 */
export const getRelatedMedia = ({
  productVariantId,
  variantMediaMap,
  productMedia,
}: getRelatedMediaArgs) => {
  // Saleor always uses the first photo as thumbnail - even if it's assigned to the variant
  const productThumbnailUrl = productMedia[0]?.url;

  const mediaAssignedToAnyVariant = Object.values(variantMediaMap).flat() || [];

  const mediaAssignedToNoVariant =
    productMedia?.filter((m) => !mediaAssignedToAnyVariant.find((vm) => vm.id === m.id)) || [];

  const mediaAssignedToVariant = variantMediaMap[productVariantId] || [];

  const additionalImages =
    [...mediaAssignedToVariant, ...mediaAssignedToNoVariant]
      ?.filter((media) => media.type === ProductMediaType.Image) // Videos are not supported by the field
      .map((media) => media.url)
      .filter((url) => url !== productThumbnailUrl) || []; // Exclude image used as thumbnail

  return {
    thumbnailUrl: productThumbnailUrl,
    additionalImages,
  };
};

interface GetVariantMediaMapArgs {
  variant: GoogleFeedProductVariantFragment;
}

export const getVariantMediaMap = ({ variant }: GetVariantMediaMapArgs) => {
  return (
    variant.product.variants?.reduce((accumulator: Record<string, Array<Media>>, currentValue) => {
      const id = currentValue?.id;

      if (!id) {
        return accumulator;
      }
      accumulator[id] = currentValue.media?.filter((m) => !!m) || [];
      return accumulator;
    }, {}) || {}
  );
};
