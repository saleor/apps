import { beforeEach, describe, expect, it, vi } from "vitest";
import { SendEventMessagesUseCase } from "./send-event-messages.use-case";
import { SendEventMessagesUseCaseFactory } from "./send-event-messages.use-case.factory";
import { errAsync, ok, okAsync, Result } from "neverthrow";
import { CompiledEmail, IEmailCompiler } from "../smtp/services/email-compiler";
import { BaseError } from "../../errors";
import { ISMTPEmailSender } from "../smtp/services/smtp-email-sender";
import { IGetSmtpConfiguration } from "../smtp/configuration/smtp-configuration.service";
import { SmtpConfiguration } from "../smtp/configuration/smtp-config-schema";

class MockEmailCompiler implements IEmailCompiler {
  static returnSuccessCompiledEmail = (): Result<CompiledEmail, never> =>
    ok({
      text: "html text",
      from: "email from",
      subject: "email subject",
      html: "<html>html text</html>",
      to: "email to",
    });

  mockEmailCompileMethod = vi.fn<
    Parameters<IEmailCompiler["compile"]>,
    ReturnType<IEmailCompiler["compile"]>
  >();

  compile = this.mockEmailCompileMethod;
}

class MockSmtpSender implements ISMTPEmailSender {
  static returnEmptyResponse: ISMTPEmailSender["sendEmailWithSmtp"] = async () => {
    return { response: {} };
  };

  mockSendEmailMethod = vi.fn<
    Parameters<ISMTPEmailSender["sendEmailWithSmtp"]>,
    ReturnType<ISMTPEmailSender["sendEmailWithSmtp"]>
  >();

  sendEmailWithSmtp = this.mockSendEmailMethod;
}

class MockSmptConfigurationService implements IGetSmtpConfiguration {
  static getSimpleConfigurationValue = (): SmtpConfiguration => {
    return {
      id: "1",
      active: true,
      senderEmail: "sender@email.com",
      senderName: "Sender Name",
      events: [
        {
          active: true,
          eventType: "ACCOUNT_DELETE",
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
    return okAsync([MockSmptConfigurationService.getSimpleConfigurationValue()]);
  };

  static returnEmptyConfigurationsList: IGetSmtpConfiguration["getConfigurations"] = () => {
    return okAsync([]);
  };

  static returnErrorFetchingConfigurations: IGetSmtpConfiguration["getConfigurations"] = () => {
    return errAsync(new BaseError("Mock fail to fetch"));
  };

  mockGetConfigurationsMethod = vi.fn<
    Parameters<IGetSmtpConfiguration["getConfigurations"]>,
    ReturnType<IGetSmtpConfiguration["getConfigurations"]>
  >();

  getConfigurations = this.mockGetConfigurationsMethod;
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
        event: "ACCOUNT_CHANGE_EMAIL_CONFIRM",
        payload: {},
        channelSlug: "channel-slug",
        recipientEmail: "recipient@test.com",
      });

      expect(result?._unsafeUnwrapErr()).toBeInstanceOf(
        SendEventMessagesUseCase.MissingAvailableConfigurationError,
      );
    });

    it("Returns error if failed to fetch configurations", async () => {
      smtpConfigurationService.mockGetConfigurationsMethod.mockImplementation(
        MockSmptConfigurationService.returnErrorFetchingConfigurations,
      );

      const result = await useCaseInstance.sendEventMessages({
        event: "ACCOUNT_CHANGE_EMAIL_CONFIRM",
        payload: {},
        channelSlug: "channel-slug",
        recipientEmail: "recipient@test.com",
      });

      expect(result?._unsafeUnwrapErr()).toBeInstanceOf(
        SendEventMessagesUseCase.FailedToFetchConfigurationError,
      );

      /**
       * Additionally check if outer error contains inner error cause
       */
      expect(result?._unsafeUnwrapErr().errors).toStrictEqual(
        expect.arrayContaining([expect.any(BaseError)]),
      );
    });

    describe("Multiple configurations assigned for the same event", () => {
      it.todo("Calls SMTP service to send email for each configuration");
    });

    describe("Single configuration assigned for the event", () => {
      it.todo("Does nothing (?) if config is missing for this event");

      it.todo("Does nothing (?) if event is set to not active");

      it.todo("Does nothing (?) if configuration sender name is missing");

      it.todo("Does nothing (?) if configuration sender email is missing");

      it.todo("Does nothing (?) if email compilation fails");

      it.todo("Calls SMTP service to send email");
    });
  });
});
