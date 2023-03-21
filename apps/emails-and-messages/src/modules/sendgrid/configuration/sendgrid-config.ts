import { MessageEventTypes } from "../../event-handlers/message-event-types";

export interface SendgridEventConfiguration {
  active: boolean;
  eventType: MessageEventTypes;
  template: string;
}

export interface SendgridConfiguration {
  id: string;
  active: boolean;
  configurationName: string;
  sandboxMode: boolean;
  senderName?: string;
  senderEmail?: string;
  apiKey: string;
  events: SendgridEventConfiguration[];
}

export type SendgridConfig = {
  configurations: SendgridConfiguration[];
};
