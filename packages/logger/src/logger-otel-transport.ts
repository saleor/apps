import { context } from "@opentelemetry/api";
import { logs } from "@opentelemetry/api-logs";
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from "@opentelemetry/semantic-conventions";
import { ILogObj, Logger } from "tslog";
import { LoggerContext } from "./logger-context";
import { LogAttributes } from "@opentelemetry/api-logs/build/src/types/LogRecord";

export const attachLoggerOtelTransport = (
  logger: Logger<ILogObj>,
  appVersion: string,
  loggerContext?: LoggerContext,
) => {
  logger.attachTransport((log) => {
    const { message, attributes, _meta, ...inheritedAttributes } = log as ILogObj & {
      message: string;
      attributes: Record<string, unknown>;
    };

    if (!message || !attributes) {
      console.error("Logger is not configured properly. OTEL transport will not be attached.");

      return;
    }

    /**
     * Prune empty keys and serialize top-level arrays, because OTEL can't consume them
     */
    const serializedAttributes = Object.entries({
      ...(loggerContext?.getRawContext() ?? {}),
      ...attributes,
    }).reduce((acc, [key, value]) => {
      if (Array.isArray(value)) {
        acc[key] = JSON.stringify(value);
      } else {
        // @ts-expect-error - Logger maps attribute as IMeta, but in the runtime Meta is only in log._meta field which is filtered out first
        acc[key] = value;
      }

      return acc;
    }, {} as LogAttributes);

    /**
     * Try to serialize Error. Modern-errors has plugin to serialize
     * https://github.com/ehmicky/modern-errors-serialize
     *
     * It add "serialize" method that converts class to plain object, working for OTEL.
     *
     * This is not perfect, doesn't work for nested object. We probably need to introduce some abstraction
     * on logger error?
     */
    try {
      const errorAttribute = serializedAttributes.error;
      const ErrorConstructor = errorAttribute!["constructor"];

      // @ts-expect-error - ErrorConstructor is a class that could have serialize method. If not, safely throw and ignore
      serializedAttributes.error = ErrorConstructor.serialize(serializedAttributes.error);
      // @ts-expect-error - Additional mapping for Datadog
      serializedAttributes.error.type = serializedAttributes.error.name;
    } catch (e) {}

    return logs.getLogger("app-logger-otel").emit({
      body: log._meta.name ? `[${log._meta.name}] ${message}` : message,
      context: context.active(),
      severityText: log._meta.logLevelName,
      attributes: {
        ...serializedAttributes,
        [SEMRESATTRS_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
        [SEMRESATTRS_SERVICE_VERSION]: appVersion,
        // eslint-disable-next-line turbo/no-undeclared-env-vars
        ["commit-sha"]: process.env.VERCEL_GIT_COMMIT_SHA,
        // eslint-disable-next-line turbo/no-undeclared-env-vars
        [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.ENV,
      },
    });
  });
};
