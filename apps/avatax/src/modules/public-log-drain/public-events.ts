export const LogSeverityLevel = {
  TRACE: "TRACE",
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  FATAL: "FATAL",
} as const;

export type LogSeverityLevelType = keyof typeof LogSeverityLevel;

const EventTypes = {
  TAXES_CALCULATED: "TAXES_CALCULATED",
  TAXES_CALCULATION_FAILED: "TAXES_CALCULATION_FAILED",
} as const;

export interface PublicLog<T extends Record<string, unknown> = {}> {
  message: string;

  timestamp: Date;
  level: LogSeverityLevelType;
  attributes: T & {
    saleorApiUrl: string;
    eventType: keyof typeof EventTypes;
  };
}

export class TaxesCalculatedInCheckoutLog implements PublicLog<{ checkoutId: string }> {
  message = "Taxes calculated in checkout";
  timestamp = new Date();
  level = LogSeverityLevel.INFO;
  attributes = { checkoutId: "", saleorApiUrl: "", eventType: EventTypes.TAXES_CALCULATED };

  constructor(params: { checkoutId: string; saleorApiUrl: string }) {
    this.attributes.checkoutId = params.checkoutId;
    this.attributes.saleorApiUrl = params.saleorApiUrl;
  }
}

export class TaxesCalculatedInOrderLog implements PublicLog<{ orderId: string }> {
  message = "Taxes calculated in order";
  timestamp = new Date();
  level = LogSeverityLevel.INFO;
  attributes = { orderId: "", saleorApiUrl: "", eventType: EventTypes.TAXES_CALCULATED };

  constructor(params: { orderId: string; saleorApiUrl: string }) {
    this.attributes.orderId = params.orderId;
    this.attributes.saleorApiUrl = params.saleorApiUrl;
  }
}

type CheckoutOrOrderId =
  | {
      orderId: string;
      checkoutId?: undefined;
    }
  | {
      orderId?: undefined;
      checkoutId: string;
    };

class TaxesCalculationFailedLog implements PublicLog<CheckoutOrOrderId> {
  message = "Taxes calculation failed";
  timestamp = new Date();
  level = LogSeverityLevel.ERROR as LogSeverityLevelType;
  attributes = {
    saleorApiUrl: "",
    eventType: EventTypes.TAXES_CALCULATION_FAILED,
  } as PublicLog<CheckoutOrOrderId>["attributes"];

  constructor(params: CheckoutOrOrderId & { saleorApiUrl: string }) {
    if (params.orderId) {
      this.attributes.orderId = params.orderId;
    } else {
      this.attributes.checkoutId = params.checkoutId;
    }
    this.attributes.saleorApiUrl = params.saleorApiUrl;
    this.attributes.eventType = EventTypes.TAXES_CALCULATION_FAILED;
  }
}

export class TaxesCalculationFailedConfigErrorLog extends TaxesCalculationFailedLog {
  message = "Taxes calculation failed due to wrong configuration";

  constructor(params: CheckoutOrOrderId & { saleorApiUrl: string; message?: string }) {
    super(params);
  }
}

export class TaxesCalculationFailedInvalidPayloadLog extends TaxesCalculationFailedLog {
  message = "Taxes calculation failed due to invalid payload received from Saleor";

  constructor(params: CheckoutOrOrderId & { saleorApiUrl: string }) {
    super(params);
  }
}

export class TaxesCalculationProviderErrorLog extends TaxesCalculationFailedLog {
  message = "Taxes calculation failed due to provider error";

  constructor(params: CheckoutOrOrderId & { saleorApiUrl: string }) {
    super(params);
  }
}

export class TaxesCalculationFailedUnhandledErrorLog extends TaxesCalculationFailedLog {
  message = "Taxes calculation failed due to unhandled error";
  level = LogSeverityLevel.FATAL;

  constructor(params: CheckoutOrOrderId & { saleorApiUrl: string }) {
    super(params);
  }
}
