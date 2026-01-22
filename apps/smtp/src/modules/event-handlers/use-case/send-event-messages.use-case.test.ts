import { err, errAsync, ok, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BaseError } from "../../../errors";
import {
  FallbackSmtpConfig,
  SmtpConfiguration,
} from "../../smtp/configuration/smtp-config-schema";
import {
  FilterConfigurationsArgs,
  IGetFallbackSmtpEnabled,
  IGetSmtpConfiguration,
} from "../../smtp/configuration/smtp-configuration.service";
import { CompileArgs, IEmailCompiler } from "../../smtp/services/email-compiler";
import { ISMTPEmailSender, SendMailArgs } from "../../smtp/services/smtp-email-sender";
import { MessageEventTypes } from "../message-event-types";
import { SendEventMessagesUseCase } from "./send-event-messages.use-case";
import { SendEventMessagesUseCaseFactory } from "./send-event-messages.use-case.factory";

vi.mock("../../smtp/configuration/smtp-config-schema", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../smtp/configuration/smtp-config-schema")>();

  return {
    ...original,
    getFallbackSmtpConfigSchema: vi.fn(),
  };
});

import { getFallbackSmtpConfigSchema } from "../../smtp/configuration/smtp-config-schema";

const mockGetFallbackSmtpConfigSchema = vi.mocked(getFallbackSmtpConfigSchema);

const EVENT_TYPE = "ACCOUNT_DELETE" satisfies MessageEventTypes;

class MockEmailCompiler implements IEmailCompiler {
  static returnSuccessCompiledEmail: IEmailCompiler["compile"] = () =>
    ok({
      text: "html text",
      from: "email from",
      subject: "email subject",
      html: "<html>html text</html>",
      to: "email to",
    });

  static returnErrorCompiling: IEmailCompiler["compile"] = () => {
    return err(new BaseError("Error compiling"));
  };

  mockEmailCompileMethod = vi.fn<(args: CompileArgs) => ReturnType<IEmailCompiler["compile"]>>();

  compile = this.mockEmailCompileMethod;
}

class MockSmtpSender implements ISMTPEmailSender {
  static returnEmptyResponse: ISMTPEmailSender["sendEmailWithSmtp"] = async () => {
    return { response: {} };
  };

  static throwInvalidResponse: ISMTPEmailSender["sendEmailWithSmtp"] = async () => {
    throw new BaseError("Some error");
  };

  mockSendEmailMethod =
    vi.fn<(args: SendMailArgs) => ReturnType<ISMTPEmailSender["sendEmailWithSmtp"]>>();

  sendEmailWithSmtp = this.mockSendEmailMethod;
}

class MockSmptConfigurationService implements IGetSmtpConfiguration, IGetFallbackSmtpEnabled {
  static getSimpleConfigurationValue = (): SmtpConfiguration => {
    return {
      id: "1",
      active: true,
      senderEmail: "sender@email.com",
      senderName: "Sender Name",
      events: [
        {
          active: true,
          eventType: EVENT_TYPE,
          subject: "Subject",
          template: "html text",
        },
      ],
      channels: { channels: ["default-channel"], mode: "exclude", override: false },
      encryption: "SSL",
      name: "Config 1",
      smtpHost: "localhost",
      smtpPassword: "admin1234",
      smtpPort: "2137",
      smtpUser: "admin",
    };
  };

  static getValidFallbackConfig = (): FallbackSmtpConfig => ({
    smtpHost: "fallback.smtp.com",
    smtpPort: "587",
    smtpUser: "fallback-user",
    smtpPassword: "fallback-password",
    encryption: "TLS",
    senderName: "Fallback Sender",
    senderEmail: "fallback@example.com",
  });

  static returnValidSingleConfiguration: IGetSmtpConfiguration["getConfigurations"] = () => {
    return okAsync([MockSmptConfigurationService.getSimpleConfigurationValue()]);
  };

  static returnEmptyConfigurationsList: IGetSmtpConfiguration["getConfigurations"] = () => {
    return okAsync([]);
  };

  static returnErrorFetchingConfigurations: IGetSmtpConfiguration["getConfigurations"] = () => {
    return errAsync(new BaseError("Mock fail to fetch"));
  };

