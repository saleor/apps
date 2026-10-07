import { describe, expect, it } from "vitest";

import { DEPRECATION_REASON } from "./deprecation-reason";

describe("DEPRECATION_REASON", () => {
  /* Saleor truncates past this, which would silently cut the migration instructions short. */
  it("Keeps the reason within the length Saleor stores", () => {
    expect(DEPRECATION_REASON.length).toBeLessThanOrEqual(2048);
  });
});
