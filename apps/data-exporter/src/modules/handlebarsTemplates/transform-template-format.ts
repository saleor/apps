interface transformTemplateFormatArgs {
  template: string;
}

/*
 * Transform simple templates to handlebars format.
 * Example: `{productID}` will be transformed to `{{ variant. product.id}}`.
 */
export const transformTemplateFormat = ({ template }: transformTemplateFormatArgs) =>
  template
    .replace("{productId}", "{{ variant.product.id }}")
    .replace("{productSlug}", "{{ variant.product.slug }}")
    .replace("{productName}", "{{ variant.product.name }}")
    .replace("{variantId}", "{{ variant.id }}")
    .replace("{variantName}", "{{ variant.name }}");
