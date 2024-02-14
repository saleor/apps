import { logUtils } from "./log-utils";
import { describe, expect, it } from "vitest";

describe("logUtils", () => {
  describe("unshiftItemToLimitedArray", () => {
    it("should unshift item to empty array", () => {
      const array: string[] = [];
      const item = "item";
      const limit = 5;
      const result = logUtils.unshiftItemToLimitedArray(array, item, limit);

      expect(result).toEqual([item]);
    });
    it("should unshift item to array with less items than limit", () => {
      const array = ["item1", "item2"];
      const item = "item3";
      const limit = 5;
      const result = logUtils.unshiftItemToLimitedArray(array, item, limit);

      expect(result).toEqual(["item3", "item1", "item2"]);
    });
    it("should unshift item to array with equal items than limit", () => {
      const array = ["item1", "item2", "item3", "item4", "item5"];
      const item = "item6";
      const limit = 5;
      const result = logUtils.unshiftItemToLimitedArray(array, item, limit);

      expect(result).toEqual(["item6", "item1", "item2", "item3", "item4"]);
    });
    it("should throw error when initial array length is more than limit", () => {
      const array = ["item1", "item2", "item3", "item4", "item5", "item6"];
      const item = "item7";
      const limit = 5;

      expect(() => logUtils.unshiftItemToLimitedArray(array, item, limit)).toThrowError();
    });
  });
});
