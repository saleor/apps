import { z } from "zod";

const schema = z.string().min(1).brand("AtobaraiSecretSpCode");

export const createAtobaraiSecretSpCode = (raw: string) => schema.parse(raw);

/**
 * Used as password for basic authentication for NP Atobarai API. See `AtobaraiApiClient` for more details.
 */
export type AtobaraiSecretSpCode = z.infer<typeof schema>;
