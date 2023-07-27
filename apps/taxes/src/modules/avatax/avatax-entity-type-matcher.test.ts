import { AvataxClient } from "./avatax-client";
import { AvataxEntityTypeMatcher } from "./avatax-entity-type-matcher";
import { describe, expect, it, vi } from "vitest";

const mockGetEntityUseCode = vi.fn();

describe("AvataxEntityTypeMatcher", () => {
  it("returns empty string when no entity code", async () => {
    const mockAvataxClient = {
      getEntityUseCode: mockGetEntityUseCode.mockReturnValue(
        Promise.resolve({ value: [{ code: "entityCode" }] })
      ),
    } as any as AvataxClient;

    const matcher = new AvataxEntityTypeMatcher({ client: mockAvataxClient });
    const result = await matcher.match(null);

    expect(result).toBe("");
  });
  it("returns empty string when entity code is present in metadata but not in avatax", async () => {
    const mockAvataxClient = {
      getEntityUseCode: mockGetEntityUseCode.mockReturnValue(Promise.resolve({})),
    } as any as AvataxClient;

    const matcher = new AvataxEntityTypeMatcher({ client: mockAvataxClient });

    const result = await matcher.match("entityCode");

    expect(result).toBe("");
  });
  it("returns entity code when entity code is present in metadata and in avatax", async () => {
    const mockAvataxClient = {
      getEntityUseCode: mockGetEntityUseCode.mockReturnValue(
        Promise.resolve({ value: [{ code: "entityCode" }] })
      ),
    } as any as AvataxClient;

    const matcher = new AvataxEntityTypeMatcher({ client: mockAvataxClient });

    const result = await matcher.match("entityCode");

    expect(result).toBe("entityCode");
  });
});
