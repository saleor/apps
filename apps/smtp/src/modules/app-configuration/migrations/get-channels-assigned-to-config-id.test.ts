import { describe, expect, it } from "vitest";
import { getChannelsAssignedToConfigId } from "./get-channels-assigned-to-config-id";

describe("getChannelsAssignedToConfigId", function () {
  it("Do not assign to any channel, when theres no app configuration", () => {
    const channels = getChannelsAssignedToConfigId("id", undefined);

    expect(channels).toEqual({
      channels: [],
      mode: "restrict",
      override: true,
    });
  });

  it("Do not assign mjml configuration to any channel, when app configuration did not assigned it", () => {
    const channels = getChannelsAssignedToConfigId("id", {
      configurationsPerChannel: {
        "default-channel": {
          active: true,
          mjmlConfigurationId: "other-id",
        },
        "other-channel": {
          active: true,
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
    const channels = getChannelsAssignedToConfigId("id", {
      configurationsPerChannel: {
        "default-channel": {
          active: true,
        },
        "other-channel": {
          active: true,
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
