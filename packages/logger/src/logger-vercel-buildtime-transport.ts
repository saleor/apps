import { ILogObj, Logger } from "tslog";

export const attachLoggerVercelBuildtimeTransport = (logger: Logger<ILogObj>) => {
  logger.attachTransport((log) => {
    const { message, attributes } = log;

    const logMessage = log._meta.name ? `[${log._meta.name}] ${message}` : message;
    const logAttributes =
      Object.keys(attributes).length === 0 ? "" : JSON.stringify(attributes, null, 2);

    console.log(logMessage, logAttributes);
  });
};
