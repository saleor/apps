import { beforeEach, describe, expect, it } from "vitest";

import { JapanesePostalData } from "./japanese-postal-data";

describe("JapanesePostalData", () => {
  let japanesePostalData: JapanesePostalData;

  beforeEach(() => {
    japanesePostalData = new JapanesePostalData();
  });

  describe("getNeighbourhoods", () => {
    it("should return neighbourhood data for Tokyo Chiyoda postal code", () => {
      const result = japanesePostalData.getNeighbourhood("1000001");

      expect(result).toBeDefined();
      expect(result?.code).toBe("1000001");
      expect(result?.name).toBe("千代田");
      expect(result?.city.code).toBe("13101");
      expect(result?.city.name).toBe("千代田区");
      expect(result?.pref.code).toBe("13");
      expect(result?.pref.name).toBe("東京都");
    });

    it("should return neighbourhood data for Tokyo Chiyoda postal code - with dash format", () => {
      const result = japanesePostalData.getNeighbourhood("100-0001");

      expect(result).toBeDefined();
      expect(result?.code).toBe("1000001");
      expect(result?.name).toBe("千代田");
      expect(result?.city.code).toBe("13101");
      expect(result?.city.name).toBe("千代田区");
      expect(result?.pref.code).toBe("13");
      expect(result?.pref.name).toBe("東京都");
    });

    it("should return neighbourhood data for Hokkaido Sapporo postal code", () => {
      const result = japanesePostalData.getNeighbourhood("0600000");

      expect(result).toBeDefined();
      expect(result?.code).toBe("0600000");
      expect(result?.name).toBe("");
      expect(result?.city.code).toBe("01101");
      expect(result?.city.name).toBe("札幌市中央区");
      expect(result?.pref.code).toBe("01");
      expect(result?.pref.name).toBe("北海道");
    });

    it("should return neighbourhood data for Tokyo Shinjuku postal code", () => {
      const result = japanesePostalData.getNeighbourhood("1600023");

      expect(result).toBeDefined();
      expect(result?.code).toBe("1600023");
      expect(result?.pref.name).toBe("東京都");
      expect(result?.city.name).toBe("新宿区");
    });

    it("should return undefined for non-existent postal code", () => {
      const result = japanesePostalData.getNeighbourhood("0000000");

      expect(result).toBeUndefined();
    });

    it("should return complete structure for Kyoto postal code", () => {
      const result = japanesePostalData.getNeighbourhood("6000000");

      expect(result).toBeDefined();
      expect(result?.code).toBe("6000000");
      expect(result?.pref.name).toBe("京都府");
      expect(result?.city.name).toBe("京都市下京区");
    });
  });
});
