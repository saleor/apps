import { type AuthData } from "@saleor/app-sdk/APL";
import { okAsync } from "neverthrow";
import { type NextApiRequest, type NextApiResponse } from "next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type FulfillmentTrackingNumberUpdatedWebhookPayloadFragment } from "../../../../generated/graphql";
import { type SendEventMessagesUseCase } from "../../../modules/event-handlers/use-case/send-event-messages.use-case";
import { SendEventMessagesUseCaseFactory } from "../../../modules/event-handlers/use-case/send-event-messages.use-case.factory";
import { handler } from "./fulfillment-tracking-number-updated";

const sendEventMessages = vi.fn();

vi.spyOn(SendEventMessagesUseCaseFactory.prototype, "createFromAuthData").mockReturnValue({
  sendEventMessages,
} as unknown as SendEventMessagesUseCase);

function createMockResponse() {
  const json = vi.fn();
  const end = vi.fn();
  const send = vi.fn();
  const res = {
    status: vi.fn().mockReturnValue({ json, end, send }),
    json,
    end,
    send,
  } as unknown as NextApiResponse;

  return { res, status: vi.mocked((res as { status: unknown }).status), json, end, send };
}

const baseAuthData: AuthData = {
  appId: "app-id",
  jwks: "{}",
  saleorApiUrl: "https://demo.saleor.io/graphql/",
  token: "token",
};

const basePayload: FulfillmentTrackingNumberUpdatedWebhookPayloadFragment = {
  fulfillment: {
    id: "RnVsZmlsbG1lbnQ6MQ==",
    trackingNumber: "1Z999",
  },
  order: {
    id: "T3JkZXI6MQ==",
    number: "1042",
    userEmail: "buyer@example.com",
    channel: { slug: "default-channel", name: "Acme Store" },
  },
};

describe("fulfillment-tracking-number-updated handler", () => {
  let mockRes: ReturnType<typeof createMockResponse>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRes = createMockResponse();
  });

  it("Resolves recipient from order.userEmail and channel from order.channel.slug", async () => {
    sendEventMessages.mockResolvedValueOnce(okAsync(undefined));

    await handler({} as NextApiRequest, mockRes.res, {
      payload: basePayload,
      authData: baseAuthData,
      baseUrl: "https://app.example.com",
      event: "FULFILLMENT_TRACKING_NUMBER_UPDATED",
      schemaVersion: [3, 14],
    });

    expect(sendEventMessages).toHaveBeenCalledWith(
      expect.objectContaining({
        channelSlug: "default-channel",
        recipientEmail: "buyer@example.com",
      }),
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it("Returns 200 with error message when order is missing", async () => {
    await handler({} as NextApiRequest, mockRes.res, {
      payload: { ...basePayload, order: null },
      authData: baseAuthData,
      baseUrl: "https://app.example.com",
      event: "FULFILLMENT_TRACKING_NUMBER_UPDATED",
      schemaVersion: [3, 14],
    });

    expect(sendEventMessages).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Order has not been specified in the event payload.",
    });
  });

  it("Returns 200 with error message when order.userEmail is missing", async () => {
    await handler({} as NextApiRequest, mockRes.res, {
      payload: { ...basePayload, order: { ...basePayload.order!, userEmail: null } },
      authData: baseAuthData,
      baseUrl: "https://app.example.com",
      event: "FULFILLMENT_TRACKING_NUMBER_UPDATED",
      schemaVersion: [3, 14],
    });

    expect(sendEventMessages).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Email recipient has not been specified in the event payload.",
    });
  });
});
