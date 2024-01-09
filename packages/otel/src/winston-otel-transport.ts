import Transport from "winston-transport";
import { context } from "@opentelemetry/api";
import { loggerProvider } from "./otel-logs-setup";

export class WinstonOtelTransport extends Transport {
  log(info: { message: string; level: string }, callback: () => void) {
    const { message, level, ...rest } = info;

    const messageToPrint = "fn" in info ? `[${(info as { fn: string }).fn}] ${message}` : message;

    const serializeAttributes = Object.entries(rest).reduce(
      (acc, [key, value]) => {
        /**
         * Prune empty keys, to save bandwidth
         */
        if (!value) {
          return acc;
        }

        if (Array.isArray(value)) {
          acc[key] = JSON.stringify(value);
        } else {
          acc[key] = value;
        }

        return acc;
      },
      {} as Record<string, unknown>,
    );

    loggerProvider.getLogger("app-logger").emit({
      body: messageToPrint,
      context: context.active(),
      attributes: { ...serializeAttributes, level },
    });

    callback();
  }
}
