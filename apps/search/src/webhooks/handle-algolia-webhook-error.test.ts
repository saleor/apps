import { type NextApiResponse } from "next";
import { describe, expect, it, vi } from "vitest";

import { handleAlgoliaWebhookError } from "./handle-algolia-webhook-error";

const createLoggerMock = () => ({ warn: vi.fn(), error: vi.fn() });

const createResponseMock = () => {
  const send = vi.fn();
  const status = vi.fn(() => ({ send }));

  return { res: { status } as unknown as NextApiResponse, status, send };
};

describe("handleAlgoliaWebhookError", () => {
  it("Warns and returns Algolia 4xx status, so Saleor doesn't retry a request that will never succeed", () => {
    const logger = createLoggerMock();
    const { res, status, send } = createResponseMock();
    const error = {
      status: 400,
      message: "Too many indices (40>20), please remove unused indices before pushing more data.",
    };

    handleAlgoliaWebhookError({ error, logger, message: "Failed to execute webhook", res });

    expect(logger.warn).toHaveBeenCalledWith("Failed to execute webhook", {
      error,
      algoliaStatusCode: 400,
    });
    expect(logger.error).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(400);
    expect(send).toHaveBeenCalledWith(error.message);
  });

  it("Warns and returns Algolia 5xx status, so Saleor retries a transient failure", () => {
    const logger = createLoggerMock();
    const { res, status } = createResponseMock();
    const error = { status: 503, message: "Service unavailable" };

    handleAlgoliaWebhookError({ error, logger, message: "Failed to execute webhook", res });

    expect(logger.warn).toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(503);
  });

  it("Logs error and returns 500 if error does not come from Algolia API", () => {
    const logger = createLoggerMock();
    const { res, status, send } = createResponseMock();
    const error = new TypeError("Cannot read property of undefined");

    handleAlgoliaWebhookError({ error, logger, message: "Failed to execute webhook", res });

    expect(logger.error).toHaveBeenCalledWith("Failed to execute webhook", { error });
    expect(logger.warn).not.toHaveBeenCalled();
    expect(status).toHaveBeenCalledWith(500);
    expect(send).toHaveBeenCalledWith("Operation failed due to error");
  });
});
