import { NextApiResponse } from "next";
import { describe, expect, it, vi } from "vitest";
import { WebhookResponse } from "./webhook-response";

describe("WebhookResponse", () => {
  it("returns 500 when thrown unexpected error", () => {
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValueOnce({ json: jsonMock });

    const mockResponse = {
      status: statusMock,
    } as unknown as NextApiResponse;
    const webhookResponse = new WebhookResponse(mockResponse);
    const unexpectedError = new Error("Unexpected error");

    webhookResponse.error(unexpectedError);

    expect(statusMock).toHaveBeenCalledWith(500);
  });

  it("returns 200 and data when success is called", () => {
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValueOnce({ json: jsonMock });

    const mockResponse = {
      status: statusMock,
    } as unknown as NextApiResponse;

    const webhookResponse = new WebhookResponse(mockResponse);

    webhookResponse.success({ foo: "bar" });

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ foo: "bar" });
  });
});
