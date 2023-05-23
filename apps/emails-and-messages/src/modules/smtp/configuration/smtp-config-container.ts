import { messageEventTypes } from "../../event-handlers/message-event-types";

import { defaultMjmlTemplates, defaultMjmlSubjectTemplates } from "../default-templates";
import { generateRandomId } from "../../../lib/generate-random-id";
import {
  SmtpConfiguration,
  smtpConfigurationSchema,
  smtpConfigurationEventSchema,
  SmtpConfig,
} from "./smtp-config-schema";
import { isAvailableInChannel } from "../../channels/is-available-in-channel";

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
  (smtpConfigRoot: SmtpConfig | null | undefined) =>
  ({ id }: GetConfigurationArgs) => {
    if (!smtpConfigRoot || !smtpConfigRoot.configurations) {
      return;
    }

    return smtpConfigRoot.configurations.find((c) => c.id === id);
  };

export interface FilterConfigurationsArgs {
  ids?: string[];
  availableInChannel?: string;
  active?: boolean;
}

const getConfigurations =
  (smtpConfigRoot: SmtpConfig | null | undefined) =>
  (filter: FilterConfigurationsArgs | undefined): SmtpConfiguration[] => {
    if (!smtpConfigRoot || !smtpConfigRoot.configurations) {
      return [];
    }

    let filtered = smtpConfigRoot.configurations;

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
  (smtpConfigRoot: SmtpConfig | null | undefined) =>
  (smtpConfiguration: Omit<SmtpConfiguration, "id" | "events">) => {
    const configNormalized = structuredClone(smtpConfigRoot) ?? { configurations: [] };

    // for creating a new configurations, the ID has to be generated
    const newConfiguration = {
      ...smtpConfiguration,
      id: generateRandomId(),
      events: getDefaultEventsConfiguration(),
    };

    configNormalized.configurations.push(newConfiguration);
    return configNormalized;
  };

const updateConfiguration =
  (smtpConfig: SmtpConfig | null | undefined) => (smtpConfiguration: SmtpConfiguration) => {
    const configNormalized = structuredClone(smtpConfig) ?? { configurations: [] };

    const configurationIndex = configNormalized.configurations.findIndex(
      (configuration) => configuration.id === smtpConfiguration.id
    );

    configNormalized.configurations[configurationIndex] = smtpConfiguration;
    return configNormalized;
  };

interface DeleteConfigurationArgs {
  id: string;
}

const deleteConfiguration =
  (smtpConfig: SmtpConfig | null | undefined) =>
  ({ id }: DeleteConfigurationArgs) => {
    const configNormalized = structuredClone(smtpConfig) ?? { configurations: [] };

    configNormalized.configurations = configNormalized.configurations.filter(
      (configuration) => configuration.id !== id
    );

    return configNormalized;
  };

export const SmtpConfigContainer = {
  createConfiguration,
  getConfiguration,
  updateConfiguration,
  deleteConfiguration,
  getConfigurations,
};
