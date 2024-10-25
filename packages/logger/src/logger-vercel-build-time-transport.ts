import { ILogObj, Logger } from "tslog";

export const attachLoggerVercelBuildTimeTransport = (logger: Logger<ILogObj>) => {
  logger.attachTransport((log) => {
    const { message, _meta, attributes } = log;

    const logMessage = log._meta.name ? `[${log._meta.name}] ${message}` : message;
    const logAttributes = JSON.stringify(attributes, null, 2);

    if (_meta.logLevelName === "ERROR") {
      console.error(logMessage, logAttributes);
      return;
    }

    if (_meta.logLevelName === "WARN") {
      console.warn(logMessage, logAttributes);
      return;
    }

    console.log(logMessage, logAttributes);
  });
};
