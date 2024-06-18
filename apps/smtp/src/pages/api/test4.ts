import { NextApiHandler } from "next";
import { createLogger } from "../../logger";
import { wrapWithLoggerContext } from "@saleor/apps-logger/node";
import { loggerContext } from "../../logger-context";
import { withOtel } from "@saleor/apps-otel";

const handler: NextApiHandler = async (req, res) => {
  createLogger("logger test3").info("log test4");

  res.status(200).send("ok");
};

export default withOtel(handler, "test4");
