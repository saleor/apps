import { WebhookError } from "@saleor/app-sdk/handlers/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createWebhookErrorHandler } from "./create-webhook-error-handler";

const logger = vi.hoisted(() => ({ warn: vi.fn(), error: vi.fn() }));

vi.mock("./logger", () => ({ createLogger: () => logger }));

describe("createWebhookErrorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Logs invalid request (WebhookError) as warning", () => {
    createWebhookErrorHandler("TEST webhook")(
      new WebhookError("Wrong incoming request event", "WRONG_EVENT"),
    );

    expect(logger.warn).toHaveBeenCalledOnce();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("Logs unexpected error as error", () => {
    createWebhookErrorHandler("TEST webhook")(new Error("APL unavailable"));

    expect(logger.error).toHaveBeenCalledOnce();
    expect(logger.warn).not.toHaveBeenCalled();
  });
});
