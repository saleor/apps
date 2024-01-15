import { ILogObj, Logger } from "tslog";
import { ISettings } from "tslog/dist/types/interfaces";

function isObject(item: unknown) {
  return typeof item === "object" && !Array.isArray(item) && item !== null;
}

/*
 * TODO: Add loggerContext
 * TODO: Add test
 */
export const logger = new Logger<ILogObj>({
  /**
   * TODO: Change env name when fully migrated from Pino
   */
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  minLevel: parseInt(process.env.NEW_APP_LOG_LEVEL ?? "3", 10),
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
