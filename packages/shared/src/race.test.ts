import { describe, expect, it } from "vitest";

import { race } from "./race";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("race", () => {
  it("throws error, if promise is not resolved before timeout", () => {
    const mockPromise = async () => {
      await wait(100);

      return "ok";
    };

    return expect(
      race({
        promise: mockPromise(),
        timeoutMilis: 50,
        error: new Error("timeout"),
      }),
    ).rejects.toThrowError("timeout");
  });

  it("returns result of successful promise, if it was faster than timeout", () => {
    const mockPromise = async () => {
      await wait(100);

      return "ok";
    };

    return expect(
      race({
        promise: mockPromise(),
        timeoutMilis: 200,
        error: new Error("timeout"),
      }),
    ).resolves.toBe("ok");
  });

  it("throw error from provided function, if it fails before the timeout", () => {
    const mockPromise = async () => {
      await wait(100);

      throw new Error("fail");
    };

    return expect(
      race({
        promise: mockPromise(),
        timeoutMilis: 200,
        error: new Error("timeout"),
      }),
    ).rejects.toThrowError("fail");
  });
});
