import { createProtectedHandler } from "@saleor/app-sdk/handlers/next";
import { saleorApp } from "../../../saleor-app";
import { runIndexSaleorProducts } from "../../worker/index-saleor-products/index-saleor-products";
import { indexingJobRepository } from "../../domain/indexing-job/IndexingJobRepository";

export default createProtectedHandler(
  async (req, res, ctx) => {
    const job = await runIndexSaleorProducts({
      saleorApiUrl: ctx.authData.saleorApiUrl,
    }); //todo handle error

    console.log("Added job");
    console.log(job.id);

    await indexingJobRepository.createPendingJob(ctx.authData.saleorApiUrl, {
      jobId: Number(job.id),
      createdByEmail: "some-name-todo", // todo add to sdk
    });

    return res.status(200).end();
  },
  saleorApp.apl,
  ["MANAGE_APPS", "MANAGE_PRODUCTS"]
);
