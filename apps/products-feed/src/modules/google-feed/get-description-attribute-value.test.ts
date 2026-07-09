import { describe, expect, it } from "vitest";

import { getDescriptionAttributeValue } from "./get-description-attribute-value";

const editorJsDescription = JSON.stringify({
  time: 1,
  version: "2.24.3",
  blocks: [{ id: "1", type: "paragraph", data: { text: "Rich text description" } }],
});

describe("getDescriptionAttributeValue", () => {
  it("Returns SEO description when it is available", () => {
    expect(
      getDescriptionAttributeValue({
        description: editorJsDescription,
        seoDescription: "SEO description",
      }),
    ).toBe("SEO description");
  });

  it("Falls back to rendered rich-text description when SEO description is empty", () => {
    expect(
      getDescriptionAttributeValue({
        description: editorJsDescription,
        seoDescription: "",
      }),
    ).toBe("Rich text description");
  });

  it("Falls back to rendered rich-text description when SEO description is missing", () => {
    expect(
      getDescriptionAttributeValue({
        description: editorJsDescription,
        seoDescription: null,
      }),
    ).toBe("Rich text description");
  });

  it("Returns undefined when neither SEO nor rich-text description is available", () => {
    expect(
      getDescriptionAttributeValue({
        description: "",
        seoDescription: "",
      }),
    ).toBe(undefined);

    expect(getDescriptionAttributeValue({})).toBe(undefined);
  });
});
