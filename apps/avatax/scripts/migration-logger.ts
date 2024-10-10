import { ILogObj, ILogObjMeta, Logger } from "tslog";

import { loggerContext } from "@/logger-context";

function isObject(item: unknown) {
  return typeof item === "object" && !Array.isArray(item) && item !== null;
}

export const logger = new Logger<ILogObj>({
  minLevel: 3, // info
  hideLogPositionForProduction: true,
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

logger.attachTransport((log) => {
  const { message, attributes, _meta } = log as ILogObj &
    ILogObjMeta & {
      message: string;
      attributes: Record<string, unknown>;
    };

  const bodyMessage = log._meta.name ? `[${log._meta.name}] ${message}` : message;

  const formattedStuff = JSON.stringify({
    message: bodyMessage,
    ...attributes,
    ...loggerContext.getRawContext(),
    _meta,
  });

  if (_meta.logLevelName === "ERROR") {
    console.error(formattedStuff);
    return;
  }

  if (_meta.logLevelName === "WARN") {
    console.warn(formattedStuff);
    return;
  }

  console.log(formattedStuff);
});

export const createLogger = (name: string, params?: Record<string, unknown>) =>
  logger.getSubLogger(
    {
      name,
    },
    params,
  );
