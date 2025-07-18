import { z } from "zod";

import { SHIPPING_COMPANY_CODES } from "./shipping-company-codes";

// zod enum requires at least one value, so we ensure the first code is always present
const [firstCode, ...restCodes] = SHIPPING_COMPANY_CODES.map(([code]) => code);
const codes = [firstCode, ...restCodes] as const;

const schema = z.enum(codes).brand("AtobaraiShippingCompanyCode");

export const createAtobaraiShippingCompanyCode = (raw: string) => schema.parse(raw);

export type AtobaraiShippingCompanyCode = z.infer<typeof schema>;
