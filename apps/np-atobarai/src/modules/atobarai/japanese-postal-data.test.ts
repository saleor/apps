import { beforeEach, describe, expect, it, vi } from "vitest";

import { JapanesePostalData } from "./japanese-postal-data";

// Mock the jp-postal module
vi.mock("jp-postal", () => ({
  default: {
    "100-0001": {
      東京都: ["千代田区", "千代田"],
    },
    "060-0000": {
      北海道: ["札幌市中央区"],
    },
    "900-0000": {
      沖縄県: ["那覇市"],
    },
    "000-0000": {},
    "111-1111": {
      愛知県: ["名古屋市"],
      岐阜県: ["岐阜市"],
    },
  },
}));

describe("JapanesePostalData", () => {
  let japanesePostalData: JapanesePostalData;

  beforeEach(() => {
    japanesePostalData = new JapanesePostalData();
  });

  describe("resolve", () => {
    it("should return prefecture and regions for valid postal code", () => {
      const result = japanesePostalData.resolve("100-0001");

      expect(result).toStrictEqual({
        prefecture: "東京都",
        regions: ["千代田区", "千代田"],
      });
    });

    it("should return prefecture and single region", () => {
      const result = japanesePostalData.resolve("060-0000");

      expect(result).toStrictEqual({
        prefecture: "北海道",
        regions: ["札幌市中央区"],
      });
    });

    it("should return null when postal code is not found", () => {
      const result = japanesePostalData.resolve("999-9999");

      expect(result).toBeNull();
    });

    it("should return null when postal code has no prefectures", () => {
      const result = japanesePostalData.resolve("000-0000");

      expect(result).toBeNull();
    });

    it("should return null when postal code has multiple prefectures", () => {
      const result = japanesePostalData.resolve("111-1111");

      expect(result).toBeNull();
    });

    it("should handle different postal code formats", () => {
      const result = japanesePostalData.resolve("900-0000");

      expect(result).toStrictEqual({
        prefecture: "沖縄県",
        regions: ["那覇市"],
      });
    });
  });
});
