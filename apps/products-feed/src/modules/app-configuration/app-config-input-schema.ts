import { z } from "zod";
import { sellerShopConfigSchema } from "./app-config";

/**
 * @deprecated
 */
export const appConfigInputSchema = z.object({
  shopConfigPerChannel: z.record(sellerShopConfigSchema),
});
