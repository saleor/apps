import { createProtectedHandler } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";

export default createProtectedHandler(
  async (req, res) => {
    // todo https://github.com/graphile/worker/issues/330
  },
  saleorApp.apl,
  ["MANAGE_APPS"]
);
