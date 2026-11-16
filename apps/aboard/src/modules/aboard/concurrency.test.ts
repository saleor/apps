import { describe, expect, it } from "vitest";

import { boundedMap } from "./concurrency";

describe("boundedMap", () => {
  it("preserves order without exceeding the concurrency limit", async () => {
    let active = 0;
    let peak = 0;
    const results = await boundedMap([1, 2, 3, 4, 5, 6], 2, async (value) => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 1));
      active -= 1;

      return value * 2;
    });

    expect(results).toStrictEqual([2, 4, 6, 8, 10, 12]);
    expect(peak).toBe(2);
  });
});
