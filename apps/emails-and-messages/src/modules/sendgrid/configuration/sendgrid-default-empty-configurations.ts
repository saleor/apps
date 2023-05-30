import { messageEventTypes } from "../../event-handlers/message-event-types";
import {
  SendgridConfiguration,
  sendgridConfigurationEventSchema,
  sendgridConfigurationSchema,
} from "./sendgrid-config-schema";

const eventsConfiguration = (): SendgridConfiguration["events"] =>
  messageEventTypes.map((eventType) => sendgridConfigurationEventSchema.parse({ eventType }));

const configuration = (): SendgridConfiguration => {
  const defaultConfig: SendgridConfiguration = sendgridConfigurationSchema.parse({
    id: "id",
    name: "name",
    apiKey: "key",
    channels: {
      excludedFrom: [],
      restrictedTo: [],
    },
    events: eventsConfiguration(),
  });

  return defaultConfig;
};

export const sendgridDefaultEmptyConfigurations = {
  eventsConfiguration,
  configuration,
};
