import { describe, expect, it } from "vitest";
import { renderHandlebarsTemplate } from "./render-handlebars-template";

describe("renderHandlebarsTemplate", () => {
  it("Returns formatted string, when valid template and data are provided", () => {
    expect(
      renderHandlebarsTemplate({
        data: { name: "John", hobby: "fishing" },
        template: "Hello, my name is {{ name }}. My hobby is {{ hobby }}.",
      })
    ).toStrictEqual("Hello, my name is John. My hobby is fishing.");
  });
  it("Throws an error, when provided template is not valid", () => {
    expect(() =>
      renderHandlebarsTemplate({
        data: { name: "John", hobby: "fishing" },
        template: "Hello, my name is {{ name }}. My hobby is {{ hobby", // no closing brackets to trigger an error
      })
    ).toThrowError("Could not render the template");
  });
});
