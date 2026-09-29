import { type NextApiResponse } from "next";
import { describe, expect, it, vi } from "vitest";

import { AppNotConfiguredError, handleWebhookContextError } from "./handle-webhook-context-error";

const createLoggerMock = () => ({ warn: vi.fn(), error: vi.fn() });

const createResponseMock = () => {
  const send = vi.fn();
  const status = vi.fn(() => ({ send }));

  return { res: { status } as unknown as NextApiResponse, status, send };
};

describe("handleWebhookContextError", () => {
  it("Warns and returns 400 when app is not configured, as it's expected before merchant sets up the app", () => {
    const logger = createLoggerMock();
    const { res, status, send } = createResponseMock();
    const error = new AppNotConfiguredError("App not configured");

    handleWebhookContextError({ error, logger, message: "Failed to execute webhook", res });

    expect(logger.warn).toHaveBeenCalledWith("Failed to execute webhook", { error });
    expect(logger.error).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(400);
    expect(send).toHaveBeenCalledWith("App not configured");
  });

  it("Logs error and returns 400 for other errors", () => {
    const logger = createLoggerMock();
    const { res, status, send } = createResponseMock();
    const error = new Error("Failed to load configuration");

    handleWebhookContextError({ error, logger, message: "Failed to execute webhook", res });

    expect(logger.error).toHaveBeenCalledWith("Failed to execute webhook", { error });
    expect(logger.warn).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(400);
    expect(send).toHaveBeenCalledWith("Failed to load configuration");
  });
});
