import { ILogObj, Logger } from "tslog";

function isObject(item: unknown) {
  return typeof item === "object" && !Array.isArray(item) && item !== null;
}

export const logger = new Logger<ILogObj>({
  minLevel: 3, // info
  hideLogPositionForProduction: true,
  type: "json",
  overwrite: {
    /**
     * Format log. Use parent logger (createLogger) args and merge them with args from individual logs
     */
    toLogObj(args, log) {
      const message = args.find((arg) => typeof arg === "string");
      const attributesFromLog = (args.find(isObject) as Object) ?? {};
      const parentAttributes = log ?? {};

      return {
        ...log,
        message,
        attributes: {
          ...parentAttributes,
          ...attributesFromLog,
        },
      };
    },
  },
});

export const createLogger = (name: string, params?: Record<string, unknown>) =>
  logger.getSubLogger(
    {
      name,
    },
    params,
  );
