import { LogDrainTransporter } from "../public-log-drain";
import { PublicLog } from "../public-events";
import { trace } from "@opentelemetry/api";
import { createLogger } from "@saleor/apps-logger";
import { ResultAsync, err, ok } from "neverthrow";
import { BaseError } from "../../../error";

export class LogDrainJsonTransporter implements LogDrainTransporter {
  static TransporterError = BaseError.subclass("TransporterError");

  static ConfigError = this.TransporterError.subclass("TransporterConfigError");
  static FetchError = this.TransporterError.subclass("TransporterFetchError");

  private endpoint: string | null = null;
  private headers: Record<string, string> = {};

  async emit(log: PublicLog): Promise<void> {
    const logger = createLogger("LogDrainJsonTransporter.emit");

    if (!this.endpoint) {
      logger.error("Endpoint is not set, call setSettings first");
      throw new LogDrainJsonTransporter.ConfigError("Endpoint is not set, call setSettings first");
    }

    const spanContext = trace.getActiveSpan()?.spanContext();

    const payload = {
      ...log,
      traceId: spanContext?.traceId,
      spanId: spanContext?.spanId,
      isRemote: spanContext?.isRemote,
      traceFlags: spanContext?.traceFlags,
      traceState: spanContext?.traceState?.serialize(),
    };

    const result = await ResultAsync.fromPromise(
      fetch(this.endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: this.headers,
      }),
      (err) =>
        new LogDrainJsonTransporter.FetchError("Failed to make request to log drain", {
          cause: err,
        }),
    ).andThen((response) =>
      response.ok
        ? ok(undefined)
        : err(new LogDrainJsonTransporter.FetchError("Response from log drain is not HTTP 200")),
    );

    if (result.isErr()) {
      // Silently ignore errors caused by making request to log drain
      logger.debug("Error while making request to log drain");
    }
  }

  setSettings({ endpoint, headers }: { endpoint: string; headers: Record<string, string> }) {
    this.endpoint = endpoint;
    this.headers = headers;
  }
}
