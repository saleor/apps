import { describe, expect, it } from "vitest";

import { type ConfigChannelFragment } from "@/generated/graphql";
import { type StripeFrontendConfigSerializedFields } from "@/modules/app-config/domain/stripe-config";

import { type ChannelMapping } from "./build-channel-assignment-updates";
import { buildChannelMovePlan } from "./build-channel-move-plan";

const channel = (id: string): ConfigChannelFragment => ({
  id,
  name: `Channel ${id}`,
  slug: id,
  isActive: true,
  currencyCode: "USD",
});

const config = (
  id: string,
  env: "test" | "live" = "test",
): StripeFrontendConfigSerializedFields => ({
  id,
  name: `Config ${id}`,
  restrictedKey: `rk_${env}_...`,
  publishableKey: `pk_${env}_...`,
});

const channels = [channel("channel-1"), channel("channel-2")];

const sandboxTarget = config("config-1");
const otherSandbox = config("config-2");
const otherLive = config("config-3", "live");

const plan = (mapping: ChannelMapping, selected: string[], target = sandboxTarget) =>
  buildChannelMovePlan({
    channels,
    mapping,
    targetConfig: target,
    selectedChannelIds: new Set(selected),
  });

describe("buildChannelMovePlan", () => {
  it("Reports nothing for channels that have no configuration yet", () => {
    expect(plan({}, ["channel-1"])).toStrictEqual([]);
  });

  it("Reports nothing for channels already assigned to the target", () => {
    expect(plan({ "channel-1": sandboxTarget }, ["channel-1"])).toStrictEqual([]);
  });

  it("Reports nothing for channels owned elsewhere but left unselected", () => {
    expect(plan({ "channel-1": otherSandbox }, [])).toStrictEqual([]);
  });

  it("Reports a channel taken from another configuration in the same environment", () => {
    expect(plan({ "channel-1": otherSandbox }, ["channel-1"])).toStrictEqual([
      {
        channelId: "channel-1",
        channelName: "Channel channel-1",
        fromConfigName: "Config config-2",
        fromEnv: "TEST",
        changesEnv: false,
      },
    ]);
  });

  it("Flags a move that swaps live keys for sandbox ones", () => {
    expect(plan({ "channel-1": otherLive }, ["channel-1"])[0]).toMatchObject({
      fromEnv: "LIVE",
      changesEnv: true,
    });
  });

  it("Flags a move that swaps sandbox keys for live ones", () => {
    expect(plan({ "channel-1": otherSandbox }, ["channel-1"], otherLive)[0]).toMatchObject({
      fromEnv: "TEST",
      changesEnv: true,
    });
  });

  it("Keeps every moved channel in mapping order", () => {
    expect(
      plan({ "channel-1": otherSandbox, "channel-2": otherLive }, ["channel-1", "channel-2"]).map(
        (move) => move.channelId,
      ),
    ).toStrictEqual(["channel-1", "channel-2"]);
  });
});
