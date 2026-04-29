import { type AuthData } from "@saleor/app-sdk/APL";
import { okAsync } from "neverthrow";
import { type NextApiRequest, type NextApiResponse } from "next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type AccountEmailChangedWebhookPayloadFragment } from "../../../../generated/graphql";
import { type SendEventMessagesUseCase } from "../../../modules/event-handlers/use-case/send-event-messages.use-case";
import { SendEventMessagesUseCaseFactory } from "../../../modules/event-handlers/use-case/send-event-messages.use-case.factory";
import { handler } from "./account-email-changed";

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

const basePayload: AccountEmailChangedWebhookPayloadFragment = {
  user: {
    id: "VXNlcjox",
    email: "new@example.com",
    firstName: "First",
    lastName: "Last",
  },
  newEmail: "new@example.com",
  redirectUrl: "https://example.com/email-changed",
  token: "email-changed-token",
  channel: { slug: "default-channel" },
  shop: {
    name: "Acme",
    domain: { host: "acme.example.com" },
  },
};

describe("account-email-changed handler", () => {
  let mockRes: ReturnType<typeof createMockResponse>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRes = createMockResponse();
  });

  it("Sends email to the NEW email address (not user.email at request time)", async () => {
    sendEventMessages.mockResolvedValueOnce(okAsync(undefined));

    await handler({} as NextApiRequest, mockRes.res, {
      /*
       * user.email could be either old or new depending on Saleor behavior;
       * recipient must always come from newEmail.
       */
      payload: { ...basePayload, user: { ...basePayload.user!, email: "old@example.com" } },
      authData: baseAuthData,
      baseUrl: "https://app.example.com",
      event: "ACCOUNT_EMAIL_CHANGED",
      schemaVersion: [3, 14],
    });

    expect(sendEventMessages).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientEmail: "new@example.com",
      }),
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it("Returns 200 with error message when newEmail is missing", async () => {
    await handler({} as NextApiRequest, mockRes.res, {
      payload: { ...basePayload, newEmail: null },
      authData: baseAuthData,
      baseUrl: "https://app.example.com",
      event: "ACCOUNT_EMAIL_CHANGED",
      schemaVersion: [3, 14],
    });

    expect(sendEventMessages).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Email recipient (newEmail) has not been specified in the event payload.",
    });
  });

  it("Returns 200 with error message when channel is missing", async () => {
    await handler({} as NextApiRequest, mockRes.res, {
      payload: { ...basePayload, channel: null },
      authData: baseAuthData,
      baseUrl: "https://app.example.com",
      event: "ACCOUNT_EMAIL_CHANGED",
      schemaVersion: [3, 14],
    });

    expect(sendEventMessages).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Channel has not been specified in the event payload.",
    });
  });
});
