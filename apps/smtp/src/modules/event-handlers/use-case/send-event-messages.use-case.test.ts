import { err, errAsync, ok, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BaseError } from "../../../errors";
import {
  getFallbackSmtpConfigSchema,
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
  const actual =
    await importOriginal<typeof import("../../smtp/configuration/smtp-config-schema")>();

  return {
    ...actual,
    getFallbackSmtpConfigSchema: vi.fn(() => null),
  };
});

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

class MockConfigService implements IGetSmtpConfiguration, IGetFallbackSmtpEnabled {
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

  static returnValidSingleConfiguration: IGetSmtpConfiguration["getConfigurations"] = () => {
    return okAsync([MockConfigService.getSimpleConfigurationValue()]);
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

  static returnFallbackEnabled: IGetFallbackSmtpEnabled["getIsFallbackSmtpEnabled"] = () => {
    return okAsync(true);
  };

  static returnFallbackDisabled: IGetFallbackSmtpEnabled["getIsFallbackSmtpEnabled"] = () => {
    return okAsync(false);
  };

  static returnFallbackError: IGetFallbackSmtpEnabled["getIsFallbackSmtpEnabled"] = () => {
    return errAsync(new BaseError("Mock error fetching fallback config"));
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
  let configService: MockConfigService;

  let useCaseInstance: SendEventMessagesUseCase;

  beforeEach(() => {
    vi.resetAllMocks();

    emailCompiler = new MockEmailCompiler();
    emailSender = new MockSmtpSender();
    configService = new MockConfigService();

    emailCompiler.mockEmailCompileMethod.mockImplementation(
      MockEmailCompiler.returnSuccessCompiledEmail,
    );
    emailSender.mockSendEmailMethod.mockImplementation(MockSmtpSender.returnEmptyResponse);
    configService.mockGetConfigurationsMethod.mockImplementation(
      MockConfigService.returnValidSingleConfiguration,
    );
    configService.mockGetIsFallbackSmtpEnabledMethod.mockImplementation(
      MockConfigService.returnFallbackDisabled,
    );

    useCaseInstance = new SendEventMessagesUseCase({
      emailCompiler,
      emailSender,
      configService,
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
    it("Returns NoOp error if configurations list is empty and fallback is disabled", async () => {
      configService.mockGetConfigurationsMethod.mockImplementation(
        MockConfigService.returnEmptyConfigurationsList,
      );
      configService.mockGetIsFallbackSmtpEnabledMethod.mockImplementation(
        MockConfigService.returnFallbackDisabled,
      );

      const result = await useCaseInstance.sendEventMessages({
        event: EVENT_TYPE,
        payload: {},
        channelSlug: "channel-slug",
        recipientEmail: "recipient@test.com",
      });

      expect(result?._unsafeUnwrapErr()[0]).toBeInstanceOf(
        SendEventMessagesUseCase.FallbackNotConfiguredError,
      );
    });

    it("Returns error if failed to fetch configurations", async () => {
      configService.mockGetConfigurationsMethod.mockImplementation(
        MockConfigService.returnErrorFetchingConfigurations,
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

    describe("Fallback SMTP behavior", () => {
      beforeEach(() => {
        configService.mockGetConfigurationsMethod.mockImplementation(
          MockConfigService.returnEmptyConfigurationsList,
        );
      });

      it("Sends email with fallback config when enabled and env is configured", async () => {
        configService.mockGetIsFallbackSmtpEnabledMethod.mockImplementation(
          MockConfigService.returnFallbackEnabled,
        );

        vi.mocked(getFallbackSmtpConfigSchema).mockReturnValue({
          smtpHost: "fallback.smtp.host",
          smtpPort: "587",
          smtpUser: "fallback-user",
          smtpPassword: "fallback-pass",
          encryption: "TLS",
          senderName: "Fallback Sender",
          senderEmail: "fallback@example.com",
        });

        const result = await useCaseInstance.sendEventMessages({
          event: EVENT_TYPE,
          payload: {},
          channelSlug: "channel-slug",
          recipientEmail: "recipient@test.com",
        });

        expect(result.isOk()).toBe(true);
        expect(emailSender.mockSendEmailMethod).toHaveBeenCalledOnce();
      });

      it("Returns NoOp error when fallback is enabled but env is not configured", async () => {
        configService.mockGetIsFallbackSmtpEnabledMethod.mockImplementation(
          MockConfigService.returnFallbackEnabled,
        );

        vi.mocked(getFallbackSmtpConfigSchema).mockReturnValue(null);

        const result = await useCaseInstance.sendEventMessages({
          event: EVENT_TYPE,
          payload: {},
          channelSlug: "channel-slug",
          recipientEmail: "recipient@test.com",
        });

        expect(result?._unsafeUnwrapErr()[0]).toBeInstanceOf(
          SendEventMessagesUseCase.FallbackNotConfiguredError,
        );
      });

      it("Returns NoOp error when fallback check returns an error", async () => {
        configService.mockGetIsFallbackSmtpEnabledMethod.mockImplementation(
          MockConfigService.returnFallbackError,
        );

        const result = await useCaseInstance.sendEventMessages({
          event: EVENT_TYPE,
          payload: {},
          channelSlug: "channel-slug",
          recipientEmail: "recipient@test.com",
        });

        expect(result?._unsafeUnwrapErr()[0]).toBeInstanceOf(
          SendEventMessagesUseCase.FallbackNotConfiguredError,
        );
      });

      it("Uses custom configurations when available, regardless of fallback setting", async () => {
        configService.mockGetConfigurationsMethod.mockImplementation(
          MockConfigService.returnValidSingleConfiguration,
        );
        configService.mockGetIsFallbackSmtpEnabledMethod.mockImplementation(
          MockConfigService.returnFallbackEnabled,
        );

        const result = await useCaseInstance.sendEventMessages({
          event: EVENT_TYPE,
          payload: {},
          channelSlug: "channel-slug",
          recipientEmail: "recipient@test.com",
        });

        expect(result.isOk()).toBe(true);
        expect(emailSender.mockSendEmailMethod).toHaveBeenCalledOnce();
        // Fallback should not be checked when custom configs exist
        expect(configService.mockGetIsFallbackSmtpEnabledMethod).not.toHaveBeenCalled();
      });

      it("Uses default templates when sending via fallback", async () => {
        configService.mockGetIsFallbackSmtpEnabledMethod.mockImplementation(
          MockConfigService.returnFallbackEnabled,
        );

        vi.mocked(getFallbackSmtpConfigSchema).mockReturnValue({
          smtpHost: "fallback.smtp.host",
          smtpPort: "587",
          smtpUser: "fallback-user",
          smtpPassword: "fallback-pass",
          encryption: "TLS",
          senderName: "Fallback Sender",
          senderEmail: "fallback@example.com",
        });

        await useCaseInstance.sendEventMessages({
          event: EVENT_TYPE,
          payload: {},
          channelSlug: "channel-slug",
          recipientEmail: "recipient@test.com",
        });

        expect(emailCompiler.mockEmailCompileMethod).toHaveBeenCalledWith(
          expect.objectContaining({
            senderEmail: "fallback@example.com",
            senderName: "Fallback Sender",
          }),
        );
      });
    });

    describe("Multiple configurations assigned for the same event", () => {
      it("Calls SMTP service to send email for each configuration", async () => {
        configService.mockGetConfigurationsMethod.mockImplementation(
          MockConfigService.returnValidTwoConfigurations,
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
        configService.mockGetConfigurationsMethod.mockImplementation(
          MockConfigService.returnValidTwoConfigurations,
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
        const smtpConfig = MockConfigService.getSimpleConfigurationValue();

        smtpConfig.events[0].active = false;

        configService.mockGetConfigurationsMethod.mockReturnValue(okAsync([smtpConfig]));

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
          const smtpConfig = MockConfigService.getSimpleConfigurationValue();

          smtpConfig[field] = undefined;

          configService.mockGetConfigurationsMethod.mockReturnValue(okAsync([smtpConfig]));

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
  });
});
