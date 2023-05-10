import { messageEventTypes } from "../../event-handlers/message-event-types";

import { defaultMjmlTemplates, defaultMjmlSubjectTemplates } from "../default-templates";
import { generateRandomId } from "../../../lib/generate-random-id";
import { isAvailableInChannel } from "../../../lib/channel-assignment/is-available-in-channel";
import {
  SmtpConfiguration,
  smtpConfigurationSchema,
  smtpConfigurationEventSchema,
  SmtpConfig,
} from "./mjml-config-schema";

export const getDefaultEventsConfiguration = (): SmtpConfiguration["events"] =>
  messageEventTypes.map((eventType) =>
    smtpConfigurationEventSchema.parse({
      eventType: eventType,
      template: defaultMjmlTemplates[eventType],
      subject: defaultMjmlSubjectTemplates[eventType],
    })
  );

export const getDefaultEmptyConfiguration = (): SmtpConfiguration => {
  const defaultConfig: SmtpConfiguration = smtpConfigurationSchema.parse({
    id: "id",
    name: "name",
    active: true,
    smtpHost: "host",
    smtpPort: "1024",
    channels: {
      excludedFrom: [],
      restrictedTo: [],
    },
    events: getDefaultEventsConfiguration(),
  });
  return defaultConfig;
};

interface GetConfigurationArgs {
  id: string;
}

const getConfiguration =
  (mjmlConfigRoot: SmtpConfig | null | undefined) =>
  ({ id }: GetConfigurationArgs) => {
    if (!mjmlConfigRoot || !mjmlConfigRoot.configurations) {
      return;
    }

    return mjmlConfigRoot.configurations.find((c) => c.id === id);
  };

export interface FilterConfigurationsArgs {
  ids?: string[];
  availableInChannel?: string;
  active?: boolean;
}

const getConfigurations =
  (mjmlConfigRoot: SmtpConfig | null | undefined) =>
  (filter: FilterConfigurationsArgs | undefined): SmtpConfiguration[] => {
    if (!mjmlConfigRoot || !mjmlConfigRoot.configurations) {
      return [];
    }

    let filtered = mjmlConfigRoot.configurations;

    if (!filter) {
      return filtered;
    }

    if (filter.ids?.length) {
      filtered = filtered.filter((c) => filter?.ids?.includes(c.id));
    }

    if (filter.active !== undefined) {
      filtered = filtered.filter((c) => c.active === filter.active);
    }

    if (filter.availableInChannel?.length) {
      filtered = filtered.filter((c) =>
        isAvailableInChannel({
          channel: filter.availableInChannel!,
          channelConfiguration: c.channels,
        })
      );
    }

    return filtered;
  };

const createConfiguration =
  (mjmlConfigRoot: SmtpConfig | null | undefined) =>
  (mjmlConfiguration: Omit<SmtpConfiguration, "id" | "events">) => {
    const mjmlConfigNormalized = structuredClone(mjmlConfigRoot) ?? { configurations: [] };

    // for creating a new configurations, the ID has to be generated
    const newConfiguration = {
      ...mjmlConfiguration,
      id: generateRandomId(),
      events: getDefaultEventsConfiguration(),
    };

    mjmlConfigNormalized.configurations.push(newConfiguration);
    return mjmlConfigNormalized;
  };

const updateConfiguration =
  (mjmlConfig: SmtpConfig | null | undefined) => (mjmlConfiguration: SmtpConfiguration) => {
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
  (mjmlConfig: SmtpConfig | null | undefined) =>
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
