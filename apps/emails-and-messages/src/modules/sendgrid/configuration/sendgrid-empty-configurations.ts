import { messageEventTypes } from "../../event-handlers/message-event-types";
import {
  SendgridConfiguration,
  sendgridConfigurationEventSchema,
  sendgridConfigurationSchema,
} from "./sendgrid-config-schema";

export const getDefaultEventsConfiguration = (): SendgridConfiguration["events"] =>
  messageEventTypes.map((eventType) => sendgridConfigurationEventSchema.parse({ eventType }));

export const getDefaultEmptyConfiguration = (): SendgridConfiguration => {
  const defaultConfig: SendgridConfiguration = sendgridConfigurationSchema.parse({
    id: "id",
    name: "name",
    apiKey: "key",
    channels: {
      excludedFrom: [],
      restrictedTo: [],
    },
    events: getDefaultEventsConfiguration(),
  });

  return defaultConfig;
};
