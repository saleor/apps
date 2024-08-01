import type { NextApiRequest, NextApiResponse } from "next";
import { createLogger } from "../../logger";

const Wait = () => {
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const logger = createLogger("Hello World!");

  await Wait();
  logger.info("Call from hellow wordl");

  res.status(200).end();
};
