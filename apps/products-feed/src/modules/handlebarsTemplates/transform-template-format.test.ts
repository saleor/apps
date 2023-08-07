import { describe, expect, it } from "vitest";
import { transformTemplateFormat } from "./transform-template-format";

describe("templateTransformer", () => {
  it("Returns unchanged string, when no v1 tags are found", () => {
    const template = "No changes, {unknownTag}";

    expect(transformTemplateFormat({ template })).toBe(template);
  });
  it("Transforms tags to handlebars format, when template contain any", () => {
    const oldTemplate = "Test: {productId} {productName} {productSlug} {variantId} {variantName}";
    const handlebarsTemplate =
      "Test: {{ variant.product.id }} {{ variant.product.name }} {{ variant.product.slug }} {{ variant.id }} {{ variant.name }}";

    expect(transformTemplateFormat({ template: oldTemplate })).toBe(handlebarsTemplate);
  });
});
