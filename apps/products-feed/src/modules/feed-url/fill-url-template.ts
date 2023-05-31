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
    .replace("{productId}", encodeURIComponent(productId))
    .replace("{productSlug}", encodeURIComponent(productSlug))
    .replace("{variantId}", encodeURIComponent(variantId));
