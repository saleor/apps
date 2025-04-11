import { describe, expect, it } from "vitest";

import { renderHandlebarsTemplate } from "./render-handlebars-template";

describe("renderHandlebarsTemplate", () => {
  it("Returns formatted string, when valid template and data are provided", () => {
    expect(
      renderHandlebarsTemplate({
        data: { name: "John", hobby: "fishing" },
        template: "Hello, my name is {{ name }}. My hobby is {{ hobby }}.",
      }),
    ).toStrictEqual("Hello, my name is John. My hobby is fishing.");
  });

  it("Supports handlebars-helpers functions like lowercase", () => {
    expect(
      renderHandlebarsTemplate({
        data: { productName: "AWESOME PRODUCT" },
        template: "Check out our {{ lowercase productName }}!",
      }),
    ).toStrictEqual("Check out our awesome product!");
  });

  it("Supports handlebars-helpers uppercase function for brand emphasis", () => {
    expect(
      renderHandlebarsTemplate({
        data: { brand: "nike" },
        template: "{{ uppercase brand }} products on sale!",
      }),
    ).toStrictEqual("NIKE products on sale!");
  });

  it("Supports handlebars-helpers truncate function for description snippets", () => {
    expect(
      renderHandlebarsTemplate({
        data: {
          description:
            "This is a very long product description that needs to be shortened for display purposes",
        },
        template: "{{ truncate description 20 }}",
      }),
    ).toStrictEqual("This is a very long ");
  });

  it("Supports handlebars-helpers conditional statements", () => {
    expect(
      renderHandlebarsTemplate({
        data: { price: 99.99, salePrice: 79.99 },
        template: "{{#if (lt salePrice price)}}ON SALE!{{else}}Regular Price{{/if}}",
      }),
    ).toStrictEqual("ON SALE!");
  });

  it("Throws an error, when provided template is not valid", () => {
    expect(() =>
      renderHandlebarsTemplate({
        data: { name: "John", hobby: "fishing" },
        template: "Hello, my name is {{ name }}. My hobby is {{ hobby", // no closing brackets to trigger an error
      }),
    ).toThrowError("Could not render the template");
  });
});
