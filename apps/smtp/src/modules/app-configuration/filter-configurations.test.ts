import { describe, expect, it } from "vitest";
import { FilterableConfiguration, filterConfigurations } from "./filter-configurations";

const enabledConfiguration: FilterableConfiguration = {
  id: "enabled",
  active: true,
  channels: {
    channels: [],
    mode: "exclude",
    override: false,
  },
};

const disabledConfiguration: FilterableConfiguration = {
  id: "disabled",
  active: false,
  channels: {
    channels: [],
    mode: "exclude",
    override: false,
  },
};

const channelRestrictedEnabledConfiguration: FilterableConfiguration = {
  id: "restrictedEnabled",
  active: true,
  channels: {
    channels: ["default-channel"],
    mode: "restrict",
    override: true,
  },
};

const channelRestrictedDisabledConfiguration: FilterableConfiguration = {
  id: "restrictedDisabled",
  active: false,
  channels: {
    channels: ["other-channel"],
    mode: "restrict",
    override: true,
  },
};

const exampleConfigurations = [
  enabledConfiguration,
  disabledConfiguration,
  channelRestrictedEnabledConfiguration,
  channelRestrictedDisabledConfiguration,
];

describe("filterConfigurations", function () {
  it("Pass all configurations, when no filters provided", () => {
    expect(
      filterConfigurations({
        configurations: exampleConfigurations,
      }),
    ).toEqual(exampleConfigurations);
  });

  it("Return only active configurations, when active filter provided", () => {
    expect(
      filterConfigurations({
        configurations: exampleConfigurations,
        filter: {
          active: true,
        },
      }),
    ).toEqual([enabledConfiguration, channelRestrictedEnabledConfiguration]);
  });

  it("Return only configurations which can be used with provided channel, when channel filter provided", () => {
    expect(
      filterConfigurations({
        configurations: exampleConfigurations,
        filter: {
          availableInChannel: "default-channel",
        },
      }),
    ).toEqual([enabledConfiguration, disabledConfiguration, channelRestrictedEnabledConfiguration]);
  });

  it("Return only configurations with matching ids, when id filter provided", () => {
    expect(
      filterConfigurations({
        configurations: exampleConfigurations,
        filter: {
          ids: ["enabled", "restrictedEnabled"],
        },
      }),
    ).toEqual([enabledConfiguration, channelRestrictedEnabledConfiguration]);
  });

  it("Return only configurations matching all the requirements, when multiple filters provided", () => {
    expect(
      filterConfigurations({
        configurations: exampleConfigurations,
        filter: {
          ids: ["enabled", "restrictedDisabled"],
          active: true,
        },
      }),
    ).toEqual([enabledConfiguration]);
  });
});
