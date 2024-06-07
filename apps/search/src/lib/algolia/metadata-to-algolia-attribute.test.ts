import { describe, expect, it } from "vitest";
import { metadataToAlgoliaAttribute } from "./metadata-to-algolia-attribute";

describe("metadataToAlgoliaAttribute", () => {
  it("Maps string attribute", () => {
    expect(
      metadataToAlgoliaAttribute([
        {
          key: "foo",
          value: "bar",
        },
        {
          key: "foobar",
          value: "baz",
        },
      ]),
    ).toEqual({
      foo: "bar",
      foobar: "baz",
    });
  });

  it("Maps json attribute to nested json", () => {
    expect(
      metadataToAlgoliaAttribute([
        {
          key: "foo",
          value: `{"bar": "baz"}`,
        },
        {
          key: "foobar",
          value: `["a", "b", "c"]`,
        },
      ]),
    ).toEqual({
      foo: {
        bar: "baz",
      },
      foobar: ["a", "b", "c"],
    });
  });

  it("Maps invalid json attribute to string", () => {
    const invalidJson = `{"bar": "baz"`;

    expect(metadataToAlgoliaAttribute([{ key: "invalidJson", value: invalidJson }])).toEqual({
      invalidJson: `{"bar": "baz"`,
    });
  });

  it("Maps empty value", () => {
    expect(
      metadataToAlgoliaAttribute([
        {
          key: "foo",
          value: "",
        },
      ]),
    ).toEqual({
      foo: null,
    });
  });
});
