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
  AVATAX_TRANSACTION_CREATED: "AVATAX_TRANSACTION_CREATED",
  AVATAX_TRANSACTION_CREATION_FAILED: "AVATAX_TRANSACTION_CREATION_FAILED",
  SALEOR_ORDER_CONFIRMED: "SALEOR_ORDER_CONFIRMED",
  SALEOR_ORDER_CONFIRMATION_FAILED: "SALEOR_ORDER_CONFIRMATION_FAILED",
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

  constructor(params: CheckoutOrOrderId & { saleorApiUrl: string; additionalMessage?: string }) {
    super(params);
    if (params.additionalMessage) {
      this.message += `: ${params.additionalMessage}`;
    }
  }
}

export class TaxesCalculationFailedInvalidPayloadLog extends TaxesCalculationFailedLog {
  message = "Taxes calculation failed due to invalid payload";

  constructor(params: CheckoutOrOrderId & { saleorApiUrl: string; additionalMessage?: string }) {
    super(params);
    if (params.additionalMessage) {
      this.message += `: ${params.additionalMessage}`;
    }
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

export class AvataxTransactionCreatedLog
  implements PublicLog<{ orderId: string; avataxTransactionId: string }>
{
  message = "Avatax transaction created";
  timestamp = new Date();
  level = LogSeverityLevel.INFO;
  attributes = {
    orderId: "",
    avataxTransactionId: "",
    saleorApiUrl: "",
    eventType: EventTypes.AVATAX_TRANSACTION_CREATED,
  };

  constructor(params: { orderId: string; avataxTransactionId: string; saleorApiUrl: string }) {
    this.attributes.orderId = params.orderId;
    this.attributes.avataxTransactionId = params.avataxTransactionId;
    this.attributes.saleorApiUrl = params.saleorApiUrl;
  }
}

class AvataxTransactionCreationError
  implements PublicLog<{ orderId: string; avataxTransactionId?: string }>
{
  message = "Avatax transaction creation failed";
  timestamp = new Date();
  level = LogSeverityLevel.ERROR as LogSeverityLevelType;
  attributes = {
    orderId: "",
    saleorApiUrl: "",
    avataxTransactionId: undefined,
    eventType: EventTypes.AVATAX_TRANSACTION_CREATION_FAILED,
  } as PublicLog<{ orderId: string; avataxTransactionId?: string }>["attributes"];

  constructor(params: { orderId: string; avataxTransactionId?: string; saleorApiUrl: string }) {
    this.attributes.orderId = params.orderId;
    this.attributes.saleorApiUrl = params.saleorApiUrl;

    if (params.avataxTransactionId) {
      this.attributes.avataxTransactionId = params.avataxTransactionId;
    }
  }
}

export class AvataxTransactionCreateFailedBadPayload extends AvataxTransactionCreationError {
  message = "Avatax transaction creation failed due to bad payload";
}

export class AvataxTransactionCreateFailedUnhandledError extends AvataxTransactionCreationError {
  message = "Avatax transaction creation failed due to unhandled error";
  level = LogSeverityLevel.FATAL;
}

export class SaleorOrderConfirmedLog implements PublicLog<{ orderId: string }> {
  message = "Saleor order was confirmed";
  timestamp = new Date();
  level = LogSeverityLevel.INFO;
  attributes = {
    orderId: "",
    saleorApiUrl: "",
    eventType: EventTypes.SALEOR_ORDER_CONFIRMED,
  };

  constructor(params: { orderId: string; saleorApiUrl: string }) {
    this.attributes.orderId = params.orderId;
    this.attributes.saleorApiUrl = params.saleorApiUrl;
  }
}
