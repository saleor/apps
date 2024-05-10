import { describe, expect, it } from "vitest";
import { isAvailableInChannel } from "./is-available-in-channel";

describe("isAvailableInChannel", function () {
  it("Passes when no overrides are set", () => {
    expect(
      isAvailableInChannel({
        channel: "default-channel",
        channelConfiguration: {
          channels: [],
          mode: "restrict",
          override: false,
        },
      }),
    ).toEqual(true);
  });

  describe("Restrict mode", () => {
    it("Fails if no channel is specified", () => {
      expect(
        isAvailableInChannel({
          channel: "default-channel",
          channelConfiguration: {
            channels: [],
            mode: "restrict",
            override: true,
          },
        }),
      ).toEqual(false);
    });
    it("Fails if tested channel is not on the list", () => {
      expect(
        isAvailableInChannel({
          channel: "default-channel",
          channelConfiguration: {
            channels: ["another-channel"],
            mode: "restrict",
            override: true,
          },
        }),
      ).toEqual(false);
    });
    it("Passes if tested channel is on the list", () => {
      expect(
        isAvailableInChannel({
          channel: "default-channel",
          channelConfiguration: {
            channels: ["default-channel"],
            mode: "restrict",
            override: true,
          },
        }),
      ).toEqual(true);
    });
  });

  describe("Exclude mode", () => {
    it("Passes if no channel is specified", () => {
      expect(
        isAvailableInChannel({
          channel: "default-channel",
          channelConfiguration: {
            channels: [],
            mode: "exclude",
            override: true,
          },
        }),
      ).toEqual(true);
    });
    it("Passes if other channels are specified", () => {
      expect(
        isAvailableInChannel({
          channel: "default-channel",
          channelConfiguration: {
            channels: ["other-channel", "different-channel"],
            mode: "exclude",
            override: true,
          },
        }),
      ).toEqual(true);
    });
    it("Fails if channel is on the list", () => {
      expect(
        isAvailableInChannel({
          channel: "default-channel",
          channelConfiguration: {
            channels: ["default-channel", "different-channel"],
            mode: "exclude",
            override: true,
          },
        }),
      ).toEqual(false);
    });
  });
});
