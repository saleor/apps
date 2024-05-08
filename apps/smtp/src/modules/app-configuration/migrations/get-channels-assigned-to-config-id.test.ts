import { expect, describe, it } from "vitest";
import { getChannelsAssignedToConfigId } from "./get-channels-assigned-to-config-id";

describe("getChannelsAssignedToConfigId", function () {
  it("Do not assign to any channel, when theres no app configuration", () => {
    const channels = getChannelsAssignedToConfigId("id", "sendgrid", undefined);

    expect(channels).toEqual({
      channels: [],
      mode: "restrict",
      override: true,
    });
  });

  it("Do not assign sendgrid configuration to any channel, when app configuration did not assigned it", () => {
    const channels = getChannelsAssignedToConfigId("id", "sendgrid", {
      configurationsPerChannel: {
        "default-channel": {
          active: true,
          sendgridConfigurationId: "other-id",
          mjmlConfigurationId: "id",
        },
        "other-channel": {
          active: true,
          mjmlConfigurationId: "id",
        },
      },
    });

    expect(channels).toEqual({
      channels: [],
      mode: "restrict",
      override: true,
    });
  });

  it("Assign sendgrid configuration to channel, when app configuration has assigned it", () => {
    const channels = getChannelsAssignedToConfigId("id", "sendgrid", {
      configurationsPerChannel: {
        "default-channel": {
          active: true,
          sendgridConfigurationId: "id",
        },
        "other-channel": {
          active: true,
          sendgridConfigurationId: "id",
        },
      },
    });

    expect(channels).toEqual({
      channels: ["default-channel", "other-channel"],
      mode: "restrict",
      override: true,
    });
  });

  it("Do not assign mjml configuration to any channel, when app configuration did not assigned it", () => {
    const channels = getChannelsAssignedToConfigId("id", "mjml", {
      configurationsPerChannel: {
        "default-channel": {
          active: true,
          mjmlConfigurationId: "other-id",
          sendgridConfigurationId: "id",
        },
        "other-channel": {
          active: true,
          sendgridConfigurationId: "id",
        },
      },
    });

    expect(channels).toEqual({
      channels: [],
      mode: "restrict",
      override: true,
    });
  });

  it("Assign mjml configuration to channel, when app configuration has assigned it", () => {
    const channels = getChannelsAssignedToConfigId("id", "mjml", {
      configurationsPerChannel: {
        "default-channel": {
          active: true,
          mjmlConfigurationId: "id",
        },
        "other-channel": {
          active: true,
          mjmlConfigurationId: "id",
        },
      },
    });

    expect(channels).toEqual({
      channels: ["default-channel", "other-channel"],
      mode: "restrict",
      override: true,
    });
  });
});
