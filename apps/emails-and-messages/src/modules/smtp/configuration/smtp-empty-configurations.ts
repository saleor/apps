import { messageEventTypes } from "../../event-handlers/message-event-types";

import { defaultMjmlTemplates, defaultMjmlSubjectTemplates } from "../default-templates";
import {
  SmtpConfiguration,
  smtpConfigurationSchema,
  smtpConfigurationEventSchema,
} from "./smtp-config-schema";

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
