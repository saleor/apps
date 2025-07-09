import { z } from "zod";

const schema = z.string().min(1).brand("AtobaraiTerminalId");

export const createAtobaraiTerminalId = (raw: string) => schema.parse(raw);

/**
 * Id used in the NP Atobarai to uniquely identify the merchant system.
 */
export type AtobaraiTerminalId = z.infer<typeof schema>;
