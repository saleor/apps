import { MessageEventTypes } from "../event-handlers/message-event-types";

export const sendgridUrls = {
  configuration: (id?: string) =>
    !id ? "/configuration/sendgrid" : `/configuration/sendgrid/${id}`,
  eventConfiguration: (id: string, event: MessageEventTypes) =>
    `/configuration/sendgrid/${id}/event/${event}`,
};
