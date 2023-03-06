import { MessageEventTypes } from "../event-handlers/message-event-types";

export const mjmlUrls = {
  configuration: (id?: string) => (!id ? "/configuration/mjml" : `/configuration/mjml/${id}`),
  eventConfiguration: (id: string, event: MessageEventTypes) =>
    `/configuration/mjml/${id}/event/${event}`,
};
