import { LogDrainTransporter, PublicLogDrain } from "./public-log-drain";
import { PublicLog } from "./public-events";

export class PublicLogDrainService implements PublicLogDrain {
  constructor(private transporters: LogDrainTransporter[]) {}

  addTransporter(transporter: LogDrainTransporter) {
    this.transporters.push(transporter);
  }

  emitLog(log: PublicLog): Promise<void[]> {
    return Promise.all(this.transporters.map((t) => t.emit(log)));
  }

  getTransporters() {
    return this.transporters;
  }
}
