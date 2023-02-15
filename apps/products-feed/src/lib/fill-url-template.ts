interface FillUrlTemplateArgs {
  urlTemplate: string;
  productId: string;
  productSlug: string;
  variantId: string;
}

export const fillUrlTemplate = ({
  urlTemplate,
  productId,
  productSlug,
  variantId,
}: FillUrlTemplateArgs) =>
  urlTemplate
    .replace("{productId}", productId)
    .replace("{productSlug}", productSlug)
    .replace("{variantId}", variantId);
