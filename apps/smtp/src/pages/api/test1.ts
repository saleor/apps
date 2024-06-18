import { NextApiHandler } from "next";
import { createLogger } from "../../logger";

const handler: NextApiHandler = async (req, res) => {
  createLogger("logger test1").info("log test1");

  res.status(200).send("ok");
};

export default handler;
