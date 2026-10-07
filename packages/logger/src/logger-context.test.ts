import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { LoggerContext, wrapWithLoggerContextAppRouter } from "./logger-context";

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

  it("Sets Saleor version from raw string or parsed schema version, skips empty values", () => {
    expect.assertions(1);

    const loggerContext = new LoggerContext();

    loggerContext.wrapNextApiHandler(() => {
      loggerContext.setSaleorVersion(undefined);
      loggerContext.setSaleorVersion([3, 21]);
      const fromTuple = loggerContext.getRawContext().saleorVersion;

      loggerContext.setSaleorVersion("3.21.5");

      expect([fromTuple, loggerContext.getRawContext().saleorVersion]).toStrictEqual([
        "3.21",
        "3.21.5",
      ]);
    });
  });

  it("Reads Saleor schema version header in App Router wrapper", async () => {
    const loggerContext = new LoggerContext();
    let saleorVersion: unknown;

    const handler = wrapWithLoggerContextAppRouter(async () => {
      saleorVersion = loggerContext.getRawContext().saleorVersion;

      return new Response();
    }, loggerContext);

    await handler(
      new NextRequest("https://app.example.com/api/manifest", {
        headers: { "saleor-schema-version": "3.22" },
      }),
    );

    expect(saleorVersion).toBe("3.22");
  });
});
