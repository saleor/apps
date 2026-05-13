import { type AuthData } from "@saleor/app-sdk/APL";
import { okAsync } from "neverthrow";
import { type NextApiRequest, type NextApiResponse } from "next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type CustomerDeletedWebhookPayloadFragment } from "../../../../generated/graphql";
import { type SendEventMessagesUseCase } from "../../../modules/event-handlers/use-case/send-event-messages.use-case";
import { SendEventMessagesUseCaseFactory } from "../../../modules/event-handlers/use-case/send-event-messages.use-case.factory";
import { handler } from "./customer-deleted";

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

const basePayload: CustomerDeletedWebhookPayloadFragment = {
  user: {
    id: "VXNlcjox",
    email: "user@example.com",
    firstName: "First",
    lastName: "Last",
  },
};

describe("customer-deleted handler", () => {
  let mockRes: ReturnType<typeof createMockResponse>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRes = createMockResponse();
  });

  it("Sends email and responds 200 when payload is valid", async () => {
    sendEventMessages.mockResolvedValueOnce(okAsync(undefined));

    await handler({} as NextApiRequest, mockRes.res, {
      payload: basePayload,
      authData: baseAuthData,
      baseUrl: "https://app.example.com",
      event: "CUSTOMER_DELETED",
      schemaVersion: [3, 23],
    });

    expect(sendEventMessages).toHaveBeenCalledWith({
      channelSlug: "",
      event: "CUSTOMER_DELETED",
      payload: { user: basePayload.user },
      recipientEmail: "user@example.com",
      saleorApiUrl: baseAuthData.saleorApiUrl,
    });
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it("Returns 200 with error message when user is missing", async () => {
    await handler({} as NextApiRequest, mockRes.res, {
      payload: { ...basePayload, user: null },
      authData: baseAuthData,
      baseUrl: "https://app.example.com",
      event: "CUSTOMER_DELETED",
      schemaVersion: [3, 23],
    });

    expect(sendEventMessages).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Email recipient has not been specified in the event payload.",
    });
  });
});
