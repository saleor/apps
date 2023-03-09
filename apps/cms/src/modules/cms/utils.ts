import { SettingsValue } from "@saleor/app-sdk/settings-manager";
import { CMSSchema } from "../../lib/cms/config";

const commonSettingsTypes = {
  array: ["enabledProviders"],
};

export type Setting = SettingsValue;

export const generateUniqueId = () => {
  const date = new Date();
  const offsetInMinutes = date.getTimezoneOffset();

  const randomDate = date.setMinutes(date.getMinutes() + offsetInMinutes).valueOf();
  const randomString = (Math.random() + 1).toString(36).substring(7);

  return `${randomString}${randomDate}`;
};

const parseSettingsArray = (value: string) => {
  return value.replace("[", "").replace("]", "").split(",");
};

const parseSettingsValue = (key: string, value: string) => {
  if (commonSettingsTypes.array.includes(key)) {
    return parseSettingsArray(value);
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
};

// * MetadataManager that fuels the /api/settings endpoint can only store an array of { key: string; value: string }.
// * CMS Hub features a number of CMSes, each having its own config.

export type BaseConfig = Record<
  string,
  Record<string, Record<string, string | boolean | string[]>>
>;

export const transformSettingsIntoConfig = (settings: Setting[]): BaseConfig => {
  return settings.reduce((prev, { key, value }) => {
    const [major, minor, patch] = key.split(".");
    return {
      ...prev,
      [major]: {
        ...prev[major],
        [minor]: {
          ...prev[major][minor],
          [patch]: parseSettingsValue(key, value),
        },
      },
    };
  }, {} as Record<string, Record<string, Record<string, string | boolean | string[]>>>);
};

const parseOptionValue = ({
  name,
  value,
}: {
  name: string;
  value: string | boolean | string[];
}): string => {
  if (name.includes("enabled")) {
    return String(value === true);
  }

  return String(value);
};

export const resolveInstanceId = (instanceName: string) => instanceName.replaceAll(" ", "-");

export const transformConfigIntoSettings = <T extends keyof CMSSchema>(
  type: T,
  instance: string,
  config: CMSSchema[T]
): Setting[] => {
  return Object.entries(config)
    .map(([name, value]) => {
      return {
        key: `${type}.${resolveInstanceId(instance)}.${name}`,
        value: parseOptionValue({ name, value }),
      };
    })
    .flatMap((c) => c);
};
