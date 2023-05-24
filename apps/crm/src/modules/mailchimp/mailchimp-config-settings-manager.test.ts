import { beforeEach, describe, expect, it, vi } from "vitest";
import { MailchimpConfigSettingsManagerV1 } from "./mailchimp-config-settings-manager";
import { Client } from "urql";
import { SettingsManager, SettingsValue } from "@saleor/app-sdk/settings-manager";

describe("MailchimpConfigSettingsManagerV1", () => {
  let mockSettingsManager: SettingsManager = {
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  };

  let service: MailchimpConfigSettingsManagerV1;

  beforeEach(() => {
    mockSettingsManager = {
      set: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    };

    service = new MailchimpConfigSettingsManagerV1(null as unknown as Client, "appID", () => {
      return mockSettingsManager;
    });
  });

  it("Calls settings manager with passed oauth config", async () => {
    let valueHasBeenSet: string;

    vi.mocked(mockSettingsManager.set).mockImplementation(
      async (values: SettingsValue[] | SettingsValue) => {
        // @ts-ignore
        valueHasBeenSet = values.value;
      }
    );

    await service.setConfig({
      token: "mailchimp-token",
      dc: "us41",
    });

    const parsedSetValue = JSON.parse(valueHasBeenSet!);

    expect(parsedSetValue).toMatchInlineSnapshot(`
      {
        "config": {
          "customerCreateEvent": {
            "enabled": false,
          },
          "dc": "us41",
          "token": "mailchimp-token",
        },
        "configVersion": "v1",
      }
    `);
  });

  it("Calls settings manager with default customerCreateEvent setting to be disabled", async () => {
    let valueHasBeenSet: string;

    vi.mocked(mockSettingsManager.set).mockImplementation(
      async (values: SettingsValue[] | SettingsValue) => {
        // @ts-ignore
        valueHasBeenSet = values.value;
      }
    );

    await service.setConfig({
      token: "mailchimp-token",
      dc: "us41",
    });

    const parsedSetValue = JSON.parse(valueHasBeenSet!);

    expect(parsedSetValue.config.customerCreateEvent.enabled).toBe(false);
  });

  it("Calls settings manager with default customerCreateEvent setting to be disabled", async () => {
    let valueHasBeenSet: string;

    vi.mocked(mockSettingsManager.set).mockImplementation(
      async (values: SettingsValue[] | SettingsValue) => {
        // @ts-ignore
        valueHasBeenSet = values.value;
      }
    );

    await service.setConfig({
      token: "mailchimp-token",
      dc: "us41",
    });

    const parsedSetValue = JSON.parse(valueHasBeenSet!);

    expect(parsedSetValue.config.customerCreateEvent.enabled).toBe(false);
  });

  it(".get returns null if data doesnt match schema", async () => {
    vi.mocked(mockSettingsManager.get).mockImplementationOnce(async (key: string) => {
      return "undefined";
    });

    await expect(service.getConfig()).resolves.toBeNull();

    vi.mocked(mockSettingsManager.get).mockImplementationOnce(async (key: string) => {
      return JSON.stringify({ foo: "bar" });
    });

    await expect(service.getConfig()).resolves.toBeNull();
  });

  it(".removeConfig method calls metadata manager DELETE method with a key", async () => {
    await service.removeConfig();

    return expect(mockSettingsManager.delete).toHaveBeenCalledWith("mailchimp_config_v1");
  });
});
