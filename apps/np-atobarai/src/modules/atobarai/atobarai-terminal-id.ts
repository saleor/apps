import { z } from "zod";

const schema = z.string().min(1).brand("AtobaraiTerminalId");

export const createAtobaraiTerminalId = (raw: string) => schema.parse(raw);

export type AtobaraiTerminalId = z.infer<typeof schema>;
