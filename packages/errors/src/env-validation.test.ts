import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { formatEnvValidationError } from "./env-validation";

const schema = z.object({
  PORT: z.coerce.number(),
  SECRET_KEY: z.string(),
  APL: z.enum(["file", "dynamodb"]),
});

const getError = (input: unknown) => {
  const result = schema.safeParse(input);

  if (result.success) {
    throw new Error("Test setup invalid - expected zod parse to fail");
  }

  return result.error;
};

const setup = () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
    throw new Error("__process.exit_called__");
  });

  return { consoleErrorSpy, exitSpy };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("formatEnvValidationError", () => {
  it("Calls process.exit(1)", () => {
    const { exitSpy } = setup();

    expect(() => formatEnvValidationError(getError({}))).toThrow("__process.exit_called__");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("Prints exact formatted message via zod-validation-error for missing fields", () => {
    const { consoleErrorSpy } = setup();

    expect(() => formatEnvValidationError(getError({}))).toThrow("__process.exit_called__");

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      1,
      'Validation error: Expected number, received nan at "PORT"; Required at "SECRET_KEY"; Required at "APL"',
    );
  });

  it("Prints exact formatted message for invalid values", () => {
    const { consoleErrorSpy } = setup();

    expect(() =>
      formatEnvValidationError(getError({ PORT: "abc", SECRET_KEY: "s", APL: "wrong" })),
    ).toThrow("__process.exit_called__");

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(
      1,
      `Validation error: Expected number, received nan at "PORT"; Invalid enum value. Expected 'file' | 'dynamodb', received 'wrong' at "APL"`,
    );
  });

  it("Prints zod issues as pretty JSON on the second console.error call", () => {
    const { consoleErrorSpy } = setup();
    const error = getError({});

    expect(() => formatEnvValidationError(error)).toThrow("__process.exit_called__");

    expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, JSON.stringify(error.issues, null, 2));
  });

  it("Throws ZodValidationError instead of exiting when process.exit is unavailable", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const originalExit = process.exit;

    // Simulate browser / Edge runtime: process.exit not callable
    Object.defineProperty(process, "exit", { value: undefined, configurable: true });

    try {
      expect(() => formatEnvValidationError(getError({}))).toThrowError(
        'Validation error: Expected number, received nan at "PORT"; Required at "SECRET_KEY"; Required at "APL"',
      );
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        1,
        'Validation error: Expected number, received nan at "PORT"; Required at "SECRET_KEY"; Required at "APL"',
      );
    } finally {
      Object.defineProperty(process, "exit", { value: originalExit, configurable: true });
    }
  });

  it("Throws ZodValidationError in browser environment where process is undefined and window is defined", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.stubGlobal("process", undefined);
    vi.stubGlobal("window", {});

    try {
      expect(() => formatEnvValidationError(getError({}))).toThrowError(
        'Validation error: Expected number, received nan at "PORT"; Required at "SECRET_KEY"; Required at "APL"',
      );
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(
        1,
        'Validation error: Expected number, received nan at "PORT"; Required at "SECRET_KEY"; Required at "APL"',
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("Does not log the error stack", () => {
    const { consoleErrorSpy } = setup();

    expect(() => formatEnvValidationError(getError({}))).toThrow("__process.exit_called__");

    for (const call of consoleErrorSpy.mock.calls) {
      for (const arg of call) {
        expect(String(arg)).not.toMatch(/at\s.+\(.+:\d+:\d+\)/);
      }
    }
  });
});
