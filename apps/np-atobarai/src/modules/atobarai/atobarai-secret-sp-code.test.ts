import { describe, expect, it } from "vitest";

import { AtobaraiSecretSpCode, createAtobaraiSecretSpCode } from "./atobarai-secret-sp-code";

describe("createAtobaraiSecretSpCode", () => {
  it("should create a valid AtobaraiSpCode from a non-empty string", () => {
    const result = createAtobaraiSecretSpCode("SP_CODE");

    expect(result).toBe("SP_CODE");
  });

  it("should throw validation error when input is an empty string", () => {
    expect(() => createAtobaraiSecretSpCode("")).toThrow(
      "Invalid secret SP code: String must contain at least 1 character(s)",
    );
  });

  it("shouldn't be assignable without createAtobaraiSecretSpCode", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiSecretSpCode = "";

    expect(testValue).toBe("");
  });
});
