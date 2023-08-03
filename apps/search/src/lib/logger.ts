import pino from "pino";

const otelTransport = pino.transport({
  target: "pino-opentelemetry-transport",
});

export const logger = pino(otelTransport);

export const createLogger = logger.child.bind(logger);
