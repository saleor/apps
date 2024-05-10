import { messageEventTypes } from "../../event-handlers/message-event-types";

import { defaultMjmlSubjectTemplates, defaultMjmlTemplates } from "../default-templates";
import {
  SmtpConfiguration,
  smtpConfigurationEventSchema,
  smtpConfigurationSchema,
} from "./smtp-config-schema";

const eventsConfiguration = (): SmtpConfiguration["events"] =>
  messageEventTypes.map((eventType) =>
    smtpConfigurationEventSchema.parse({
      eventType: eventType,
      template: defaultMjmlTemplates[eventType],
      subject: defaultMjmlSubjectTemplates[eventType],
    }),
  );

const configuration = (): SmtpConfiguration => {
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
    events: eventsConfiguration(),
  });

  return defaultConfig;
};

export const smtpDefaultEmptyConfigurations = {
  eventsConfiguration,
  configuration,
};
