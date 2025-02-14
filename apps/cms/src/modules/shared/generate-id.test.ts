import { describe, expect, it } from "vitest";

import { generateId } from "./generate-id";

describe("generateId", () => {
  it("generates a string", () => {
    expect(typeof generateId() === "string").toBe(true);
  });
});
