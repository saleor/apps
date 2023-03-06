import { messageEventTypes } from "../../event-handlers/message-event-types";
import { MjmlConfig as MjmlConfigurationRoot, MjmlConfiguration } from "./mjml-config";
import { defaultMjmlTemplates, defaultMjmlSubjectTemplates } from "../default-templates";

const getDefaultEventsConfiguration = (): MjmlConfiguration["events"] =>
  messageEventTypes.map((eventType) => ({
    active: true,
    eventType: eventType,
    template: defaultMjmlTemplates[eventType],
    subject: defaultMjmlSubjectTemplates[eventType],
  }));

export const getDefaultEmptyConfiguration = (): MjmlConfiguration => {
  const defaultConfig: MjmlConfiguration = {
    id: "",
    active: true,
    configurationName: "",
    senderName: "",
    senderEmail: "",
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    encryption: "NONE",
    events: getDefaultEventsConfiguration(),
  };

  return defaultConfig;
};

interface GetConfigurationArgs {
  id: string;
}

const getConfiguration =
  (mjmlConfigRoot: MjmlConfigurationRoot | null | undefined) =>
  ({ id }: GetConfigurationArgs) => {
    if (!mjmlConfigRoot || !mjmlConfigRoot.configurations) {
      return;
    }

    return mjmlConfigRoot.configurations.find((c) => c.id === id);
  };

interface FilterConfigurationsArgs {
  ids?: string[];
  active?: boolean;
}

const getConfigurations =
  (mjmlConfigRoot: MjmlConfigurationRoot | null | undefined) =>
  ({ ids, active }: FilterConfigurationsArgs): MjmlConfiguration[] => {
    if (!mjmlConfigRoot || !mjmlConfigRoot.configurations) {
      return [];
    }

    let filtered = mjmlConfigRoot.configurations;

    if (ids?.length) {
      filtered = filtered.filter((c) => ids.includes(c.id));
    }

    if (active !== undefined) {
      filtered = filtered.filter((c) => c.active === active);
    }

    return filtered;
  };

const createConfiguration =
  (mjmlConfigRoot: MjmlConfigurationRoot | null | undefined) =>
  (mjmlConfiguration: Omit<MjmlConfiguration, "id" | "events">) => {
    const mjmlConfigNormalized = structuredClone(mjmlConfigRoot) ?? { configurations: [] };

    // for creating a new configurations, the ID has to be generated
    const newConfiguration = {
      ...mjmlConfiguration,
      id: Date.now().toString(),
      events: getDefaultEventsConfiguration(),
    };
    mjmlConfigNormalized.configurations.unshift(newConfiguration);
    return mjmlConfigNormalized;
  };

const updateConfiguration =
  (mjmlConfig: MjmlConfigurationRoot | null | undefined) =>
  (mjmlConfiguration: MjmlConfiguration) => {
    const mjmlConfigNormalized = structuredClone(mjmlConfig) ?? { configurations: [] };

    const configurationIndex = mjmlConfigNormalized.configurations.findIndex(
      (configuration) => configuration.id === mjmlConfiguration.id
    );

    mjmlConfigNormalized.configurations[configurationIndex] = mjmlConfiguration;
    return mjmlConfigNormalized;
  };

interface DeleteConfigurationArgs {
  id: string;
}

const deleteConfiguration =
  (mjmlConfig: MjmlConfigurationRoot | null | undefined) =>
  ({ id }: DeleteConfigurationArgs) => {
    const mjmlConfigNormalized = structuredClone(mjmlConfig) ?? { configurations: [] };

    mjmlConfigNormalized.configurations = mjmlConfigNormalized.configurations.filter(
      (configuration) => configuration.id !== id
    );

    return mjmlConfigNormalized;
  };

export const MjmlConfigContainer = {
  createConfiguration,
  getConfiguration,
  updateConfiguration,
  deleteConfiguration,
  getConfigurations,
};
