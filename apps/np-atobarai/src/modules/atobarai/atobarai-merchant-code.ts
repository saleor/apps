import { z } from "zod";

const schema = z.string().min(1).brand("AtobaraiMerchantCode");

export const createAtobaraiMerchantCode = (raw: string) => schema.parse(raw);

/**
 * Code used in the NP Atobarai to uniquely identify the merchant. Used in conjunction with the merchant code as basic authentication (as login). See `AtobaraiApiClient` for more details.
 */
export type AtobaraiMerchantCode = z.infer<typeof schema>;
