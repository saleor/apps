import { type AuthData } from "@saleor/app-sdk/APL";
import { okAsync } from "neverthrow";
import { type NextApiRequest, type NextApiResponse } from "next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type AccountChangeEmailRequestedWebhookPayloadFragment } from "../../../../generated/graphql";
import { type SendEventMessagesUseCase } from "../../../modules/event-handlers/use-case/send-event-messages.use-case";
import { SendEventMessagesUseCaseFactory } from "../../../modules/event-handlers/use-case/send-event-messages.use-case.factory";
import { handler } from "./account-change-email-requested";

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

const basePayload: AccountChangeEmailRequestedWebhookPayloadFragment = {
  user: {
    id: "VXNlcjox",
    email: "current@example.com",
    firstName: "First",
    lastName: "Last",
  },
  newEmail: "new@example.com",
  redirectUrl: "https://example.com/change-email",
  token: "change-email-token",
  channel: { slug: "default-channel" },
  shop: {
    name: "Acme",
    domain: { host: "acme.example.com" },
  },
};

describe("account-change-email-requested handler", () => {
  let mockRes: ReturnType<typeof createMockResponse>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRes = createMockResponse();
  });

  it("Sends email to the CURRENT email address (not newEmail)", async () => {
    sendEventMessages.mockResolvedValueOnce(okAsync(undefined));

    await handler({} as NextApiRequest, mockRes.res, {
      payload: basePayload,
      authData: baseAuthData,
      baseUrl: "https://app.example.com",
      event: "ACCOUNT_CHANGE_EMAIL_REQUESTED",
      schemaVersion: [3, 14],
    });

    expect(sendEventMessages).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientEmail: "current@example.com",
      }),
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it("Includes newEmail in the payload sent to the use case so templates can render it", async () => {
    sendEventMessages.mockResolvedValueOnce(okAsync(undefined));

    await handler({} as NextApiRequest, mockRes.res, {
      payload: basePayload,
      authData: baseAuthData,
      baseUrl: "https://app.example.com",
      event: "ACCOUNT_CHANGE_EMAIL_REQUESTED",
      schemaVersion: [3, 14],
    });

    expect(sendEventMessages).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ newEmail: "new@example.com" }),
      }),
    );
  });

  it("Returns 200 with error message when user email is missing", async () => {
    await handler({} as NextApiRequest, mockRes.res, {
      payload: { ...basePayload, user: null },
      authData: baseAuthData,
      baseUrl: "https://app.example.com",
      event: "ACCOUNT_CHANGE_EMAIL_REQUESTED",
      schemaVersion: [3, 14],
    });

    expect(sendEventMessages).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Email recipient has not been specified in the event payload.",
    });
  });

  it("Returns 200 with error message when channel is missing", async () => {
    await handler({} as NextApiRequest, mockRes.res, {
      payload: { ...basePayload, channel: null },
      authData: baseAuthData,
      baseUrl: "https://app.example.com",
      event: "ACCOUNT_CHANGE_EMAIL_REQUESTED",
      schemaVersion: [3, 14],
    });

    expect(sendEventMessages).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Channel has not been specified in the event payload.",
    });
  });
});
