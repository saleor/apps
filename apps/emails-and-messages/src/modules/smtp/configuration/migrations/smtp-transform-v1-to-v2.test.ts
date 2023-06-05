import { expect, describe, it } from "vitest";
import { smtpTransformV1toV2 } from "./smtp-transform-v1-to-v2";

describe("smtpTransformV1toV2", function () {
  it("No configurations, when no defined previously", () => {
    const migratedConfig = smtpTransformV1toV2({
      configV1: {
        configurations: [],
      },
      appConfigV1: undefined,
    });

    expect(migratedConfig).toEqual({
      configurations: [],
    });
  });

  it("Migrate and do not assign to any channel, when no app configuration passed", () => {
    const migratedConfig = smtpTransformV1toV2({
      configV1: {
        configurations: [
          {
            id: "id",
            configurationName: "name",
            active: true,
            encryption: "NONE",
            smtpHost: "host",
            smtpPort: "1234",
            smtpPassword: "password",
            smtpUser: "user",
            senderEmail: "email",
            senderName: "name",
            events: [
              {
                active: true,
                eventType: "ORDER_CREATED",
                template: "template",
                subject: "subject",
              },
            ],
          },
        ],
      },
      appConfigV1: undefined,
    });

    expect(migratedConfig).toEqual({
      configurations: [
        {
          id: "id",
          name: "name",
          active: true,
          encryption: "NONE",
          smtpHost: "host",
          smtpPort: "1234",
          smtpPassword: "password",
          smtpUser: "user",
          senderEmail: "email",
          senderName: "name",
          events: [
            {
              active: true,
              eventType: "ORDER_CREATED",
              template: "template",
              subject: "subject",
            },
          ],
          channels: {
            override: true,
            mode: "restrict",
            channels: [],
          },
        },
      ],
    });
  });

  it("Migrate and assign to channel, when app configuration is passed", () => {
    const migratedConfig = smtpTransformV1toV2({
      configV1: {
        configurations: [
          {
            id: "id",
            configurationName: "name",
            active: true,
            encryption: "NONE",
            smtpHost: "host",
            smtpPort: "1234",
            smtpPassword: "password",
            smtpUser: "user",
            senderEmail: "email",
            senderName: "name",
            events: [
              {
                active: true,
                eventType: "ORDER_CREATED",
                template: "template",
                subject: "subject",
              },
            ],
          },
        ],
      },
      appConfigV1: {
        configurationsPerChannel: {
          "default-channel": {
            active: true,
            mjmlConfigurationId: "id",
          },
        },
      },
    });

    expect(migratedConfig).toEqual({
      configurations: [
        {
          id: "id",
          name: "name",
          active: true,
          encryption: "NONE",
          smtpHost: "host",
          smtpPort: "1234",
          smtpPassword: "password",
          smtpUser: "user",
          senderEmail: "email",
          senderName: "name",
          events: [
            {
              active: true,
              eventType: "ORDER_CREATED",
              template: "template",
              subject: "subject",
            },
          ],
          channels: {
            override: true,
            mode: "restrict",
            channels: ["default-channel"],
          },
        },
      ],
    });
  });
});
