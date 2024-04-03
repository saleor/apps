import { ILogObj, Logger } from "tslog";

function isObject(item: unknown) {
  return typeof item === "object" && !Array.isArray(item) && item !== null;
}

function getMinLevel() {
  switch (process.env.APP_LOG_LEVEL) {
    case "silent":
      return 0;
    case "trace":
      return 1;
    case "debug":
      return 2;
    case "info":
      return 3;
    case "warn":
      return 4;
    case "error":
      return 5;
    case "fatal":
      return 6;
    default:
      return 3;
  }
}

/*
 * TODO: Add test
 */
export const logger = new Logger<ILogObj>({
  minLevel: getMinLevel(),
  hideLogPositionForProduction: true,
  /**
   * Use custom console.log transport, because built-in API for pretty logger is limited
   */
  type: "hidden",
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
      name: name,
    },
    params,
  );
