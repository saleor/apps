import { ILogObj, ILogObjMeta, Logger } from "tslog";

function isObject(item: unknown) {
  return typeof item === "object" && !Array.isArray(item) && item !== null;
}

function getMinLevel() {
  switch (process.env.APP_LOG_LEVEL) {
    case "debug":
      return 2;
    case "info":
      return 3;
    case "warn":
      return 4;
    case "error":
      return 5;
    default:
      return 3;
  }
}

const logger = new Logger<ILogObj>({
  minLevel: getMinLevel(),
  hideLogPositionForProduction: true,
  /**
   * Use custom console.log transport, because built-in API for pretty logger is limited
   */
  type: "hidden",
  maskValuesOfKeys: ["metadata", "username", "password", "apiKey"],
  overwrite: {
    /**
     * Format log. Use parent logger (createLogger) args and merge them with args from individual logs
     */
    toLogObj(args, log) {
      const message = args.find((arg) => typeof arg === "string");
      const attributesFromLog = args.find(isObject) ?? {};
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

const attachLoggerConsoleTransport = (logger: Logger<ILogObj>) => {
  logger.attachTransport((log) => {
    const {
      message,
      attributes,
      _meta: { date, name, parentNames },
    } = log as ILogObj &
        ILogObjMeta & {
      message: string;
      attributes: Record<string, unknown>;
    };

    const formattedName = `${(parentNames ?? []).join(":")}:${name ?? ""}`;
    const formattedDate = date.toISOString();

    // eslint-disable-next-line no-console
    console.log(
        `\x1b[2m ${formattedDate} ${formattedName}\x1b[0m \t${message}`,
        attributes,
    );
  });
};

attachLoggerConsoleTransport(logger);

export const createLogger = (name: string, params?: Record<string, unknown>) =>
    logger.getSubLogger(
        {
          name: name,
        },
        params,
    );