import { describe, expect, it, vi } from "vitest";
import { createLogger } from "./logger";
import { attachLoggerConsoleTransport } from "./logger-console-transport";
import { attachLoggerOtelTransport } from "./logger-otel-transport";
import { logs } from "@opentelemetry/api-logs";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

vi.spyOn(console, "log");
vi.setSystemTime(new Date(2024, 1, 1, 5, 15));

describe("Logger", () => {
  describe("Console Transport", () => {
    it("Prints message and nested object to the console, including attributes passed from the parent scope", () => {
      const logger = createLogger("Test Logger", {
        rootScopePrimitiveArg: 1,
        rootScopeObjectArg: {
          objectKey: "objectValue",
        },
      });

      attachLoggerConsoleTransport(logger);

      logger.info("Test Message", {
        childScopePrimitiveArg: 2,
        childScopeObjectArg: {
          objectKey: "objectValue",
        },
      });

      expect(console.log).toBeCalledWith(
        "\x1B[2m 2024-02-01T05:15:00.000Z :Test Logger\x1B[0m \tTest Message",
        {
          rootScopePrimitiveArg: 1,
          rootScopeObjectArg: { objectKey: "objectValue" },
          childScopePrimitiveArg: 2,
          childScopeObjectArg: { objectKey: "objectValue" },
        },
      );
    });
  });

  describe("Otel Transport", () => {
    it("Calls Open Telemtry logger emit() function, passing there required attributes", () => {
      const logger = createLogger("Test Logger", {
        rootScopePrimitiveArg: 1,
        rootScopeObjectArg: {
          objectKey: "objectValue",
        },
      });

      const mockOtelEmit = vi.fn();

      vi.spyOn(logs, "getLogger").mockImplementation(() => {
        return {
          emit: mockOtelEmit,
        };
      });

      vi.stubEnv("OTEL_SERVICE_NAME", "otel service name");
      vi.stubEnv("ENV", "development");
      vi.stubEnv("VERCEL_GIT_COMMIT_SHA", "ASD#!@#");

      attachLoggerOtelTransport(logger, "1.0.0");

      logger.info("Test Message", {
        childScopePrimitiveArg: 2,
        childScopeObjectArg: {
          objectKey: "objectValue",
        },
      });

      expect(mockOtelEmit).toHaveBeenCalledWith({
        severityText: "INFO",
        context: expect.anything(), // Unique otel context
        body: "[Test Logger] Test Message",
        attributes: {
          rootScopePrimitiveArg: 1,
          rootScopeObjectArg: {
            objectKey: "objectValue",
          },
          childScopeObjectArg: {
            objectKey: "objectValue",
          },
          childScopePrimitiveArg: 2,
          [SemanticResourceAttributes.SERVICE_NAME]: "otel service name",
          [SemanticResourceAttributes.SERVICE_VERSION]: "1.0.0",
          [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: "development",
          "commit-sha": "ASD#!@#",
        },
      });
    });
  });
});
