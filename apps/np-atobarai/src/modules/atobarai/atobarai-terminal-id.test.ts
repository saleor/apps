import { describe, expect, it } from "vitest";

import { AtobaraiTerminalId, createAtobaraiTerminalId } from "./atobarai-terminal-id";

describe("createAtobaraiTerminalId", () => {
  it("should create a valid AtobaraiTerminalId from a non-empty string", () => {
    const result = createAtobaraiTerminalId("TERMINAL_ID");

    expect(result).toBe("TERMINAL_ID");
  });

  it("should throw validation error when input is an empty string", () => {
    expect(() => createAtobaraiTerminalId("")).toThrow(
      "Invalid terminal ID: String must contain at least 1 character(s)",
    );
  });

  it("shouldn't be assignable without createAtobaraiTerminalId", () => {
    // @ts-expect-error - if this fails - it means the type is not branded
    const testValue: AtobaraiTerminalId = "";

    expect(testValue).toBe("");
  });
});
