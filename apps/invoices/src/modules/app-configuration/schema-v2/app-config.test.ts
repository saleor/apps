import { vi, expect, describe, it } from "vitest";
import { getMockAddress } from "../../../fixtures/mock-address";
import { AppConfigV2 } from "./app-config";

describe("AppConfig", function () {
  it("Serializes internal state", () => {
    const appConfig = new AppConfigV2();

    appConfig.upsertOverride("test", getMockAddress());

    const serialized = appConfig.serialize();

    expect(serialized).toMatchInlineSnapshot(
      `"{"channelsOverrides":{"test":{"companyName":"Saleor","cityArea":"","countryArea":"Dolnoslaskie","streetAddress1":"Techowa 7","streetAddress2":"","postalCode":"12-123","city":"Wrocław","country":"Poland"}}}"`,
    );
  });

  it("Parses from serialized form", () => {
    const appConfig = new AppConfigV2();

    appConfig.upsertOverride("test", getMockAddress());

    const serialized = appConfig.serialize();

    const parsed = AppConfigV2.parse(serialized);

    expect(parsed.getChannelsOverrides()).toEqual({
      test: getMockAddress(),
    });
  });

  it("Accepts initial state in constructor", () => {
    const appConfig = new AppConfigV2({ channelsOverrides: { test: getMockAddress() } });

    expect(appConfig.getChannelsOverrides()).toEqual({
      test: getMockAddress(),
    });
  });

  it("upsertOverride stores new channel address override", () => {
    const appConfig = new AppConfigV2({
      channelsOverrides: {
        existing: getMockAddress(),
      },
    });

    appConfig.upsertOverride("test", getMockAddress());

    expect(appConfig.getChannelsOverrides()).toEqual({
      test: getMockAddress(),
      existing: getMockAddress(),
    });
  });

  it("upsertOverride updates channel address override if exists", () => {
    const appConfig = new AppConfigV2({
      channelsOverrides: {
        test: getMockAddress(),
      },
    });

    appConfig.upsertOverride("test", {
      ...getMockAddress(),
      cityArea: "override",
    });

    expect(appConfig.getChannelsOverrides()).toEqual({
      test: { ...getMockAddress(), cityArea: "override" },
    });
  });

  it("removeOverride removes channel override from state", () => {
    const appConfig = new AppConfigV2({
      channelsOverrides: {
        test: getMockAddress(),
      },
    });

    appConfig.removeOverride("test");

    expect(appConfig.getChannelsOverrides()).toEqual({});
  });

  it("getChannelsOverrides returns record with overrides", () => {
    const appConfig = new AppConfigV2({
      channelsOverrides: {
        test: getMockAddress(),
      },
    });

    expect(appConfig.getChannelsOverrides()).toEqual({
      test: getMockAddress(),
    });
  });
});
