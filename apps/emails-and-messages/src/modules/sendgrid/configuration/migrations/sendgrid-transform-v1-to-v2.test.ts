import { expect, describe, it } from "vitest";
import { sendgridTransformV1toV2 } from "./sendgrid-transform-v1-to-v2";

describe("sendgridTransformV1toV2", function () {
  it("No configurations, when no defined previously", () => {
    const migratedConfig = sendgridTransformV1toV2({
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
    const migratedConfig = sendgridTransformV1toV2({
      configV1: {
        configurations: [
          {
            id: "id",
            configurationName: "name",
            active: true,
            apiKey: "key",
            sandboxMode: true,
            senderEmail: "email",
            senderName: "name",
            events: [
              {
                active: true,
                eventType: "ORDER_CREATED",
                template: "template",
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
          apiKey: "key",
          sandboxMode: true,
          senderEmail: "email",
          senderName: "name",
          channels: {
            override: true,
            mode: "restrict",
            channels: [],
          },
          events: [
            {
              active: true,
              eventType: "ORDER_CREATED",
              template: "template",
            },
          ],
        },
      ],
    });
  });

  it("Migrate and assign to channel, when app configuration is passed", () => {
    const migratedConfig = sendgridTransformV1toV2({
      configV1: {
        configurations: [
          {
            id: "id",
            configurationName: "name",
            active: true,
            apiKey: "key",
            sandboxMode: true,
            senderEmail: "email",
            senderName: "name",
            events: [
              {
                active: true,
                eventType: "ORDER_CREATED",
                template: "template",
              },
            ],
          },
        ],
      },
      appConfigV1: {
        configurationsPerChannel: {
          "default-channel": {
            active: true,
            sendgridConfigurationId: "id",
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
          apiKey: "key",
          sandboxMode: true,
          senderEmail: "email",
          senderName: "name",
          channels: {
            override: true,
            mode: "restrict",
            channels: ["default-channel"],
          },
          events: [
            {
              active: true,
              eventType: "ORDER_CREATED",
              template: "template",
            },
          ],
        },
      ],
    });
  });
});
