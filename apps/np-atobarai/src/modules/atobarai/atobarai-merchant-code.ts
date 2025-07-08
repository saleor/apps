import { z } from "zod";

const schema = z.string().min(1).brand("AtobaraiMerchantCode");

export const createAtobaraiMerchantCode = (raw: string) => schema.parse(raw);

export type AtobaraiMerchantCode = z.infer<typeof schema>;
