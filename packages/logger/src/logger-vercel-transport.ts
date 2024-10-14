import { ILogObj, Logger } from "tslog";

import { LoggerContext } from "./logger-context";

export const attachLoggerVercelTransport = (
  logger: Logger<ILogObj>,
  loggerContext?: LoggerContext,
) => {
  logger.attachTransport((log) => {
    const { message, attributes, _meta } = log;

    const bodyMessage = log._meta.name ? `[${log._meta.name}] ${message}` : message;

    const stringifiedMessage = JSON.stringify({
      message: bodyMessage,
      ...attributes,
      ...loggerContext?.getRawContext(),
      _meta: {
        ..._meta,
        // used to filter out log in log drain
        source: "saleor-app",
      },
    });

    // Prints Vercel log in proper level https://vercel.com/docs/observability/runtime-logs#level
    if (_meta.logLevelName === "ERROR") {
      console.error(stringifiedMessage);
      return;
    }

    if (_meta.logLevelName === "WARN") {
      console.warn(stringifiedMessage);
      return;
    }

    console.log(stringifiedMessage);
  });
};
