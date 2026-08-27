import { type ExtensionPOSTAttributes } from "@saleor/app-sdk/types";
import { type NextApiHandler } from "next";

import { placeholderDocument } from "@/extensions/placeholder";

/**
 * POST target for extensions. Saleor submits a `<form>` here with the staff
 * user's context, so this can't be a static page.
 *
 * The token is intentionally not verified - the app stores no credentials, it
 * only echoes back what Saleor sent.
 */
const handler: NextApiHandler = (req, res) => {
  const { accessToken, ...context } = (req.body ?? {}) as ExtensionPOSTAttributes;
  const label = typeof req.query.label === "string" ? req.query.label : "Extension";

  const meta = [
    `${req.query.mount} · ${req.query.target} · POST`,
    ...Object.entries(context).map(([key, value]) => `${key}: ${value}`),
    accessToken ? "accessToken: received" : "accessToken: missing",
  ];

  return res
    .status(200)
    .setHeader("content-type", "text/html")
    .send(placeholderDocument({ label, meta }));
};

export default handler;
