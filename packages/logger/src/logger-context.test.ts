import { describe, expect, it, vi } from "vitest";

import { LoggerContext } from "./logger-context";

describe("LoggerContext", () => {
  it("Wraps context and shares context globally", () => {
    vi.stubEnv("OTEL_SERVICE_NAME", "logger-context-test-service");
    expect.assertions(1);

    const loggerContext = new LoggerContext();

    const assertFunction = () => {
      loggerContext.set("baz", "1");

      expect(loggerContext.getRawContext()).toStrictEqual({
        foo: "bar",
        initialState: "exists",
        baz: "1",
        project_name: "logger-context-test-service",
      });
    };

    function someExecution() {
      loggerContext.set("foo", "bar");

      assertFunction();
    }

    loggerContext.wrapNextApiHandler(() => someExecution(), { initialState: "exists" });
  });
});
