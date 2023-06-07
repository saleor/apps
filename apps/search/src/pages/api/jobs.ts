import { createProtectedHandler } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { indexingJobRepository } from "../../domain/indexing-job/IndexingJobRepository";

export default createProtectedHandler(
  async (req, res, ctx) => {
    const jobs = await indexingJobRepository.getJobs(ctx.authData.saleorApiUrl);

    return res.json(jobs);
  },
  saleorApp.apl,
  ["MANAGE_APPS"]
);
