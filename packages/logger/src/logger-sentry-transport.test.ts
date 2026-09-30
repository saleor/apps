import * as Sentry from "@sentry/nextjs";
import { type ILogObj, Logger } from "tslog";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { attachLoggerSentryTransport } from "./logger-sentry-transport";

vi.mock("@sentry/nextjs", () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

describe("attachLoggerSentryTransport", () => {
  let logger: Logger<ILogObj>;

  beforeEach(() => {
    vi.clearAllMocks();

    logger = new Logger<ILogObj>({
      type: "hidden",
      overwrite: {
        toLogObj: (args, log) => ({
          ...log,
          message: args.find((arg) => typeof arg === "string"),
          attributes: args.find((arg) => typeof arg === "object") ?? {},
        }),
      },
    });

    attachLoggerSentryTransport(logger);
  });

  it("Adds exactly one breadcrumb per log, with its own message and mapped level", () => {
    logger.info("first");
    logger.warn("second", { foo: "bar" });
    logger.info("third");

    expect(Sentry.addBreadcrumb).toHaveBeenCalledTimes(3);
    expect(Sentry.addBreadcrumb).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ message: "second", level: "warning", data: { foo: "bar" } }),
    );
    expect(Sentry.addBreadcrumb).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ message: "third", level: "info" }),
    );
    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });

  it("Captures error log with Error attribute as exception", () => {
    const error = new Error("boom");

    logger.error("Failed to do things", { error: error, id: 1 });

    expect(Sentry.captureException).toHaveBeenCalledExactlyOnceWith(error, {
      level: "error",
      extra: { message: "Failed to do things", error, id: 1 },
    });
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });

  it("Captures error log without Error attribute as message", () => {
    logger.fatal("Something broke", { id: 1 });

    expect(Sentry.captureMessage).toHaveBeenCalledExactlyOnceWith("Something broke", {
      level: "error",
      extra: { message: "Something broke", id: 1 },
    });
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});
