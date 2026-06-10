import { describe, expect, it } from "vitest";

import {
  ANONYMIZED_METADATA_KEY,
  ANONYMIZED_METADATA_VALUE,
  chunkArray,
  isOrderAnonymized,
} from "./bulk-anonymize";

describe("isOrderAnonymized", () => {
  it("returns true when the anonymized flag is present", () => {
    expect(
      isOrderAnonymized([
        { key: "other", value: "x" },
        { key: ANONYMIZED_METADATA_KEY, value: ANONYMIZED_METADATA_VALUE },
      ]),
    ).toBe(true);
  });

  it("returns false when the flag is missing", () => {
    expect(isOrderAnonymized([{ key: "other", value: "x" }])).toBe(false);
    expect(isOrderAnonymized([])).toBe(false);
  });

  it("returns false when the key is present with a different value", () => {
    expect(isOrderAnonymized([{ key: ANONYMIZED_METADATA_KEY, value: "false" }])).toBe(false);
  });
});

describe("chunkArray", () => {
  it("splits items into consecutive batches of the given size", () => {
    expect(chunkArray([1, 2, 3, 4, 5], 2)).toStrictEqual([[1, 2], [3, 4], [5]]);
  });

  it("returns a single batch when size exceeds the item count", () => {
    expect(chunkArray([1, 2], 10)).toStrictEqual([[1, 2]]);
  });

  it("returns no batches for an empty list", () => {
    expect(chunkArray([], 3)).toStrictEqual([]);
  });
});
