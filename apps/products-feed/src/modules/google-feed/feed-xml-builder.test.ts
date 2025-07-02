import { describe, it } from "vitest";

import { FeedXmlBuilder } from "./feed-xml-builder";

describe("FeedXmlBuilder", () => {
  it("Generates XML string from product", () => {
    const builder = new FeedXmlBuilder();

    const result = builder.buildItemsChunk([]);
  });
});
