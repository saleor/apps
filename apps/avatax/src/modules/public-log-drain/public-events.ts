export const LogSeverityLevel = {
  TRACE: "TRACE",
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  FATAL: "FATAL",
} as const;

export type LogSeverityLevelType = keyof typeof LogSeverityLevel;

export interface PublicLog<T extends Record<string, unknown> = {}> {
  message: string;
  eventType: string; // enum
  timestamp: Date;
  level: LogSeverityLevelType;
  attributes: T;
}

export class TaxesCalculatedLog implements PublicLog {
  message = "Taxes calculated";
  eventType = "TAXES_CALCULATED" as const;
  timestamp = new Date();
  level = LogSeverityLevel.INFO;
  attributes = {};
}
