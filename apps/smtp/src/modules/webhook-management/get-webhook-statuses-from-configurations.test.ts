import { describe, expect, it } from "vitest";

import { SmtpConfiguration } from "../smtp/configuration/smtp-config-schema";
import { getWebhookStatusesFromConfigurations } from "./get-webhook-statuses-from-configurations";
import { webhookStatusesFactory } from "./webhook-status-dict";

export const nonActiveSmtpConfiguration: SmtpConfiguration = {
  id: "1685343953413npk9p",
  active: false,
  name: "Best name",
  smtpHost: "smtpHost",
  smtpPort: "1337",
  encryption: "NONE",
  channels: {
    override: false,
    channels: [],
    mode: "restrict",
  },
  events: [
    {
      active: false,
      eventType: "ORDER_CREATED",
      template: "template",
      subject: "Order {{ order.number }} has been created!!",
    },
    {
      active: false,
      eventType: "ORDER_FULFILLED",
      template: "template",
      subject: "Order {{ order.number }} has been fulfilled",
    },
    {
      active: false,
      eventType: "ORDER_CONFIRMED",
      template: "template",
      subject: "Order {{ order.number }} has been confirmed",
    },
    {
      active: false,
      eventType: "ORDER_CANCELLED",
      template: "template",
      subject: "Order {{ order.number }} has been cancelled",
    },
    {
      active: false,
      eventType: "ORDER_FULLY_PAID",
      template: "template",
      subject: "Order {{ order.number }} has been fully paid",
    },
    {
      active: false,
      eventType: "INVOICE_SENT",
      template: "template",
      subject: "New invoice has been created",
    },
    {
      active: false,
      eventType: "ACCOUNT_CONFIRMATION",
      template: "template",
      subject: "Account activation",
    },
    {
      active: false,
      eventType: "ACCOUNT_PASSWORD_RESET",
      template: "template",
      subject: "Password reset request",
    },
    {
      active: false,
      eventType: "ACCOUNT_CHANGE_EMAIL_REQUEST",
      template: "template",
      subject: "Email change request",
    },
    {
      active: false,
      eventType: "ACCOUNT_CHANGE_EMAIL_CONFIRM",
      template: "template",
      subject: "Email change confirmation",
    },
    {
      active: false,
      eventType: "ACCOUNT_DELETE",
      template: "template",
      subject: "Account deletion",
    },
  ],
  smtpUser: "John",
  smtpPassword: "securepassword",
  senderEmail: "no-reply@example.com",
  senderName: "Sender Name",
};

describe("getWebhookStatusesFromConfigurations", function () {
  it("Statuses should be set to false, when no configurations passed", async () => {
    expect(
      getWebhookStatusesFromConfigurations({
        smtpConfigurations: [],
      }),
    ).toStrictEqual(webhookStatusesFactory({}));
  });

  it("Statuses should be set to false, when no active configurations passed", async () => {
    expect(
      getWebhookStatusesFromConfigurations({
        smtpConfigurations: [nonActiveSmtpConfiguration],
      }),
    ).toStrictEqual(webhookStatusesFactory({}));
  });

  it("Statuses should be set to false, when configuration is not active even if events were activated", async () => {
    const smtpConfiguration = {
      ...nonActiveSmtpConfiguration,
      events: nonActiveSmtpConfiguration.events.map((event) => ({ ...event, active: true })),
    };

    expect(
      getWebhookStatusesFromConfigurations({
        smtpConfigurations: [smtpConfiguration],
      }),
    ).toStrictEqual(webhookStatusesFactory({}));
  });

  it("Status of the event should be set to true, when at least one active configuration has activated it", async () => {
    const smtpConfiguration: SmtpConfiguration = {
      ...nonActiveSmtpConfiguration,
      active: true,
      events: [
        {
          active: true,
          eventType: "INVOICE_SENT",
          subject: "",
          template: "",
        },
      ],
    };

    expect(
      getWebhookStatusesFromConfigurations({
        smtpConfigurations: [nonActiveSmtpConfiguration, smtpConfiguration],
      }),
    ).toStrictEqual(webhookStatusesFactory({ enabledWebhooks: ["invoiceSentWebhook"] }));
  });

  it("Status of the NOTIFY webhooks should be set to true, when at least one active configuration has activated one of its related events", async () => {
    const smtpConfiguration: SmtpConfiguration = {
      ...nonActiveSmtpConfiguration,
      active: true,
      events: [
        {
          active: false,
          eventType: "ACCOUNT_CHANGE_EMAIL_CONFIRM",
          subject: "",
          template: "",
        },
        {
          active: true,
          eventType: "ACCOUNT_CHANGE_EMAIL_REQUEST",
          subject: "",
          template: "",
        },
      ],
    };

    expect(
      getWebhookStatusesFromConfigurations({
        smtpConfigurations: [nonActiveSmtpConfiguration, smtpConfiguration],
      }),
    ).toStrictEqual(webhookStatusesFactory({ enabledWebhooks: ["notifyWebhook"] }));
  });
});
