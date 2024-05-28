import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { sharedOtelConfig } from "@saleor/apps-otel/src/shared-config";
import { IResource } from "@opentelemetry/resources";

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

  getTransport() {
    return this.transporter;
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
    })
      .then((r) => r.json())
      .then((res) => {
        console.log(res); // todo

        return;
      });
  }

  setSettings() {}
}

export class LogDrainOtelTransporter implements LogDrainTransporter {
  private otelExporter: OTLPLogExporter | null = null;

  async emit(log: PublicLog): Promise<void> {
    return new Promise((res, rej) => {
      if (!this.otelExporter) {
        throw new Error("Call setSettings first");
      }

      return this.otelExporter.export(
        [
          {
            body: log.message,
            attributes: log.attributes,
            severityText: log.level,
            hrTimeObserved: [0, 0],
            hrTime: [0, 0],
            resource: {
              attributes: {},
              merge(other: IResource | null): IResource {
                return other as IResource; // todo
              },
            },
            droppedAttributesCount: 0,
            instrumentationScope: { name: "LogDrainOtelTransporter" },
          },
        ],
        (cb) => {
          if (cb.error) {
            rej(cb.error);
          } else {
            res();
          }
        },
      );
    });
  }

  setSettings(settings: { url: string }) {
    this.otelExporter = new OTLPLogExporter({
      headers: sharedOtelConfig.exporterHeaders,
      url: settings.url,
      timeoutMillis: 2000,
    });
  }
}
