import { ILogObj, ILogObjMeta, Logger } from "tslog";

export const attachLoggerConsoleTransport = (logger: Logger<ILogObj>) => {
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

    const formattedName = `${(parentNames ?? []).join(":")}:${name}`;
    const formattedDate = date.toISOString();

    console.log(`\x1b[2m ${formattedDate} ${formattedName}\x1b[0m \t${message}`, attributes);
  });
};
