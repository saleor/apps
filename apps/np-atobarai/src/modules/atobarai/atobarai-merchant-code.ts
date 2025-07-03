import { z } from "zod";

const atobaraiMerchantCode = z.string().min(1).brand("AtobaraiMerchantCode");

export const createAtobaraiMerchantCode = (raw: string) => atobaraiMerchantCode.parse(raw);

export type AtobaraiMerchantCode = z.infer<typeof atobaraiMerchantCode>;
