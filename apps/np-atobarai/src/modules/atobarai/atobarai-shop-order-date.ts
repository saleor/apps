import { z } from "zod";

const transformTo_YYYY_MM_DD = (stringDate: string) => stringDate.split("T")[0];

const schema = z
  .string()
  .datetime({ offset: true })
  .transform(transformTo_YYYY_MM_DD)
  .brand("AtobaraiShopOrderDate");

export const createAtobaraiShopOrderDate = (raw: string) => schema.parse(raw);

export type AtobaraiShopOrderDate = z.infer<typeof schema>;
