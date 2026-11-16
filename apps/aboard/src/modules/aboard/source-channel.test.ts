import { describe, expect, it } from "vitest";

import { sourceChannel } from "./source-channel";

describe("sourceChannel", () => {
  it("scopes generated channels by source instance and currency", () => {
    const input = {
      name: "Product CSV Import",
      slug: "product-csv-import",
      sourceName: "products.csv",
      sourceInstanceId: "upload-1",
      currencyCode: "USD",
    };

    const first = sourceChannel(input);

    expect(first).toStrictEqual({
      name: "Product CSV Import: products.csv (USD)",
      slug: expect.stringMatching(/^product-csv-import-usd-[a-f0-9]{10}$/),
      currencyCode: "USD",
    });
    expect(sourceChannel({ ...input, currencyCode: "EUR" }).slug).not.toBe(first.slug);
    expect(sourceChannel({ ...input, sourceInstanceId: "upload-2" }).slug).not.toBe(first.slug);
  });
});
