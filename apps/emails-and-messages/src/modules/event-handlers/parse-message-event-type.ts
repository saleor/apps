import { MessageEventTypes, messageEventTypes } from "./message-event-types";

/**
 *  Returns the event type if it is valid, otherwise undefined.
 */
export const parseMessageEventType = (eventType?: string): MessageEventTypes | undefined => {
  if (!eventType) {
    return;
  }
  if (messageEventTypes.includes(eventType as MessageEventTypes)) {
    return eventType as MessageEventTypes;
  }
};
