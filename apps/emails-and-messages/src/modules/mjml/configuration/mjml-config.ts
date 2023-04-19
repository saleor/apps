import { MessageEventTypes } from "../../event-handlers/message-event-types";

export interface MjmlEventConfiguration {
  active: boolean;
  eventType: MessageEventTypes;
  template: string;
  subject: string;
}

export const smtpEncryptionTypes = ["NONE", "TLS", "SSL"] as const;

export type SmtpEncryptionType = (typeof smtpEncryptionTypes)[number];

export interface MjmlConfiguration {
  id: string;
  active: boolean;
  configurationName: string;
  channels: {
    excludedFrom: string[];
    restrictedTo: string[];
  };
  senderName: string;
  senderEmail: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  encryption: SmtpEncryptionType;
  events: MjmlEventConfiguration[];
}

export type MjmlConfig = {
  configurations: MjmlConfiguration[];
};
