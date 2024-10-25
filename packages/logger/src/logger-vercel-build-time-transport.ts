import { ILogObj, Logger } from "tslog";

export const attachLoggerVercelBuildTimeTransport = (logger: Logger<ILogObj>) => {
  logger.attachTransport((log) => {
    const { message, _meta } = log;

    const logMessage = log._meta.name ? `[${log._meta.name}] ${message}` : message;

    if (_meta.logLevelName === "ERROR") {
      console.error(logMessage);
      return;
    }

    if (_meta.logLevelName === "WARN") {
      console.warn(logMessage);
      return;
    }

    console.log(logMessage);
  });
};
