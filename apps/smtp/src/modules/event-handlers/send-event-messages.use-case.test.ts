import { describe, expect, it } from "vitest";
import { SendEventMessagesUseCase } from "./send-event-messages.use-case";
import { SendEventMessagesUseCaseFactory } from "./send-event-messages.use-case.factory";

describe("SendEventMessagesUseCase", () => {
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
    it.todo("Returns error when no active configurations are available for selected channel");

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
