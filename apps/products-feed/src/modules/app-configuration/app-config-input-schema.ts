import { z } from "zod";
import { sellerShopConfigSchema } from "./app-config";

export const appConfigInputSchema = z.object({
  shopConfigPerChannel: z.record(sellerShopConfigSchema),
});
