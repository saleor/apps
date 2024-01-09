/**
 * TODO Move to shared
 */
import * as Sentry from "@sentry/nextjs";
import { type SeverityLevel } from "@sentry/nextjs";
import Transport from "winston-transport";

const winstonLevelToSentryLevel = (level: string): SeverityLevel => {
  switch (level) {
    case "error":
      return "error";
    case "warn":
      return "warning";
    case "debug":
      return "debug";
    case "debug":
      return "debug";
    case "info":
      return "info";
  }

  return "debug";
};

/**
 *
 * https://develop.sentry.dev/sdk/event-payloads/breadcrumbs/#breadcrumb-types
 */
const levelToBreadcrumbType = (level: string) => {
  switch (level) {
    case "error":
      return "error";
    case "debug":
      return "debug";
    case "info":
    default:
      return "default";
  }
};

export class SentryBreadcrumbTransport extends Transport {
  log(info: { message: string; level: string }, callback: () => void) {
    const { message, level, ...rest } = info;

    const sentryLevel = winstonLevelToSentryLevel(level);

    try {
      Sentry?.addBreadcrumb?.({
        message: message,
        level: sentryLevel,
        type: levelToBreadcrumbType(level),
        // @ts-expect-error Invalid type in Sentry SDK
        timestamp: new Date().toDateString(),
        data: rest,
      });
    } catch (e) {
      // no-op
    }

    callback();
  }
}
