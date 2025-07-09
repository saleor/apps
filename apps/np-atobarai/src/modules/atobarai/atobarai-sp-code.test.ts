import { describe, expect, it } from "vitest";

import { AtobaraiSpCode, createAtobaraiSpCode } from "./atobarai-sp-code";

describe("createAtobaraiSpCode", () => {
  it("should create a valid AtobaraiSpCode from a non-empty string", () => {
    const result = createAtobaraiSpCode("SP_CODE");

    expect(result).toBe("SP_CODE");
  });

  it("should throw ZodError when input is an empty string", () => {
    expect(() => createAtobaraiSpCode("")).toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "code": "too_small",
          "minimum": 1,
          "type": "string",
          "inclusive": true,
          "exact": false,
          "message": "String must contain at least 1 character(s)",
          "path": []
        }
      ]]
    `);
  });

  it("shouldn't be assignable without createAtobaraiSpCode", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiSpCode = "";

    expect(testValue).toBe("");
  });
});
