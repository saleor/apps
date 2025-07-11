import { describe, expect, it } from "vitest";

import { BaseError } from "./base-error";

describe("BaseError", () => {
  it("Can be extended", () => {
    const SubError = BaseError.subclass("SubError", {});

    const error = new SubError("test");

    expect(error).toBeInstanceOf(SubError);
    expect(error).toBeInstanceOf(BaseError);
  });

  it("Serializes without stack trace", () => {
    const SubError = BaseError.subclass("SubError", {});

    const fn = () => {
      throw new SubError("test");
    };

    try {
      fn();
    } catch (e) {
      expect((e as Error).stack).toBeDefined();

      expect(e).toMatchInlineSnapshot(`[SubError: test]`);
      expect(JSON.stringify(e)).toMatchInlineSnapshot(`"{"name":"SubError","message":"test"}"`);
    }
  });
});
