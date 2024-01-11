import { ILogObj, Logger } from "tslog";

/*
 * TODO: Add loggerContext
 */
export const logger = new Logger<ILogObj>({
  argumentsArrayName: "payload",
  /**
   * TODO: Change env name when fully migrated from Pino
   */
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  minLevel: parseInt(process.env.NEW_APP_LOG_LEVEL ?? "3", 10),
});

export const createLogger = (name: string, params?: Record<string, unknown>) =>
  logger.getSubLogger(
    {
      name: name,
    },
    params,
  );
