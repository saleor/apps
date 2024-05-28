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

  timestamp: Date;
  level: LogSeverityLevelType;
  attributes: T & {
    saleorApiUrl: string;
    eventType: string;
  };
}

export class TaxesCalculatedLog implements PublicLog<{ orderOrCheckoutId: string }> {
  message = "Taxes calculated";
  timestamp = new Date();
  level = LogSeverityLevel.INFO;
  attributes = { orderOrCheckoutId: "", saleorApiUrl: "", eventType: "TAXES_CALCULATED" };

  constructor(params: { orderOrCheckoutId: string; saleorApiUrl: string }) {
    this.attributes.orderOrCheckoutId = params.orderOrCheckoutId;
    this.attributes.saleorApiUrl = params.saleorApiUrl;
  }
}
