import { describe, expect, it, vi } from "vitest";

import { attachLoggerConsoleTransport } from "./logger-console-transport";
import { rootLogger } from "./root-logger";

vi.spyOn(console, "log");
vi.setSystemTime(new Date(2024, 1, 1, 5, 15));

describe("Logger", () => {
  describe("Console Transport", () => {
    it("Prints message and nested object to the console, including attributes passed from the parent scope", () => {
      const logger = rootLogger.getSubLogger(
        { name: "Test Logger" },
        {
          rootScopePrimitiveArg: 1,
          rootScopeObjectArg: {
            objectKey: "objectValue",
          },
        },
      );

      attachLoggerConsoleTransport(logger);

      logger.info("Test Message", {
        childScopePrimitiveArg: 2,
        childScopeObjectArg: {
          objectKey: "objectValue",
        },
      });

      expect(console.log).toBeCalledWith(
        "\x1B[2m 2024-02-01T05:15:00.000Z :Test Logger\x1B[0m \tTest Message",
        JSON.stringify(
          {
            rootScopePrimitiveArg: 1,
            rootScopeObjectArg: { objectKey: "objectValue" },
            childScopePrimitiveArg: 2,
            childScopeObjectArg: { objectKey: "objectValue" },
          },
          null,
          2,
        ),
      );
    });

    it("Masks secret keys at any depth and with any casing", () => {
      const logger = rootLogger.getSubLogger({ name: "Test Logger" });

      attachLoggerConsoleTransport(logger);

      logger.info("Test Message", {
        AuthToken: "top-level-secret",
        config: {
          apiKey: "nested-secret",
          channels: [{ restrictedKey: "array-secret", name: "default" }],
        },
      });

      expect(console.log).toHaveBeenLastCalledWith(
        "\x1B[2m 2024-02-01T05:15:00.000Z :Test Logger\x1B[0m \tTest Message",
        JSON.stringify(
          {
            AuthToken: "[***]",
            config: {
              apiKey: "[***]",
              channels: [{ restrictedKey: "[***]", name: "default" }],
            },
          },
          null,
          2,
        ),
      );
    });
  });
});
