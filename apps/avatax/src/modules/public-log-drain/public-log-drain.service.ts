export interface PublicLog<T extends Record<string, unknown> = {}> {
  message: string;
  eventType: string; // enum
  timestamp: Date;
  level: string; // todo enum, maybe otel level
  attributes: T;
}

export class TaxesCalculatedLog implements PublicLog {
  message = "Taxes calculated";
  eventType = "TAXES_CALCULATED" as const;
  timestamp = new Date();
  level = "info";
  attributes = {};
}

export interface PublicLogDrain {
  emitLog(log: PublicLog): Promise<void>;
}

export interface LogDrainTransporter {
  emit(log: PublicLog): Promise<void>;
}

export class PublicLogDrainService implements PublicLogDrain {
  constructor(private transporter: LogDrainTransporter) {}

  emitLog(log: PublicLog): Promise<void> {
    return this.transporter.emit(log);
  }
}

export class LogDrainJsonTransporter implements LogDrainTransporter {
  private endpoint: string | null = null;

  async emit(log: PublicLog): Promise<void> {
    if (!this.endpoint) {
      throw new Error("Endpoint is not set, call setSettings first");
    }

    return fetch(this.endpoint, {
      method: "POST",
      body: JSON.stringify(log),
    });
  }

  setSettings() {}
}

export class LogDrainOtelTransporter implements LogDrainTransporter {
  async emit(log: PublicLog): Promise<void> {
    throw new Error("Not implemented");
  }
}
