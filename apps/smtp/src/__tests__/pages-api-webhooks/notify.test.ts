import { type AuthData } from "@saleor/app-sdk/APL";
import { okAsync } from "neverthrow";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type NotifySubscriptionPayload } from "../../lib/notify-event-types";
import { SendEventMessagesUseCase } from "../../modules/event-handlers/use-case/send-event-messages.use-case";
import { type SmtpConfiguration } from "../../modules/smtp/configuration/smtp-config-schema";
import {
  type IGetFallbackSmtpEnabled,
  type IGetSmtpConfiguration,
} from "../../modules/smtp/configuration/smtp-configuration.service";
import {
  defaultMjmlSubjectTemplates,
  defaultMjmlTemplates,
} from "../../modules/smtp/default-templates";
import { EmailCompiler } from "../../modules/smtp/services/email-compiler";
import { HandlebarsTemplateCompiler } from "../../modules/smtp/services/handlebars-template-compiler";
import { HtmlToTextCompiler } from "../../modules/smtp/services/html-to-text-compiler";
import { MjmlCompiler } from "../../modules/smtp/services/mjml-compiler";
import {
  type ISMTPEmailSender,
  type SendMailArgs,
} from "../../modules/smtp/services/smtp-email-sender";
// Import handler AFTER mocks are declared so module-level useCaseFactory uses mocked class
import { handler } from "../../pages/api/webhooks/notify";

const { mockCreateFromAuthData } = vi.hoisted(() => ({
  mockCreateFromAuthData: vi.fn(),
}));

