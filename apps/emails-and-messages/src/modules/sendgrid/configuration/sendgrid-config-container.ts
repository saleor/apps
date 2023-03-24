import { generateRandomId } from "../../../lib/generate-random-id";
import { messageEventTypes } from "../../event-handlers/message-event-types";
import {
  SendgridConfig as SendgridConfigurationRoot,
  SendgridConfiguration,
} from "./sendgrid-config";

export const getDefaultEventsConfiguration = (): SendgridConfiguration["events"] =>
  messageEventTypes.map((eventType) => ({
    active: true,
    eventType: eventType,
    template: "",
  }));

export const getDefaultEmptyConfiguration = (): SendgridConfiguration => {
  const defaultConfig: SendgridConfiguration = {
    id: "",
    active: true,
    configurationName: "",
    senderName: undefined,
    senderEmail: undefined,
    apiKey: "",
    sandboxMode: false,
    events: getDefaultEventsConfiguration(),
  };

  return defaultConfig;
};

interface GetConfigurationArgs {
  id: string;
}

const getConfiguration =
  (sendgridConfigRoot: SendgridConfigurationRoot | null | undefined) =>
  ({ id }: GetConfigurationArgs) => {
    if (!sendgridConfigRoot || !sendgridConfigRoot.configurations) {
      return;
    }

    return sendgridConfigRoot.configurations.find((c) => c.id === id);
  };

export interface FilterConfigurationsArgs {
  ids?: string[];
  active?: boolean;
}

const getConfigurations =
  (sendgridConfigRoot: SendgridConfigurationRoot | null | undefined) =>
  (filter: FilterConfigurationsArgs | undefined): SendgridConfiguration[] => {
    if (!sendgridConfigRoot || !sendgridConfigRoot.configurations) {
      return [];
    }

    let filtered = sendgridConfigRoot.configurations;

    if (filter?.ids?.length) {
      filtered = filtered.filter((c) => filter?.ids?.includes(c.id));
    }

    if (filter?.active !== undefined) {
      filtered = filtered.filter((c) => c.active === filter.active);
    }

    return filtered;
  };

const createConfiguration =
  (sendgridConfigRoot: SendgridConfigurationRoot | null | undefined) =>
  (sendgridConfiguration: Omit<SendgridConfiguration, "id" | "events">) => {
    const sendgridConfigNormalized = structuredClone(sendgridConfigRoot) ?? { configurations: [] };

    // for creating a new configurations, the ID has to be generated
    const newConfiguration = {
      ...sendgridConfiguration,
      id: generateRandomId(),
      events: getDefaultEventsConfiguration(),
    };
    sendgridConfigNormalized.configurations.push(newConfiguration);
    return sendgridConfigNormalized;
  };

const updateConfiguration =
  (sendgridConfig: SendgridConfigurationRoot | null | undefined) =>
  (sendgridConfiguration: SendgridConfiguration) => {
    const sendgridConfigNormalized = structuredClone(sendgridConfig) ?? { configurations: [] };

    const configurationIndex = sendgridConfigNormalized.configurations.findIndex(
      (configuration) => configuration.id === sendgridConfiguration.id
    );

    sendgridConfigNormalized.configurations[configurationIndex] = sendgridConfiguration;
    return sendgridConfigNormalized;
  };

interface DeleteConfigurationArgs {
  id: string;
}

const deleteConfiguration =
  (sendgridConfig: SendgridConfigurationRoot | null | undefined) =>
  ({ id }: DeleteConfigurationArgs) => {
    const sendgridConfigNormalized = structuredClone(sendgridConfig) ?? { configurations: [] };

    sendgridConfigNormalized.configurations = sendgridConfigNormalized.configurations.filter(
      (configuration) => configuration.id !== id
    );

    return sendgridConfigNormalized;
  };

export const SendgridConfigContainer = {
  createConfiguration,
  getConfiguration,
  updateConfiguration,
  deleteConfiguration,
  getConfigurations,
};
