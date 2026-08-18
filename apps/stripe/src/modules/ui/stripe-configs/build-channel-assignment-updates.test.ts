import { describe, expect, it } from "vitest";

import { type ConfigChannelFragment } from "@/generated/graphql";
import { type StripeFrontendConfigSerializedFields } from "@/modules/app-config/domain/stripe-config";

import {
  buildChannelAssignmentUpdates,
  type ChannelMapping,
} from "./build-channel-assignment-updates";

const channel = (id: string): ConfigChannelFragment => ({
  id,
  name: `Channel ${id}`,
  slug: id,
  isActive: true,
  currencyCode: "USD",
});

const config = (id: string): StripeFrontendConfigSerializedFields => ({
  id,
  name: `Config ${id}`,
  restrictedKey: "rk_test_...",
  publishableKey: "pk_test_...",
});

const channels = [channel("channel-1"), channel("channel-2"), channel("channel-3")];

const thisConfig = config("config-1");
const otherConfig = config("config-2");

const build = (mapping: ChannelMapping, selected: string[]) =>
  buildChannelAssignmentUpdates({
    channels,
    mapping,
    configId: thisConfig.id,
    selectedChannelIds: new Set(selected),
  });

describe("buildChannelAssignmentUpdates", () => {
  it("Returns no updates when the selection matches the saved mapping", () => {
    expect(build({ "channel-1": thisConfig }, ["channel-1"])).toStrictEqual([]);
  });

  it("Assigns newly selected channels that have no config", () => {
    expect(build({}, ["channel-2"])).toStrictEqual([
      { channelId: "channel-2", configId: thisConfig.id },
    ]);
  });

  it("Re-points a channel that is assigned to another config", () => {
    expect(build({ "channel-3": otherConfig }, ["channel-3"])).toStrictEqual([
      { channelId: "channel-3", configId: thisConfig.id },
    ]);
  });

  it("Unassigns channels removed from the selection", () => {
    expect(build({ "channel-1": thisConfig }, [])).toStrictEqual([
      { channelId: "channel-1", configId: null },
    ]);
  });

  it("Leaves channels owned by other configs untouched when not selected", () => {
    expect(build({ "channel-2": otherConfig }, [])).toStrictEqual([]);
  });
});
