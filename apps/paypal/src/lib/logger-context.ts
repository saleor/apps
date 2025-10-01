import { ObservabilityAttributesNames } from "@saleor/apps-otel/src/observability-attributes";
import { AsyncLocalStorage } from "async_hooks";

export const loggerContext = new AsyncLocalStorage<
  Partial<Record<ObservabilityAttributesNames, unknown>>
>();

export const withLoggerContext = <T extends (...args: any[]) => any>(handler: T): T => {
  return ((...args: Parameters<T>) => {
    return loggerContext.run({}, () => handler(...args));
  }) as T;
};
