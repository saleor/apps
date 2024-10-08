import { describe, expect, it } from "vitest";

import { bytesToKb } from "./bytes-to-kb";

describe("bytesToKb", () => {
  it("should convert bytes to kb", () => {
    expect(bytesToKb(1024)).toBe(1);
    expect(bytesToKb(2048)).toBe(2);
    expect(bytesToKb(3072)).toBe(3);
    expect(bytesToKb(34344443)).toBe(33539.5);
    expect(bytesToKb(43433434343)).toBe(42415463.23);
    expect(bytesToKb(3434334)).toBe(3353.84);
  });
});
