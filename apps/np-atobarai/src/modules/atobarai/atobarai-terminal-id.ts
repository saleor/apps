import { z } from "zod";

const atobaraiTerminalId = z.string().min(1).brand("AtobaraiTerminalId");

export const createAtobaraiTerminalId = (raw: string) => atobaraiTerminalId.parse(raw);

export type AtobaraiTerminalId = z.infer<typeof atobaraiTerminalId>;
