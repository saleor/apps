import { MessageEventTypes } from "../event-handlers/message-event-types";

export const smtpUrls = {
  newConfiguration: () => `/configuration/smtp/new`,
  configuration: (id: string) => `/configuration/smtp/${id}`,
  eventConfiguration: (id: string, event: MessageEventTypes) =>
    `/configuration/smtp/${id}/event/${event}`,
};
