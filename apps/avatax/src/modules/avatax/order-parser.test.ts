import { describe, expect, it } from "vitest";
import { AvataxAppOrderParser } from "./order-parser";
import { AvataxAppOrderFactory } from "./order-parser-factory";

describe("AvataxAppOrder", () => {
  it("should work for empty payload", () => {
    const payload = {};
    const result = AvataxAppOrderParser.parse(payload);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(AvataxAppOrderParser.ParsingError);
  });

  it("should work for empty order", () => {
    const payload = { order: {} };
    const result = AvataxAppOrderParser.parse(payload);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(AvataxAppOrderParser.ParsingError);
  });

  it("should work for empty channel", () => {
    const payload = { order: { channel: {} } };
    const result = AvataxAppOrderParser.parse(payload);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(AvataxAppOrderParser.ParsingError);
  });

  it("should work for empty tax config", () => {
    const payload = { order: { channel: { taxConfiguration: {} } } };
    const result = AvataxAppOrderParser.parse(payload);

    expect(result._unsafeUnwrapErr()).toBeInstanceOf(AvataxAppOrderParser.ParsingError);
  });

  it("should work for valid payload", () => {
    const result = AvataxAppOrderParser.parse(AvataxAppOrderFactory.payload);

    expect(result._unsafeUnwrap()).toEqual(AvataxAppOrderFactory.create());
  });
});
