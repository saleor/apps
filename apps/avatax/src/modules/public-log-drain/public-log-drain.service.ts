import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { sharedOtelConfig } from "@saleor/apps-otel/src/shared-config";
import { IResource } from "@opentelemetry/resources";
import { timeInputToHrTime, isAttributeValue, InstrumentationScope } from "@opentelemetry/core";
import { LogAttributes } from "@opentelemetry/api-logs";
import { Attributes } from "@opentelemetry/api";
import * as packageJson from "../../../package.json";

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

      const isValidAttribute = (value: unknown) => {
        return (
          value === null ||
          value === undefined ||
          (typeof value === "number" ? !Number.isFinite(value) : true)
        );
      };

      /*
       * We must filter out non-serializable values
       * https://opentelemetry.io/docs/specs/otel/common/#attribute
       */
      const filteredAttributes = Object.fromEntries(
        Object.entries(log.attributes).filter((_, value) => {
          if (Array.isArray(value)) {
            return value.every((item) =>
              typeof value === "number" ? !Number.isFinite(value) : true,
            );
          }
          return isValidAttribute(value);
        }),
      );

      const resourceAttributes: Attributes = {
        "service.name": "saleor-app-avatax",
        "service.version": packageJson.version,
      };

      const resource: IResource = {
        attributes: resourceAttributes,
        merge(other: IResource | null): IResource {
          return this;
        },
      };

      return this.otelExporter.export(
        [
          {
            body: log.message,
            attributes: filteredAttributes as LogAttributes,
            severityText: log.level,
            hrTimeObserved: timeInputToHrTime(log.timestamp),
            hrTime: timeInputToHrTime(log.timestamp),
            /*
             * TODO: Pass traceId to logs
             * spanContext: ...
             */
            resource,
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
