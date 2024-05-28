import { PublicLog } from "./public-events";

export interface PublicLogDrain {
  emitLog(log: PublicLog): Promise<void[]>;
  getTransporters(): LogDrainTransporter[];
  addTransporter(transporter: LogDrainTransporter): void;
}

export interface LogDrainTransporter {
  emit(log: PublicLog): Promise<void>;
}
