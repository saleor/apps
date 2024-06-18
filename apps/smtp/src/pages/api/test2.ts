import { NextApiHandler } from "next";
import { createLogger } from "../../logger";
import { wrapWithLoggerContext } from "@saleor/apps-logger/src/logger-context";
import { loggerContext } from "../../logger-context";

const handler: NextApiHandler = async (req, res) => {
  createLogger("logger test2").info("log test2");

  res.status(200).send("ok");
};

export default wrapWithLoggerContext(handler, loggerContext);
