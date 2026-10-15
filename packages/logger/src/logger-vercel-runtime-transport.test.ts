import { describe, expect, it, vi } from "vitest";

import { LoggerContext } from "./logger-context";
import { attachLoggerVercelRuntimeTransport } from "./logger-vercel-runtime-transport";
import { rootLogger } from "./root-logger";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("attachLoggerVercelRuntimeTransport", () => {
  it("Keeps the log message when attributes or logger context contain a message key", () => {
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
    const loggerContext = new LoggerContext();
    const logger = rootLogger.getSubLogger({ name: "Test Logger" });

    attachLoggerVercelRuntimeTransport(logger, "1.0.0", loggerContext);

    loggerContext.wrapNextApiHandler(
      () => {
        logger.info("evt", { message: "boom" });
      },
      { message: "from context" },
    );

    const printed = JSON.parse(consoleLog.mock.calls[0][0] as string);

    expect(printed.message).toBe("evt");
  });
});
