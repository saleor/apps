import { messageEventTypes } from "../../event-handlers/message-event-types";
import { defaultMjmlSubjectTemplates, defaultMjmlTemplates } from "../default-templates";
import { TemplateStringCompressor } from "../services/template-string-compressor";
import {
  SmtpConfiguration,
  smtpConfigurationEventSchema,
  smtpConfigurationSchema,
} from "./smtp-config-schema";

const templateStringFormatter = new TemplateStringCompressor();

const eventsConfiguration = (): SmtpConfiguration["events"] =>
  messageEventTypes.map((eventType) => {
    const template = defaultMjmlTemplates[eventType];
    const compressedTemplate = templateStringFormatter.compress(template);

    return smtpConfigurationEventSchema.parse({
      eventType: eventType,
      template: compressedTemplate.isOk() ? compressedTemplate.value : template,
      subject: defaultMjmlSubjectTemplates[eventType],
    });
  });

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
