export interface PublicLog<T extends Record<string, unknown> = {}> {
  message: string;
  timestamp: Date;
  level: string; // todo enum, maybe otel level
  attributes: T;
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
  async emit(log: PublicLog): Promise<void> {
    throw new Error("Not implemented");
  }
}

export class LogDrainOtelTransporter implements LogDrainTransporter {
  async emit(log: PublicLog): Promise<void> {
    throw new Error("Not implemented");
  }
}