  static returnValidTwoConfigurations: IGetSmtpConfiguration["getConfigurations"] = () => {
    const c1 = this.getSimpleConfigurationValue();
    const c2 = this.getSimpleConfigurationValue();

    c2.id = "2";

    return okAsync([c1, c2]);
  };

  mockGetConfigurationsMethod =
    vi.fn<
      (args?: FilterConfigurationsArgs) => ReturnType<IGetSmtpConfiguration["getConfigurations"]>
    >();

  mockGetIsFallbackSmtpEnabledMethod =
    vi.fn<() => ReturnType<IGetFallbackSmtpEnabled["getIsFallbackSmtpEnabled"]>>();

  getConfigurations = this.mockGetConfigurationsMethod;

  getIsFallbackSmtpEnabled = this.mockGetIsFallbackSmtpEnabledMethod;
}

describe("SendEventMessagesUseCase", () => {
  let emailCompiler: MockEmailCompiler;
  let emailSender: MockSmtpSender;
  let smtpConfigurationService: MockSmptConfigurationService;

  let useCaseInstance: SendEventMessagesUseCase;

  beforeEach(() => {
    /**
     * Just in case reset mocks if some reference is preserved
     */
    vi.resetAllMocks();

    /**
     * Create direct dependencies
     */
    emailCompiler = new MockEmailCompiler();
    emailSender = new MockSmtpSender();
    smtpConfigurationService = new MockSmptConfigurationService();

    /**
     * Apply default return values, which can be partially overwritten in tests
     */
    emailCompiler.mockEmailCompileMethod.mockImplementation(
      MockEmailCompiler.returnSuccessCompiledEmail,
    );
    emailSender.mockSendEmailMethod.mockImplementation(MockSmtpSender.returnEmptyResponse);
    smtpConfigurationService.mockGetConfigurationsMethod.mockImplementation(
      MockSmptConfigurationService.returnValidSingleConfiguration,
    );
    smtpConfigurationService.mockGetIsFallbackSmtpEnabledMethod.mockReturnValue(okAsync(false));
    mockGetFallbackSmtpConfigSchema.mockReturnValue(null);

    /**
     * Create service instance for testing
     */
    useCaseInstance = new SendEventMessagesUseCase({
      emailCompiler,
      emailSender,
      smtpConfigurationService,
    });
  });

  describe("Factory", () => {
    it("Build with default dependencies from AuthData", () => {
      const instance = new SendEventMessagesUseCaseFactory().createFromAuthData({
        saleorApiUrl: "https://demo.saleor.cloud/graphql/",
        token: "foo",
        appId: "1",
      });

      expect(instance).toBeDefined();
    });
  });

  describe("sendEventMessages method", () => {
    it("Returns error if configurations list is empty", async () => {
      smtpConfigurationService.mockGetConfigurationsMethod.mockImplementation(
        MockSmptConfigurationService.returnEmptyConfigurationsList,
      );

      const result = await useCaseInstance.sendEventMessages({
        event: EVENT_TYPE,
        payload: {},
        channelSlug: "channel-slug",
        recipientEmail: "recipient@test.com",
      });

      expect(result?._unsafeUnwrapErr()[0]).toBeInstanceOf(
        SendEventMessagesUseCase.MissingAvailableConfigurationError,
      );
    });

    it("Returns error if failed to fetch configurations", async () => {
      smtpConfigurationService.mockGetConfigurationsMethod.mockImplementation(
        MockSmptConfigurationService.returnErrorFetchingConfigurations,
      );

      const result = await useCaseInstance.sendEventMessages({
        event: EVENT_TYPE,
        payload: {},
        channelSlug: "channel-slug",
        recipientEmail: "recipient@test.com",
      });

      expect(result?._unsafeUnwrapErr()[0]).toBeInstanceOf(
        SendEventMessagesUseCase.FailedToFetchConfigurationError,
      );

      /**
       * Additionally check if outer error contains inner error cause
       */
      expect(result?._unsafeUnwrapErr()[0].errors).toStrictEqual(
        expect.arrayContaining([expect.any(BaseError)]),
      );
    });

    describe("Multiple configurations assigned for the same event", () => {
      it("Calls SMTP service to send email for each configuration", async () => {
        smtpConfigurationService.mockGetConfigurationsMethod.mockImplementation(
          MockSmptConfigurationService.returnValidTwoConfigurations,
        );

        await useCaseInstance.sendEventMessages({
          event: EVENT_TYPE,
          payload: {},
          channelSlug: "channel-slug",
          recipientEmail: "recipient@test.com",
        });

        expect(emailSender.mockSendEmailMethod).toHaveBeenCalledTimes(2);
      });

      it("Returns error if at least one configuration fails, even if second one works", async () => {
        smtpConfigurationService.mockGetConfigurationsMethod.mockImplementation(
          MockSmptConfigurationService.returnValidTwoConfigurations,
        );

        emailSender.mockSendEmailMethod.mockImplementationOnce(MockSmtpSender.returnEmptyResponse);

        emailSender.mockSendEmailMethod.mockImplementationOnce(MockSmtpSender.throwInvalidResponse);

        const result = await useCaseInstance.sendEventMessages({
          event: EVENT_TYPE,
          payload: {},
          channelSlug: "channel-slug",
          recipientEmail: "email@example.com",
        });

        expect(result.isErr()).toBe(true);

        const errors = result._unsafeUnwrapErr();

        expect(errors[0]).toBeInstanceOf(SendEventMessagesUseCase.ServerError);
      });
    });

    describe("Single configuration assigned for the event", () => {
      it("Returns error if event is set to not active", async () => {
        const smtpConfig = MockSmptConfigurationService.getSimpleConfigurationValue();

        smtpConfig.events[0].active = false;

        smtpConfigurationService.mockGetConfigurationsMethod.mockReturnValue(okAsync([smtpConfig]));

        const result = await useCaseInstance.sendEventMessages({
          event: EVENT_TYPE,
          payload: {},
          channelSlug: "channel-slug",
          recipientEmail: "recipient@test.com",
        });

        expect(result?.isErr()).toBe(true);
        expect(result?._unsafeUnwrapErr()[0]).toBeInstanceOf(
          SendEventMessagesUseCase.EventConfigNotActiveError,
        );
      });

      it.each(["senderName", "senderEmail"] as const)(
        "Returns error if configuration '%s' is missing in configuration",
        async (field) => {
          const smtpConfig = MockSmptConfigurationService.getSimpleConfigurationValue();

          smtpConfig[field] = undefined;

          smtpConfigurationService.mockGetConfigurationsMethod.mockReturnValue(
            okAsync([smtpConfig]),
          );

          const result = await useCaseInstance.sendEventMessages({
            event: EVENT_TYPE,
            payload: {},
            channelSlug: "channel-slug",
            recipientEmail: "recipient@test.com",
          });

          expect(result?.isErr()).toBe(true);
          expect(result?._unsafeUnwrapErr()[0]).toBeInstanceOf(
            SendEventMessagesUseCase.InvalidSenderConfigError,
          );
        },
      );

      it("Returns error if email compilation fails", async () => {
        emailCompiler.mockEmailCompileMethod.mockImplementation(
          MockEmailCompiler.returnErrorCompiling,
        );

        const result = await useCaseInstance.sendEventMessages({
          event: EVENT_TYPE,
          payload: {},
          channelSlug: "channel-slug",
          recipientEmail: "recipient@test.com",
        });

        expect(result?.isErr()).toBe(true);
        expect(result?._unsafeUnwrapErr()[0]).toBeInstanceOf(
          SendEventMessagesUseCase.EmailCompilationError,
        );
      });

      it("Calls SMTP service to send email", async () => {
        await useCaseInstance.sendEventMessages({
          event: EVENT_TYPE,
          payload: {},
          channelSlug: "channel-slug",
          recipientEmail: "recipient@test.com",
        });

        expect(emailSender.mockSendEmailMethod).toHaveBeenCalledOnce();
      });
    });

    describe("Fallback SMTP behavior", () => {
      beforeEach(() => {
        smtpConfigurationService.mockGetConfigurationsMethod.mockImplementation(
          MockSmptConfigurationService.returnEmptyConfigurationsList,
        );
        smtpConfigurationService.mockGetIsFallbackSmtpEnabledMethod.mockReturnValue(okAsync(true));
      });

      it("Sends email using fallback SMTP configuration when enabled and no custom configs exist", async () => {
        mockGetFallbackSmtpConfigSchema.mockReturnValue(
          MockSmptConfigurationService.getValidFallbackConfig(),
        );

        const result = await useCaseInstance.sendEventMessages({
          event: EVENT_TYPE,
          payload: {},
          channelSlug: "channel-slug",
          recipientEmail: "recipient@test.com",
        });

        expect(result.isOk()).toBe(true);
        expect(emailCompiler.mockEmailCompileMethod).toHaveBeenCalledOnce();
        expect(emailSender.mockSendEmailMethod).toHaveBeenCalledOnce();

        const sendMailArgs = emailSender.mockSendEmailMethod.mock.calls[0][0];

        expect(sendMailArgs.smtpSettings).toEqual({
          host: "fallback.smtp.com",
          port: 587,
          encryption: "TLS",
          auth: {
            user: "fallback-user",
            pass: "fallback-password",
          },
        });
      });

      it("Returns error when fallback is enabled but config is missing", async () => {
        mockGetFallbackSmtpConfigSchema.mockReturnValue(null);

        const result = await useCaseInstance.sendEventMessages({
          event: EVENT_TYPE,
          payload: {},
          channelSlug: "channel-slug",
          recipientEmail: "recipient@test.com",
        });

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()[0]).toBeInstanceOf(
          SendEventMessagesUseCase.FallbackSmtpConfigurationError,
        );
      });

      it("Returns error when email compilation fails with fallback config", async () => {
        mockGetFallbackSmtpConfigSchema.mockReturnValue(
          MockSmptConfigurationService.getValidFallbackConfig(),
        );
        emailCompiler.mockEmailCompileMethod.mockImplementation(
          MockEmailCompiler.returnErrorCompiling,
        );

        const result = await useCaseInstance.sendEventMessages({
          event: EVENT_TYPE,
          payload: {},
          channelSlug: "channel-slug",
          recipientEmail: "recipient@test.com",
        });

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()[0]).toBeInstanceOf(
          SendEventMessagesUseCase.EmailCompilationError,
        );
      });

      it("Returns error when SMTP sending fails with fallback config", async () => {
        mockGetFallbackSmtpConfigSchema.mockReturnValue(
          MockSmptConfigurationService.getValidFallbackConfig(),
        );
        emailSender.mockSendEmailMethod.mockImplementation(MockSmtpSender.throwInvalidResponse);

        const result = await useCaseInstance.sendEventMessages({
          event: EVENT_TYPE,
          payload: {},
          channelSlug: "channel-slug",
          recipientEmail: "recipient@test.com",
        });

        expect(result.isErr()).toBe(true);
        expect(result._unsafeUnwrapErr()[0]).toBeInstanceOf(SendEventMessagesUseCase.ServerError);
      });

      it("Uses fallback SMTP even when custom configs exist (when fallback is enabled)", async () => {
        smtpConfigurationService.mockGetConfigurationsMethod.mockImplementation(
          MockSmptConfigurationService.returnValidSingleConfiguration,
        );
        mockGetFallbackSmtpConfigSchema.mockReturnValue(
          MockSmptConfigurationService.getValidFallbackConfig(),
        );

        const result = await useCaseInstance.sendEventMessages({
          event: EVENT_TYPE,
          payload: {},
          channelSlug: "channel-slug",
          recipientEmail: "recipient@test.com",
        });

        expect(result.isOk()).toBe(true);

        const sendMailArgs = emailSender.mockSendEmailMethod.mock.calls[0][0];

        expect(sendMailArgs.smtpSettings.host).toBe("fallback.smtp.com");
      });

      it("Does not include auth when fallback SMTP user is not configured", async () => {
        const configWithoutAuth = MockSmptConfigurationService.getValidFallbackConfig();

        configWithoutAuth.smtpUser = undefined;
        configWithoutAuth.smtpPassword = undefined;
        mockGetFallbackSmtpConfigSchema.mockReturnValue(configWithoutAuth);

        const result = await useCaseInstance.sendEventMessages({
          event: EVENT_TYPE,
          payload: {},
          channelSlug: "channel-slug",
          recipientEmail: "recipient@test.com",
        });

        expect(result.isOk()).toBe(true);

        const sendMailArgs = emailSender.mockSendEmailMethod.mock.calls[0][0];

        expect(sendMailArgs.smtpSettings.auth).toBeUndefined();
      });
    });
  });
});
