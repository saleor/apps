import { MessageEventTypes } from "../event-handlers/message-event-types";

export const sendgridUrls = {
  newConfiguration: () => `/configuration/sendgrid/new`,
  configuration: (id: string) => `/configuration/sendgrid/${id}`,
  eventConfiguration: (id: string, event: MessageEventTypes) =>
    `/configuration/sendgrid/${id}/event/${event}`,
};
