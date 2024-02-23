import { AvataxClient } from "./avatax-client";
import { AvataxEntityTypeMatcher } from "./avatax-entity-type-matcher";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ok, okAsync, ResultAsync } from "neverthrow";

describe("AvataxEntityTypeMatcher", () => {
  const mockGetEntityUseCode = vi.fn();

  const mockAvataxClient: Pick<AvataxClient, "getEntityUseCode"> = {
    getEntityUseCode: mockGetEntityUseCode,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns empty string when no entity code", async () => {
    mockGetEntityUseCode.mockReturnValue(okAsync({ value: [{ code: "entityCode" }] }));

    const matcher = new AvataxEntityTypeMatcher({ client: mockAvataxClient as AvataxClient });
    const result = await matcher.match(null);

    expect(result._unsafeUnwrap()).toBe("");
  });

  it("returns empty string when entity code is present in metadata but not in avatax", async () => {
    mockGetEntityUseCode.mockReturnValue(okAsync({}));

    const matcher = new AvataxEntityTypeMatcher({ client: mockAvataxClient as AvataxClient });

    const result = await matcher.match("entityCode");

    expect(result._unsafeUnwrap()).toBe("");
  });

  it("returns entity code when entity code is present in metadata and in avatax", async () => {
    mockGetEntityUseCode.mockReturnValue(okAsync({ value: [{ code: "entityCode" }] }));

    const matcher = new AvataxEntityTypeMatcher({ client: mockAvataxClient as AvataxClient });

    const result = await matcher.match("entityCode");

    expect(result._unsafeUnwrap()).toBe("entityCode");
  });
});
