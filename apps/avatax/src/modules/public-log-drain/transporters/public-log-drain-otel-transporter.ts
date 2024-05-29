import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { isAttributeValue, timeInputToHrTime } from "@opentelemetry/core";
import { Attributes, trace } from "@opentelemetry/api";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import packageJson from "../../../../package.json";
import { IResource } from "@opentelemetry/resources";
import { LogSeverityLevelType, PublicLog } from "../public-events";
import { LogDrainTransporter } from "../public-log-drain";

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

  /*
   * Maps seveity level to a matching number in OTEL specification range
   * https://opentelemetry.io/docs/specs/otel/logs/data-model/#field-severitynumber
   */
  private _mapSeverityToOtelNumber(severityLevel: LogSeverityLevelType) {
    switch (severityLevel) {
      case "TRACE":
        return 1;
      case "DEBUG":
        return 5;
      case "INFO":
        return 9;
      case "WARN":
        return 13;
      case "ERROR":
        return 17;
      case "FATAL":
        return 21;
    }
  }

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

      return true;
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

  constructor(settings?: { url: string; headers: Record<string, string> }) {
    if (!settings) {
      return;
    }

    this.otelExporter = new OTLPLogExporter({
      url: settings.url,
      timeoutMillis: 2000,
      headers: settings.headers,
    });
  }

  async emit(log: PublicLog): Promise<void> {
    return new Promise((res, rej) => {
      if (!this.otelExporter) {
        throw new Error("Call setSettings first");
      }

      const spanContext = trace.getActiveSpan()?.spanContext();

      const resourceAttributes: Attributes = {
        [SemanticResourceAttributes.SERVICE_NAME]: "saleor-app-avatax",
        [SemanticResourceAttributes.SERVICE_VERSION]: packageJson.version,
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
            severityNumber: this._mapSeverityToOtelNumber(log.level),
            hrTimeObserved: timeInputToHrTime(log.timestamp),
            hrTime: timeInputToHrTime(log.timestamp),
            spanContext,
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

  setSettings(settings: {
    url: string;
    headers: Record<string, string>;
    logRecordLimit?: Required<LogRecordLimits>;
  }) {
    this.otelExporter = new OTLPLogExporter({
      url: settings.url,
      timeoutMillis: 2000,
      headers: settings.headers,
    });
    if (settings.logRecordLimit) {
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
