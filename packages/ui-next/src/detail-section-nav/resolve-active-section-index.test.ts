import { describe, expect, it } from "vitest";

import { resolveActiveSectionIndex } from "./resolve-active-section-index";

describe("resolveActiveSectionIndex", () => {
  it("returns -1 when there are no sections", () => {
    expect(resolveActiveSectionIndex({ sectionTops: [], markerY: 100, nearBottom: false })).toBe(
      -1,
    );
  });

  it("keeps the first section while its top is still below the marker", () => {
    expect(
      resolveActiveSectionIndex({ sectionTops: [120, 400, 800], markerY: 100, nearBottom: false }),
    ).toBe(0);
  });

  it("advances to the last section whose top has crossed the marker", () => {
    expect(
      resolveActiveSectionIndex({ sectionTops: [40, 90, 400], markerY: 100, nearBottom: false }),
    ).toBe(1);
  });

  it("selects the last section when scrolled to the bottom", () => {
    expect(
      resolveActiveSectionIndex({ sectionTops: [40, 90, 400], markerY: 100, nearBottom: true }),
    ).toBe(2);
  });
});
