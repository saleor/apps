import type { NextApiRequest, NextApiResponse } from "next";
import { createLogger } from "../../logger";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { withOtel } from "@saleor/apps-otel";
import { loggerContext } from "../../logger-context";

const Wait = () => {
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const logger = createLogger("Hello World!");

  await Wait();
  logger.info("Call from hellow wordl");

  res.status(200).end();
};

export default wrapWithLoggerContext(
  withOtel(handler, "/api/feed/[url]/[channel]/google.xml"),
  loggerContext,
);
