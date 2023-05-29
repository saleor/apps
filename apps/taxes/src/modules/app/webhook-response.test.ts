import { NextApiResponse } from "next";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { WebhookResponse } from "./webhook-response";

let jsonMock = vi.fn();
let statusMock = vi.fn().mockReturnValueOnce({ json: jsonMock });

let mockResponse = {
  status: statusMock,
} as unknown as NextApiResponse;

beforeEach(() => {
  jsonMock = vi.fn();
  statusMock = vi.fn().mockReturnValueOnce({ json: jsonMock });

  mockResponse = {
    status: statusMock,
  } as unknown as NextApiResponse;
});

describe("WebhookResponse", () => {
  it("returns 500 when thrown unexpected error", () => {
    const webhookResponse = new WebhookResponse(mockResponse);
    const unexpectedError = new Error("Unexpected error");

    webhookResponse.error(unexpectedError);

    expect(statusMock).toHaveBeenCalledWith(500);
  });

  it("returns 200 and data when success is called", () => {
    const webhookResponse = new WebhookResponse(mockResponse);

    webhookResponse.success({ foo: "bar" });

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ foo: "bar" });
  });
});