vi.mock("../../modules/event-handlers/use-case/send-event-messages.use-case.factory", () => ({
  SendEventMessagesUseCaseFactory: vi.fn().mockImplementation(() => ({
    createFromAuthData: mockCreateFromAuthData,
  })),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

const authData: AuthData = {
  appId: "app-id",
  token: "token",
  saleorApiUrl: "https://acme-store.example.com/graphql/",
  jwks: "{}",
};

const baseEventConfig = (eventType: SmtpConfiguration["events"][number]["eventType"]) => ({
  active: true,
  eventType,
  template: defaultMjmlTemplates[eventType],
  subject: defaultMjmlSubjectTemplates[eventType],
});

const buildConfig = (overrides: Partial<SmtpConfiguration> = {}): SmtpConfiguration => ({
  id: "config-1",
  name: "Test SMTP",
  active: true,
  senderName: "Acme",
  senderEmail: "noreply@acme-store.example.com",
  smtpHost: "smtp.example.com",
  smtpPort: "587",
  smtpUser: "user",
  smtpPassword: "pass",
  encryption: "NONE",
  channels: { channels: [], mode: "restrict", override: false },
  customVariables: {},
  events: [],
  ...overrides,
});

const meta = {
  issued_at: "2026-01-01T00:00:00Z",
  version: "3.20.0",
  issuing_principal: { id: "user-id", type: "user" },
};

const buildPayload = <T extends NotifySubscriptionPayload>(payload: T) => payload;

const accountSetCustomerPasswordPayload = buildPayload({
  meta,
  notify_event: "account_set_customer_password",
  payload: {
    user: {
      id: "VXNlcjox",
      email: "customer@example.com",
      first_name: "Test",
      last_name: "Customer",
      is_staff: false,
      is_active: false,
      private_metadata: {},
      metadata: {},
      language_code: "en",
    },
    recipient_email: "customer@example.com",
    token: "set-password-token",
    password_set_url: "https://example.com/account/set-password?token=set-password-token",
    channel_slug: "default-channel",
    domain: "acme-store.example.com",
    site_name: "Acme",
    logo_url: "",
  },
});

const accountChangeEmailRequestPayload = buildPayload({
  meta,
  notify_event: "account_change_email_request",
  payload: {
    user: {
      id: "VXNlcjox",
      email: "customer@example.com",
      first_name: "Test",
      last_name: "Customer",
      is_staff: false,
      is_active: true,
      private_metadata: {},
      metadata: {},
      language_code: "en",
    },
    recipient_email: "customer@example.com",
    token: "change-email-token",
    old_email: "customer@example.com",
    new_email: "customer.new@example.com",
    redirect_url: "https://example.com/account/change-email?token=change-email-token",
    channel_slug: "default-channel",
    domain: "acme-store.example.com",
    site_name: "Acme",
    logo_url: "",
  },
});

const buildUseCase = ({
  configs,
  emailSender,
}: {
  configs: SmtpConfiguration[];
  emailSender: ISMTPEmailSender;
}) => {
  const configService: IGetSmtpConfiguration & IGetFallbackSmtpEnabled = {
    getConfigurations: vi.fn(() => okAsync(configs)),
    getIsFallbackSmtpEnabled: vi.fn(() => okAsync(false)),
  };

  return new SendEventMessagesUseCase({
    configService,
    emailCompiler: new EmailCompiler(
      new HandlebarsTemplateCompiler(),
      new HtmlToTextCompiler(),
      new MjmlCompiler(),
    ),
    emailSender,
  });
};

const callHandler = async (payload: NotifySubscriptionPayload) => {
  const { req, res } = createMocks({ method: "POST" });

  await handler(req, res, {
    event: "NOTIFY_USER",
    baseUrl: "https://app.example.com",
    payload,
    authData,
    schemaVersion: null,
  });

  return res;
};

describe("notify webhook handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends an email when config has ACCOUNT_SET_CUSTOMER_PASSWORD active and matching notify event arrives", async () => {
    const sendEmailWithSmtp = vi
      .fn<(args: SendMailArgs) => Promise<{ response: unknown }>>()
      .mockResolvedValue({ response: "ok" });

    const useCase = buildUseCase({
      configs: [
        buildConfig({
          events: [baseEventConfig("ACCOUNT_SET_CUSTOMER_PASSWORD")],
        }),
      ],
      emailSender: { sendEmailWithSmtp },
    });

    mockCreateFromAuthData.mockReturnValue(useCase);

    const res = await callHandler(accountSetCustomerPasswordPayload);

    expect(res._getStatusCode()).toBe(200);
    expect(sendEmailWithSmtp).toHaveBeenCalledTimes(1);

    const [{ mailData }] = sendEmailWithSmtp.mock.calls[0];

    expect(mailData.to).toBe("customer@example.com");
    expect(mailData.from).toBe("Acme <noreply@acme-store.example.com>");
    expect(mailData.subject).toBe("Set your password");
    /*
     * Default template renders the password_set_url into the email body
     * Handlebars HTML-escapes the URL (= becomes &#x3D;), so check the host + token
     */
    expect(mailData.html).toContain("https://example.com/account/set-password?token");
    expect(mailData.html).toContain("set-password-token");
  });

  it("delivers ACCOUNT_CHANGE_EMAIL_REQUEST but drops ACCOUNT_SET_CUSTOMER_PASSWORD when only the former is configured", async () => {
    const sendEmailWithSmtp = vi
      .fn<(args: SendMailArgs) => Promise<{ response: unknown }>>()
      .mockResolvedValue({ response: "ok" });

    const useCase = buildUseCase({
      configs: [
        buildConfig({
          events: [baseEventConfig("ACCOUNT_CHANGE_EMAIL_REQUEST")],
        }),
      ],
      emailSender: { sendEmailWithSmtp },
    });

    mockCreateFromAuthData.mockReturnValue(useCase);

    // 1) account_change_email_request — configured, must be sent
    const resConfigured = await callHandler(accountChangeEmailRequestPayload);

    expect(resConfigured._getStatusCode()).toBe(200);
    expect(sendEmailWithSmtp).toHaveBeenCalledTimes(1);

    const [{ mailData }] = sendEmailWithSmtp.mock.calls[0];

    expect(mailData.subject).toBe("Confirm your new email address");

    /*
     * 2) account_set_customer_password — supported event but no active config for it,
     * app must drop the event without sending an email
     */
    const resNotConfigured = await callHandler(accountSetCustomerPasswordPayload);

    expect(resNotConfigured._getStatusCode()).toBe(200);
    expect(sendEmailWithSmtp).toHaveBeenCalledTimes(1); // still 1 — no extra send
  });
});
