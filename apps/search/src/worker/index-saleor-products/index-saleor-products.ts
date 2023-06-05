import { Task } from "graphile-worker/dist/interfaces";
import { z } from "zod";
import { getProductsAndSendToAlgolia } from "./get-products-and-send-to-algolia";
import { getWorkerUtils } from "../worker-utils";

const payloadSchema = z.object({
  saleorApiUrl: z.string().url(),
});

/**
 *  TODO Is it secure to pass only saleorApiUrl
 *
 *  TODO Refactor to extract all product fetching etc
 */
export const IndexSaleorProducts: Task = async (payload, helpers) => {
  /**
   * Parse payload - in graphile its always unknown, so its a good place to ensure its correct
   */
  const typedPayload = payloadSchema.parse(payload);

  /**
   * Perform some business logic
   */
  await getProductsAndSendToAlgolia(typedPayload.saleorApiUrl);
};

export const IndexSaleorProductsJobName = "IndexSaleorProducts";

/**
 * Factory that pushed job to the worker
 *
 * https://github.com/graphile/worker#makeworkerutilsoptions-workerutilsoptions-promiseworkerutils
 */
export const runIndexSaleorProducts = async (payload: z.infer<typeof payloadSchema>) => {
  const utils = await getWorkerUtils();

  await utils.migrate();

  return utils.addJob(IndexSaleorProductsJobName, payload).finally(() => {
    return utils.release();
  });
};
