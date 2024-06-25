import { describe, it, expect } from "vitest";
import { metadataToTypesenseAttribute } from "./metadata-to-typesense-attribute";

describe("metadataToTypesenseAttribute", () => {
  it("Maps string attribute", () => {
    expect(
      metadataToTypesenseAttribute([
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
      metadataToTypesenseAttribute([
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

    expect(metadataToTypesenseAttribute([{ key: "invalidJson", value: invalidJson }])).toEqual({
      invalidJson: `{"bar": "baz"`,
    });
  });

  it("Maps empty value", () => {
    expect(
      metadataToTypesenseAttribute([
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
