import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { sharedOtelConfig } from "@saleor/apps-otel/src/shared-config";
import { IResource } from "@opentelemetry/resources";
import { timeInputToHrTime, isAttributeValue } from "@opentelemetry/core";
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

export interface LogRecordLimits {
  /** attributeValueLengthLimit is maximum allowed attribute value size */
  attributeValueLengthLimit?: number;

  /** attributeCountLimit is number of attributes per LogRecord */
  attributeCountLimit?: number;
}

export class LogDrainOtelTransporter implements LogDrainTransporter {
  private otelExporter: OTLPLogExporter | null = null;
  private logRecordLimit: Required<LogRecordLimits> = {
    /*
     * Default values used by OTEL spec
     * https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/#attribute-limits
     */
    attributeValueLengthLimit: Infinity,
    attributeCountLimit: 128,
  };

  private _truncateSize(value: unknown) {
    const limit = this.logRecordLimit.attributeValueLengthLimit;

    const truncateToLimit = (value: string) => {
      if (value.length <= limit) {
        return value;
      }
      return value.substring(0, limit);
    };

    if (typeof value === "string") {
      return truncateToLimit(value);
    }

    if (Array.isArray(value)) {
      return (value as []).map((val) => (typeof val === "string" ? truncateToLimit(val) : val));
    }

    // If value is of another type, we can safely return it as is
    return value;
  }

  private _filterAndTruncateAttributes(attributes: Record<string, unknown>) {
    /*
     * We must filter out non-serializable values and truncate ones that exceed limits
     * https://opentelemetry.io/docs/specs/otel/common/#attribute
     */
    const filteredAttributesEntries = Object.entries(attributes).filter(([key, value]) => {
      if (value === null) {
        return false;
      }
      if (key.length === 0) {
        return false;
      }
      if (
        !isAttributeValue(value) &&
        !(typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0)
      ) {
        return false;
      }
      /*
       * Additional validation that is missing in OTEL SDK, but causes crashes on otel-collector
       * when sending non-finite numbers (e.g. NaN, Infinity)
       */
      if (typeof value === "number" && !Number.isFinite(value)) {
        return false;
      }
    });

    return filteredAttributesEntries
      .slice(0, this.logRecordLimit.attributeCountLimit)
      .reduce((acc, [key, value]) => {
        if (Object.keys(acc).length >= this.logRecordLimit.attributeCountLimit) {
          return acc;
        }

        if (isAttributeValue(value)) {
          return {
            ...acc,
            [key]: this._truncateSize(value),
          };
        } else {
          return {
            ...acc,
            [key]: value,
          };
        }
      }, {});
  }

  async emit(log: PublicLog): Promise<void> {
    return new Promise((res, rej) => {
      if (!this.otelExporter) {
        throw new Error("Call setSettings first");
      }

      const resourceAttributes: Attributes = {
        "service.name": "saleor-app-avatax",
        "service.version": packageJson.version,
      };

      const resource: IResource = {
        attributes: resourceAttributes,
        // This is a workaround to support OTEL SDK types
        merge(): IResource {
          return this;
        },
      };

      const attributes = this._filterAndTruncateAttributes(log.attributes);

      return this.otelExporter.export(
        [
          {
            body: log.message,
            attributes,
            severityText: log.level,
            /*
             * TODO: Map severity to OTEL levels
             * severityNumber: "",
             */
            severityNumber: 0, // todo
            hrTimeObserved: timeInputToHrTime(log.timestamp),
            hrTime: timeInputToHrTime(log.timestamp),
            /*
             * TODO: Pass traceId to logs
             * spanContext: ...
             */
            resource,
            droppedAttributesCount:
              Object.keys(log.attributes).length - Object.keys(attributes).length,
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

  setSettings(settings: { url: string; logRecordLimit: Required<LogRecordLimits> }) {
    this.otelExporter = new OTLPLogExporter({
      headers: sharedOtelConfig.exporterHeaders,
      url: settings.url,
      timeoutMillis: 2000,
    });
    if (this.logRecordLimit) {
      if (this.logRecordLimit.attributeValueLengthLimit <= 0) {
        throw new Error("attributeValueLengthLimit cannot be less than 0");
      }
      if (this.logRecordLimit.attributeCountLimit <= 0) {
        throw new Error("attributeCountLimit cannot be less than 0");
      }
      this.logRecordLimit = settings.logRecordLimit;
    }
  }
}
